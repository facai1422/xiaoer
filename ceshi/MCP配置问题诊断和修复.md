# MCP 配置连接问题诊断和修复

## 问题分析

从您的日志可以看出：
✅ MCP 服务器可以正常启动
✅ 成功连接到 Supabase
✅ 所有5个表都成功订阅
❌ 但 Cursor 可能无法连接到 MCP 服务器

## 可能的问题原因

### 1. **MCP 配置格式问题**
当前配置可能不完全符合 Cursor 的 MCP 规范

### 2. **stdio 通信问题**
`streamTransport: true` 可能不是正确的配置

### 3. **路径问题**
相对路径可能在某些情况下不工作

### 4. **协议版本问题**
可能需要指定 MCP 协议版本

## 修复方案

### 方案1：标准 MCP 配置
```json
{
    "mcpServers": {
        "supabase-realtime": {
            "command": "node",
            "args": [".cursor/mcp-server.js"],
            "env": {
                "SUPABASE_URL": "https://wjvuuckoasdukmnbrzxk.supabase.co",
                "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdnV1Y2tvYXNkdWttbmJyenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDI5NTEsImV4cCI6MjA2NTgxODk1MX0.80Q4rACNWeUErV4xkswzr_oeGJrmABI2bPqk4ui4HGg"
            }
        }
    }
}
```

### 方案2：简化配置
```json
{
    "mcpServers": {
        "supabase": {
            "command": "node",
            "args": [".cursor/mcp-server.js"]
        }
    }
}
```

### 方案3：绝对路径配置
```json
{
    "mcpServers": {
        "supabase-realtime": {
            "command": "node",
            "args": ["C:\\Users\\admin\\Desktop\\6月20\\主项目目录\\.cursor\\mcp-server.js"],
            "env": {
                "SUPABASE_URL": "https://wjvuuckoasdukmnbrzxk.supabase.co",
                "SUPABASE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqdnV1Y2tvYXNkdWttbmJyenhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDI5NTEsImV4cCI6MjA2NTgxODk1MX0.80Q4rACNWeUErV4xkswzr_oeGJrmABI2bPqk4ui4HGg"
            }
        }
    }
}
```

## 诊断步骤

### 1. 检查 Cursor MCP 状态
- 在 Cursor 中按 `Ctrl+Shift+P`
- 搜索 "MCP" 相关命令
- 查看是否有 MCP 服务器状态显示

### 2. 查看 Cursor 日志
- 打开 Cursor 开发者工具 (`Ctrl+Shift+I`)
- 查看 Console 中是否有 MCP 相关错误

### 3. 验证文件路径
- 确保 `.cursor/mcp-server.js` 文件存在
- 确保文件有执行权限

### 4. 测试不同配置
- 尝试上述三种配置方案
- 重启 Cursor 使配置生效

## 常见问题和解决方案

### 问题1：找不到文件
**症状**：Cursor 报告找不到 MCP 服务器文件
**解决**：使用绝对路径或确保工作目录正确

### 问题2：权限错误
**症状**：文件存在但无法执行
**解决**：检查文件权限，确保可执行

### 问题3：依赖问题
**症状**：MCP 服务器启动失败
**解决**：确保 `@supabase/supabase-js` 已安装

### 问题4：端口冲突
**症状**：连接被拒绝
**解决**：检查是否有其他进程占用相同资源

## 调试技巧

### 1. 手动测试 MCP 服务器
```bash
# 测试服务器是否正常启动
node .cursor/mcp-server.js

# 查看是否有错误输出
```

### 2. 检查环境变量
```bash
# Windows
echo %SUPABASE_URL%
echo %SUPABASE_KEY%

# 确保环境变量正确设置
```

### 3. 验证 JSON 格式
- 使用 JSON 验证器检查配置文件格式
- 确保没有语法错误

## 推荐的修复步骤

1. **备份当前配置**
2. **尝试方案1（标准配置）**
3. **重启 Cursor**
4. **检查 MCP 状态**
5. **如果仍有问题，尝试方案2（简化配置）**
6. **最后尝试方案3（绝对路径）**

## 验证连接成功的标志

- Cursor 中可以看到 MCP 服务器状态
- 可以通过 MCP 查询数据库信息
- 实时数据变更能被 Cursor 感知
- 没有连接错误日志

如果所有方案都不工作，可能需要：
- 更新 Cursor 到最新版本
- 检查 Cursor 的 MCP 支持文档
- 考虑使用其他 MCP 实现方式 