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