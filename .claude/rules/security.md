---
paths:
  - "src/**/*.vue"
  - "src/**/*.ts"
---

# 安全

安全是"已完成"的一部分。锚定到 **OWASP Top 10:2025**（当前版本，取代 2021）；在确定了具体风险点时给出 CWE 编号。浏览器是敌对领地：**服务端是唯一的信任边界**，因此这里的一切都是纵深防御 — 绝不作为唯一的控制措施。

## 首要规则 — 客户端永不执行安全策略（A01 / CWE-602）

- 路由守卫（`beforeEach`/`beforeEnter`）、`v-if`-on-role 和禁用的按钮仅为 **UX** — 通过浏览器开发者工具或直接 API 调用即可轻易绕过。服务端独立授权**每个**请求。
- 绝不将客户端提供的值作为授权输入 — 从 `localStorage` 读取的 JWT 声明、query 参数、`postMessage` 数据。在服务端重新检查。
- 不向未授权用户传输他们不应看到的内容：不加载未授权用户的管理路由/组件/数据。隐藏 ≠ 保护。

## 注入/XSS（A05 / CWE-79）

Vue 自动转义 `{{ }}` 和属性绑定；以下逃逸出口不会。

- **原始 HTML 出口** — `v-html`、render-function/JSX 的 `innerHTML`（`h('div', { innerHTML })`）、设置 `el.innerHTML` 的自定义指令、或手动 `innerHTML`/`outerHTML`/`insertAdjacentHTML`：绝不绑定不可信（用户或远程）HTML 原始数据。优先使用 `{{ }}`/`textContent`；如果原始 HTML 不可避免，先使用 **DOMPurify** 消毒。
- **`<component :is>`、动态 `import()`、`eval`、`new Function`、字符串 `setTimeout`/`setInterval`** — 绝不接受用户/远程数据输入；这等于任意代码执行（CWE-94/95）。仅通过硬编码的允许清单/注册表解析已知组件/加载器。
- **`:href`、`:src`、`router.push`、`window.location`** — Vue 转义值但不转义 scheme。只允许安全的 scheme（`/^(https?:|mailto:|tel:)/i`）；阻止 `javascript:`/`data:`。通过 `new URL()` 解析并对照允许清单验证重定向目标，绝不使用子字符串匹配（开放重定向 → A01 / CWE-601）。
- **`v-bind="obj"` / fall-through `v-bind="$attrs"`** — 展开不可信对象会绑定所有键，包括 `innerHTML` 和 `on*` 处理器。仅绑定一组合法的、已验证的属性。
- **模板/DOM 引用** — 从 `useTemplateRef` 节点赋值 `el.innerHTML` 绕过 Vue 的转义；使用 `textContent` 或 DOMPurify。
- **翻译信息（vue-i18n）** — 当信息可能嵌入不可信数据时，不要用 `v-html` 渲染 `t()`/`$t()` 的输出（已知的 i18n XSS 向量）；使用 `<i18n-t>` 组件配合 slots（见 `i18n.md`）。
- **原型污染** — 在任何递归合并/克隆或 query-string 解析中防护 `__proto__`/`constructor`/`prototype` 键；使用 `Object.create(null)`/`Map` 并通过 schema 验证（Zod）。
- **CSTI** — 绝不从用户输入编译运行时模板；优先使用仅运行时构建。

## 密钥与客户端包（A02 / CWE-200、CWE-798）

- 包中的所有内容都是公开的。仅**暴露安全的 `VITE_` 前缀环境变量**属于客户端代码（`VITE_API_BASE_URL`、可公开的 `pk_…` 密钥）。真正的密钥保留在服务端（无 `VITE_` 前缀），通过 API 访问。
- 绝不硬编码或提交凭据；将 `.env*.local` 保持 git 忽略。不将 token/PII 放在 URL 或 query 字符串中（它们通过 `Referer`、历史记录、日志、分析泄露）、错误消息或客户端遥测中。
- 禁用生产环境 source maps（`build.sourcemap: false`，或 `'hidden'` 用于私密上传到错误追踪器），这样源代码和逻辑不会被公开发布。
- 不在生产环境启用 Vue Devtools（`__VUE_PROD_DEVTOOLS__`）— 它暴露组件状态和 Pinia stores 给任何人。

## Token 与会话（A07 / CWE-522、A02 / CWE-922）

- 优先将会话 token 放在 **`httpOnly` + `Secure` + `SameSite` cookies** 中（JS 不可读）而非 `localStorage`/`sessionStorage` — Web Storage 可被任何脚本读取，一次 XSS 即可窃取会话。
- 绝不通过 Pinia/Vuex 持久化插件持久化 token、序列化到 SSR HTML 或记录它们。Store 仅持有非敏感的轮廓数据。
- **CSRF（仅 cookie 会话）（A01 / CWE-352）** — 使用 ambient cookie 时设置 `SameSite=Lax/Strict` 并在 `api/` 层的自定义请求头中添加反 CSRF token（双提交或同步器）。Bearer-token（`Authorization` 头）的 SPA 基本不受此影响。

## 浏览器安全控制（A02、A08）

- **CSP** — 严格的 `script-src`（nonce/hash，无 `unsafe-inline`/`unsafe-eval`，无通配符主机）加上 `frame-ancestors`（点击劫持）、`base-uri`、`object-src 'none'`。考虑 Vite 开发 vs 生产环境的内联脚本差异。
- **子资源完整性（A08）** — 每个第三方 `<script>`/CDN 资源带有 `integrity="sha384-…"` + `crossorigin` 和固定版本，或者自托管/打包。最小化第三方脚本；每个都拥有完全 DOM 访问权限（Magecart 攻击）。
- **传输** — 所有子资源 HTTPS（无混合内容），`Strict-Transport-Security`、`upgrade-insecure-requests`、`Referrer-Policy`、`X-Content-Type-Options: nosniff`。不可信 iframe 带 `sandbox`。
- **`:style`** — 用对象语法绑定经过审核的属性；绝不使用原始的用户输入字符串（CSS 注入 / 遮罩层点击劫持）。

## 跨窗口与网络

- **`postMessage`** — 精确匹配 `event.origin` 与允许清单（绝不用 `indexOf`/子字符串）；验证消息结构；绝不向 `'*'` 发送敏感数据（A01）。
- **CORS** 是服务端控制，但从客户端角度：绝不向宽松的 API 发送带凭据（`credentials: 'include'`）的跨域请求，并标记一个同时返回 `Origin` 和 `Access-Control-Allow-Credentials: true` 的后端（A02）。

## 供应链（A03）

- 审视每个依赖；固定版本并提交 lockfile。运行 `<pm> audit`，将已知的高/严重漏洞视为阻断项，关注传递依赖。这在 CI 中自动化执行（见 `ci-cd-engineer`），而非可选项。

## SSR/SSG

> 仅当项目进行服务端渲染时适用（Nuxt 或自定义渲染器）。纯客户端 SPA 跳过。

- Vue 的自动转义仅覆盖组件模板。转义任何插入到 HTML shell（`<title>`、meta、手动标记）中的内容，并用 `</script>` 安全的序列化器（`devalue`/`serialize-javascript`）序列化注入的状态，而非原始 `JSON.stringify`（A05 / CWE-79）。

## 验证

- 任何依赖变更时运行 `<pm> audit`；合并前解决高/严重级别。
- 对于上文涉及的每个不可信数据出口，合并前确认输入已被转义、消毒或纳入允许清单。
- `security-scanner` agent 在质量门禁中将发现映射到 OWASP/CWE — 但目标是在编写代码时就默认安全，而非事后补审。
