# VisTrans-AI
基于AI技术的人物三视图自动生成工具，只需上传一张人物图片，即可快速生成角色的三视图参考。集成ComfyUI作为后端AI处理引擎，提供简洁易用的Web界面，支持图片保存与历史查看功能。

## 项目简介

"视界立转"(VisTrans)是一款结合AI技术的角色设计辅助工具，能够将单张人物图像快速转换为三视图，为艺术创作、角色设计、建模参考等领域提供便捷解决方案。本项目集成ComfyUI作为后端AI处理引擎，提供简洁易用的Web界面，让用户无需复杂操作即可获得专业效果。

## 功能特点

- **一键生成**：上传单张人物图像，自动生成正面、侧面、背面三视图
- **简洁界面**：直观的用户界面，操作简单明了
- **历史记录**：支持查看历史生成图片，方便对比和选择
- **本地保存**：一键保存生成结果到本地
- **进度显示**：实时显示生成进度，提供良好用户体验

## 技术栈

- **前端**：HTML, CSS, JavaScript, jQuery, Three.js
- **后端**：Node.js, Express
- **数据库**：MongoDB
- **AI引擎**：ComfyUI
- **其他工具**：Axios, Multer, WebSocket

## 安装与运行

### 前置要求

- Node.js (v14.0.0或更高)
- MongoDB (v4.0或更高)
- ComfyUI (按官方文档配置)

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/VisTrans-AI.git
cd VisTrans-AI
```

2. 安装依赖
```bash
npm install
```

3. 启动MongoDB
```bash
mongod --dbpath <数据存储路径>
```

4. 启动ComfyUI (按ComfyUI官方文档操作)

5. 启动服务器
```bash
node server.js
```

6. 访问应用
```
http://localhost:4000
```

## 使用指南

1. 点击"进入页面"按钮
2. 点击"上传"按钮选择一张人物图片
3. 点击"开始生成"按钮
4. 等待生成完成
5. 点击"保存图片"将结果下载到本地
6. 点击"历史图片画廊"查看以往生成结果

## 项目结构

```
VisTrans-AI/
├── public/             # 前端静态资源
│   ├── css/            # 样式文件
│   ├── js/             # 前端脚本
│   ├── images/         # 静态图片资源
│   ├── pages/          # 其他页面
│   └── Index.html      # 主页面
├── server.js           # 服务器入口文件
├── uploads/            # 临时上传文件目录
├── saved_images/       # 保存的图片目录
├── package.json        # 项目依赖
└── README.md           # 项目说明
```

## 注意事项

- 确保ComfyUI在8188端口运行
- 应用默认在4000端口运行
- MongoDB默认在27017端口运行
- 上传图片的质量和清晰度会影响生成结果

## 未来计划

- [ ] 增加更多风格选项
- [ ] 支持批量处理
- [ ] 提供API接口
- [ ] 优化移动端体验
- [ ] 增加用户账户系统

## 贡献指南

欢迎提交Issue和Pull Request，一起完善这个项目！

## 许可证

本项目采用MIT许可证，详情请参阅LICENSE文件。 