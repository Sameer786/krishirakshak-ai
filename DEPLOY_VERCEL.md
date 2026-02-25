# KrishiRakshak — Vercel Deployment Guide

## Prerequisites

- Node.js 18+
- GitHub repository pushed (e.g., `Sameer786/krishirakshak-ai`)
- (Optional) AWS Lambda backend deployed (see `lambda/DEPLOY.md`)

---

## Option A: Vercel CLI (Quick)

### 1. Install Vercel CLI

```bash
npm i -g vercel
```

### 2. Login

```bash
vercel login
```

### 3. Deploy (first time)

From the project root:

```bash
vercel
```

Follow the prompts:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No (creates new)
- **Project name?** → krishirakshak
- **Framework preset?** → Vite
- **Build command?** → `vite build` (default)
- **Output directory?** → `dist` (default)

### 4. Set environment variables

```bash
vercel env add VITE_API_GATEWAY_URL production
# Enter: https://YOUR-API-ID.execute-api.ap-south-1.amazonaws.com/prod

vercel env add VITE_DEMO_MODE production
# Enter: false
```

> **Demo mode:** Set `VITE_DEMO_MODE=true` if the Lambda backend is not deployed yet. The app will use built-in mock data.

### 5. Deploy to production

```bash
vercel --prod
```

### 6. Get your URL

```
https://krishirakshak.vercel.app
```

---

## Option B: GitHub Integration (Recommended)

### 1. Connect repository

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository**
3. Select `Sameer786/krishirakshak-ai`
4. Configure:
   - **Framework Preset:** Vite
   - **Build Command:** `vite build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

### 2. Set environment variables

In the Vercel project dashboard → **Settings** → **Environment Variables**:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_GATEWAY_URL` | `https://YOUR-API-ID.execute-api.ap-south-1.amazonaws.com/prod` | Production |
| `VITE_DEMO_MODE` | `false` | Production |

> **Important:** Vite environment variables must start with `VITE_` to be accessible in the frontend.

### 3. Deploy

Click **Deploy**. Future pushes to `main` will auto-deploy.

---

## Post-Deployment Verification

### Checklist

1. **Open URL on phone** (Chrome / Samsung Internet)
   - [ ] App loads, green header visible
   - [ ] Navigation works (Home, Voice QA, Hazard Detection, Checklist)

2. **Test Voice Q&A**
   - [ ] Tap microphone → speak a question
   - [ ] Get AI response (or demo response if DEMO_MODE=true)
   - [ ] TTS reads answer aloud

3. **Test Hazard Detection**
   - [ ] Take photo or upload image
   - [ ] Analyze Hazards → get results (or demo results)
   - [ ] Expandable hazard cards work

4. **Test JHA Checklist**
   - [ ] Select a template
   - [ ] Check items → progress bar updates
   - [ ] Close app → reopen → progress is saved

5. **Test "Add to Home Screen"**
   - [ ] Chrome: Menu → "Add to Home Screen" or install banner
   - [ ] App opens in standalone mode (no browser bar)

6. **Test Offline (Airplane Mode)**
   - [ ] Turn on airplane mode
   - [ ] App still loads from cache
   - [ ] JHA Checklist fully works offline
   - [ ] Voice Q&A shows cached responses
   - [ ] Hazard Detection shows "offline" indicator

7. **Test on multiple browsers**
   - [ ] Chrome Android
   - [ ] Samsung Internet
   - [ ] Safari iOS (PWA install via Share → Add to Home Screen)

---

## Custom Domain (Optional)

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `krishirakshak.in`)
3. Update DNS records as instructed
4. SSL is automatic

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Blank page after deploy | Check `vercel.json` rewrites are present |
| API calls failing | Verify `VITE_API_GATEWAY_URL` env var, redeploy after changing |
| Service worker not updating | `sw.js` has `Cache-Control: max-age=0` in vercel.json |
| PWA not installable | Ensure `manifest.json` loads (check DevTools → Application) |
| Demo mode still active | Set `VITE_DEMO_MODE=false` and redeploy with `vercel --prod` |
| CORS errors on API | Check Lambda API Gateway has CORS enabled for your Vercel domain |

---

## Cost

- **Vercel Hobby (free):** 100 GB bandwidth/month, unlimited deploys
- **Sufficient for hackathon demo and testing**
