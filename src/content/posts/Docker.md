---
title: Docker：轻量级容器化技术的实战指南
published: 2025-11-19
description: '开始使用Docker吧，你会发现它将成为你开发工具箱中不可或缺的利器！'
image: '/images/docker-logo-guide-logos-1.svg'
tags: [Docker,容器]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---
## 前言

最近这段平常的学习空闲时间，闲来无事，回顾我这些年的开发历程，从最初的手动部署环境，到使用虚拟机，再到现在的容器化技术，真是感慨万千。记得刚开始工作的时候，每次为新项目配置开发环境都是一场噩梦——不同项目需要不同版本的依赖，经常出现"在我机器上能跑"的经典问题。

后来接触了虚拟机，虽然解决了环境隔离的问题，但虚拟机太重了，启动慢，占用资源多，迁移也不方便。直到我发现了Docker这个神器，才真正体会到什么是"一次构建，到处运行"的便利。

作为一个Coder，怎么能不掌握Docker呢？这相当于是你在云时代的生存技能，是团队协作的基石，更是现代应用部署的标准配置。

所以在其我的开发流程中，Docker已经成为了不可或缺的一部分。它不仅让我摆脱了环境配置的困扰，还让我的应用部署变得异常简单和可靠。

## 让我们开始吧

### 首先我们需要用到下列东西

- **能够独立思考的大脑 x 1**：用于理解Docker的核心概念和解决可能遇到的问题
    
- **Docker Desktop x 1**：Windows/Mac用户可以直接下载这个集成环境，Linux用户需要单独安装Docker引擎
    
- **Docker Hub账号 x 1**：用于拉取和推送镜像，类似于GitHub之于代码
    
- **Git版本控制工具(链接1)**​ x 1：用于管理你的Dockerfile和docker-compose.yml文件
    
- **一个好奇的心 x 1**：Docker的世界很有趣，值得你深入探索
    

### Docker是什么？为什么需要它？

Docker是一个开源的容器化平台，它让你能够将应用及其所有依赖打包到一个轻量级、可移植的容器中。与传统的虚拟机不同，Docker容器共享主机操作系统内核，因此更加轻量级和高效。

**Docker的核心优势：**

- **轻量级**：容器启动秒级完成，资源占用少
    
- **可移植性**：一次构建，到处运行
    
- **隔离性**：每个容器都是独立的运行环境
    
- **效率**：比虚拟机更高效，性能损失小
    

### 快速上手Docker

#### 1. 安装Docker

**Mac/Windows用户：**

直接下载[Docker Desktop](https://www.docker.com/products/docker-desktop/)并安装，按照向导完成设置即可。

**Linux用户(Ubuntu为例)：**

```
# 卸载旧版本
sudo apt-get remove docker docker-engine docker.io containerd runc

# 安装必要依赖
sudo apt-get update
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 添加Docker官方GPG密钥
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 设置仓库
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker引擎
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 验证安装
sudo docker run hello-world
```

#### 2. Docker核心概念

- **镜像(Image)**：只读的模板，包含运行应用所需的代码、运行时、库和环境变量
    
- **容器(Container)**：镜像的可运行实例
    
- **Dockerfile**：定义如何构建镜像的文本文件
    
- **Docker Hub**：官方的镜像仓库，类似于GitHub之于代码
    

#### 3. 第一个Docker实践：运行一个Nginx web服务器

```
# 拉取官方Nginx镜像
docker pull nginx

# 运行Nginx容器
docker run -d -p 8080:80 --name my-nginx nginx

# 访问 http://localhost:8080 查看运行结果
```

就这么简单！你已经成功运行了一个Web服务器。

#### 4. 创建自己的Docker镜像

让我们创建一个简单的Node.js应用的Docker镜像：

**1. 项目结构：**

```
my-node-app/
├── app.js
├── package.json
└── Dockerfile
```

**2. Dockerfile示例：**

```
# 使用官方Node.js镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /usr/src/app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制应用源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 定义容器启动时执行的命令
CMD ["node", "app.js"]
```

**3. 构建和运行：**

```
# 在项目目录下构建镜像
docker build -t my-node-app .

# 运行容器
docker run -d -p 3000:3000 --name my-running-app my-node-app

# 访问 http://localhost:3000
```

### Docker Compose：多容器应用管理

对于复杂的应用，通常需要多个服务协同工作（如Web应用+数据库）。这时候就需要Docker Compose了。

**docker-compose.yml示例：**

```
version: '3.8'

services:
  web:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - redis
    environment:
      - NODE_ENV=production

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
```

**使用方法：**

```
# 启动所有服务
docker-compose up -d

# 查看运行中的服务
docker-compose ps

# 停止并删除服务
docker-compose down
```

### 实战技巧和最佳实践

#### 1. Dockerfile优化技巧

- **使用官方镜像**：尽量使用官方维护的镜像
    
- **选择合适的基础镜像**：如使用alpine版本减小镜像大小
    
- **多阶段构建**：减小最终镜像大小
    
- **合理使用缓存**：正确排序Dockerfile指令以利用构建缓存
    

**多阶段构建示例：**

```
# 构建阶段
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 生产阶段
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm install --production
EXPOSE 3000
CMD ["node", "dist/app.js"]
```

#### 2. 常用命令速查

```
# 镜像相关
docker images                  # 列出所有镜像
docker pull <image>            # 拉取镜像
docker rmi <image>             # 删除镜像

# 容器相关
docker ps                      # 列出运行中的容器
docker ps -a                   # 列出所有容器
docker run [options] <image>   # 运行容器
docker start/stop/restart <container>  # 控制容器
docker exec -it <container> /bin/bash  # 进入容器
docker logs <container>        # 查看容器日志
docker rm <container>          # 删除容器

# 镜像构建
docker build -t <tag> .        # 构建镜像

# 清理
docker system prune            # 清理无用资源
```

#### 3. 数据持久化

容器是临时的，要持久化数据需要使用卷(volumes)或绑定挂载(bind mounts)：

```
# 创建卷
docker volume create my-volume

# 运行容器并挂载卷
docker run -d -v my-volume:/app/data my-image

# 或者使用绑定挂载(宿主机目录映射到容器)
docker run -d -v /host/path:/container/path my-image
```

### 结语

Docker真的改变了我的开发方式。它不仅解决了环境一致性的问题，还让部署变得如此简单。还记得我第一次在生产环境使用Docker部署应用时，那种"无论在哪里都能完美运行"的安心感，是传统部署方式无法给予的。

作为一个Coder，掌握Docker不仅仅是为了部署应用，更是为了理解现代软件架构和DevOps实践的基础。它让我们能够更专注于业务逻辑的开发，而不是环境配置的琐事。

现在，每当我开始一个新项目，第一件事就是写Dockerfile和docker-compose.yml。这已经成为了我的标准工作流程，也是我推荐给所有开发者的最佳实践。

**Docker的魅力在于：一次构建，到处运行；简单配置，复杂管理；小而强大，轻而可靠。**

开始使用Docker吧，你会发现它将成为你开发工具箱中不可或缺的利器！