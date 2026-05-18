/* ===== momo的AI魔法屋 - DeepSeek API 代理 ===== */
/* 服务端运行，API Key 不会暴露给浏览器 */

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';

export default async function handler(req, res) {
  // 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'DEEPSEEK_API_KEY not configured on server' });
  }

  const { messages, options = {} } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages required' });
  }

  const {
    model = 'deepseek-v4-flash',
    temperature = 0.8,
    maxTokens = 2048,
  } = options;

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
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('[momo代理] DeepSeek API 错误:', response.status, errorData);
      return res.status(response.status).json({ error: `DeepSeek API error (${response.status})` });
    }

    const data = await response.json();
    return res.status(200).json({ content: data.choices[0].message.content });
  } catch (error) {
    console.error('[momo代理] 请求失败:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
