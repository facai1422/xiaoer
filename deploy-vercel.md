# Vercel 部署指南

## 准备工作

### 1. 安装 Vercel CLI
```bash
npm install -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

## 部署步骤

### 方法一：使用 Vercel CLI（推荐）

1. **初始化项目**
```bash
vercel
```

2. **配置项目设置**
- 项目名称：`惠享生活`
- 框架：`Vite`
- 输出目录：`dist`
- 构建命令：`npm run build`
- 开发命令：`npm run dev`

3. **部署到生产环境**
```bash
vercel --prod
```

### 方法二：通过 Git 集成

1. **推送代码到 GitHub**
```bash
git add .
git commit -m "准备部署到Vercel"
git push origin main
```

2. **在 Vercel 网站导入项目**
- 访问 [vercel.com](https://vercel.com)
- 点击 "New Project"
- 选择 GitHub 仓库
- 配置构建设置

## 环境变量配置

在 Vercel 控制台设置以下环境变量：

```
VITE_SUPABASE_URL=https://wjvuuckoasdukmnbrzxk.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_hjn8uDvuadUNMrM1jg5HHQ_37sGt-pr
NODE_ENV=production
```

## 构建设置

### Framework Preset
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 高级设置
- **Node.js Version**: 18.x
- **Package Manager**: npm

## 域名配置

### 自定义域名
1. 在 Vercel 控制台进入项目设置
2. 点击 "Domains"
3. 添加自定义域名
4. 配置 DNS 记录

### SSL 证书
Vercel 自动为所有域名提供免费的 SSL 证书。

## 性能优化

### 静态资源缓存
`vercel.json` 已配置静态资源缓存：
```json
{
  "headers": {
    "Cache-Control": "public, max-age=31536000, immutable"
  }
}
```

### 路由配置
已配置 SPA 路由重定向，确保所有路由都指向 `index.html`。

## 监控和分析

### 部署状态
- 在 Vercel 控制台查看部署状态
- 查看构建日志
- 监控性能指标

### 错误追踪
- 查看 Function Logs
- 监控 Real User Monitoring (RUM)

## 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 中的构建脚本
   - 确保所有依赖都已安装
   - 查看构建日志

2. **路由 404 错误**
   - 确保 `vercel.json` 配置正确
   - 检查 SPA 路由重定向

3. **环境变量问题**
   - 在 Vercel 控制台检查环境变量设置
   - 确保变量名以 `VITE_` 开头

4. **Supabase 连接问题**
   - 检查 Supabase URL 和 API Key
   - 确保 Supabase 项目配置正确

## 自动部署

### Git 集成
- 推送到 `main` 分支自动触发生产部署
- 推送到其他分支创建预览部署

### 部署钩子
可以配置部署钩子来触发其他服务的更新。

## 成本考虑

### 免费额度
- 每月 100GB 带宽
- 无限静态部署
- 100GB/小时 Function 执行时间

### 付费计划
超出免费额度后按使用量计费。

## 备份和回滚

### 版本管理
- Vercel 保留所有部署版本
- 可以快速回滚到任何历史版本

### 数据备份
- 确保 Supabase 数据定期备份
- 考虑设置自动备份策略 