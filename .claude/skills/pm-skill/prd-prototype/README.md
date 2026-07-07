# PRD Prototype

> 基于 PRD 生成可交互的 HTML 原型 — Claude Code Skill

PRD 写好了，但团队对着文字很难有直观感受。这个 skill 把 PRD 变成**可点击、可演示**的 HTML 原型——浏览器打开就能用，不需要 Figma、不需要设计师、不需要开发。

## Demo

```
📄 PRD 输入               🎨 原型产出
─────                    ─────
5 个页面说明              5 个可浏览页面
5 条交互规格              18 个可点击交互
2 张数据表                52 行真实感数据
                         11 个功能标注

保真度：高保真 · 布局：手机框架 + 管理后台
```

生成一个 HTML 文件，浏览器双击即用。

## 它能做什么

```
输入：PRD 文件（.md 或 .html）
  ↓
自动解析页面、流程、交互节点
  ↓
选择保真度（线框 / 中保真 / 高保真）
  ↓
输出：单文件 HTML 原型
  ├── 可点击的页面跳转
  ├── 表单输入、按钮反馈、弹窗、Toast
  ├── 左侧流程导航面板
  ├── 功能标注系统（可开关）
  └── 与 PRD HTML 合并版（Tab 切换）
```

### 三种保真度

| 等级 | 适用场景 | 视觉风格 |
|------|----------|----------|
| **线框** | 内部对齐，改动成本最低 | 黑白灰，纯布局 |
| **中保真** | 给领导/客户看概念 | 品牌色、图标、真实感 |
| **高保真** | 替代设计稿进开发评审 | 接近最终产品，含动效 |

### 设计品质标准

不是 AI 模板风格，是有设计品质的交互作品：

- 根据产品类型自动匹配视觉调性（金融→Luxury Refined / 社交→Soft Pastel / 工具→Editorial Minimal）
- Anti-AI-Aesthetic 红线：禁止紫色渐变、豆腐块布局、纯色背景、千篇一律
- Google Fonts 精选字体对，Dominant color + sharp accent 配色
- 编排动效（staggered reveal）、hover 微交互、scroll-triggered 动画

### 自动适配布局

| PRD 关键词 | 布局模式 |
|-----------|----------|
| React Native / Flutter / App | 手机框架（375×812） |
| 小程序 / WeChat | 手机框架 + 微信顶栏 |
| 管理后台 / Dashboard / SaaS | 侧边栏后台布局 |
| 落地页 / 官网 | 全宽响应式 |
| 用户端 + 管理端 | 混合型（按钮切换） |

## 安装

**前提**：已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)

```bash
# 克隆仓库
git clone https://github.com/CPTYUSHU/prd-prototype.git

# 复制到 Claude Code skills 目录
cp -r prd-prototype ~/.claude/skills/prd-prototype

# 重启 Claude Code 即可使用
```

## 使用

在 Claude Code 中直接说：

```
基于 /path/to/积分兑换-PRD.md 生成高保真原型
```

### 触发词

- "生成原型" / "做原型"
- "prototype" / "交互原型"
- "PRD 转原型" / "可点击原型"

### 与 prd-sprint 配合

推荐搭配 [prd-sprint](https://github.com/CPTYUSHU/prd-sprint) 使用：

```
1. prd-sprint 生成 PRD → 积分兑换-PRD.md + 积分兑换-PRD.html
2. prd-prototype 生成原型 → 积分兑换-prototype.html
3. 自动合并 → 积分兑换.html（PRD + 原型一体，Tab 切换）
```

两个 skill 通过 CSS 变量接口约定保持视觉一致。切换 Tab 时外围区域（topbar、背景、面板）零跳跃，只有内容区域变化。

## 核心特性

### 流程导航面板

左侧固定侧边栏（280px），从 PRD 用户流程章节提取所有流程：

- 纵向步骤条（编号 + 步骤名 + ↓ 箭头）
- 点击步骤直接跳转到对应页面
- 布局切换按钮（用户端 / 管理后台）

### 功能标注系统

右下角醒目的蓝色胶囊按钮，点击开启标注模式：

- 带编号的标注气泡（①②③）标记关键交互点
- 点击气泡弹出说明卡片（功能名 + 说明 + PRD 编号）
- 每页 3-6 个标注，从 PRD 功能清单和页面说明提取

### 真实感数据

- 中文姓名（张伟、李薇），不用"用户A"
- 脱敏手机号（138****5678）
- 真实品牌商品（星巴克 50 元礼品卡）
- SVG 图表（折线图、柱状图、进度条）
- 多样状态分布，至少一个空状态页

### iframe 嵌入兼容

自动检测是否在 iframe 中运行，隐藏内层 topbar：

```js
if (window !== window.top) {
  document.querySelector('.topbar').style.display = 'none';
  document.documentElement.style.setProperty('--topbar-h', '0px');
}
```

不依赖外层 `contentDocument` 访问（`file://` 协议下会被拦截）。

## 文件结构

```
prd-prototype/
├── SKILL.md              # Skill 主文件（Claude Code 读取这个）
└── README.md
```

生成产出：

```
{功能名}-prototype.html    # 原型文件（单 HTML，浏览器双击即用）
{功能名}.html              # 合并版（PRD + 原型，Tab 切换）
```

## FAQ

**Q: 生成的原型能离线用吗？**
基本能。依赖 Google Fonts CDN（离线时 fallback 系统字体）和 Lucide Icons CDN（离线时图标不显示）。核心交互不受影响。

**Q: 一个原型最多能有几个页面？**
建议 8 个以内。超过 8 页时 skill 会提示分批生成，以保证单文件质量和生成速度。

**Q: 能改生成后的原型吗？**
能。输出的是标准 HTML/CSS/JS，可以直接编辑。或者修改 PRD 后重新生成。

**Q: 需要设计基础吗？**
不需要。Skill 会根据产品类型自动选择视觉调性、配色、字体、动效。

## License

MIT
