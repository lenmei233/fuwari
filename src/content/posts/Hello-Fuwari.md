---
title: Hello-Fuwari
published: 2025-10-01
description: '记录小站搭建过程'
image: '/images/Screenshot%202025-10-01%20at%2019-45-42.webp'
tags: [Fuwari]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---
:::ai-summary{model="deepseek-v4.1-flash" provider="deepseek" updated="2026-09-27"}

作者在 Typecho 服务商跑路、博客数据全丢之后，决定用「零成本 + 稳定」的方案重建个人站点，最终选择了静态博客框架 Fuwari，并配合 GitHub 与 Cloudflare Pages 完成建站与托管。全文是一篇面向新手的从零搭建记录。

### 🧰 前置准备

需要一个 GitHub 账号、Git、Node.js、一个 Cloudflare 账号，以及 Obsidian 这类 Markdown 编辑器；作者也调侃式地列出「能够独立思考的大脑 x1」。

### 🚀 搭建四步走

一是 Fork Fuwari 官方模板仓库；二是把仓库克隆到本地，安装 pnpm、执行 `pnpm install` 与 `pnpm add sharp` 完成本地环境；三是参考官方 Readme 修改站点名称、作者信息等基础配置；四是推送到 GitHub 并由 Cloudflare Pages 自动构建，同时获得免费 SSL 证书。

### ⌨️ 常用命令速查

文章最后整理了日常会用到的命令：`pnpm new-post <标题>` 新建文章、`pnpm dev` 本地预览、`pnpm build` 构建生产版本，以及首次使用 Git 时的全局账号配置和更新博客后的 `git add` / `git commit` / `git push` 三步上传流程。
::::

## 前言
最近国庆假期闲来无事，前段时间我的Typecho搭建的博客的服务商跑路了，导致我失去了我的博客。之前的博客也没什么内容，倒也不感觉可惜，但身为一个Coder，怎么能没有自己的博客呢？这相当于是你在互联网上的存在证明，是交友的渠道，也是精神的延续。

所以其实在我的博客消失后，我就计划用一个更稳定的方案搭建新博客。因为本人经济实力不足，无力长期购买服务器，且本着“能不花钱就不花钱”的原则，果断抛弃了动态博客——像**Wordpress**、**Typecho**这类系统虽好，但依赖服务器（至少需要PHP环境），因此我选择了静态博客方案。

于是我通过Google搜索了解到，目前主流的静态博客方案有**Hexo**、**Vitepress**、**Vuepress**等。我简单折腾了一下发现，想要配置一个好看、易上手的博客其实很麻烦：不仅要安装各种环境，关键是配置周期长，无法及时看到效果，导致我在配置阶段就失去了耐心。

直到一次偶然的机会，我发现了Fuwari这个静态博客框架，而且那篇介绍文章还提供了详细教程（[原文链接](https://2x.nz/posts/fuwari/)）。我跟着教程快速上手，很快就搭建出了一个“能让人看到无限可能”的博客雏形。

![博客雏形截图](/images/Pasted%20image%2020251001201156.webp)

## 开干：四步把博客跑起来
###### 先准备好这几样东西
- 能够独立思考的大脑 x 1：用于看懂本文，以及独立解决可能遇到的问题
- Github账号 x 1：用于Fork仓库和存储博客代码
- [Git 版本控制工具](https://git-scm.com/downloads) x 1：用于将Github仓库克隆到本地，以及后续上传博客内容
- [Node.js](https://nodejs.org/en) x 1：Fuwari基于Node.js开发，需安装此环境才能运行
- [Cloudflare](https://cloudflare.com)账号 x 1：用于将博客部署到Cloudflare Pages，同时获取免费SSL证书等服务
- [Obsidian](https://obsidian.md/) x 1：一款非常好用的Markdown编辑器，能实时预览文本效果，用来写博客刚刚好

###### 第一步：Fork Fuwari仓库
1. 登录你的Github账号
2. 打开Fuwari的官方模板仓库：[https://github.com/saicaca/fuwari](https://github.com/saicaca/fuwari)
3. 点右上角的「Fork」按钮（如下图）
   ![点击Fork按钮截图](/images/caac1edd66059c5431084ef9b6886510.webp)
4. 跳转后别的不用动，直接点绿色的「Create fork」就行（注：以前 Fork 过的话，这里会显示「Sync fork」）
5. 进到你 Fork 后的仓库，点绿色「Code」按钮，复制最上面那串 Git 地址（类似 `https://github.com/你的用户名/fuwari.git`）
   ![复制Git地址截图](/images/55c6638f552a22673b8cd78a58cd3dfe.webp)

###### 第二步：本地把环境跑起来
1. 在电脑上新建个文件夹（比如叫「blog」），专门放博客代码
2. 终端 `cd` 进去（例：`cd /Users/你的用户名/Documents/blog`）
3. 把仓库克隆下来：`git clone https://github.com/你的用户名/fuwari.git`（网好的话一会儿就下完了，文件夹里会多出个「fuwari」）
4. 装 pnpm：`npm install -g pnpm`（装一次，以后一直能用）
5. `cd fuwari` 进项目根目录
6. 装依赖：先 `pnpm install`，再 `pnpm add sharp`（sharp 负责处理图片，Fuwari 少了它不行）
7. 完事。后面用 `pnpm dev` 就能本地预览了

最后，照着官方仓库的[Readme.md](https://github.com/saicaca/fuwari/blob/main/README.md)改改站点名称、作者信息这些基础配置，你的博客就算有模样了。

## 配置后常用命令汇总
###### 1. 新建文章
```bash
pnpm new-post <你的文章标题>
```
跑完会在 `src/content/posts` 里自动生成「你的文章标题.md」，直接开写就行。

###### 2. 本地预览
```bash
pnpm dev
```
终端会给你一个本地地址（一般是 `http://localhost:4321`），浏览器打开就能实时预览，改完自动刷新，写博客的快乐源泉。

###### 3. 构建生产版本
```bash
pnpm build
```
打包成静态文件扔到 `./dist/` 里，部署时传这堆文件就行。

###### 4. Git 全局账号（第一次用 Git 才要配）
```bash
git config --global user.name "你的Github用户名"
git config --global user.email "你的Github注册邮箱"
```

###### 5. 更新博客后上传
```bash
git add .
git commit -m "你的提交信息"   # 比如 git commit -m "新增一篇摸鱼记录"
git push                        # 第一次推可能要输 Token，按提示来就行
```

---

从 Typecho 跑路到 Fuwari 上线，前后也就折腾了一个假期。静态博客最大的好处就是**省心**：没有数据库可丢、没有 PHP 可挂，代码往 GitHub 一推，Cloudflare 自动构建，全程免费。

如果你也在找地方安放自己的文字，不妨试试这套方案。毕竟，博客这种东西，先跑起来再说，完美可以慢慢迭代——你现在看到的这个站，就是这么长出来的。
