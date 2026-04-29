# TTS Workbench

일본어 드라마 제작용 TTS 클립 작업대. Google Gemini TTS로 대본을 클립 단위 음성 파일로 변환합니다.

**Live:** https://tts.pie-nest.com

## 사용 방법

### 사전 준비

1. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 Gemini API Key 발급
2. Cloudflare Worker 프록시 배포 (`worker/cloudflare-worker.js` 참고)
   - 기본 제공 Worker: `https://tts-proxy.dadamandes.workers.dev`

### 앱 사용 순서

**Step 1 — 설정**
- Worker URL과 API Key 입력 후 저장 (브라우저 localStorage에만 저장)

**Step 2 — 대본 & 변환**
- 일본어 대본 입력 → [한자 분석] 클릭
- kuromoji.js가 한자를 자동 감지하고 가나로 변환 제안
- 잘못된 발음만 수정 (수정 내용은 사용자 사전에 자동 저장)
- 목소리·모델·톤 지시 선택 후 [음성 변환]
- 변환된 `.wav` 파일 재생 및 다운로드

**Step 3, 4** — Phase 2 예정 (화자 프리셋, 32+ 클립 일괄 변환)

## 기술 스택

| 항목 | 내용 |
|------|------|
| 앱 구조 | 단일 HTML 파일, 빌드 도구 없음 |
| TTS | Google Gemini 2.5 Flash/Pro TTS Preview |
| 한자 처리 | [kuromoji.js](https://github.com/takuyaa/kuromoji) via jsDelivr CDN |
| CORS 프록시 | Cloudflare Workers |
| 오디오 변환 | PCM 16-bit mono 24 kHz → WAV (브라우저 내 처리) |
| 라우팅 | URL hash 기반 (`#setup`, `#script`, `#speakers`, `#workbench`) |
| 저장소 | localStorage (설정, 사용자 사전) |
| 호스팅 | GitHub Pages + Cloudflare DNS |

## 데이터 저장 (localStorage 키)

| 키 | 내용 |
|----|------|
| `tts.proxyUrl` | Cloudflare Worker URL |
| `tts.apiKey` | Gemini API Key |
| `tts.voice` | 마지막 선택 목소리 |
| `tts.model` | 마지막 선택 모델 |
| `tts.tone` | 마지막 입력 톤 지시 |
| `tts.userDict.v1` | 사용자 한자 사전 `{ "表面形": "よみがな" }` |

## 디렉토리 구조

```
tts-workbench/
├── index.html              ← 메인 앱 (SPA)
├── prototypes/
│   └── step1b/             ← 검증된 단일 클립 프로토타입
└── worker/
    └── cloudflare-worker.js  ← Cloudflare Worker 소스
```

## Cloudflare Worker 배포

```bash
cd worker
npx wrangler deploy
```

Worker는 `X-Goog-Api-Key` 헤더를 그대로 Gemini API로 전달합니다. 자세한 내용은 `worker/README.md` 참고.

## License

MIT — see [LICENSE](./LICENSE)
