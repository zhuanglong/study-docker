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
