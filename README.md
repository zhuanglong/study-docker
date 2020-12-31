# Docker 部署 Node 项目

> 环境准备：

- Docker 环境
- 基于 express-generator 初始化的 Node 项目

## 构建镜像和容器

用 express-generator 初始化的项目，结构如下：

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222164854.png)

**1. 使用 Dockerfile 定制镜像**

项目根目录新建文件 Dockerfile

[Dockerfile 文档](https://www.runoob.com/docker/docker-dockerfile.html)

```
# 构建 node 镜像，apline 版本会小很多
FROM node:alpine

# 在容器中创建一个目录
RUN mkdir -p /server

# 复制本地目录的文件到 server 目录
COPY . /server

# 定位到容器的工作目录
WORKDIR /server

# 配置 npm 镜像地址，加速访问
RUN npm config set registry https://registry.npm.taobao.org

# 安装项目依赖
RUN npm install

# 将宿主机端口绑定至容器端口，这样宿主机就能访问容器，-P 指令会读取这个参数随机分配宿主机的端口
EXPOSE 3000

# 每次启动容器都会执行这个命令
# 注：CMD 不同于 RUN，CMD 用于指定在容器启动时所要执行的命令，而 RUN 用于指定镜像构建时所要执行的命令。
#    RUN 指令创建的中间镜像会被缓存，并会在下次构建中使用。如果不想使用这些缓存镜像，可以在构建时指定 --no-cache参数，如：docker build --no-cache
CMD ["npm", "start"]
```

项目根目录新建文件 .dockerignore，用于构建镜像时忽略某些文件上传到 Docker 服务器

```
node_modules
npm-debug.log
```

**2. 构建镜像**

首先启动 Docker 虚拟机（`test` 是我已经创建好的虚拟机），[创建 Docker 虚拟机教程](https://www.runoob.com/docker/docker-machine.html)

`docker-machine start test`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222170732.png)

查看虚拟机状态，可以看到已运行，记下虚拟机的 ip，下面会用到

`docker-machine ls`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222175306.png)

切换到项目目录

`cd /D/My/Docker/docker-express-demo`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222172653.png)

进行构建，"docker-express-demo"是应用名称， "."表示当前目录

`docker build -t docker-express-demo .`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222173929.png)

查看已安装的镜像

`docker images`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222174025.png)

**3. 通过 docker-express-demo 镜像创建一个容器并运行**

`docker run -d -p 3030:3000 docker-express-demo`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222174651.png)

> -d：表明容器会在后台运行。  
-p：表示端口映射，把本机的 3030 端口映射到容器的 3000 端口，这样外网就能通过本机的 3030 端口访问。

查看容器状态，`docker ps -a`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222174727.png)

进入容器，`docker exec -it da2483e9b4e1 sh`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201223145018.png)

**4. 访问应用**

curl 测试

`curl -i 192.168.99.100:3030`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222175937.png)

浏览器测试

![](https://gitee.com/zloooong/image_store/raw/master/img/20201222175648.png)

## docker-compose 简化执行命令

> 通过上面可以发现，每次制作镜像，生成容器，运行容器，都要输入很多命令，有点繁琐，可以利用 docker-compose 简化命令。 

[docker-compose 文档](https://www.runoob.com/docker/docker-compose.html)

项目根目录新建文件 docker-compose.yml

```
version: '3'
services:
  server:
    build:
      context: ./
      dockerfile: ./Dockerfile
    image: express-demo
    ports:
      - 3030:3000
    container_name: express-demo-container
```

> - server: 服务名
> - build: 构建相关，`context: ./` 表示构建当前目录，`dockerfile` 导入配置
> - image: 构建的镜像名称
> - ports: 端口映射
> - container_name: 构建的容器名称


切换到项目目录

`cd /D/My/Docker/docker-express-demo`

构建命令

`docker-compose up -d --build`

![](https://gitee.com/zloooong/image_store/raw/master/img/20201223164520.png)

成功运行

![](https://gitee.com/zloooong/image_store/raw/master/img/20201223164434.png)

docker-compose 基本命令

![](https://gitee.com/zloooong/image_store/raw/master/img/20201223173745.png)

## 总结

创建 Docker 虚拟机，用 Dockerfile 定制镜像配置，然后构建镜像，创建容器并运行，还可以用 docker-compose.yml 简化执行命令。

## 参考

- [Docker部署 nodejs项目](https://www.jianshu.com/p/ab76ba86eafc)

- [Docker 搭建你的第一个 Node 项目到服务器](https://blog.csdn.net/qq_45401061/article/details/103782461)

- [Docker 部署 React 全栈应用（三）](https://juejin.cn/post/6908534600578891789#heading-1)