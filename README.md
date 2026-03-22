# Pourover Coffee Journal

一个给手冲咖啡记录、设备档案和拍照辅助建议使用的静态 Web App 原型。

## 本地使用

1. 安装依赖（仅测试需要）：

```bash
npm install
```

2. 运行测试：

```bash
npm test
```

3. 本地预览：

```bash
python3 -m http.server 4173
```

然后打开 `http://127.0.0.1:4173`。

## 发布到 GitHub Pages

这个仓库已经带好了 GitHub Pages 工作流：

- 工作流文件：`.github/workflows/deploy-pages.yml`
- 构建命令：`npm run build:pages`

你只需要：

1. 把项目推到 GitHub 仓库
2. 在 GitHub 仓库里打开 `Settings > Pages`
3. 将 Source 设为 `GitHub Actions`
4. 推送到 `main` 分支

之后 GitHub 会自动部署，站点地址通常会是：

`https://<你的用户名>.github.io/<仓库名>/`

## 说明

- 当前是纯静态站点，不依赖后端
- 记录保存在浏览器本地存储里，不会跨设备同步
