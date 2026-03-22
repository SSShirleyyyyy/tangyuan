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

这个项目是纯静态站点，可以直接从仓库分支发布。

你只需要：

1. 把项目推到 GitHub 仓库
2. 在 GitHub 仓库里打开 `Settings > Pages`
3. 将 Source 设为 `Deploy from a branch`
4. Branch 选 `main`
5. Folder 选 `/(root)`
6. 点击 `Save`

之后 GitHub 会自动发布，站点地址通常会是：

`https://<你的用户名>.github.io/<仓库名>/`

## 说明

- 当前是纯静态站点，不依赖后端
- 记录保存在浏览器本地存储里，不会跨设备同步
- 根目录包含 `.nojekyll`，用于按静态文件方式直接发布
