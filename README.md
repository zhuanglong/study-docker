# Docker 部署 Express + React + MongoDB + Nginx

[开发笔记](https://github.com/zhuanglong/study-docker/tree/express%2Breact%2Bmongodb%2Bnginx/note.md)

## Docker 部署

1. 安装 Docker 环境

2. 构建镜像

    切换到项目根目录，`docker-compose up -d --build`

3. 验证是否正常运行

    在宿主机用浏览器打开 http://192.168.99.100:9000

## 本地开发

### backend 后端代码

开始项目：

1. 开启 mongoBD
    
   首先安装好 mongoDB，然后命令 `mongod --dbpath D:\Develop\DB\Mongodb\data` 启动数据库

   [安装教程](https://www.runoob.com/mongodb/mongodb-tutorial.html)

2. 切换到 backend 目录

    安装依赖，`yarn` or `npm i`

    启动项目，`npm start`

### frontend 前端代码

开始项目：

1. 切换到 frontend 目录

    安装依赖，`yarn`

    启动项目，`npm start`