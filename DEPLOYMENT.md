# GitHub Pages 部署指南

本项目提供了多种方式将 React + Vite 应用部署到 GitHub Pages。

## 🚀 部署方式

### 1. 手动部署脚本

使用 `deploy.sh` 脚本进行单个项目的手动部署：

```bash
# 给脚本添加执行权限（首次使用）
chmod +x deploy.sh

# 运行部署脚本
./deploy.sh
```

**脚本功能：**
- ✅ 检查未提交的更改
- ✅ 确保在主分支
- ✅ 拉取最新代码
- ✅ 安装依赖
- ✅ 构建项目
- ✅ 创建/切换到 gh-pages 分支
- ✅ 推送到 GitHub Pages
- ✅ 显示访问地址

### 2. 批量部署脚本

使用 `batch-deploy.sh` 脚本进行多个项目的批量部署：

```bash
# 给脚本添加执行权限（首次使用）
chmod +x batch-deploy.sh

# 部署当前项目
./batch-deploy.sh

# 部署指定目录下的所有项目
./batch-deploy.sh ~/my-projects

# 查看帮助信息
./batch-deploy.sh --help
```

**批量部署特性：**
- 🔍 自动扫描 React + Vite 项目
- 📊 显示部署统计信息
- 🎨 彩色输出，易于阅读
- ⚠️ 智能跳过不符合条件的项目
- 📝 详细的错误信息和提示

### 3. 自动化部署（GitHub Actions）

项目已配置 GitHub Actions 工作流，每次推送到 `main` 分支时自动部署：

**工作流文件：** `.github/workflows/deploy.yml`

**触发条件：**
- 推送到 `main` 分支
- 创建 Pull Request 到 `main` 分支
- 手动触发

**工作流步骤：**
1. 检出代码
2. 设置 Node.js 环境
3. 安装依赖
4. 构建项目
5. 部署到 GitHub Pages

## ⚙️ 配置说明

### Vite 配置

项目的 `vite.config.ts` 已配置正确的 base 路径：

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/diagram-rebuild/' : '/',
  // ...
})
```

### GitHub Pages 设置

1. 进入 GitHub 仓库设置页面
2. 找到 "Pages" 选项
3. 选择 "Deploy from a branch"
4. 选择 `gh-pages` 分支
5. 选择 `/ (root)` 目录
6. 点击 "Save"

## 📋 部署前检查清单

- [ ] 项目是 Git 仓库
- [ ] 已配置远程仓库
- [ ] 没有未提交的更改
- [ ] 在 `main` 或 `master` 分支
- [ ] `package.json` 包含 `build` 脚本
- [ ] `vite.config.ts` 配置了正确的 base 路径
- [ ] GitHub 仓库启用了 Pages 功能

## 🌐 访问地址

部署成功后，你的应用将在以下地址可用：

```
https://[用户名].github.io/[仓库名]/
```

例如：`https://zyxcambridge.github.io/diagram-rebuild/`

## 🔧 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本是否兼容
   - 确保所有依赖都已安装
   - 检查 TypeScript 错误

2. **页面显示 404**
   - 确认 GitHub Pages 设置正确
   - 检查 base 路径配置
   - 等待几分钟让 GitHub Pages 生效

3. **资源加载失败**
   - 检查 `vite.config.ts` 中的 base 配置
   - 确保仓库名与配置一致

4. **权限错误**
   - 确保有仓库的写入权限
   - 检查 GitHub token 是否有效

### 调试技巧

```bash
# 查看构建输出
npm run build

# 本地预览构建结果
npm run preview

# 检查 git 状态
git status

# 查看远程仓库
git remote -v
```

## 📚 相关文档

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Actions 文档](https://docs.github.com/en/actions)

## 🤝 贡献

如果你发现部署脚本有问题或有改进建议，欢迎提交 Issue 或 Pull Request！