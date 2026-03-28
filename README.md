# Pourover Coffee Journal

一个给手冲咖啡记录、设备档案和拍照辅助识别使用的本地优先 Web App / PWA。

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
npm run build:bundle
OPENAI_API_KEY=你的key HOST=0.0.0.0 PORT=4174 npm run serve:local
```

然后打开 `http://127.0.0.1:4174`。

## 部署到 Render

如果你想给朋友公开试用，并且保留拍照识别接口，推荐直接部署到 Render。

仓库里已经带了 [render.yaml](./render.yaml)，部署时只需要：

1. 把项目推到 GitHub 仓库
2. 在 Render 新建 `Blueprint` 或 `Web Service`
3. 连接这个 GitHub 仓库
4. 保持默认的 build / start 配置
5. 在 Render 环境变量里补上 `OPENAI_API_KEY`
6. 部署完成后，把公开 URL 发给朋友

Render 会读取：

- `buildCommand`: `npm install && npm run build:bundle`
- `startCommand`: `HOST=0.0.0.0 npm run serve:local`
- `healthCheckPath`: `/health`

## 说明

- 记录默认保存在浏览器本地存储里，不会跨设备同步
- 拍照识别接口依赖 `OPENAI_API_KEY`
- 如果不配置 `OPENAI_API_KEY`，拍照识别会回退到本地 OCR
