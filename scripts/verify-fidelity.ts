#!/usr/bin/env node

/**
 * UI Fidelity Verification Script
 * ================================
 * 截图对比自测工具：渲染 Vue 页面并与设计参考图进行像素级比对
 *
 * Usage:
 *   pnpm run verify:fidelity -- --ref=design.png --route=/order/list
 *   pnpm run verify:fidelity -- --capture-only --url=http://localhost:5173/page
 *   pnpm run verify:fidelity -- --diff-only --capture=actual.png --ref=design.png
 *
 * Options:
 *   --ref=<path>        参考图路径（必选，除 capture-only 外）
 *   --route=<path>      页面路由，用于组合 dev server URL（可选，默认 /）
 *   --url=<url>         完整页面 URL（可选，覆盖 route）
 *   --viewport=WxH      视口尺寸，如 1440x900（可选，默认 1440x900）
 *   --viewports=<list>  多视口批量截图，逗号分隔，如 "1440x900,1600x900,1920x1080"
 *                        同时验证多个断点的适配效果（仅用于 capture-only 模式）
 *   --threshold=<0-1>   像素差异阈值（可选，默认 0.1）
 *   --capture-only      仅截图，不比对比
 *   --diff-only         仅比对，不截图
 *   --output=<dir>      输出目录（可选，默认 scripts/fidelity/reports）
 *   --help              显示帮助
 */

import { chromium } from "playwright";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

// ─── 类型定义 ───────────────────────────────────────────────

interface CliOptions {
  ref?: string;
  route?: string;
  url?: string;
  viewport?: string;
  viewports?: string; // comma-separated list: "1440x900,1920x1080"
  capture?: string; // path to actual screenshot for diff-only mode
  threshold?: number;
  captureOnly?: boolean;
  diffOnly?: boolean;
  output?: string;
  help?: boolean;
}

interface DiffResult {
  totalPixels: number;
  diffPixels: number;
  diffPercent: number;
  width: number;
  height: number;
}

interface Region {
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── CLI 解析 ────────────────────────────────────────────────

function parseArgs(args: string[]): CliOptions {
  const opts: CliOptions = {};

  for (const arg of args) {
    if (arg === "--help" || arg === "-h") {
      opts.help = true;
      continue;
    }
    if (arg === "--capture-only") {
      opts.captureOnly = true;
      continue;
    }
    if (arg === "--diff-only") {
      opts.diffOnly = true;
      continue;
    }
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      switch (key) {
        case "ref":
          opts.ref = value;
          break;
        case "route":
          opts.route = value;
          break;
        case "url":
          opts.url = value;
          break;
        case "viewport":
          opts.viewport = value;
          break;
        case "viewports":
          opts.viewports = value;
          break;
        case "threshold":
          opts.threshold = parseFloat(value);
          break;
        case "capture":
          opts.capture = value;
          break;
        case "output":
          opts.output = value;
          break;
      }
    }
  }

  return opts;
}

// ─── 图片处理 ────────────────────────────────────────────────

function loadPNG(filePath: string): PNG {
  const buffer = readFileSync(filePath);
  return PNG.sync.read(buffer);
}

function savePNG(png: PNG, filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  writeFileSync(filePath, PNG.sync.write(png));
}

function findDiffRegions(diff: PNG, minRegionSize = 16): Region[] {
  const regions: Region[] = [];
  const visited = new Set<number>();
  const { width, height, data } = diff;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;
      // Check if this pixel is different (diff image uses red/magenta for differences)
      if (
        !visited.has(idx) &&
        data[pixelIdx + 3] > 0 // alpha > 0 means this pixel is marked as diff
      ) {
        // Flood fill to find contiguous region
        const region: Region = { x, y, w: 1, h: 1 };
        const stack = [idx];
        visited.add(idx);

        while (stack.length > 0) {
          const ci = stack.pop()!;
          const cx = ci % width;
          const cy = Math.floor(ci / width);

          // Expand region bounds
          if (cx < region.x) region.x = cx;
          if (cx > region.x + region.w - 1) region.w = cx - region.x + 1;
          if (cy < region.y) region.y = cy;
          if (cy > region.y + region.h - 1) region.h = cy - region.y + 1;

          // Check neighbors (4-directional)
          for (const [dx, dy] of [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
          ]) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nidx = ny * width + nx;
              if (!visited.has(nidx)) {
                const npi = nidx * 4;
                if (data[npi + 3] > 0) {
                  visited.add(nidx);
                  stack.push(nidx);
                }
              }
            }
          }
        }

        if (region.w >= minRegionSize || region.h >= minRegionSize) {
          regions.push(region);
        }
      }
    }
  }

  // Sort by size descending
  return regions.sort((a, b) => b.w * b.h - a.w * a.h);
}

// ─── 截图 ────────────────────────────────────────────────────

async function captureScreenshot(
  pageUrl: string,
  viewportStr: string,
  outputPath: string
): Promise<void> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      viewport: parseViewport(viewportStr)
    });
    const page = await context.newPage();
    await page.goto(pageUrl, { waitUntil: "networkidle" });
    // Extra wait for any animations to settle
    await page.waitForTimeout(1000);
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`  ✓ 截图已保存: ${outputPath}`);
  } finally {
    await browser.close();
  }
}

// ─── 比对 ────────────────────────────────────────────────────

function compareImages(
  refPath: string,
  actualPath: string,
  diffPath: string,
  threshold: number
): DiffResult {
  if (!existsSync(refPath)) {
    console.error(`  ✗ 参考图不存在: ${refPath}`);
    process.exit(1);
  }
  if (!existsSync(actualPath)) {
    console.error(`  ✗ 截图不存在: ${actualPath}`);
    process.exit(1);
  }

  const ref = loadPNG(refPath);
  const actual = loadPNG(actualPath);

  if (ref.width !== actual.width || ref.height !== actual.height) {
    console.error(
      `  ✗ 图片尺寸不匹配: 参考图 ${ref.width}x${ref.height}，截图 ${actual.width}x${actual.height}`
    );
    process.exit(1);
  }

  const { width, height } = ref;
  const diff = new PNG({ width, height });

  const diffPixels = pixelmatch(
    ref.data,
    actual.data,
    diff.data,
    width,
    height,
    {
      threshold,
      alpha: 0.3,
      diffColor: [255, 0, 0], // Red for differences
      diffColorAlt: [255, 165, 0] // Orange for near-matches
      // 注意：pixelmatch 的 diffColor / diffColorAlt 参数名可能因版本不同
      // 兼容处理见下方
    }
  );

  savePNG(diff, diffPath);

  const totalPixels = width * height;
  const diffPercent = (diffPixels / totalPixels) * 100;

  return { totalPixels, diffPixels, diffPercent, width, height };
}

// ─── 工具函数 ────────────────────────────────────────────────

function parseViewport(s: string): { width: number; height: number } {
  const parts = s.split("x");
  return {
    width: parseInt(parts[0], 10) || 1440,
    height: parseInt(parts[1], 10) || 900
  };
}

function timestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

// ─── 报告输出 ────────────────────────────────────────────────

function printReport(
  result: DiffResult,
  regions: Region[],
  passed: boolean
): void {
  const border = "═".repeat(55);
  console.log(`\n  ${border}`);
  console.log("  ╔═══ UI Fidelity Report ═══");
  console.log(`  ${border}`);
  console.log(
    `  ${"Reference:".padEnd(22)} ${result.diffPixels > 0 ? "🖼️" : "✅"} 见上方路径`
  );
  console.log(`  ${"Diff Image:".padEnd(22)} 见下方路径`);
  console.log(`  ┌──────────────────────────┬──────────────┐`);
  console.log(
    `  │ ${"Image Size".padEnd(24)} │ ${`${result.width}x${result.height}`.padStart(12)} │`
  );
  console.log(
    `  │ ${"Total Pixels".padEnd(24)} │ ${result.totalPixels.toLocaleString().padStart(12)} │`
  );
  console.log(
    `  │ ${"Different Pixels".padEnd(24)} │ ${result.diffPixels.toLocaleString().padStart(12)} │`
  );
  console.log(
    `  │ ${"Difference %".padEnd(24)} │ ${result.diffPercent.toFixed(4).padStart(11)}% │`
  );
  console.log(`  │ ${"Threshold".padEnd(24)} │ ${"0.1".padStart(12)} │`);
  console.log(
    `  │ ${"Status".padEnd(24)} │ ${(passed ? "✅ 通过" : "⚠️ 有差异").padStart(12)} │`
  );
  console.log(`  └──────────────────────────┴──────────────┘`);

  if (regions.length > 0) {
    console.log(`\n  Top ${Math.min(regions.length, 5)} difference regions:`);
    regions.slice(0, 5).forEach((r, i) => {
      console.log(`    ${i + 1}. x:${r.x} y:${r.y} w:${r.w} h:${r.h}`);
    });
    console.log(`\n  Check diff.png for visual comparison.`);
  }

  console.log(`  ${"─".repeat(55)}\n`);
}

function printUsage(): void {
  console.log(`
  UI Fidelity Verification — 高保真自测工具

  用法:
    pnpm run verify:fidelity -- --ref=<参考图> --route=<路由>

  选项:
    --ref=<path>        参考图路径（必选，除 capture-only 外）
    --route=<path>      页面路由（默认 /）
    --url=<url>         完整 URL（可选，覆盖 route）
    --viewport=WxH      视口尺寸（默认 1440x900）
    --viewports=<list>  多视口批量截图，逗号分隔，如 "1440x900,1600x900,1920x1080"
    --threshold=<0-1>   差异阈值（默认 0.1）
    --capture-only      仅截图，不比对
    --diff-only         仅比对，不截图
    --output=<dir>      输出目录（默认 scripts/fidelity/reports）
    --help              显示本帮助

  示例:
    pnpm run verify:fidelity -- --ref=refs/home.png --route=/
    pnpm run verify:fidelity -- --capture-only --url=http://localhost:5173/order/list
    pnpm run verify:fidelity -- --diff-only --capture=actual.png --ref=design.png
    # 批量多视口截图（验证适配效果）
    pnpm run verify:fidelity:capture -- --url=http://localhost:5173/order/list --viewports=1440x900,1600x900,1920x1080
  `);
}

// ─── 主函数 ──────────────────────────────────────────────────

async function main(): Promise<void> {
  const opts = parseArgs(process.argv.slice(2));

  if (opts.help) {
    printUsage();
    process.exit(0);
  }

  const outputDir = resolve(opts.output || "scripts/fidelity/reports");
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const ts = timestamp();
  const viewportStr = opts.viewport || "1440x900";
  const threshold = opts.threshold ?? 0.1;

  // ─── 模式 1: 仅截图 ──────────────────────────────────

  if (opts.captureOnly) {
    const targetUrl = opts.url || `http://localhost:5173${opts.route || "/"}`;

    // 批量多视口截图
    if (opts.viewports) {
      const vpList = opts.viewports.split(",").map((s) => s.trim());
      console.log(`\n  ═══ 批量截图模式（${vpList.length} 个视口）═══`);
      console.log(`  URL: ${targetUrl}`);
      console.log(`  ${"─".repeat(50)}`);

      for (const vp of vpList) {
        const vpLabel = vp.replace(/x/, "_");
        const outPath = resolve(outputDir, `actual-${vpLabel}-${ts}.png`);
        console.log(`  [${vp}] 截图...`);
        await captureScreenshot(targetUrl, vp, outPath);
      }

      console.log(`\n  ✅ 批量截图完成，共 ${vpList.length} 张\n`);
      process.exit(0);
    }

    const outPath = resolve(outputDir, `actual-${ts}.png`);

    console.log(`\n  ═══ 截图模式 ═══`);
    console.log(`  URL: ${targetUrl}`);
    console.log(`  Viewport: ${viewportStr}`);

    await captureScreenshot(targetUrl, viewportStr, outPath);
    process.exit(0);
  }

  // ─── 模式 2: 仅比对 ──────────────────────────────────

  if (opts.diffOnly) {
    if (!opts.ref) {
      console.error("  ✗ 比对模式需要 --ref 参数");
      process.exit(1);
    }

    const refPath = resolve(opts.ref);

    if (!opts.capture) {
      console.error("  ✗ diff-only 模式需要 --capture=<截图路径> 参数");
      process.exit(1);
    }
    const actualPath = resolve(opts.capture);
    const diffPath = resolve(outputDir, `diff-${ts}.png`);

    console.log(`\n  ═══ 比对模式 ═══`);
    console.log(`  Reference: ${refPath}`);
    console.log(`  Actual:    ${actualPath}`);
    console.log(`  Diff:      ${diffPath}`);

    const result = compareImages(refPath, actualPath, diffPath, threshold);
    const regions = findDiffRegions(loadPNG(diffPath));
    const passed = result.diffPercent <= 1.0;

    printReport(result, regions, passed);
    process.exit(passed ? 0 : 1);
  }

  // ─── 模式 3: 完整流水线（截图 + 比对） ──────────────

  if (!opts.ref) {
    console.error("  ✗ 需要 --ref 参数指定参考图路径");
    printUsage();
    process.exit(1);
  }

  const refPath = resolve(opts.ref);
  const targetUrl = opts.url || `http://localhost:5173${opts.route || "/"}`;
  const actualPath = resolve(outputDir, `actual-${ts}.png`);
  const diffPath = resolve(outputDir, `diff-${ts}.png`);

  console.log(`\n  ═══ UI Fidelity Self-Test ═══`);
  console.log(`  Reference:   ${refPath}`);
  console.log(`  Target URL:  ${targetUrl}`);
  console.log(`  Viewport:    ${viewportStr}`);
  console.log(`  Threshold:   ${threshold}`);
  console.log(`  Output dir:  ${outputDir}`);
  console.log(`  ${"─".repeat(50)}`);

  // Step 1: Screenshot
  console.log(`\n  [1/2] 截取页面截图...`);
  await captureScreenshot(targetUrl, viewportStr, actualPath);

  // Step 2: Compare
  console.log(`\n  [2/2] 像素级比对...`);
  const result = compareImages(refPath, actualPath, diffPath, threshold);
  const regions = findDiffRegions(loadPNG(diffPath));
  const passed = result.diffPercent <= 1.0;

  printReport(result, regions, passed);

  console.log(`  Screenshot: ${actualPath}`);
  console.log(`  Diff:       ${diffPath}`);

  if (passed) {
    console.log(
      `\n  ✅ 高保真还原通过！差异率: ${result.diffPercent.toFixed(2)}% ≤ 1%\n`
    );
  } else {
    const fixHints: string[] = [];
    for (const r of regions.slice(0, 3)) {
      if (r.w < 10 && r.h < 10) {
        fixHints.push(
          `  - 区域 (${r.x},${r.y}) ${r.w}x${r.h}: 可能是反锯齿或内阴影差异，可忽略`
        );
      } else if (r.w > 100 && r.h > 50) {
        fixHints.push(
          `  - 区域 (${r.x},${r.y}) ${r.w}x${r.h}: 大范围差异，检查布局或组件结构`
        );
      } else {
        fixHints.push(
          `  - 区域 (${r.x},${r.y}) ${r.w}x${r.h}: 中等差异，检查颜色、尺寸或间距`
        );
      }
    }
    if (fixHints.length > 0) {
      console.log(`\n  修复建议:`);
      fixHints.forEach((h) => console.log(h));
    }
    console.log(
      `\n  ⚠️ 差异率 ${result.diffPercent.toFixed(2)}% > 1%，请修复后重新测试\n`
    );
  }

  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error("  ✗ 出错:", err.message);
  process.exit(1);
});
