@echo off
echo ========================================
echo    MCP Supabase 实时服务器启动脚本
echo ========================================
echo.

echo 正在启动 MCP Supabase 实时服务器...
echo 监听的表: business_products, recharge_orders, business_orders, user_profiles, transactions
echo.

echo 按 Ctrl+C 停止服务器
echo.

node .cursor/mcp-server.js

echo.
echo 服务器已停止
pause 