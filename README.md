# TTS Workbench

Web-based TTS clip workbench for Japanese drama production using Google Gemini TTS.

## Status

🚧 In active development.

This repository currently contains:
- `prototypes/step1b/` — validated prototype with kanji reading + single-clip TTS conversion
- `worker/` — Cloudflare Worker proxy for bypassing CORS

The full multi-clip workbench (32+ clips, batch conversion, ZIP download) is being implemented.

## Live demo

- App: https://tts.pie-nest.com (coming soon)
- Worker: https://tts-proxy.dadamandes.workers.dev

## Tech stack

- Single-page HTML app (no build step)
- Google Gemini 2.5 Flash TTS
- kuromoji.js (CDN) for Japanese morphological analysis
- Cloudflare Workers (CORS proxy)
- GitHub Pages (hosting)

## License

MIT — see [LICENSE](./LICENSE)
