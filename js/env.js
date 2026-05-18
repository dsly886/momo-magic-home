/* ===== momo的AI魔法屋 - 环境变量加载器 ===== */
/* 生产环境通过 Vercel Serverless Proxy 调用 API，Key 不暴露给浏览器 */
/* 本地开发需在设置中填入 API Key */

const Env = {
  _baseUrl: 'https://api.deepseek.com',
  _loaded: false,

  async load() {
    if (this._loaded) return;
    this._loaded = true;
  },

  getBaseUrl() {
    return this._baseUrl;
  },
};
