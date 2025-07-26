# MCP Supabase 配置说明

## 配置文件概述

我已经帮您修改了 MCP (Model Context Protocol) 的 Supabase 配置，让它能够更好地监听数据库的实时变更。

## 修改的文件

### 1. `.cursor/mcp.json` - MCP 服务器配置
```json
{
    "mcpServers": {
        "supabase-realtime": {
            "command": "node",
            "args": ["./.cursor/mcp-server.js"],
            "streamTransport": true,
            "env": {
                "SUPABASE_URL": "https://wjvuuckoasdukmnbrzxk.supabase.co",
                "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "NODE_ENV": "development"
            },
            "timeout": 30000,
            "restart": true
        }
    }
}
```

**配置说明：**
- `command`: 使用 Node.js 运行服务器
- `args`: 指向正确的服务器文件路径
- `streamTransport`: 启用流传输
- `timeout`: 30秒超时设置
- `restart`: 自动重启功能
- `env`: 环境变量配置

### 2. `.cursor/mcp-server.js` - MCP 服务器实现

**主要改进：**

#### A. Supabase 客户端配置
```javascript
const supabase = createClient(
    process.env.SUPABASE_URL || 'https://wjvuuckoasdukmnbrzxk.supabase.co',
    process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);
```
- 使用环境变量，如果不存在则使用默认值
- 确保连接稳定性

#### B. 多表监听
```javascript
const tables = [
    'business_products',    // 业务产品表
    'recharge_orders',      // 充值订单表
    'business_orders',      // 业务订单表
    'user_profiles',        // 用户资料表
    'transactions'          // 交易记录表
];
```
- 监听项目中的核心表
- 支持实时数据变更通知

#### C. 增强的变更数据格式
```javascript
const changeData = {
    timestamp: new Date().toISOString(),
    table: tableName,
    event: payload.eventType,
    old: payload.old,
    new: payload.new,
    schema: payload.schema
};
```
- 包含时间戳
- 明确标识表名和事件类型
- 提供新旧数据对比

#### D. 优雅退出处理
```javascript
process.on('SIGINT', () => {
    console.log('正在关闭 MCP 服务器...');
    supabase.removeAllChannels();
    process.exit(0);
});
```
- 处理程序中断信号
- 清理所有订阅通道
- 避免资源泄漏

## 功能特性

### 1. 实时数据监听
- **INSERT**: 新增数据时触发
- **UPDATE**: 更新数据时触发
- **DELETE**: 删除数据时触发

### 2. 监听的表
- `business_products`: 业务产品变更
- `recharge_orders`: 充值订单变更
- `business_orders`: 业务订单变更
- `user_profiles`: 用户资料变更
- `transactions`: 交易记录变更

### 3. 日志记录
- 启动日志
- 订阅状态日志
- 数据变更日志
- 错误日志

## 使用方法

### 1. 启动 MCP 服务器
```bash
# 在项目根目录执行
node .cursor/mcp-server.js
```

### 2. 通过 Cursor 使用
MCP 服务器会自动被 Cursor 调用，无需手动启动。

### 3. 查看实时数据
当数据库中的监听表发生变更时，会在控制台看到类似输出：
```
[business_products] INSERT: { ... }
[recharge_orders] UPDATE: { ... }
```

## 环境变量

可以通过环境变量覆盖默认配置：

```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_KEY="your-anon-key"
export NODE_ENV="production"
```

## 故障排除

### 1. 连接问题
- 检查 Supabase URL 和 Key 是否正确
- 确认网络连接正常
- 验证 Supabase 项目状态

### 2. 权限问题
- 确认使用的是 `anon` 或 `service_role` key
- 检查 RLS 策略是否允许实时订阅

### 3. 表不存在
- 确认监听的表在数据库中存在
- 检查表名拼写是否正确

## 安全注意事项

1. **API Key 安全**：
   - 不要在公开代码中暴露 service_role key
   - 使用环境变量管理敏感信息

2. **RLS 策略**：
   - 确保实时订阅遵循行级安全策略
   - 只监听必要的表和数据

3. **网络安全**：
   - 在生产环境中使用 HTTPS
   - 考虑使用 VPN 或私有网络

## 性能优化

1. **选择性监听**：只监听需要的表
2. **事件过滤**：可以过滤特定的事件类型
3. **数据格式化**：优化传输的数据结构
4. **连接管理**：合理管理连接数量

这个配置为您的项目提供了强大的实时数据监听能力，可以帮助您更好地跟踪和响应数据库变更。 