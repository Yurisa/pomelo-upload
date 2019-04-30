# pomelo-upload
一个基于electron+react+antd的文件上传桌面应用
## 技术栈
使用react+redux+react-router+antd作为页面部分的开发
使用electron将页面打包为桌面应用
使用pdf插件预览pdf文件
使用图片画廊插件
后端采用egg.js 服务端地址：https://github.com/Yurisa/egg-server
采用audio和video为核心开发播放器
支持大文件切分成blob分块上传，后台接收合并
文件下载使用electron的api

## ⌨️ 本地开发

### 克隆代码
```bash
git clone https://github.com/Yurisa/pomelo-upload.git
```

### 安装依赖
```bash
cd pomelo-upload
yarn install
```

### 运行项目
```bash
yarn start

yarn run electron-start
```