---
title: Deploy Your Own Invisible CAPTCHA on Cloudflare for Free — An Intro and Deployment Guide to Lap
published: 2026-08-25
description: 'Lap is a lightweight, open-source CAPTCHA alternative built on proof-of-work. This post explains how it works and walks you through deploying it on Cloudflare Workers + D1.'
image: '/images/Lap.png'
tags: [Lap, Cloudflare, CAPTCHA, Verification]
category: 'Sharing'
draft: false 
lang: 'en'
---

## Preface

My blog has always been hosted on Cloudflare — what the community affectionately calls the "cyber Bodhisattva" — where I freeload its edge nodes and various free services (I even wrote a [post](/posts/HanAnalytics) about deploying website analytics on Cloudflare). As a developer constantly harassed by bots yet annoyed by traditional CAPTCHAs, I had long wanted an "invisible" solution — one that neither makes users click traffic lights and pick fire hydrants, nor fails to stop scripts.

Lately I've been tinkering with and maintaining a project called **Lap**, which is exactly such a lightweight, open-source CAPTCHA alternative. Under the hood it relies on **Proof-of-Work** and **browser instrumentation**. No images, no puzzles, no tracking — the user is verified in the background while their browser does "a little maths."

::github{repo="lenmei233/Lap"}

Below I'll walk you through, from a first-person perspective, what Lap is and how to run it on Cloudflare at zero cost.

## 1. What Is Lap / Core Features

At its heart, Lap is a **CAPTCHA replacement**: when someone submits your form, their browser quietly performs a series of hash computations to prove "I am not a low-cost script," and only then is it allowed through. A few things I really like about it:

- **Zero infrastructure**: A single Cloudflare Worker plus a single D1 (SQLite) database is enough. No Docker, no Redis, no VPS, and no always-on process — fully Serverless.
- **Free-tier friendly**: The whole thing fits comfortably inside Cloudflare's free Workers + D1 allowances, so personal projects are basically zero-cost.
- **Self-hosted widget**: The Worker serves the frontend widget itself from `/widget.js`, so it **depends on no third-party CDN or npm package** — no supply-chain risk.
- **Privacy first**: No telemetry, no cookies, no cross-site tracking.
- **Runs at the edge**: Challenges are issued from the Cloudflare PoP nearest the user.

> Fun fact: Lap is actually a rebrand fork I made of [Cap](https://github.com/tiagozip/cap) (by tiago, under Apache-2.0), porting its originally Node + Redis/Valkey architecture into a pure Cloudflare Serverless setup and renaming the components (`<cap-widget>` → `<lap-widget>`). All the cryptographic design and frontend interaction come from Cap's work, so please also go give the original project a Star.

### So how does it work, roughly?

```
 1. Browser requests a challenge  POST /:siteKey/challenge
        │
        ▼
   Lap Worker issues a challenge { challenge, token } (with c/s/d params)
        │
        ▼
 2. Browser brute-forces a nonce so that sha256(salt + nonce) starts with target (this is the PoW)
        │
        ▼
 3. Browser submits the solution  POST /:siteKey/redeem → Worker verifies and issues a one-time redeem token
        │
        ▼
 4. Your backend exchanges the token at POST /siteverify for { success: true }
```

In short: a bot would have to complete massive amounts of hashing in a very short time — extremely expensive — while a real browser spends just a moment and is barely aware of it. Every token is single-use and is consumed on first verification.

## 2. Deployment Walkthrough (Workers + D1, recommended)

Lap offers three deployment paths: Workers + D1 (recommended), Pages Functions, and GitHub Actions for CI/CD. Below I'll take the most common, CI-used **Workers + D1** route.

What you'll need:

- A Cloudflare account x1 (free is fine)
- Node.js 18+ (Node 22 recommended)
- A working brain 🧠 x1
- A decent network environment x1

### 1. Clone and install dependencies

```bash
git clone https://github.com/lenmei233/Lap.git lap
cd lap/cloudflare
npm install
npx wrangler login      # opens a browser to authorize your Cloudflare account
```

### 2. Create the D1 database

```bash
npx wrangler d1 create lap-serverless
```

Wrangler prints a TOML block. Copy the `database_id` into `cloudflare/wrangler.toml`, replacing `REPLACE_WITH_YOUR_D1_ID`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "lap-serverless"
database_id = "0f9c1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"   # <- yours
```

> `binding = "DB"` is the name the code reads (`env.DB`). Leave it unless you also change `src/worker.js`.

### 3. Apply the database schema

```bash
npx wrangler d1 migrations apply lap-serverless --remote
```

This creates six tables: `site_keys`, `tokens`, `nonces`, `blocklist`, `ratelimit`, and `meta`. The migration is idempotent, so re-running it is safe.

### 4. Set the admin key

The admin key protects the `/admin/*` endpoints that mint site keys. It is a **Worker Secret** — never commit it:

```bash
npx wrangler secret put ADMIN_KEY
# paste a long random string, e.g. openssl rand -hex 32
```

### 5. Deploy

```bash
npm run deploy      # runs sync-widget, then wrangler deploy
```

Your Worker URL will look like `https://lap-serverless.<your-subdomain>.workers.dev`. Verify it:

```bash
curl https://lap-serverless.<your-subdomain>.workers.dev/health
# {"ok":true,"service":"lap-serverless","version":"1.0.0"}
```

### Alternative: Cloudflare Pages Functions

If you prefer Pages, the repo's `cloudflare/functions/[[path]].js` is a catch-all route that forwards requests to the same Worker logic, so both targets behave identically. The gist:

```bash
cd cloudflare
node scripts/sync-widget.mjs        # generates public/ + src/assets/
npx wrangler pages project create lap-serverless --production-branch main
npx wrangler pages deploy public --project-name lap-serverless
```

Pages doesn't read `wrangler.toml` bindings, so set them in the dashboard under **Workers & Pages → your Pages project → Settings**:

- **Bindings → Add → D1 database**: variable name `DB`, bound to `lap-serverless`, added to both Production and Preview.
- **Environment variables → Add → Encrypt**: name `ADMIN_KEY`, value your random string, then click **Encrypt**.
- Redeploy once so the bindings take effect.

### Alternative: GitHub Actions auto-deploy

`.github/workflows/deploy-serverless.yml` runs tests and deploys on every push to `main` that touches `cloudflare/` or `widget/`. You only need to create a Cloudflare API Token with `Workers Scripts: Edit` and `D1: Edit` permissions, then add these repo secrets under **Settings → Secrets**:

- `CLOUDFLARE_API_TOKEN`: the token from above
- `CLOUDFLARE_ACCOUNT_ID`: Account ID from Workers & Pages → Account details

`ADMIN_KEY` is **not** a GitHub Secret — it lives in the Worker, so set it once with `wrangler secret put ADMIN_KEY`; subsequent deploys preserve it.

## 3. Create a site key and embed the widget

After deployment you can't use it directly yet — you first need to mint a **site key** for your website. Its secret is shown only once, so store it safely.

```bash
ORIGIN=https://lap-serverless.<your-subdomain>.workers.dev
ADMIN_KEY=<the key you set earlier>

curl -X POST "$ORIGIN/admin/keys" \
  -H "x-admin-key: $ADMIN_KEY" \
  -H "content-type: application/json" \
  -d '{}'
```

Sample response:

```json
{
  "id": "a1b2c3d4e5f60718293a4b5c",
  "secret": "9f8e7d6c5b4a39281706f5e4d3c2b1a0",
  "config": { "difficulty": 4, "challengeCount": 80, "saltSize": 32 }
}
```

### Embedding the widget

The Lap Worker hosts the widget itself, so **no CDN or npm package is needed**:

```html
<script src="https://lap-serverless.<your-subdomain>.workers.dev/widget.js"></script>

<form method="POST" action="/signup">
  <input name="email" type="email" required />

  <lap-widget
    data-lap-api-endpoint="https://lap-serverless.<your-subdomain>.workers.dev/<SITE_KEY>/">
  </lap-widget>

  <button type="submit">Sign up</button>
</form>
```

Note the **trailing slash** on `data-lap-api-endpoint` and that the path must include your site key — the widget appends `challenge` and `redeem` to it. On success the widget writes a hidden input named `lap-token` into the surrounding form, so your backend just reads `req.body["lap-token"]`.

For more custom interaction you can also use the JS API:

```html
<script src=".../widget.js"></script>
<script>
  const lap = new Lap({ apiEndpoint: "https://.../<SITE_KEY>/" });
  const { token } = await lap.solve();
  // send the token to your backend yourself
</script>
```

For styling, every visual property is a `--lap-` prefixed CSS variable you can tweak:

```css
lap-widget {
  --lap-background: #11111b;
  --lap-border-color: #313244;
  --lap-border-radius: 12px;
  --lap-color: #cdd6f4;
  --lap-spinner-color: #89b4fa;
}
```

## 4. Verify on your server (you must)

A token from the browser means nothing until **verified server-side at `/siteverify`**, and each token is consumed on first use.

```bash
curl -X POST "$ORIGIN/siteverify" \
  -H "content-type: application/json" \
  -d '{"secret":"<SITE_SECRET>","response":"<SITEKEY>:<ID>:<TOKEN>"}'
# {"success":true}
```

Node.js / Express example:

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
  // ...continue your business logic
});
```

Python / Flask version:

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
    # ...continue
```

### Common tuning

A site key's config can be set at creation (`POST /admin/keys`) or later (`PUT /admin/keys/:id`). Common knobs:

- `difficulty` (default 4): target prefix length; each +1 is ~16× the work, exponential.
- `challengeCount` (default 80): number of sub-puzzles, linear cost.
- `instrumentation` (default false): also run a browser-behaviour challenge.
- `blockAutomatedBrowsers` (default true): reject headless/automated browsers (needs `instrumentation`).
- `ratelimitMax` / `ratelimitDuration`: per-IP rate limit, default 30 / 5s.

> Tuning tip: the default `difficulty:4` + `challengeCount:80` takes about a second on a modern laptop. When you want it stricter, **raise `challengeCount` (linear cost) before `difficulty` (exponential cost)** — it gives smoother, more predictable timing.

## 5. Local dev and troubleshooting

Local debugging needs no Cloudflare account:

```bash
cd cloudflare
npm install
echo "ADMIN_KEY=dev-secret" > .dev.vars
npx wrangler d1 migrations apply lap-serverless --local
npx wrangler dev --local
```

The Worker runs at `http://127.0.0.1:8787` against a local SQLite file, ready to use out of the box.

Common pitfalls:

- `{"error":"Admin key not configured"}`: `ADMIN_KEY` isn't set — run `wrangler secret put ADMIN_KEY`.
- `no such table: site_keys`: migrations weren't applied — run the `d1 migrations apply` step (add `--remote` for production).
- `D1_ERROR`: your `wrangler.toml` `database_id` is probably still the placeholder.
- Widget doesn't show: check the browser console for a 404 on `/widget.js`, then confirm `<lap-widget>` is spelled correctly.
- Widget shows but never verifies: `data-lap-api-endpoint` must end in `/` and include the site key.

## Closing

What impresses me most about Lap is its "quietness" — no puzzle popups, no face scans, no cross-site tracking; it just lets the browser silently finish one computation in the background, and everything goes on as usual. Running it on Cloudflare means **zero servers, zero ops, within the free tier**, which is almost the perfect CAPTCHA replacement for personal blogs, forms, and small tools.

If you're also tired of traditional CAPTCHAs and want to own your data, fork Lap and follow the steps above — ten minutes is all it takes to have your own invisible verification service. And if you could spare a **Star**, that would be even better (.

::github{repo="lenmei233/Lap"}

> 中文版：[用 Cloudflare 免费部署属于自己的无感验证码：Lap 介绍与部署教程](/posts/lap/)
