/**
 * Cloudflare Worker — Gemini TTS Proxy
 *
 * Purpose: Bypass CORS limitation when calling Gemini API from browser.
 * The user's API key is passed through a header, never stored on the Worker.
 *
 * Deploy:
 *   1. Sign in to Cloudflare dashboard → Workers & Pages
 *   2. Create new Worker → paste this code
 *   3. Note the worker URL (e.g. https://tts-proxy.YOUR-SUBDOMAIN.workers.dev)
 *   4. Update PROXY_URL in the HTML file to match
 *
 * Free tier: 100,000 requests/day. Plenty for personal use.
 */

const ALLOWED_ORIGINS = [
  // Add your GitHub Pages URL here once deployed
  // e.g. 'https://hack3rsolution.github.io'
  // For local testing, file:// origins send 'null'
  'null',
  'http://localhost',
  'http://127.0.0.1',
];

// Match also any localhost port
function isOriginAllowed(origin) {
  if (!origin) return true; // direct requests (no Origin header) are allowed
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.startsWith('http://localhost:')) return true;
  if (origin.startsWith('http://127.0.0.1:')) return true;
  // Allow any github.io subdomain (you can tighten this later)
  if (origin.endsWith('.github.io')) return true;
  return false;
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Goog-Api-Key',
    'Access-Control-Max-Age': '86400',
  };
}

export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get('Origin');

    // Preflight
    if (request.method === 'OPTIONS') {
      if (!isOriginAllowed(origin)) {
        return new Response('Origin not allowed', { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', {
        status: 405,
        headers: corsHeaders(origin),
      });
    }

    if (!isOriginAllowed(origin)) {
      return new Response('Origin not allowed', {
        status: 403,
        headers: corsHeaders(origin),
      });
    }

    // Get API key from custom header
    const apiKey = request.headers.get('X-Goog-Api-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'X-Goog-Api-Key header is required' }),
        {
          status: 400,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Get URL path — caller specifies which Gemini model
    // e.g. POST /v1beta/models/gemini-2.5-flash-preview-tts:generateContent
    const url = new URL(request.url);
    const apiPath = url.pathname; // e.g. "/v1beta/models/..."

    if (!apiPath.startsWith('/v1beta/')) {
      return new Response(
        JSON.stringify({ error: 'Invalid API path. Must start with /v1beta/' }),
        {
          status: 400,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const targetUrl = `https://generativelanguage.googleapis.com${apiPath}`;

    try {
      const body = await request.text();
      const upstream = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
        },
        body,
      });

      const responseBody = await upstream.text();

      return new Response(responseBody, {
        status: upstream.status,
        headers: {
          ...corsHeaders(origin),
          'Content-Type':
            upstream.headers.get('Content-Type') || 'application/json',
        },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({ error: 'Proxy request failed', detail: String(err) }),
        {
          status: 502,
          headers: {
            ...corsHeaders(origin),
            'Content-Type': 'application/json',
          },
        }
      );
    }
  },
};
