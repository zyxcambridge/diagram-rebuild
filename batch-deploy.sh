#!/bin/bash

# 批量部署脚本
# 用于批量部署多个 React + Vite 项目到 GitHub Pages

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 检查项目是否为有效的 React + Vite 项目
check_project() {
    local project_dir=$1
    
    if [ ! -f "$project_dir/package.json" ]; then
        return 1
    fi
    
    if [ ! -f "$project_dir/vite.config.ts" ] && [ ! -f "$project_dir/vite.config.js" ]; then
        return 1
    fi
    
    return 0
}

# 部署单个项目
deploy_project() {
    local project_dir=$1
    local project_name=$(basename "$project_dir")
    
    print_message $BLUE "\n🚀 开始部署项目: $project_name"
    print_message $BLUE "📁 项目路径: $project_dir"
    
    cd "$project_dir"
    
    # 检查是否为 git 仓库
    if [ ! -d ".git" ]; then
        print_message $RED "❌ $project_name 不是 Git 仓库，跳过"
        return 1
    fi
    
    # 检查是否有远程仓库
    if ! git remote get-url origin > /dev/null 2>&1; then
        print_message $RED "❌ $project_name 没有配置远程仓库，跳过"
        return 1
    fi
    
    # 检查是否有未提交的更改
    if [[ -n $(git status --porcelain) ]]; then
        print_message $YELLOW "⚠️  $project_name 有未提交的更改，跳过"
        git status --short
        return 1
    fi
    
    # 确保在主分支
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ]; then
        print_message $YELLOW "⚠️  $project_name 不在主分支，当前分支: $current_branch，跳过"
        return 1
    fi
    
    # 拉取最新代码
    print_message $BLUE "📥 拉取最新代码..."
    git pull origin $current_branch
    
    # 安装依赖
    print_message $BLUE "📦 安装依赖..."
    npm install
    
    # 构建项目
    print_message $BLUE "🔨 构建项目..."
    export NODE_ENV=production
    npm run build
    
    # 检查构建是否成功
    if [ ! -d "dist" ]; then
        print_message $RED "❌ $project_name 构建失败，dist 目录不存在"
        return 1
    fi
    
    print_message $GREEN "✅ $project_name 构建完成"
    
    # 部署到 GitHub Pages
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
    print_message $BLUE "📝 提交构建文件..."
    git commit -m "Deploy $project_name to GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 添加远程仓库（如果不存在）
    if ! git remote get-url origin > /dev/null 2>&1; then
        cd ..
        remote_url=$(git remote get-url origin)
        cd dist
        git remote add origin "$remote_url"
    fi
    
    # 强制推送到 gh-pages 分支
    print_message $BLUE "🚀 推送到 GitHub Pages..."
    git push -f origin gh-pages
    
    # 返回项目根目录
    cd ..
    
    # 获取 GitHub Pages URL
    remote_url=$(git remote get-url origin)
    repo_name=$(echo $remote_url | sed 's/.*github.com[:\/]\([^.]*\).*/\1/' | tr '[:upper:]' '[:lower:]')
    pages_url="https://${repo_name}.github.io/$(basename $(pwd))"
    
    print_message $GREEN "✅ $project_name 部署完成！"
    print_message $GREEN "🌐 访问地址: $pages_url"
    
    return 0
}

# 主函数
main() {
    print_message $BLUE "🎯 批量部署脚本启动"
    
    local projects_dir="."
    local success_count=0
    local fail_count=0
    local skip_count=0
    
    # 如果提供了参数，使用参数作为项目目录
    if [ $# -gt 0 ]; then
        projects_dir="$1"
    fi
    
    print_message $BLUE "📂 扫描目录: $projects_dir"
    
    # 如果当前目录就是一个项目，直接部署
    if check_project "$projects_dir"; then
        if deploy_project "$projects_dir"; then
            ((success_count++))
        else
            ((fail_count++))
        fi
    else
        # 扫描子目录中的项目
        for project_dir in "$projects_dir"/*/; do
            if [ -d "$project_dir" ]; then
                if check_project "$project_dir"; then
                    if deploy_project "$project_dir"; then
                        ((success_count++))
                    else
                        ((fail_count++))
                    fi
                else
                    print_message $YELLOW "⏭️  跳过非 Vite 项目: $(basename "$project_dir")"
                    ((skip_count++))
                fi
            fi
        done
    fi
    
    # 输出统计信息
    print_message $BLUE "\n📊 部署统计:"
    print_message $GREEN "✅ 成功: $success_count 个项目"
    print_message $RED "❌ 失败: $fail_count 个项目"
    print_message $YELLOW "⏭️  跳过: $skip_count 个项目"
    
    if [ $success_count -gt 0 ]; then
        print_message $GREEN "\n🎉 批量部署完成！"
        print_message $BLUE "💡 提示: GitHub Pages 可能需要几分钟时间生效"
    else
        print_message $RED "\n😞 没有成功部署任何项目"
    fi
}

# 显示帮助信息
show_help() {
    echo "批量部署脚本 - 将多个 React + Vite 项目部署到 GitHub Pages"
    echo ""
    echo "用法:"
    echo "  $0 [项目目录]          # 部署指定目录下的所有项目"
    echo "  $0                     # 部署当前目录或当前目录下的所有项目"
    echo "  $0 -h, --help         # 显示帮助信息"
    echo ""
    echo "示例:"
    echo "  $0                     # 部署当前目录的项目"
    echo "  $0 ~/projects          # 部署 ~/projects 目录下的所有项目"
    echo ""
    echo "要求:"
    echo "  - 项目必须是 Git 仓库"
    echo "  - 项目必须配置了远程仓库"
    echo "  - 项目必须是 React + Vite 项目"
    echo "  - 项目必须没有未提交的更改"
    echo "  - 项目必须在 main 或 master 分支"
}

# 检查参数
if [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    show_help
    exit 0
fi

# 运行主函数
main "$@"