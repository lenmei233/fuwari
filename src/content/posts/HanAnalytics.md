---
title: 使用Cloudflare部署你的免费网站统计 -- Web-Analytics
published: 2025-10-18
description: '本站统计功能实现的方法 '
image: '/images/68747470733a2f2f69302e77702e636f6d2f757869616f68616e2e6769746875622e696f2f76322f323032342f30392f313732373030373933372e77656270.webp'
tags: [Web-Analytics, Web, Cloudflare]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---
:::ai-summary{model="deepseek-v4.1-flash" provider="deepseek" updated="2026-09-27"}

作者把博客原本只能登录 Cloudflare 后台查看的 Web Analytics，换成了一个可以公开访问的统计仪表板：借助开源项目 HanAnalytics，把「数据只对站长可见」变成「一个链接即可查看」，且全程托管在 Cloudflare 免费额度内。

### 📌 为什么需要它

博客部署在 Cloudflare Pages 上，官方 Web Analytics 虽然够用，但换个设备查看就要登录并逐层点开菜单，数据也只对站长可见。作者希望有一个随时能打开、还能分享给别人的仪表板。

### 🔧 部署关键步骤

全文按实测顺序走了七个环节：Fork 仓库、复制 Account ID、创建权限合适的 API token、开启 Analytics Engine（变量名 `AnalyticsBinding`、数据集 `AnalyticsDataset`）、创建 Pages 项目并填写 `CLOUDFLARE_ACCOUNT_ID` 等环境变量、在「绑定」里关联 Analytics Engine，最后重新部署访问仪表板。文章还补充了密码访问与网站白名单两项安全功能，并提醒 Analytics Engine 采用抽样统计，数据存在一定误差。

### 🔗 接入自己的网站

部署完成后首次打开没有数据，需要在网站底部插入一行 tracker 脚本并带上自定义的 `data-website-id`，产生有效访问后仪表板即可看到数据。文末附上了作者的演示站点。
::::

## 前言

我的博客部署在 Cloudflare Pages 上，Cloudflare 作为 “赛博菩萨” 免费提供边缘服务器托管网站，还提供了 Web-Analytics 供站长查看网站统计数据。

![博客统计截图](/images/Screenshot%202025-10-18%20at%2020-04-29%20分析和日志%20Web%20Analytics%20Cloudflare.webp)

这一切看似不错，但有个很现实的痛点：官方的统计只能站长自己看，想在手机上瞄一眼数据，得先登录 Cloudflare，再一层层点开菜单——等我找到数据，摸鱼的心情都没了。

而且数据这东西，自己看和能分享是两回事。我就想要一个**打开链接就能看、还能甩给别人看**的仪表板。搜了一圈，发现 GitHub 上有个叫 HanAnalytics 的开源项目，正好解决这个问题，于是决定亲手部署一套。

## 一、HanAnalytics 是啥

::github{repo="uxiaohan/HanAnalytics"}

HanAnalytics 是个简单的网站访问统计 + 仪表板，专门跑在 Cloudflare 上。最大的卖点：**全程零成本**——不需要域名、不需要服务器、不需要数据库，Cloudflare Pages 直接托管，每天 10 万次统计免费额度，个人博客根本用不完。

## 二、实测部署（跟着点就行）

部署前我先翻了仓库的 Readme 和[这篇部署教程](https://www.vvhan.com/article/han-analytics)，流程不复杂，就是步骤有点多。下面是我实测走通的完整顺序，照着点就行。

需要准备：

• CloudFlare 账号 x1

• Github 账号 x1

• 能用的大脑🧠 x1

• 良好的网络环境 x1

### 1. Fork 仓库

首先进入 HanAnalytics 的 GitHub 仓库

::github{repo="uxiaohan/HanAnalytics"}

然后点击 “Use this template”，在弹出的菜单中选择 “Create a new repository”

![创建新仓库截图](/images/e5bb5d834fa4ae78f30849151cd10bef.webp)

之后根据自身需求选择是否公开仓库。

### 2. 登录 CloudFlare

进入 Cloudflare 主页后，按照提示点击左侧 “计算和 AI” 菜单，在二级菜单中点击 “Workers 和 Pages”

![Workers和Pages截图](/images/693fc725bd4ee201e909e726858aef22.webp)

进入 Workers 和 Pages 页面后，点击右侧 Account ID 进行复制备用

![复制Account ID截图](/images/326c1d17e4ac72508154168205fbd34e.webp)

### 3. 创建 Cloudflare API token

访问[Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens)页面，按照操作截图指引创建 API token 并保存备用。创建时需注意权限配置，确保能满足 HanAnalytics 的运行需求。

![API token创建截图1](/images/8736d3b2c0af89f3498f9bd54f0469c3.webp)

![API token创建截图2](/images/80cfcaa5f48e8ad80ab3eb089f605b0a.webp)

![API token创建截图3](/images/fcee8f37-b259-436d-ad4e-6c9da2ab193e.webp)

### 4. 开启分析引擎

在 Cloudflare 里找到 Analytics Engine，按下面填：
```
# 变量名
AnalyticsBinding
# 数据集
AnalyticsDataset
```

![分析引擎设置截图1](/images/Pasted%20image%2020251018202650.webp)

![分析引擎设置截图2](/images/Pasted%20image%2020251018202904.webp)

> 变量名和数据集名称后面绑定时要一字不差地对上，建议直接复制粘贴，别手打。

### 5. 创建 Pages 项目

登录 Cloudflare，创建 Pages 项目，链接之前 Fork 的 GitHub 仓库。架构选择 Vue，然后填入环境变量，环境变量含义如下,大部分人只需要按图片一样填写二个：

![环境变量设置截图](/images/Pasted%20image%2020251018203216.webp)

```
# Cloudflare Workers ID
CLOUDFLARE_ACCOUNT_ID = 你的 Cloudflare Workers ID
# 你的 Cloudflare API token
CLOUDFLARE_API_TOKEN = 你的 Cloudflare API token
CLOUDFLARE_WEBSITE_PWD = # 网站访问密码 (不设置即无需密码访问)
CLOUDFLARE_WEBSITE_WHITELIST = # 可统计的白名单 
格式：  域名,WebSite|域名,WebSite，多个站点使用|分隔 例如：api.vvhan.com,Hello-Han-Api|www.vvhan.com,Hello-HanHexoBlog  (不设置即允许任何统计)
```

完成后部署项目。

### 6. 配置绑定

Cloudflare Pages 部署完成后，在项目的 “设置” 中配置 “绑定”，添加 “Analytics Engine”，变量名称填写 “AnalyticsBinding”，数据集填写 “AnalyticsDataset” 并保存，然后重新部署。

![绑定设置截图](/images/8ad2647d310002722106f5d5e27c48c6.webp)

### 7. 访问仪表板

重新部署完成后，访问 `https://xxxxxx.pages.dev` 就能看到仪表板了（注意：首次部署的域名可能要几分钟才生效，别急着刷新）。

本站演示：[https://analytics.lenmei233.top/](https://analytics.lenmei233.top/) ——没错，现在你也能看到我的博客数据了。

## 三、集成到网站

部署成功后，首次打开页面没有数据，需要集成到自己的网站。在网站底部插入以下代码即可：

```
// 在网站底部插入以下代码即可集成网站分析仪表板
<script defer src="https://xxxxxx.pages.dev/tracker.min.js" data-website-id="自定义网站唯一标识"></script>
```

当出现有效访问后，再次打开仪表板页面即可看到数据。

## 四、功能补充

HanAnalytics 还新增了 “密码访问” 及 “网站白名单” 功能。开启密码后，输入密码才可访问（默认无需密码）；网站白名单功能开启后，只有加白的网站才可计入统计（默认任意网站都可统计）。

## 五、关于数据准确度的一点说明

如果部署后没数据，先确认网站能正常访问、Analytics Engine 已开启——九成的数据问题都出在这两处。

另外提一句：HanAnalytics 底层用的是 Cloudflare Analytics Engine，它**采用抽样统计**（跟 Google Analytics 的抽样一个思路），数据会有一定误差。个人博客看看趋势完全够用，但别拿它当财务报表。
