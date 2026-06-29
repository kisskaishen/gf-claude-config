---
module: login
title: 登录认证
routes: /login
apis: src/api/user.ts
stores: useUserStore
generated_at: 2026-06-26
---

# 登录认证

> 用户登录、注册、邮箱验证、偏好设置。

## 1. 功能概述

登录模块提供用户注册、登录、首次偏好设置、开通服务等认证相关流程。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/login` | 登录 | ❌ | ❌ | 登录/注册/验证码三合一页面 |

## 3. 页面详情

### 3.1 登录页面 (`/login/index`)

**文件**：`src/views/login/index.vue`

**功能说明**：登录/注册/验证码三种模式的统一页面。左侧品牌展示区，右侧表单区。登录成功后首次用户进入偏好设置流程。

**三种模式**（通过 `mode` 变量切换）：

| 模式 | 组件 | 说明 |
|------|------|------|
| `login` | `LoginForm` | 邮箱 + 密码 + 图形验证码登录 |
| `register` | `RegisterForm` | 邮箱注册（国家 + 邮箱 + 密码 + 验证码 + 协议） |
| `verify` | `VerifyCodeForm` | 邮箱验证码校验 |

**偏好设置**：
登录成功后，若用户未设置默认语言/时区，弹出 `PreferenceModal` 引导用户设置。

**依赖 API**：
- `postLogin` → POST `/user/login` — 用户登录
- `postRegister` → POST `/user/register` — 用户注册
- `postCheckAccount` → POST `/user/email/check` — 邮箱账号校验
- `postSendVerificationCode` → POST `/user/register/email/code` — 发送邮箱验证码
- `getVerifyCode` → GET `/user/verifyCode` — 获取图形验证码

**使用组件**：
- `LangSelect` — 右上角语言切换
- `LoginForm`、`RegisterForm`、`VerifyCodeForm`、`PreferenceModal`

### 3.2 开通服务

**功能说明**：新用户注册后可申请开通服务，填写货量预估、发货频率等信息。

**依赖 API**：
- `postOpenService` → POST `/fms/customer/lead`

## 4. 数据模型

### 4.1 登录参数

```typescript
interface LoginParams {
  email: string;
  password: string;
  code: string;     // 图形验证码
  uuid: string;     // 验证码 UUID
}
```

### 4.2 注册参数

```typescript
interface RegisterParams {
  country: string;
  email: string;
  password: string;
  verificationCode: string;
  protocolTracing: string;    // 协议留痕（前端自定义）
}
```

### 4.3 用户信息

```typescript
interface UserInfo {
  account: string;              // 账号
  country: string;              // 国家代码（如 'FR'）
  id: number;
  defaultLanguage?: string;     // 默认语言（如 'zh'）
  defaultTimeZone?: string;     // 默认时区（如 'Local'）
  userIdentity: number;         // 用户身份：1-潜在客户 2-成交客户 3-走货账户
  customerId?: string;          // UUID 格式
  customerCode?: string;
  createTime: number;           // 时间戳（毫秒）
}
```

## 5. 认证流程

```
[首次注册流程]
  邮箱输入 → 发送验证码 → 填写注册信息 → 注册成功 → 登录 → 偏好设置 → 开通服务 → 首页

[已注册登录流程]
  邮箱+密码+验证码 → 登录 → 首页

[登录成功处理]
  1. 保存 token 和用户信息到 useUserStore（持久化）
  2. 设置站点 (site)、语言 (lang)、时区 (timezone)
  3. 初始化用户监控 (dataFinder.initUser)
  4. 若未设置偏好 → 弹窗引导设置
  5. 跳转首页
```

## 6. 相关 API 清单

| 功能 | API 函数 | 请求方式 | 接口路径 |
|------|---------|---------|---------|
| 登录 | `postLogin` | POST | `/user/login` |
| 注册 | `postRegister` | POST | `/user/register` |
| 账号校验 | `postCheckAccount` | POST | `/user/email/check` |
| 发送验证码 | `postSendVerificationCode` | POST | `/user/register/email/code` |
| 图形验证码 | `getVerifyCode` | GET | `/user/verifyCode` |
| 用户信息 | `getUserInfo` | GET | `/userinfo` |
| 更新信息 | `postUpdateUserInfo` | POST | `/userinfo/update` |
| 开通服务 | `postOpenService` | POST | `/fms/customer/lead` |
| 账户国家 | `getAccountCountry` | POST | `/user/accountCountry` |

## 7. Store 依赖

- `useUserStore` — token、userInfo、loginInfo、login/logout/fetchUserInfo
  - 持久化 key：`csd-gfuc-web-user-state`
  - 持久化字段：`token`, `userInfo`, `loginInfo`
- `useAppStore` — site、lang、timezone
  - 持久化 key：`csd-gfuc-web-app-state`

## 8. 相关模块

- [[home.md]] — 登录成功后跳转首页
- [[setting.md]] — 消息订阅设置与用户偏好相关
