# gf-claude-config

Claude Code 共享配置 — 团队共用的 Skills、Rules、Agents、Hooks。

## 目录结构

```
gf-claude-config/
├── agents/       # Agent 定义（子代理类型）
├── hooks/        # Hook 脚本（会话启动、检查引用等）
├── rules/        # 规则文件（编码规范、架构、安全等）
├── skills/       # Skill 定义（内联技能）
└── settings.json # 共享的权限/配置
```

## 使用方式

### 方式一：Git Submodule（推荐）

```bash
# 在项目中添加为 submodule
git submodule add <repo-url> .claude
git submodule update --init --recursive

# 更新到最新版本
git submodule update --remote .claude
```

### 方式二：直接 Clone

```bash
git clone <repo-url> .claude
# 把 .claude/ 加入 .gitignore，各自独立管理版本
```

### 方式三：符号链接

```bash
git clone <repo-url> ~/gf-claude-config
ln -s ~/gf-claude-config .claude
```

## 贡献指南

1. 基于 `main` 分支创建 feature 分支
2. 修改后提 PR
3. 团队成员 Review 后合并
4. 各项目通过 submodule 更新即可同步

## 注意事项

- `settings.local.json` 不在本仓库中，每个开发者自行维护本地配置
- `.wizard/` 等运行记录不属于共享内容
