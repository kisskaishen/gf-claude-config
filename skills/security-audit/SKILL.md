---
name: security-audit
description: 对照 OWASP Top 10:2025 审查前端变更的安全问题 — XSS/注入风险点、密钥/Token 泄露、客户端访问控制、CSP/SRI、依赖漏洞。与 security-scanner agent 对应的内联版本。
---

# 安全审计

对照 `.claude/rules/security.md` 和 **OWASP Top 10:2025** 审查。将每个发现映射到 OWASP 分类（如果确定了具体风险点则加上 CWE）。审查 diff；对涉及的文件用 grep 搜索以下风险点。如需门禁式流水线运行，委托给 `security-scanner` agent（隔离、只读、可查询 CVE）。

## 检查项

- **注入 / XSS（A05 / CWE-79）** — 原始 HTML 出口被用户/远程数据输入且未经 DOMPurify 处理：`v-html`、render/JSX 的 `innerHTML`、设置 `el.innerHTML` 的指令、`v-html="t(key)"`（vue-i18n）、手动 `innerHTML`/`outerHTML`/`insertAdjacentHTML`。来自非常量数据的 `<component :is>`、动态 `import()`、`eval`、`new Function`、字符串 `setTimeout`（CWE-94/95）。`v-bind="$attrs"`/对象展开到原生元素。`:href`/`:src` 允许 `javascript:`/`data:`。未防护的递归合并 / query-string 解析（`__proto__`）。从输入编译运行时模板（CSTI）。
- **访问控制（A01）** — 路由守卫 / `v-if`-on-role 作为安全屏障而无服务端检查；来自用户参数的重定向（CWE-601）；`postMessage` 未精确检查 `origin`，或 `postMessage(…, '*')` 带敏感数据。
- **密钥与泄露（A02 / CWE-200、CWE-798）** — `VITE_` 前缀的密钥（`VITE_.*(KEY|SECRET|TOKEN|PASSWORD)`）或任何 `import.meta.env` 值泄露到客户端包；硬编码/提交的凭据；生产环境 `build.sourcemap` 或散落的 `.map` 文件；URL、错误、日志、分析中的 Token/PII（参考 `config.md`、`observability.md`）。
- **Token 与会话（A07 / CWE-522）** — Token 在 `localStorage`/`sessionStorage` 中或被持久化的 Pinia；cookie-session 状态变更缺少 `SameSite`/反 CSRF token（CWE-352）。
- **浏览器控制（A02 / A08）** — 缺少或弱的 CSP（`unsafe-inline`/`unsafe-eval`/通配符）；第三方 `<script>`/CDN 无 SRI；无 `frame-ancestors`；原始字符串 `:style`；混合内容。
- **供应链（A03）** — 运行 `<pm> audit`；查询新增/更新包的 CVE。

## 输出

按严重程度列出发现，每条附带 `file:line`、OWASP/CWE 映射、风险说明和补救方案。可利用的 XSS、泄露的密钥和纯客户端访问控制为 Critical 级别。不要标记已经过消毒/白名单处理的风险点。最高优先级排在最前；如果没有问题，直接说明。
