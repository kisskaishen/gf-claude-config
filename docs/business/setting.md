---
module: setting
title: 系统设置
routes: /setting/*
apis: src/api/finance.ts (余额预警部分), src/api/common.ts
stores: useAppStore, useUserStore
generated_at: 2026-06-26
---

# 系统设置

> 当前提供消息订阅（余额不足提醒）设置功能。

## 1. 功能概述

系统设置模块当前主要包含消息通知订阅，特别是余额不足时的邮件/页面提醒配置。

## 2. 路由结构

| 路由路径 | 页面名称 | 认证 | 菜单可见 | 说明 |
|----------|---------|------|---------|------|
| `/setting/messageNotification` | 消息订阅 | ❌ | ✅ | 余额不足提醒配置 |

## 3. 页面详情

### 3.1 消息订阅 (`/setting/messageNotification`)

**文件**：`src/views/setting/messageNotification.vue`

**功能说明**：配置余额不足时的邮件提醒。可开启/关闭，设置预警金额、告警邮箱、告警时间。

**设置项**：
| 设置项 | 说明 |
|--------|------|
| 开关 | 启用/禁用余额不足提醒 |
| 预警金额 | 当账户余额低于此值时触发 |
| 告警邮箱 | 接收告警邮件的邮箱地址列表 |
| 告警时间 | 每日发送告警的时间（UTC） |
| 邮件语言 | 告警邮件的语言 |
| 弹窗提醒 | 是否在页面弹窗提醒 |
| 时区 | 用户时区 |

**状态展示**：
- 已启用：显示绿色"已启用"标签 + 编辑按钮
- 未配置/已禁用：显示灰色"未启用"标签 + 配置按钮

**依赖 API**：
- `getBalanceAlertConfig` → GET `/userConfig/balanceAlert/queryByGfucLoginId`
- `addBalanceAlertConfig` → POST `/userConfig/balanceAlert`
- `updateBalanceAlertConfig` → PUT `/userConfig/balanceAlert`

## 4. 数据模型

参见 [[finance.md#43-余额预警配置]]。

## 5. 相关模块

- [[finance.md]] — 余额预警实际关联财务余额数据
- [[login.md]] — 用户偏好设置与消息通知关联
