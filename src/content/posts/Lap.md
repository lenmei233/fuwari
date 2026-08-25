---
title: 用 Cloudflare 免费部署属于自己的无感验证码：Lap 介绍与部署教程
published: 2026-08-25
description: 'Lap 是一个基于工作量证明的轻量级开源验证码替代方案，本文介绍其原理并手把手演示在 Cloudflare Workers + D1 上的部署。'
image: '/images/Lap.png'
tags: [Lap, Cloudflare, CAPTCHA, 验证码]
category: '分享记录'
draft: false 
lang: 'zh_CN'
---

## 前言

我的博客一直部署在被称为 “赛博菩萨” 的 Cloudflare 上，白嫖它的边缘节点和各类免费服务（之前还写过用 Cloudflare 部署网站统计的[文章](/posts/HanAnalytics)）。作为一个常年被机器人骚扰、又讨厌传统验证码的 Coder，我一直想找个 “无感” 的方案——既不让用户去点红绿灯、选消防栓，又能挡住脚本。

最近我自己折腾并维护了一个项目 **Lap**，它正是这样一种轻量级、开源的验证码替代方案，底层基于 **工作量证明（Proof-of-Work）** 和 **浏览器行为检测**。没有图片、没有拼图、没有追踪，用户在后台 “算一点数学题” 的功夫就被验证完了。

::github{repo="lenmei233/Lap"}

下面我就以第一视角，带大家看看 Lap 是什么，以及如何零成本把它跑在 Cloudflare 上。

## 一、Lap 是什么 / 核心特点

Lap 本质上是一个 **CAPTCHA 的替代品**：当有人提交你的表单时，他的浏览器会默默完成一系列哈希计算来证明 “我不是一个低成本脚本”，通过后才放行。它有几个让我很喜欢的特性：

- **零基础设施**：一个 Cloudflare Worker + 一个 D1（SQLite）数据库就够了，不需要 Docker、Redis、VPS，也没有常驻进程——全 Serverless。
- **免费额度友好**：整体能舒服地塞进 Cloudflare 的免费 Workers + D1 额度，个人项目基本零成本。
- **自托管 Widget**：Worker 自己从 `/widget.js` 提供前端验证组件，**不依赖任何第三方 CDN 或 npm 包**，没有供应链风险。
- **隐私优先**：没有埋点、没有 Cookie、没有跨站追踪。
- **跑在边缘**：挑战由离用户最近的 Cloudflare 节点签发。

> 小知识：Lap 其实是我基于 [Cap](https://github.com/tiagozip/cap)（作者 tiago，Apache-2.0 协议）做的 rebrand 分支，把原本需要 Node + Redis/Valkey 的架构移植成了纯 Cloudflare Serverless 方案，并改了组件名（`<cap-widget>` → `<lap-widget>`）。所有密码学设计和前端交互都来自 Cap 的贡献，也欢迎大家去给原项目点 Star。

### 它大概是怎么工作的？

```
 1. 浏览器请求挑战  POST /:siteKey/challenge
        │
        ▼
   Lap Worker 签发挑战 { challenge, token }（含 c/s/d 参数）
        │
        ▼
 2. 浏览器暴力求解 nonce，使 sha256(salt + nonce) 以 target 开头（这就是 PoW）
        │
        ▼
 3. 浏览器提交答案  POST /:siteKey/redeem → Worker 校验并签发一次性 redeem token
        │
        ▼
 4. 你的后端用 token 去 POST /siteverify 换取 { success: true }
```

简单说：机器人要在极短时间内完成大量哈希计算，成本极高；真人浏览器只花一瞬间，几乎无感。每个 token 都是一次性、验证即作废。

## 二、部署实测（Workers + D1，推荐方案）

Lap 提供了三种部署方式：Workers + D1（推荐）、Pages Functions、GitHub Actions 自动部署。下面我走最常用、也是 CI 采用的 **Workers + D1** 路径。

需要准备：

- Cloudflare 账号 x1（免费即可）
- Node.js 18+（推荐 Node 22）
- 能用的大脑 🧠 x1
- 良好的网络环境 x1

### 1. 克隆并安装依赖

```bash
git clone https://github.com/lenmei233/Lap.git lap
cd lap/cloudflare
npm install
npx wrangler login      # 会打开浏览器授权你的 Cloudflare 账号
```

### 2. 创建 D1 数据库

```bash
npx wrangler d1 create lap-serverless
```

命令会打印一段 TOML。把其中的 `database_id` 复制到 `cloudflare/wrangler.toml`，替换掉 `REPLACE_WITH_YOUR_D1_ID`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "lap-serverless"
database_id = "0f9c1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"   # <- 换成你自己的
```

> `binding = "DB"` 是代码里读取时用的名字（`env.DB`），没特殊需求不要改，除非你也同步改 `src/worker.js`。

### 3. 应用数据库结构

```bash
npx wrangler d1 migrations apply lap-serverless --remote
```

这条命令会创建六张表：`site_keys`、`tokens`、`nonces`、`blocklist`、`ratelimit`、`meta`。迁移是幂等的，重复执行也安全。

### 4. 设置管理员密钥

管理员密钥用来保护 `/admin/*` 这些能签发站点密钥的接口，它是 **Worker Secret**，千万不要提交到代码里：

```bash
npx wrangler secret put ADMIN_KEY
# 粘贴一段足够长的随机串，例如：openssl rand -hex 32
```

### 5. 部署

```bash
npm run deploy      # 先 sync-widget，再 wrangler deploy
```

部署成功后你的 Worker 地址形如 `https://lap-serverless.<你的子域名>.workers.dev`。验证一下：

```bash
curl https://lap-serverless.<你的子域名>.workers.dev/health
# {"ok":true,"service":"lap-serverless","version":"1.0.0"}
```

### 备选：Cloudflare Pages Functions

如果你更习惯用 Pages，仓库里的 `cloudflare/functions/[[path]].js` 是个 catch-all 路由，会把请求转发给同一套 Worker 逻辑，两边行为完全一致。要点是：

```bash
cd cloudflare
node scripts/sync-widget.mjs        # 生成 public/ + src/assets/
npx wrangler pages project create lap-serverless --production-branch main
npx wrangler pages deploy public --project-name lap-serverless
```

Pages 不会读取 `wrangler.toml` 里的绑定，需要在控制台 **Workers & Pages → 你的 Pages 项目 → Settings** 里手动绑定：

- **Bindings → Add → D1 database**：变量名填 `DB`，绑定到 `lap-serverless`，生产环境和预览环境都要加。
- **Environment variables → Add → Encrypt**：名称 `ADMIN_KEY`，值填你的随机串，记得点 **Encrypt**。
- 最后重新部署一次让绑定生效。

### 备选：GitHub Actions 自动部署

`.github/workflows/deploy-serverless.yml` 会在每次改动 `cloudflare/` 或 `widget/` 并推送到 `main` 时自动跑测试并部署。你只需在 Cloudflare 后台创建一个具备 `Workers Scripts: Edit` 和 `D1: Edit` 权限的 API Token，然后在仓库 **Settings → Secrets** 里添加：

- `CLOUDFLARE_API_TOKEN`：上一步的 token
- `CLOUDFLARE_ACCOUNT_ID`：Workers & Pages → 账户详情里的 Account ID

`ADMIN_KEY` 不用设为 GitHub Secret，它存在 Worker 里，`wrangler secret put` 设一次即可，后续部署会保留。

## 三、创建站点密钥并接入前端

部署完成后，还不能直接用，得先为自己的网站签发一个 **站点密钥（Site Key）**。它的 secret 只显示一次，请妥善保存。

```bash
ORIGIN=https://lap-serverless.<你的子域名>.workers.dev
ADMIN_KEY=<你刚才设置的密钥>

curl -X POST "$ORIGIN/admin/keys" \
  -H "x-admin-key: $ADMIN_KEY" \
  -H "content-type: application/json" \
  -d '{}'
```

返回类似：

```json
{
  "id": "a1b2c3d4e5f60718293a4b5c",
  "secret": "9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  "config": { "difficulty": 4, "challengeCount": 80, "saltSize": 32 }
}
```

### 在网页里嵌入组件

Lap 的 Worker 自己托管了 widget，所以**不需要引入任何 CDN 或 npm 包**：

```html
<script src="https://lap-serverless.<你的子域名>.workers.dev/widget.js"></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required />

  <lap-widget
    data-lap-api-endpoint="https://lap-serverless.<你的子域名>.workers.dev/<SITE_KEY>/">
  </lap-widget>

  <button type="submit">注册</button>
</form>
```

注意 `data-lap-api-endpoint` 末尾的**斜杠**不能丢，且路径里要带上你的站点密钥——widget 会自动在后面拼上 `challenge` 和 `redeem`。验证成功时，widget 会往所在表单里写入一个隐藏字段 `lap-token`，后端直接读 `req.body["lap-token"]` 即可。

如果想要更自定义的交互，也可以用 JS 调用：

```html
<script src=".../widget.js"></script>
<script>
  const lap = new Lap({ apiEndpoint: "https://.../<SITE_KEY>/" });
  const { token } = await lap.solve();
  // 自己把 token 发给后端
</script>
```

样式方面，所有视觉属性都是 `--lap-` 前缀的 CSS 变量，可以随意调：

```css
lap-widget {
  --lap-background: #11111b;
  --lap-border-color: #313244;
  --lap-border-radius: 12px;
  --lap-color: #cdd6f4;
  --lap-spinner-color: #89b4fa;
}
```

## 四、服务端验证（务必做）

前端的 token 不算数，**必须在后端用 `/siteverify` 校验**，而且每个 token 验证一次即作废。

```bash
curl -X POST "$ORIGIN/siteverify" \
  -H "content-type: application/json" \
  -d '{"secret":"<SITE_SECRET>","response":"<SITEKEY>:<ID>:<TOKEN>"}'
# {"success":true}
```

以 Node.js / Express 为例：

```js
app.post("/signup", async (req, res) => {
  const token = req.body["lap-token"];

  const r = await fetch(`${process.env.LAP_ORIGIN}/siteverify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ secret: process.env.LAP_SECRET, response: token }),
  });
  const { success } = await r.json();

  if (!success) return res.status(403).send("CAPTCHA failed");
  // ...继续你的业务逻辑
});
```

Python / Flask 版本：

```python
import os, requests
from flask import request, abort

@app.post("/signup")
def signup():
    r = requests.post(
        f"{os.environ['LAP_ORIGIN']}/siteverify",
        json={"secret": os.environ["LAP_SECRET"], "response": request.form.get("lap-token")},
        timeout=10,
    )
    if not r.json().get("success"):
        abort(403, "CAPTCHA failed")
    # ...继续
```

### 常用调参

站点密钥的配置可以在创建（`POST /admin/keys`）或后续（`PUT /admin/keys/:id`）调整，几个常用项：

- `difficulty`（默认 4）：目标前缀长度，每 +1 工作量约 ×16，指数增长。
- `challengeCount`（默认 80）：子谜题数量，线性增长。
- `instrumentation`（默认 false）：额外做浏览器行为检测。
- `blockAutomatedBrowsers`（默认 true）：拒绝无头/自动化浏览器（需开 `instrumentation`）。
- `ratelimitMax` / `ratelimitDuration`：单 IP 限流，默认 30 次 / 5 秒。

> 调优建议：默认 `difficulty:4` + `challengeCount:80` 在现代笔记本上大约耗时 1 秒。想更严格时，**优先提高 `challengeCount`（线性成本）**，而不是 `difficulty`（指数成本），这样耗时更平滑可控。

## 五、本地开发与排错小贴士

本地调试不需要 Cloudflare 账号：

```bash
cd cloudflare
npm install
echo "ADMIN_KEY=dev-secret" > .dev.vars
npx wrangler d1 migrations apply lap-serverless --local
npx wrangler dev --local
```

Worker 会跑在 `http://127.0.0.1:8787`，用本地 SQLite 文件，开箱即用。

几个常见坑：

- `{"error":"Admin key not configured"}`：`ADMIN_KEY` 没设置，记得 `wrangler secret put ADMIN_KEY`。
- `no such table: site_keys`：迁移没跑，补上 `d1 migrations apply` 步骤（生产加 `--remote`）。
- `D1_ERROR`：八成是 `wrangler.toml` 里的 `database_id` 还是占位符。
- 组件不出现：先看浏览器控制台 `/widget.js` 是否 404，再确认 `<lap-widget>` 拼写无误。
- 组件出现但一直不验证：`data-lap-api-endpoint` 必须以 `/` 结尾，且包含站点密钥。

## 结语

Lap 给我最大的感受就是 “安静”——它不弹拼图、不读你的脸、不追踪你跨站去了哪，只是让浏览器在后台默默算完一题，然后一切照常。而把它跑在 Cloudflare 上，意味着**零服务器、零运维、免费额度内**，对个人博客、表单、小工具来说几乎是完美的验证码平替。

如果你也受够了传统验证码，又想自己掌控数据，不妨 fork 一下 Lap，按上面的步骤十分钟就能拥有一个属于你自己的无感验证服务，如果能**Star**一下就更好了 (。

::github{repo="lenmei233/Lap"}

> 英文版：[Lap Intro & Deployment Tutorial (EN)](/posts/lap-en/)
