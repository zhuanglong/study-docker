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
# COPY ./build /usr/share/nginx/html

# 覆盖 nginx 配置
COPY ./default.conf /etc/nginx/conf.d/default.conf

# 将宿主机端口绑定至容器端口，这样宿主机就能访问容器
EXPOSE 80

# 使用 daemon off 的方式将 nginx 运行在前台保证镜像不至于退出
CMD ["nginx", "-g", "daemon off;"]
