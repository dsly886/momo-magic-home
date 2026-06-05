/* ===== momo的AI魔法屋 - DeepSeek API 代理（已加固） ===== */

const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
const MAX_REQUESTS_PER_HOUR = 10;
const MAX_MESSAGE_LENGTH = 512;
const MAX_TOKENS = 4096;
const MAX_MESSAGES_COUNT = 20;

// 内存速率限制（Vercel Serverless 冷启动时重置，基础防护）
const rateMap = new Map();

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
    || req.headers['x-real-ip']
    || req.socket?.remoteAddress
    || 'unknown';
}

function isOriginAllowed(origin, host) {
  if (!origin) return false;
  const allowed = [
    'momo-magic-home.vercel.app',
    'momomagichome.com',
    'localhost',
    '127.0.0.1',
  ];
  try {
    const hostname = new URL(origin).hostname;
    return allowed.some(a => hostname === a || hostname.endsWith('.' + a));
  } catch {
    return false;
  }
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 3600000 });
    // 定期清理过期条目
    if (rateMap.size > 1000) {
      for (const [k, v] of rateMap) {
        if (now > v.resetAt) rateMap.delete(k);
      }
    }
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_HOUR) return false;
  entry.count++;
  return true;
}

function validateInput(body) {
  const { messages, options = {} } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return 'messages 不能为空';
  }
  if (messages.length > MAX_MESSAGES_COUNT) {
    return `messages 数量不能超过 ${MAX_MESSAGES_COUNT}`;
  }
  let totalLen = 0;
  for (const m of messages) {
    if (!m.role || typeof m.content !== 'string') {
      return '消息格式无效';
    }
    totalLen += m.content.length;
  }
  if (totalLen > MAX_MESSAGE_LENGTH) {
    return `输入内容过长（最大 ${MAX_MESSAGE_LENGTH} 字符）`;
  }
  if (options.maxTokens && options.maxTokens > MAX_TOKENS) {
    return `maxTokens 不能超过 ${MAX_TOKENS}`;
  }
  return null;
}

export default async function handler(req, res) {
  // === CORS 预检 ===
  const origin = req.headers.origin;
  const host = req.headers.host || '';

  if (isOriginAllowed(origin, host)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, X-Magic-Token');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // === 方法校验 ===
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // === Origin 校验（POST 必须） ===
  if (!isOriginAllowed(origin, host)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // === CSRF 校验 ===
  if (req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // === 动态 Token 校验（防脚本重放） ===
  const clientToken = req.headers['x-magic-token'];
  const serverToken = process.env.MAGIC_API_TOKEN;
  if (!clientToken || clientToken !== serverToken) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // === 速率限制 ===
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试。' });
  }

  // === API Key 校验 ===
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '服务器配置错误' });
  }

  // === 输入校验 ===
  const { messages, options = {} } = req.body;
  const inputError = validateInput(req.body);
  if (inputError) {
    return res.status(400).json({ error: inputError });
  }

  const {
    model = 'deepseek-v4-flash',
    temperature = 0.8,
    maxTokens = 2048,
  } = options;

  // === 调用 DeepSeek API ===
  try {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: Math.min(maxTokens, MAX_TOKENS),
      }),
    });

    if (!response.ok) {
      console.error('[momo代理] DeepSeek API 错误:', response.status);
      return res.status(502).json({ error: 'AI 服务暂时不可用' });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('[momo代理] 请求失败:', error.message);
    return res.status(502).json({ error: '服务暂时不可用' });
  }
}
