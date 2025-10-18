---
title: Hello-Fuwari
published: 2025-10-18
description: '本站统计功能实现的方法 '
image: '/images/68747470733a2f2f69302e77702e636f6d2f757869616f68616e2e6769746875622e696f2f76322f323032342f30392f313732373030373933372e77656270.jpg'
tags: [Web-Analytics, Web, Cloudflare]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---
## 前言

我的博客部署在 Cloudflare Pages 上，Cloudflare 作为 "赛博菩萨" 免费提供边缘服务器托管网站，还提供了 Web-Analytics 供站长查看网站统计数据。



这一切看似不错，但在其他设备上查看数据时，需要登录 Cloudflare 并逐层打开菜单，非常不便，且数据仅限自己查看。经过一番搜索，我发现了一个 GitHub 开源项目可以解决这个问题。

## 一、HanAnalytics 特点

Han-Analytics 是一个简单的网络分析跟踪器和仪表板，托管在被称为 "赛博菩萨" 的 Cloudflare 上，可无成本稳定运行，每天可达 10 万次免费统计。无需域名、服务器、数据库，托管在 Cloudflare Pages 上即可快速部署网站分析仪表板。

## 二、实测部署

通过阅读 GitHub 仓库的 Readme.md，我了解到其作用和部署教程，于是准备尝试。

需要准备：

- CloudFlare 账号 x1
- Github 账号 x1
- 能用的大脑🧠 x1
- 良好的网络环境 x1

### 1. Fork 仓库

首先进入 HanAnalytics 的 GitHub 仓库，然后点击 "Use this template"，在弹出的菜单中选择 "Create a new repository"



之后根据自身需求选择是否公开仓库。

### 2. 登录 CloudFlare

进入 Cloudflare 主页后，按照提示点击左侧 "计算和 AI" 菜单，在二级菜单中点击 "Workers 和 Pages"



进入 Workers 和 Pages 页面后，点击右侧 Account ID 进行复制备用



### 3. 创建 Cloudflare API token

访问 Cloudflare API token 页面，按照操作截图指引创建 API token 并保存备用。创建时需注意权限配置，确保能满足 HanAnalytics 的运行需求。





### 4. 开启分析引擎

在 Cloudflare 中，点击 Analytics Engine，填写下面的信息：

```
# 变量名
AnalyticsBinding
# 数据集
AnalyticsDataset
```




### 5. 创建 Pages 项目

登录 Cloudflare，创建 Pages 项目，链接之前 Fork 的 GitHub 仓库。架构选择 Vue，然后填入环境变量，环境变量含义如下，大部分人只需要按图片一样填写二个：



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

Cloudflare Pages 部署完成后，在项目的 "设置" 中配置 "绑定"，添加 "Analytics Engine"，变量名称填写 "AnalyticsBinding"，数据集填写 "AnalyticsDataset" 并保存，然后重新部署。



### 7. 访问仪表板

重新部署完成后，访问 https://xxxxxx.pages.dev 即可访问网站分析仪表板（注意：首次部署生成的域名可能需要几分钟时间生效，请耐心等待）。

## 三、集成到网站

部署成功后，首次打开页面没有数据，需要集成到自己的网站。在网站底部插入以下代码即可：

```html
<script defer src="https://xxxxxx.pages.dev/tracker.min.js" data-website-id="自定义网站唯一标识"></script>
```

当出现有效访问后，再次打开仪表板页面即可看到数据。

## 四、功能补充

HanAnalytics 还新增了 "密码访问" 及 "网站白名单" 功能。开启密码后，输入密码才可访问（默认无需密码）；网站白名单功能开启后，只有加白的网站才可计入统计（默认任意网站都可统计）。

## 五、数据相关说明

数据问题一般是由于 Cloudflare Analytics Engine 无法访问网站导致的，请确保网站可以正常访问，并且 Cloudflare Analytics Engine 已经开启。

HanAnalytics 使用 Cloudflare Analytics Engine 数据集，完全通过 HTTP 使用 Cloudflare 的 API 进行通信，数据来源于 Cloudflare Analytics Engine 数据集。Cloudflare Analytics Engine 使用抽样技术，以可承受的规模化方式实现大量数据提取/查询（这类似于大多数其他分析工具，如 Google Analytics 上的抽样）。

