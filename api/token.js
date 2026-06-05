/* ===== momo的AI魔法屋 - API Token 分发 ===== */
/* 前端调用此端点获取动态 Token，存入 sessionStorage */

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin;
  const allowed = ['momo-magic-home.vercel.app', 'momomagichome.com', 'localhost', '127.0.0.1'];
  const hostname = (() => {
    try { return new URL(origin).hostname; } catch { return ''; }
  })();
  if (allowed.some(a => hostname === a || hostname.endsWith('.' + a))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!origin || !hostname) return res.status(403).json({ error: 'Forbidden' });

  const token = process.env.MAGIC_API_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token not configured' });

  return res.status(200).json({ token });
}
