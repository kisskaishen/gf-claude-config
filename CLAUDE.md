# CSD-GFUC-Web — AI 项目指南

> 本文件聚合了项目文档库 (`docs/`) 和编码规则 (`.cursor/rules/`) 的核心约束，供 AI 助手自动遵循。

## 项目简介

基于 Vue 3 + TypeScript + Element Plus + Pinia 的后台管理系统，含国际化、多站点、订单/财务等业务模块。

---

## 一、编码规范（严格遵守）

### 1.1 分层架构 — 🔴 必须

```
src/
├── api/          # ① 请求层 — 只发 HTTP，不处理 UI 逻辑
├── store/        # ② 状态层 — 管理全局状态，调用 api
├── hooks/        # ③ 组合逻辑层 — 可复用的组合式函数
├── components/   # ④ 组件层 — 纯展示/交互，不直接调 api
├── views/        # ⑤ 页面层 — 编排组件+store+hook
├── utils/        # ⑥ 工具层 — 纯函数，无副作用
└── styles/       # ⑦ 样式层 — 全局样式/变量
```

- ❌ 禁止在 `.vue` 中直接写 `axios.post(...)` — 必须调用 `api/` 层
- ❌ 禁止在 `api/` 层弹 UI（如 `ElMessage.success`）
- ❌ 禁止组件直接操作原始 API 响应数据 — 应在 api/store 层转换
- ❌ 禁止在样式文件中写业务状态选择器（如 `.status-1`）

### 1.2 TypeScript 规范 — 🔴 必须

| 规则           | 说明                                                               |
| -------------- | ------------------------------------------------------------------ |
| 禁止隐式 `any` | 所有函数参数、返回值必须有完整类型签名                             |
| 禁止 `as any`  | 用 `unknown` + 类型守卫替代                                        |
| API 类型命名   | 请求参数 `<Feature><Action>Params`，响应 `<Feature><Action>Result` |
| 通用类型       | 使用已有 `Result<T>` / `PageResult<T>`                             |
| 路径别名       | 始终用 `@/` 指向 `src/`                                            |
| 类型推断       | 优先自动推断，初始值为 null/undefined 时才显式标注                 |

### 1.3 Vue 3 组件规范 — 🔴 必须

- 所有组件使用 `<script setup lang="ts">` + `defineOptions({ name: "ComponentName" })`
- Props 用 `withDefaults(defineProps<Interface>(), { ... })`，Emits 用 TypeScript 调用签名
- 样式用 `<style lang="scss" scoped>`，覆盖 Element Plus 用 `:deep()`
- 组件根元素 class 名与组件名一致（kebab-case）
- 可复用组件：`src/components/<PascalCase>/index.vue`
- 页面组件：`src/views/<feature>/<name>.vue`
- 插槽命名使用 kebab-case：`<slot name="action-left" />`
- i18n 文本添加注释：`{{ $t("gfuc.search" /** 搜索 **/) }}`

### 1.4 组件复用 — 🔴 必须

- 同一 UI 模式出现 **2 次及以上** → 提取通用组件，禁止复制粘贴
- 组件优先级：项目已有共享组件 → Element Plus → 提取新组件
- 先检查是否已有：`PageContainer`、`SearchContainer`、`TableLayout`、`ProTableColumn`、`CommonUpload`、`FeedbackDialog`、`SuccessDialog`、`SiteSelect`、`TimezoneSelect`、`LangSelect`、`SvgIcon`

### 1.5 Git 规范 — 🔴 必须

- 提交信息格式：`<类型>: <中文描述>`（feat/fix/refactor/style/docs/chore）
- 分支命名：`feat/<功能名>` / `fix/<bug名>` / `release-vX.XX.XX.XX`
- 提交前确保 Husky + lint-staged 检查通过

---

## 二、开发模式参考（按需查阅）

### 2.1 API 调用

- 每个功能域独立文件：`src/api/{user,order,finance,home,task,common,product}.ts`
- 列表/表单提交用 `post`（参数放 `data`），详情用 `get`（参数放 `params`）
- 使用统一的 `src/utils/request.ts`（自动处理 Base URL、拦截器、错误提示）
- 详细参考：[docs/skills/api-calls.md](docs/skills/api-calls.md)

### 2.2 状态管理 (Pinia)

- 全部使用 **Setup 函数语法**（Composition API 风格）
- 持久化 key 命名：`csd-gfuc-web-<store-name>`
- 组件外使用必须导出 `WithOut` 函数
- 现有 Store：`app`（侧栏/语言/时区/站点）、`user`（token/用户信息）、`tagsView`（标签页）
- 详细参考：[docs/skills/state-management.md](docs/skills/state-management.md)

### 2.3 UI 高保真还原

- 从 Figma 设计稿还原时：先提取设计规范 → 像素级精确实现 → 运行自测比对
- 页面设置 `min-width: 1440px`，大屏弹性扩展（禁止写死 `width: 1440px`）
- 所有 px 尺寸、颜色、间距严格匹配设计稿，添加 Figma 测量值注释
- 必须运行 `pnpm run verify:fidelity` 自测，差异率 ≤ 1%
- 详细参考：[docs/skills/ui-fidelity-implementation.md](docs/skills/ui-fidelity-implementation.md)

### 2.4 自动化测试

- 修改 `src/{api,store,utils,hooks}/` 下的代码时，必须同步编写单元测试
- 框架：Vitest + @vue/test-utils + happy-dom
- 测试文件放在被测试模块同级目录，命名 `<module>.test.ts`
- 测试描述用中文，三段式结构（Arrange → Act → Assert）
- `pnpm test` 通过后提交
- 详细参考：[docs/skills/automated-testing.md](docs/skills/automated-testing.md)

---

## 三、性能规则 — 🟡 推荐

| 规则         | 要求                                               |
| ------------ | -------------------------------------------------- |
| 列表渲染     | 必须指定唯一 `:key`，大列表分页（每页 ≤ 100）      |
| 搜索防抖     | 使用 `lodash-es` 的 `debounce`，300ms              |
| 避免重复请求 | 用 `AbortController` 取消上一个请求                |
| watch 量化   | 监听具体字段而非整个对象，避免 `deep: true`        |
| 字典缓存     | 使用 `useDict` hook（已内置缓存）                  |
| 计算属性     | 用 `computed` 替代方法调用（避免每次渲染重新计算） |
| 组件加载     | 路由级懒加载，大组件条件渲染用 `v-if`              |

---

## 四、浏览器兼容 — 🟡 推荐

- 最低支持：Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+（不兼容 IE）
- Autoprefixer 已配置，CSS 写标准语法即可
- 注意降级场景：`backdrop-filter`、`structuredClone` 等
- 禁止使用非标准 API（如 `navigator.userAgentData`）

---

## 五、完整的规则来源

| 来源                                                                                   | 内容                   | 说明     |
| -------------------------------------------------------------------------------------- | ---------------------- | -------- |
| [docs/standards/vue-conventions.md](docs/standards/vue-conventions.md)                 | Vue 3 组件开发约定     | 详细规范 |
| [docs/standards/typescript-rules.md](docs/standards/typescript-rules.md)               | TypeScript 编码规范    | 详细规范 |
| [docs/standards/git-workflow.md](docs/standards/git-workflow.md)                       | Git 工作流程与提交规范 | 详细规范 |
| [docs/skills/api-calls.md](docs/skills/api-calls.md)                                   | API 调用模式           | 实践指南 |
| [docs/skills/state-management.md](docs/skills/state-management.md)                     | 状态管理指南           | 实践指南 |
| [docs/skills/component-guide.md](docs/skills/component-guide.md)                       | 组件开发指南           | 实践指南 |
| [docs/skills/ui-fidelity-implementation.md](docs/skills/ui-fidelity-implementation.md) | UI 高保真还原          | 实践指南 |
| [docs/skills/automated-testing.md](docs/skills/automated-testing.md)                   | 自动化测试             | 实践指南 |
| [.cursor/rules/layer-separation.mdc](.cursor/rules/layer-separation.mdc)               | 分层解耦               | 编码规则 |
| [.cursor/rules/type-constraints.mdc](.cursor/rules/type-constraints.mdc)               | 类型约束               | 编码规则 |
| [.cursor/rules/component-reuse.mdc](.cursor/rules/component-reuse.mdc)                 | 组件复用               | 编码规则 |
| [.cursor/rules/performance.mdc](.cursor/rules/performance.mdc)                         | 性能量化               | 编码规则 |
| [.cursor/rules/browser-compatibility.mdc](.cursor/rules/browser-compatibility.mdc)     | 浏览器兼容             | 编码规则 |
| [.cursor/rules/vue-components.mdc](.cursor/rules/vue-components.mdc)                   | Vue 组件约定           | 编码规则 |
| [.cursor/rules/typescript-style.mdc](.cursor/rules/typescript-style.mdc)               | TS 编码风格            | 编码规则 |
| [.cursor/rules/api-layer.mdc](.cursor/rules/api-layer.mdc)                             | API 调用约定           | 编码规则 |
| [.cursor/rules/pinia-store.mdc](.cursor/rules/pinia-store.mdc)                         | Pinia 状态管理         | 编码规则 |
| [.cursor/rules/ui-fidelity.mdc](.cursor/rules/ui-fidelity.mdc)                         | UI 高保真规则          | 编码规则 |
| [.cursor/rules/automated-testing.mdc](.cursor/rules/automated-testing.mdc)             | 测试规则               | 编码规则 |
| [.cursor/rules/git-commit.mdc](.cursor/rules/git-commit.mdc)                           | Git 提交规范           | 编码规则 |
