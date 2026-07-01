---
paths:
  - "**/*.ts"
  - "**/*.vue"
---

# 代码风格

ESLint + Prettier 是格式化的唯一标准 — 绝不手动格式化和它们对抗。以下规则覆盖工具无法强制执行的内容。

> **TypeScript 是可选的。** TypeScript 部分仅适用于项目使用 TS 时（存在 `tsconfig.json` 或 SFC 使用 `lang="ts"`）。对 JavaScript 项目，改为遵循 JavaScript 部分并忽略仅类型规则。

## TypeScript（当项目使用 TypeScript 时）

- `strict: true`。绝不使用 `any`；优先使用 `unknown` 并缩小类型，或使用精确类型。
- 导出的函数和 composables 有显式返回类型。内部辅助函数可以推断。
- 对象结构和联合类型优先用 `type`；仅在需要声明合并时使用 `interface`。
- 类型从单一来源派生：`z.infer<typeof schema>`、`ReturnType<>`、索引访问 — 避免重复声明结构。
- 不用非空 `!` 断言来消音编译器；处理空值情况。

## JavaScript（当项目不使用 TypeScript 时）

- 文件保持纯 JS/JSX — 不要添加 `lang="ts"` 或类型注解。
- 使用运行时 prop 校验（`type`、`required`、`default`、`validator`）作为组件契约，而非类型。
- 用 JSDoc（`@param`、`@returns`、`@typedef`）文档化不那么显而易见的形状，仅在确实能帮助编辑器智能提示时 — 不要给所有东西加 JSDoc。
- 保持 TS 规则隐含的纪律：无隐式全局变量、显式处理空值、派生值而非重复声明。

## Vue SFC

- 始终使用 `<script setup>`；TS 项目使用 `<script setup lang="ts">`。顺序：`<script setup>`、然后 `<template>`、然后 `<style scoped>`。
- TS：用泛型形式类型化 props/emits — `defineProps<Props>()`、`defineEmits<{ change: [value: string] }>()`。JS：使用带校验器的运行时形式 — `defineProps({ value: { type: String, required: true } })`、`defineEmits(['change'])`。
- 可选 prop 默认值：Vue 3.5+ 优先使用响应式 props 解构 — `const { size = 'md' } = defineProps<Props>()`；仅 Vue ≤3.4 使用 `withDefaults`。必填 prop 不需要默认值。
- 双向绑定：优先使用 `defineModel()`（Vue 3.4+）而非手动的 `modelValue` prop + `update:modelValue` emit。
- 模板引用：`useTemplateRef('name')`（Vue 3.5+）。使用 `useId()` 生成稳定的 id 用于标签/输入框关联。
- 插槽是注入 _标记_ 的 API：暴露具名插槽给结构性区域（`#header`/`#footer`），作用域插槽（`<slot :item="item" />`）传递数据给调用方，默认插槽给主体内容。优先使用插槽而非携带可渲染内容的 prop 或切换模板块的布尔值。TS 中用 `defineSlots<{ default(props: { item: T }): any }>()` 声明契约。
- 每个组件一个文件。文件名与组件名一致。

## 命名

- 组件：`PascalCase`（文件和用法）。Composables：`useThing`。Stores：`useThingStore`。
- 布尔值为谓词：`isLoading`、`hasError`、`canSubmit`。
- 事件名：过去式或祈使句，模板中 kebab-case（`@row-selected`）。

## 导入

- 顺序：node/std、外部包、`@/` 别名、相对路径 — 用空行分隔。
- 使用 `@/` 别名指向 `src`；避免 `../../../` 链式路径。

## 代码卫生

- 提交的代码中无 `console.log`（使用 logger 或删除）。无注释掉的代码块。
- 无跟踪引用则无 TODO。
