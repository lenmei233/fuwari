---
title: Docker：轻量级容器化技术的实战指南
published: 2025-11-19
description: '我的 Docker 实战笔记：从"在我机器上能跑"的灾难，到一次构建、到处运行。'
image: '/images/docker-logo-guide-logos-1.svg'
tags: [Docker,容器]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---

:::ai-summary{model="deepseek-v4.1-flash" provider="deepseek" updated="2026-09-27"}
这篇文章是作者 lenmei233 于 2025 年 11 月发布在个人博客上的 Docker 实战指南，全文约 1700 字，预计阅读 9 分钟。文章以作者从手动部署环境到虚拟机、再到容器化技术的开发历程为引，旨在帮助读者理解并快速上手 Docker。

### 🐳 Docker 是什么，为什么需要它

Docker 是一个开源的**容器化平台**，能够将应用及其所有依赖打包到一个**轻量级、可移植**的容器中。

与传统的虚拟机不同，Docker 容器**共享主机操作系统内核**，因此更加轻量高效。其核心优势包括：

- **轻量级**：容器启动可达秒级，资源占用少
- **可移植性**：一次构建，到处运行
- **隔离性**：每个容器都是独立的运行环境
- **效率**：比虚拟机性能损失更小

### 📦 快速上手与核心概念

文章建议读者准备好 Docker Desktop（Windows/Mac）或 Docker 引擎（Linux），以及 Docker Hub 账号。

**四个核心概念**：

| 概念 | 说明 |
|---|---|
| **镜像（Image）** | 只读的模板，包含代码、运行时、库和环境变量 |
| **容器（Container）** | 镜像的可运行实例 |
| **Dockerfile** | 定义如何构建镜像的文本文件 |
| **Docker Hub** | 官方镜像仓库，类似 GitHub 之于代码 |

文章通过运行一个 Nginx Web 服务器作为第一个实践示例，并进一步演示了如何为 Node.js 应用编写 Dockerfile、构建和运行自定义镜像。

### 🧩 Docker Compose 与最佳实践

对于需要多个服务协同工作的复杂应用（如 Web 应用 + 数据库），文章引入了 **Docker Compose**，通过 `docker-compose.yml` 文件统一管理多容器应用。

实战技巧方面，文章重点介绍了 **Dockerfile 优化**：

- 尽量使用**官方镜像**
- 选择 **alpine 等精简版本**减小镜像体积
- 采用**多阶段构建**减小最终镜像大小
- **合理排序指令**以利用构建缓存

此外还涵盖了**常用命令速查**和**数据持久化**（使用卷 volumes 或绑定挂载 bind mounts）等内容。

### 💎 结语

作者在结语中强调，Docker 已经彻底改变了他的开发方式——解决了环境一致性问题，让部署变得异常简单可靠。掌握 Docker 不仅是部署应用的需要，更是理解现代软件架构和 DevOps 实践的基础。文章用一句话概括了 Docker 的魅力：**“一次构建，到处运行；简单配置，复杂管理；小而强大，轻而可靠。”**
:::
## 前言

要说这几年学到的最值的东西，Docker 肯定算一个。

刚开始折腾开发那会儿，每次换电脑、重装系统，或者接手别人的项目，配环境都是一场小型灾难：Python 版本不对、依赖装不上、明明在我机器上跑得好好的，换台机器就满地报错。那种 "在我机器上能跑" 的经典场面，我真是见了太多次，多到后来都不好意思再说这句话。

后来用过一段虚拟机，环境隔离是解决了，但那玩意儿又重又慢，开个虚拟机喝杯咖啡回来还没进系统，实在受不了。直到遇见 Docker——第一次 `docker run` 起一个服务，几秒钟搞定，那种感觉就像从绿皮车换乘上了高铁。

所以这篇算是我的 Docker 实战笔记，不讲大道理，只讲怎么用、怎么避坑。如果你也被环境配置折磨过，这篇应该对你有用。

## 开干之前，先准备这些

### 需要用到的东西

- **能够独立思考的大脑 x 1**：用于理解Docker的核心概念和解决可能遇到的问题
    
- **Docker Desktop x 1**：Windows/Mac用户可以直接下载这个集成环境，Linux用户需要单独安装Docker引擎
    
- **Docker Hub账号 x 1**：用于拉取和推送镜像，类似于GitHub之于代码
    
- **Git版本控制工具**​ x 1：用于管理你的Dockerfile和docker-compose.yml文件
    
- **一个好奇的心 x 1**：Docker的世界很有趣，值得你深入探索
    

### Docker是什么？一句话讲明白

如果只用一句话：Docker 就是把 "应用 + 它要的一切依赖" 打包成一个箱子，搬到哪都能直接跑。

和虚拟机最大的区别是，容器不用自带整个操作系统，而是**共享宿主机的内核**，所以又轻又快——虚拟机开机按分钟算，容器启动按秒算。

**它的核心优势：**

- **轻量级**：容器启动秒级完成，资源占用少
    
- **可移植性**：一次构建，到处运行
    
- **隔离性**：每个容器都是独立的运行环境
    
- **效率**：比虚拟机更高效，性能损失小
    

### 快速上手：先跑起来再说

别被概念吓到，Docker 上手最快的方式就是直接跑。下面跟着敲一遍，十分钟就能有个直观感受。

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

三行命令，一个 Web 服务器就跑起来了。第一次体验到这种 "说跑就跑" 的感觉，确实有点上头。

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

### Docker Compose：一个管一堆容器

单个容器好办，但真实项目往往是一堆服务凑一块：Web 应用 + 数据库 + 缓存……一个个 `docker run` 会疯掉。这时候就该 Docker Compose 出场了——一个 `docker-compose.yml` 把所有服务一次管起来。

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

### 实战技巧：让我少踩坑的几条经验

#### 1. Dockerfile优化技巧

下面这几条都是血泪换来的：

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

回头看，Docker 解决的其实就一件事：**让 "能跑" 这件事变得可复制**。不再依赖某台机器、某个人的记忆，环境本身变成了代码的一部分，可以版本控制、可以分享、可以回滚。

现在我开新项目的第一件事就是写 Dockerfile——不是因为时髦，而是因为被环境坑过太多次，学乖了。

如果你还没用过 Docker，找个周末下午，按上面的步骤跑一遍。相信我，第一次 `docker-compose up -d` 把一整套服务拉起来的那个瞬间，你会回来感谢我的。