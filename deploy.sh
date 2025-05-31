#!/bin/bash

# GitHub Pages 部署脚本
# 用于将 React + Vite 项目部署到 GitHub Pages

set -e # 遇到错误时退出

echo "🚀 开始部署到 GitHub Pages..."

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  检测到未提交的更改，请先提交所有更改"
    git status
    exit 1
fi

# 确保在主分支
echo "📋 检查当前分支..."
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    echo "⚠️  请切换到 main 分支后再运行部署脚本"
    exit 1
fi

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成"

# 进入构建目录
cd dist

# 初始化 git 仓库（如果不存在）
if [ ! -d ".git" ]; then
    git init
    git checkout -b gh-pages
else
    git checkout gh-pages 2>/dev/null || git checkout -b gh-pages
fi

# 添加所有文件
git add -A

# 提交更改
echo "📝 提交构建文件..."
git commit -m "Deploy to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"

# 添加远程仓库（如果不存在）
if ! git remote get-url origin > /dev/null 2>&1; then
    # 从上级目录获取远程仓库地址
    cd ..
    remote_url=$(git remote get-url origin)
    cd dist
    git remote add origin "$remote_url"
fi

# 强制推送到 gh-pages 分支
echo "🚀 推送到 GitHub Pages..."
git push -f origin gh-pages

# 返回项目根目录
cd ..

echo "✅ 部署完成！"
echo "🌐 你的网站将在几分钟内可用："
echo "   https://$(git remote get-url origin | sed 's/.*github.com[:\/]\([^.]*\).*/\1/' | tr '[:upper:]' '[:lower:]').github.io/$(basename $(pwd))"
echo ""
echo "💡 提示："
echo "   - 首次部署可能需要等待几分钟"
echo "   - 确保在 GitHub 仓库设置中启用了 Pages 功能"
echo "   - 选择 gh-pages 分支作为源"