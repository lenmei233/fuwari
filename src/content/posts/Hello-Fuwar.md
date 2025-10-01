---
title: Hello-Fuwar
published: 2025-10-01
description: '记录小站搭建过程'
image: 'https://img.111pan.cn/f/XasW/Screenshot%202025-10-01%20at%2019-45-42.png'
tags: [Fuwari]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---
## 前言
最近国庆假期闲来无事，前段时间我的Typecho搭建的博客的服务商跑路了，导致我失去了我的博客。之前的博客也没什么内容，倒也不感觉可惜，但身为一个Coder，怎么能没有自己的博客呢？这相当于是你在互联网上的存在证明，是交友的渠道，也是精神的延续。

所以其实在我的博客消失后，我就计划用一个更稳定的方案搭建新博客。因为本人经济实力不足，无力长期购买服务器，且本着“能不花钱就不花钱”的原则，果断抛弃了动态博客——像**Wordpress**、**Typecho**这类系统虽好，但依赖服务器（至少需要PHP环境），因此我选择了静态博客方案。

于是我通过Google搜索了解到，目前主流的静态博客方案有**Hexo**、**Vitepress**、**Vuepress**等。我简单折腾了一下发现，想要配置一个好看、易上手的博客其实很麻烦：不仅要安装各种环境，关键是配置周期长，无法及时看到效果，导致我在配置阶段就失去了耐心。

直到一次偶然的机会，我发现了Fuwari这个静态博客框架，而且那篇介绍文章还提供了详细教程（[原文链接](https://2x.nz/posts/fuwari/)）。我跟着教程快速上手，很快就搭建出了一个“能让人看到无限可能”的博客雏形。

![博客雏形截图](https://img.111pan.cn/f/bvSw/Pasted%20image%2020251001201156.png)

## 让我们开始吧
###### 首先我们需要准备这些工具
- 能够独立思考的大脑 x 1：用于看懂本文，以及独立解决可能遇到的问题
- Github账号 x 1：用于Fork仓库和存储博客代码
- [Git 版本控制工具](https://git-scm.com/downloads) x 1：用于将Github仓库克隆到本地，以及后续上传博客内容
- [Node.js](https://nodejs.org/en) x 1：Fuwari基于Node.js开发，需安装此环境才能运行
- [Cloudflare](https://cloudflare.com)账号 x 1：用于将博客部署到Cloudflare Pages，同时获取免费SSL证书等服务
- [Obsidian](https://obsidian.md/) x 1：一款非常好用的Markdown编辑器，能实时预览文本效果，用来写博客刚刚好

###### 第一步：Fork Fuwari仓库
1. 登录你的Github账号
2. 访问Fuwari的官方模板仓库：[https://github.com/saicaca/fuwari](https://github.com/saicaca/fuwari)
3. 点击仓库页面右上角的「Fork」按钮（如下图）
   ![点击Fork按钮截图](https://img.111pan.cn/f/2PuB/caac1edd66059c5431084ef9b6886510.png)
4. 跳转后无需修改其他配置，直接点击绿色的「Create fork」按钮即可（注：若已Fork过，此按钮会显示为「Sync fork」）
5. 进入你Fork后的仓库页面，点击绿色的「Code」按钮，复制弹出窗口中最上方的Git地址（示例：`https://github.com/你的用户名/fuwari.git`）
   ![复制Git地址截图](https://img.111pan.cn/f/mZTX/55c6638f552a22673b8cd78a58cd3dfe.png)

###### 第二步：本地部署环境
1. 在电脑上新建一个文件夹（如命名为「blog」），用于存放博客代码
2. 打开终端，通过`cd 文件夹路径`命令导航到这个新建文件夹（例：`cd /Users/你的用户名/Documents/blog`）
3. 在终端执行刚才复制的Git命令，克隆仓库：`git clone https://github.com/你的用户名/fuwari.git`（网络稳定的情况下，等待克隆完成后，文件夹内会出现「fuwari」子文件夹）
4. 安装pnpm包管理工具：在终端执行`npm install -g pnpm`（全局安装，后续可重复使用）
5. 进入Fuwari项目根目录：`cd fuwari`
6. 安装项目依赖：依次执行`pnpm install`和`pnpm add sharp`（sharp用于处理图片资源，是Fuwari的必要依赖）
7. 完成以上步骤后，本地环境就搭建好了，可通过后续命令预览博客效果

最后，你可以参考Fuwari官方仓库的[Readme.md](https://github.com/saicaca/fuwari/blob/main/README.md)，进行博客的基础配置（如修改站点名称、作者信息等）。

## 配置后常用命令汇总
###### 1. 新建文章
```bash
pnpm new-post <你的文章标题>
```
执行后会在项目根目录的 `src/content/posts` 文件夹中，自动生成一个名为「你的文章标题.md」的文件。

###### 2. 本地调试（预览效果）
```bash
pnpm dev
```
执行后终端会显示本地访问地址（通常是 `http://localhost:4321`），打开浏览器访问即可实时预览博客效果，修改内容后页面会自动刷新。

###### 3. 构建生产版本
```bash
pnpm build
```
将博客构建为可部署的静态文件，输出到项目根目录的 `./dist/` 文件夹中（部署时需上传此文件夹内的内容）。

###### 4. 配置Git全局账号（首次使用Git需执行）
```bash
git config --global user.name "你的Github用户名"
git config --global user.email "你的Github注册邮箱"
```

###### 5. 上传代码到Github（更新博客后）
1. 提交所有修改的文件：`git add .`（注意末尾的点，表示“所有文件”）
2. 添加提交说明：`git commit -m "你的提交信息"`（示例：`git commit -m "新增Hello-Fuwar文章"`）
3. 推送到远程仓库：`git push`（首次推送可能需要输入Github账号密码或Token，按提示操作即可）

## 修复说明
1. **核心问题修复**：删除了图片引用中的「嵌套括号」（如原`![[xxx.png](url)]`改为`![描述](url)`），符合Markdown标准语法，避免Vite/Rollup解析路径错误；
2. **格式优化**：补充了步骤编号、命令代码块，调整了标点符号和换行，提升可读性；
3. **链接优化**：将原文中的“原文”文字改为可点击的「原文链接」，方便直接跳转；
4. **细节修正**：补充了Fork步骤中的按钮名称（如「Create fork」）、命令执行的上下文（如“进入项目根目录后执行”），减少操作歧义。