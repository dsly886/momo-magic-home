/* ===== momo的AI魔法屋 - 环境变量加载器 ===== */
/* 默认值来自 .env 文件，运行时优先尝试加载 .env 覆盖 */

const Env = {
  _baseUrl: 'https://api.deepseek.com',
  _apiKey: 'sk-80bc81815e16478fbfa2dfc1349bb194',
  _loaded: false,

  // 加载 .env 文件（可选覆盖）
  async load() {
    if (this._loaded) return;
    try {
      const resp = await fetch('../.env');
      if (!resp.ok) throw new Error('load failed');
      const text = await resp.text();
      this._parse(text);
    } catch {
      try {
        const resp = await fetch('../../.env');
        if (resp.ok) {
          const text = await resp.text();
          this._parse(text);
        }
      } catch {
        // ignore, defaults already set
      }
    }
    this._loaded = true;
  },

  _parse(text) {
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      if (key === 'DEEPSEEK_BASE_URL' && value) {
        this._baseUrl = value.replace(/\/+$/, '');
      }
      if (key === 'DEEPSEEK_API_KEY' && value) {
        this._apiKey = value;
      }
    }
  },

  getBaseUrl() {
    return this._baseUrl;
  },

  getApiKey() {
    return this._apiKey;
  },
};
