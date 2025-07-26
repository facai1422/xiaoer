@echo off
chcp 65001 >nul
echo 🚀 开始部署到 Vercel...

REM 检查是否安装了 Vercel CLI
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI 未安装，正在安装...
    npm install -g vercel
    if %errorlevel% neq 0 (
        echo ❌ Vercel CLI 安装失败
        pause
        exit /b 1
    )
)

REM 构建项目
echo 📦 构建项目...
npm run build
if %errorlevel% neq 0 (
    echo ❌ 构建失败，请检查错误信息
    pause
    exit /b 1
)

echo ✅ 构建成功！

REM 部署到 Vercel
echo 🌐 部署到 Vercel...
vercel --prod

if %errorlevel% equ 0 (
    echo 🎉 部署成功！
    echo 📱 网站已上线，请查看 Vercel 控制台获取域名
) else (
    echo ❌ 部署失败，请检查错误信息
)

pause 