# PRD Sprint

> 把零散输入变成完整 PRD — Claude Code Skill for Product Managers

产品经理每天都在处理零散信息：客户邮件、会议记录、口头需求、历史文档。把这些变成一份结构清晰、可直接交付开发的 PRD，以前要 2-3 天，现在几分钟搞定。

## Demo

```
📥 输入                    📤 产出
─────                     ─────
3 份原始材料               PRD 文档 344 行
（邮件、会议记录、微信消息）   6 个用户故事
共 856 字原始文本            3 张 Mermaid 流程图
                           28 条交互规格
                           20 个验收标准
                           5 张数据表

⏱️ 总耗时：4 分 12 秒
```

## 它能做什么

```
输入：邮件 + 会议记录 + 口头描述 + 历史文档（任意组合）
  ↓
自动扫描材料 → 提取需求点、业务规则、技术约束
  ↓
信息覆盖分析（✅ 已有 / ⚠️ 模糊 / ❌ 缺失）
  ↓
精准追问（最多 1 轮 3 个问题，带选项）
  ↓
输出：Markdown + 精美 HTML 双格式 PRD
  ↓
可选：生成可交互 HTML 原型 → 配合 prd-prototype skill
```

### 输出亮点

- **Markdown PRD** — 结构完整，适合版本管理和团队协作
- **HTML PRD** — 左侧导航、Mermaid 流程图自动渲染、优先级彩色标签、滚动高亮、响应式设计
- **编辑模式** — 说"改一下PRD"，只改受影响的章节，标注版本变更
- **原型联动** — PRD 更新后自动分析对原型的影响，提示哪些页面需要重做

## 安装

**前提**：已安装 [Claude Code](https://docs.anthropic.com/en/docs/claude-code)（Anthropic 官方 CLI）

```bash
# 克隆仓库
git clone https://github.com/CPTYUSHU/prd-sprint.git

# 复制到 Claude Code skills 目录
cp -r prd-sprint ~/.claude/skills/prd-sprint

# 重启 Claude Code 即可使用
```

或者手动：下载 ZIP → 解压 → 将 `prd-sprint` 文件夹复制到 `~/.claude/skills/` → 重启 Claude Code。

## 使用

在 Claude Code 中直接说：

```
帮我写个PRD。我们要做一个积分兑换功能。
客户邮件里提了这些需求：[粘贴邮件内容]
上周会议结论：[粘贴会议记录]
技术栈是 Java + React Native。
```

### 触发词

以下任意一种说法都能触发：

- "写PRD" / "PRD Sprint"
- "生成需求文档" / "帮我整理PRD"
- "需求文档"
- "更新PRD" / "PRD改一下"（编辑模式）

### 快速模式

材料已经很完整，或者赶时间：

```
快速写个PRD：[直接粘贴所有材料]
```

跳过追问，直接生成，信息不足的地方标 `[待确认]`。

## PRD 输出结构

```
1. 概述（一句话 + 背景 + 目标 + 范围外）
2. 用户故事（角色 + 故事 + 优先级）
3. 功能清单（按端拆分，P0/P1/P2 优先级）
4. 用户流程（Mermaid 流程图，可直接渲染）
5. 页面说明（布局 + 交互逻辑）
6. 交互规格（触发 → 前置条件 → 成功 → 失败）
7. 数据 & 字段说明（字段名/类型/必填/校验规则/示例值）
8. 异常流程 & 边界情况
9. 验收标准（每条可测试、可验证）
10. 待确认事项
+ 技术备注
```

## 与 prd-prototype 配合

prd-sprint 生成 PRD 后，可以无缝衔接 [prd-prototype](https://github.com/CPTYUSHU/prd-prototype) 生成可交互的 HTML 原型：

```
基于 /path/to/积分兑换-PRD.md 生成高保真原型
```

两个 skill 通过 CSS 变量接口约定保持视觉一致性：

| CSS 变量 | 用途 | PRD 定义 → 原型读取 |
|----------|------|---------------------|
| `--color-bg` | 页面背景 | `#fafaf9` |
| `--color-surface` | 面板背景 | `#ffffff` |
| `--color-accent` | 强调色 | `#2563eb` |

合并版（PRD + 原型一体）通过顶部 Tab 切换，零视觉跳跃。

## 文件结构

```
prd-sprint/
├── SKILL.md                  # Skill 主文件（Claude Code 读取这个）
├── references/
│   └── prd-template.md       # PRD 模板 & 写作规范
└── README.md
```

## 支持的输入类型

| 类型 | 说明 |
|------|------|
| 粘贴文本 | 邮件、会议记录、聊天记录、需求描述 |
| 文件路径 | 指向本地文档，AI 会自动读取 |
| 口头描述 | 直接用自然语言描述需求 |
| 截图 | 竞品截图、白板照片、草图 |
| 历史 PRD | 在已有文档基础上迭代 |

不需要把材料整理好再丢给它。越原始越好，整理是 AI 的活。

## FAQ

**Q: 和 feature-card 什么区别？**
feature-card 是轻量级需求卡片（单个功能）。prd-sprint 是完整的 PRD 文档，适合正式评审和开发交付。

**Q: 可以自定义 PRD 模板吗？**
可以，修改 `references/prd-template.md` 即可。

**Q: 生成的 HTML 能离线看吗？**
能。HTML 文件除了 Google Fonts 和 Mermaid CDN 外不依赖外部服务。断网时字体会 fallback 到系统字体，流程图会显示 Mermaid 源码。

## License

MIT
