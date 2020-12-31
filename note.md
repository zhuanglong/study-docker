# Docker 部署 Express + React + MongoDB + Nginx

[项目地址](https://github.com/zhuanglong/study-docker/tree/express%2Breact%2Bmongodb%2Bnginx)，该教程基于 [express-jwt](https://github.com/zhuanglong/login-demo_node/tree/express-jwt) 项目进行 Docker 部署。

> 环境准备：

- Docker 环境

## 配置前端镜像

**1、在 frontend 目录新建 Dockerfile 文件**

[Dockerfile 文档](https://www.runoob.com/docker/docker-dockerfile.html)
```
### 构建阶段

# 构建 node 镜像，apline 版本会小很多
FROM node:alpine as builder

# 在容器中创建一个目录
RUN mkdir -p /web

# 复制本地目录的文件到 web 目录
COPY . /web

# 定位到容器的工作目录
WORKDIR /web

# 配置 yarn 镜像地址，加速访问
RUN yarn config set registry https://registry.npm.taobao.org

# 安装项目依赖
RUN yarn

# 打包项目
RUN npm run build

### 运行阶段

# 构建 nginx 镜像
FROM nginx

# 在 builder 阶段拷贝构建物到 nginx 所需目录
COPY --from=builder /web/build /usr/share/nginx/html

# 覆盖 nginx 配置
COPY ./default.conf /etc/nginx/conf.d/default.conf

# 将宿主机端口绑定至容器端口，这样宿主机就能访问容器
EXPOSE 80

# 使用 daemon off 的方式将 nginx 运行在前台保证镜像不至于退出
CMD ["nginx", "-g", "daemon off;"]
```

**2、在 frontend 目录新建 .dockerignore 文件**

当构建镜像时会会忽略以下目录或文件

```
node_modules/
npm-debug.log
```

**3、在 frontend 目录新建 default.conf 文件**

这是 nginx 配置文件

```
server {
  listen 80;

  root /usr/share/nginx/html;

  location / {
    try_files $uri $uri/ /index.htmcl;
  }

  location /api {
    # 此处 server_container 容器名，在同一个自定义网络下会自动解析为 IP 连接
    proxy_pass http://server_container:9090;

    # 参考 https://www.cnblogs.com/czlun/articles/7010604.html
    # http://xxx:9000/api/sign-in => http://server_container:9090/sign-in
    # $1 是 (.*) 的内容，也就是 sign-in，再把 sign-in 拼到 http://server_container:9090
    # ，即 http://server_container:9090/sign-in
    rewrite "^/api/(.*)$" /$1 break;
  }
}
```

react 代理配置和 nginx 代理逻辑基本一样的，

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231103029.png)

## 配置后端镜像

**1、在 backend 目录新建 Dockerfile 文件**

```
# 构建 node 镜像，apline 版本会小很多
FROM node:alpine

# 在容器中创建一个目录
RUN mkdir -p /server

# 复制本地目录的文件到 server 目录
COPY . /server

# 定位到容器的工作目录
WORKDIR /server

# 配置 yarn 镜像地址，加速访问
RUN yarn config set registry https://registry.npm.taobao.org

# 安装项目依赖
RUN yarn

# 将宿主机端口绑定至容器端口，这样宿主机就能访问容器
EXPOSE 9090

# 每次启动容器都会执行这个命令
CMD ["npm", "run", "serverstart"]
```

**2、在 backend 目录新建 .dockerignore 文件**

当构建镜像时会会忽略以下目录或文件

```
node_modules/
npm-debug.log
```

**3、数据库帐号信息配置**

新建 backend\utils\secret.js

```
module.exports = {
  // 数据库配置
  dbConfig: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || '27017',
    username: process.env.DB_USERNAME || '',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'loginDemo'
  }
}
```

`process.env.xxx` 哪里来的？后面会讲到

修改 backend\routes\index.js，封装数据库连接函数

查看 [index.js](https://github.com/zhuanglong/study-docker/blob/express%2Breact%2Bmongodb%2Bnginx/backend/routes/index.js)

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231104103.png)

## docker-compose.yml

> 该配置用于整合应用环境，简化执行命令

[docker-compose 文档](https://www.runoob.com/docker/docker-compose.html)

```
version: '3'
services:
  mongodb:
    image: mongo:latest
    ports:
      - 27017:27017
    # 初始化时设置数据库用户信息
    environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=root123456
    # volumes:
    #   # - ./db:/data/db
    networks:
      - express-jwt
    container_name: mongodb_container
  server:
    build: ./backend
    image: server
    ports:
      - 9090:9090
    # server 容器的环境变量，在 ./backend/utils/secret.js 里面会使用到
    environment:
      DB_HOST: mongodb_container
      DB_USERNAME: root
      DB_PASSWORD: root123456
    # 以依赖顺序启动服务，先启动 mongodb，才会启动 server
    depends_on:
      - mongodb
    networks:
      - express-jwt
    container_name: server_container
  web:
    build: ./frontend
    image: web
    ports:
     - "9000:80"
    depends_on:
      - server
    networks:
      - express-jwt
    container_name: web_container
networks:
  express-jwt:
```

```
environment:
      - MONGO_INITDB_ROOT_USERNAME=root
      - MONGO_INITDB_ROOT_PASSWORD=root123456
```

用于设置数据库的帐号和密码

```
environment:
      DB_HOST: mongodb_container
      DB_USERNAME: root
      DB_PASSWORD: root123456
```

用于区分本地开发和生产的数据库配置

## 构建镜像

切换到项目目录，执行 `docker-compose up -d` 进行构建

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231111349.png)

构建成功

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231115344.png)

构建的镜像和启动的容器

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231143648.png)

在宿主机用浏览器打开 http://192.168.99.100:9000

![](https://gitee.com/zloooong/image_store/raw/master/img/20201231115514.png)

## 总结

用 Docker 部署前后端应用并不复杂，学习期间查阅了很多教程资料，也踩了不少坑，断断续续用了一周时间，对 Docker 也有了整体的认识。

## 参考

- [\[译\] 面向 React 和 Nginx 的 Docker 多阶段构建](https://juejin.cn/post/6844904055190339598)

- [前端部署--基于nginx和docker](https://juejin.cn/post/6901322566108102670)

- [Docker 实战教程：使用 docker-compose 管理 MongoDB](https://learnku.com/server/t/37106)

- [MongoDB docker 添加用户名 密码](https://www.jianshu.com/p/96fa51551f52)

- [避坑！！！docker安装mongodb及配置用户权限](https://www.cnblogs.com/nimantou/p/12981243.html)

- 项目参考
    - [Docker 部署 React 全栈应用（三）](https://juejin.cn/post/6908534600578891789)

    - [juejin-ariticle-liked-helper](https://github.com/6fedcom/juejin-ariticle-liked-helper)
    
    - [Mood](https://github.com/wsydxiangwang/Mood)