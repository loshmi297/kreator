# ASSAY — Deployment Guide

## Project Structure
```
assay/
├── public/
│   └── index.html       ← frontend (the whole app)
├── api/
│   └── token.js         ← serverless function (token proxy)
└── vercel.json          ← routing config
```

---

## Step 1 — Create your X Developer App

1. Go to https://developer.x.com → sign in → "Sign up for Free Account"
2. Create a **Project** then an **App** inside it
3. Go to your App → **User authentication settings** → click Edit
4. Set:
   - **App permissions**: Read
   - **Type of App**: Single-page App
   - **Callback URI**: `https://YOUR-VERCEL-URL.vercel.app/` (add this after deploy — you can update it)
   - **Website URL**: `https://YOUR-VERCEL-URL.vercel.app/`
5. Save → copy the **Client ID** and **Client Secret**

---

## Step 2 — Add your Client ID to the frontend

Open `public/index.html` and find this line near the bottom:

```js
const CLIENT_ID = window.__X_CLIENT_ID__ || 'YOUR_CLIENT_ID_HERE';
```

Replace `YOUR_CLIENT_ID_HERE` with your actual Client ID. The Client ID is public — it's safe to embed.

---

## Step 3 — Deploy to Vercel

### Option A: Vercel CLI (fast)
```bash
npm i -g vercel
cd assay/
vercel
```
Follow prompts → deploy → copy the URL.

### Option B: GitHub (recommended for updates)
1. Push this folder to a GitHub repo
2. Go to https://vercel.com → New Project → Import your repo
3. No build settings needed — Vercel auto-detects the structure
4. Deploy

---

## Step 4 — Add Environment Variables in Vercel

In your Vercel project dashboard → **Settings** → **Environment Variables**, add:

| Name | Value |
|------|-------|
| `X_CLIENT_ID` | your Client ID |
| `X_CLIENT_SECRET` | your Client Secret |

> The Client Secret stays server-side only — never in the frontend code.

---

## Step 5 — Update X App Callback URI

Go back to developer.x.com → your app → User authentication settings → update:
- **Callback URI**: `https://your-actual-url.vercel.app/`

Must match **exactly** including the trailing slash.

---

## Step 6 — Redeploy

After adding env vars, trigger a redeploy in Vercel (or push any small change to GitHub).

---

## API Tier Notes

| Metric | Free Tier | Basic ($100/mo) |
|--------|-----------|-----------------|
| Followers, likes, replies, RTs | ✓ | ✓ |
| **Impressions (non_public_metrics)** | ✗ | ✓ |

On the Free tier, ASSAY estimates impressions from engagement data. On Basic, it shows real impression counts.

---

## Troubleshooting

**"Token exchange failed"** → Check that the Callback URI in your X app matches your Vercel URL exactly.

**"Could not fetch profile"** → Your access token may have expired. Click Disconnect and reconnect.

**Users get CORS errors** → Make sure the `/api/token.js` serverless function deployed correctly. Check Vercel → Functions tab.
