# Cloudflare Worker — Gemini TTS Proxy

This Worker bypasses CORS limitations when calling the Gemini API from the browser.

## Deployed instance

- URL: `https://tts-proxy.dadamandes.workers.dev`
- Allowed origins: `https://tts.pie-nest.com`, `https://hack3rsolution.github.io`, localhost

## Deployment

1. Sign in to Cloudflare dashboard → Workers & Pages
2. Create new Worker (start with Hello World template)
3. Name: `tts-proxy`
4. Edit code → paste contents of `cloudflare-worker.js`
5. Deploy

## Updating CORS allow-list

Edit `ALLOWED_ORIGINS` in `cloudflare-worker.js` and redeploy.

## Free tier

100,000 requests/day. More than enough for personal use.
