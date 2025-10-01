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
最近国庆假期闲来无事,前段时间我的Typecho搭建的博客的服务商跑路了,导致我失去了我的博客,之前的博客也没什么内容,也不感觉可惜,但是身为一个Coder怎么能不能有博客呢,这相当于是你的互联网上存在的证明,是交友的渠道,是精神的延续

所以其实在我的博客消失后,我就计划使用一个更加稳定的方案搭建我的博客,因为本人经济实力不足,无力长期购买服务器,并且本着能不花钱就不花钱的原则,果断抛弃动态的博客**Wordpress**,**Typecho** 等,这些博客系统虽好,但是依赖于服务器至少需要PHP环境,所以我选择静态博客的方案

于是我Google 搜索了解到目前主流的方案有使用 **Hexo** , **Vitepress** ,**Vuepress** 等方案,我简单折腾了一下发现想要配置一个好看,快速上手的博客非常麻烦,不仅需要安装各种环境,主要是配置时间很长,无法获取及时的反馈导致我在配置时就失去了耐心

所以在一次偶然的机会,我发现了Fuwar这个静态博客框架,并且那篇文章提供了详细的教程 [原文](https://2x.nz/posts/fuwari/) 我根据教程快速的上手了一下,很快就能够搭建出一个一看就能够拥有无限想象的博客

![[Pasted image 20251001201156.png](https://img.111pan.cn/f/bvSw/Pasted%20image%2020251001201156.png)]

## 让我们开始吧
###### 首先我们需要用到下列东西
- 能够独立思考的大脑 x 1 : 用于看懂本文和解独立决可能遇到的问题
- Github账号 x 1 : 用于Fork Github仓库和存储你的博客
- [Git 版本控制工具](https://git-scm.com/downloads) x 1 : 用于Clone Github仓库到本地和后续上传你的博客
- [Node.js — Run JavaScript Everywhere (nodejs.org)](https://nodejs.org/en) x 1：Fuwari基于Node.js，你需要安装这个来使用Fuwari
- [Cloudflare](https://cloudflare.com)账号 x 1 : 用于将你的博客部署到Cloudflare Pages 和 免费的SSL等服务
- [Obsidian](https://obsidian.md/) x 1 : 一个巨好用的Markdown文本编辑器,可以帮助你直观的看到你编写的Markdown文本效果,用来写博客刚刚好
###### 首先Fork一份Fuwar
- 登录Github
- 前往Fuwar的Github模板仓库:[https://github.com/saicaca/fuwari](https://github.com/saicaca/fuwari)
- ![[caac1edd66059c5431084ef9b6886510.png](https://img.111pan.cn/f/2PuB/caac1edd66059c5431084ef9b6886510.png)]
-  如上图点击Fork按钮
- 进入一个新的页面,直接点击下面的绿色按钮即可,因为我这里已经Fork过了所以看不到那个页面了
- 然后前往你刚才Fork后的仓库![[55c6638f552a22673b8cd78a58cd3dfe.png]](![/assets/images/55c6638f552a22673b8cd78a58cd3dfe.png](https://img.111pan.cn/f/mZTX/55c6638f552a22673b8cd78a58cd3dfe.png))
- 先点击上图中的绿色按钮,再到展开的窗口中复制最上面的那一行命令
- 到你的电脑的一个合适的位置创建一个文件夹,比如**blog**
- 然后使用终端导航到你创建的文件夹中
- 在终端运行你刚才复制的命令,在网络环境好的情况下等待完成后,你可以发现你的文件夹下出现了一个 **fuwari** 的文件夹
- 在你的终端中运行`npm install -g pnpm` 以安装pnpm
- 在项目根目录安装依赖：`pnpm install` 和 `pnpm add sharp`
- 完成这些后你就获得了最顶上图片中的效果

最后你只需要参考Github模板仓库:[https://github.com/saicaca/fuwari](https://github.com/saicaca/fuwari)的Readme.md进行配置即可

## 在你配置后可能用到的命令

###### 新建文章: `pnpm new-post <这里填写你的文章标题>`
在根目录下的 `src/content/posts` 文件夹中会多出一个 `你的文章标题.md`文件

###### 本地调试:`pnpm dev`
可以在本地预览效果
###### 构建站点 `pnpm build`
将生产站点构建到 `./dist/`

###### 配置Git账号
`git config --global user.name "你的Github用户名"`
`git config --global user.email "你的Github邮箱@example.com"`

###### 上传Github
提交所有文件 `git add .`
添加提交 `git commit -m "你的提交信息"`
推送到远程仓库 `git push`
