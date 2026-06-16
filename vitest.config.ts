import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "path";

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ["vue", "vue-router", "pinia"],
      resolvers: [ElementPlusResolver({ importStyle: "sass" })]
    }),
    Components({ resolvers: [ElementPlusResolver()] })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  test: {
    // 测试环境
    environment: "happy-dom",

    // 全局 API（describe, it, expect 等无需 import）
    globals: true,

    // 测试文件匹配
    include: ["src/**/*.{test,spec}.{ts,js}"],

    // 测试覆盖率
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.{ts,vue}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.{test,spec}.ts",
        "src/main.ts",
        "src/env.d.ts",
        "src/svg-icons.d.ts"
      ],
      // 各模块覆盖率阈值（可根据实际情况逐步提高）
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60
      }
    },

    // 测试执行前自动 mock 全局样式和图片
    css: false,

    // 测试超时（毫秒）
    testTimeout: 10000,

    // 环境配置
    setupFiles: []
  }
});
