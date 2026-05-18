/* ===== momo的AI魔法屋 - DeepSeek API 封装 ===== */
/* 生产环境通过 Vercel Serverless Proxy (/api/chat) 调用，Key 不暴露给浏览器 */
/* 本地开发需在设置中配置 API Key，直接调用 DeepSeek API */

const MagicAPI = {
  // 从 localStorage 获取本地开发用 API Key
  getApiKey() {
    return localStorage.getItem('momo_deepseek_api_key') || '';
  },

  // 保存本地开发用 API Key
  setApiKey(key) {
    localStorage.setItem('momo_deepseek_api_key', key);
  },

  // 检查是否可调用 API
  // 生产环境：服务端 Proxy 持有 Key，前端无需配置
  // 本地开发：需要用户在设置中填入 Key
  hasApiKey() {
    if (this._isProduction()) return true;
    return !!this.getApiKey();
  },

  _isProduction() {
    const host = window.location.hostname;
    return host !== 'localhost' && host !== '127.0.0.1';
  },

  // === 核心 API 调用 ===

  // 生产环境：通过 Vercel Serverless Proxy
  async _proxyCall(messages, model, temperature, maxTokens) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        options: { model, temperature, maxTokens },
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Proxy error (${response.status})`);
    }

    const data = await response.json();
    return data.content;
  },

  // 本地开发：直接调用 DeepSeek API
  async _directCall(apiKey, baseUrl, messages, model, temperature, maxTokens) {
    const url = `${baseUrl}/v1/chat/completions`;
    console.log('[momo魔法屋] 本地模式 API 请求:', { url, model, maxTokens });
    const response = await fetch(url, {
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
      throw new Error(`API request failed (${response.status}): ${errorData}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  },

  // 通用 API 调用（自动选择代理或直连）
  async call(messages, options = {}) {
    const apiKey = this.getApiKey();
    const baseUrl = Env.getBaseUrl();
    const { model = 'deepseek-v4-flash', temperature = 0.8, maxTokens = 2048 } = options;

    if (apiKey) {
      return this._directCall(apiKey, baseUrl, messages, model, temperature, maxTokens);
    }

    return this._proxyCall(messages, model, temperature, maxTokens);
  },

  // === 工具专用方法 ===

  // 故事工坊
  async generateStory(theme, characters, style = 'fantasy') {
    const prompt = `你是一个充满想象力的魔法故事创作者。请根据以下信息创作一个精彩的短篇魔法故事（约500字）：

主题/背景：${theme}
角色：${characters}
风格：${style === 'fantasy' ? '奇幻魔法' : style === 'warm' ? '温馨治愈' : '冒险刺激'}

要求：
- 故事要生动有趣，有完整的起承转合
- 融入魔法元素，营造奇幻氛围
- 语言优美，适合各年龄段读者
- 故事要有积极的寓意
${i18n?.getLangInstruction?.() || ''}`;

    return this.call([
      { role: 'system', content: '你是一位生活在魔法世界的吟游诗人，擅长讲述令人着迷的故事。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.9, maxTokens: 3072 });
  },

  // 魔法占卜
  async doFortune(question, category = 'general') {
    const categoryMap = {
      general: '综合运势',
      love: '爱情',
      career: '事业',
      wealth: '财富',
    };

    const prompt = `你是一位智慧深邃的魔法占卜师。请为前来寻求指引的人进行一次塔罗风格占卜。

问题领域：${categoryMap[category] || '综合运势'}
具体问题：${question || '未来一段时间的整体运势如何？'}

请以以下格式回复：
✨ 【牌面】选择一张有寓意的塔罗牌，描述其象征
🔮 【解读】结合问题给出有洞察力的解读
💫 【建议】给出2-3条实用建议
📜 【祝福语】一句简短的祝福

要求：语言富有诗意和哲理性，给人希望和指引。
${i18n?.getLangInstruction?.() || ''}`;

    return this.call([
      { role: 'system', content: '你是一位神秘而慈悲的塔罗占卜师，能用深邃的智慧为迷途者指引方向。你的语言充满诗意，却又不失真诚与温度。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.8, maxTokens: 2048 });
  },

  // 咒语炼金炉
  async castSpell(userInput, type = 'poetic') {
    const typeMap = {
      poetic: '诗意华丽',
      ancient: '古风典雅',
      cute: '可爱俏皮',
    };

    const prompt = `你是一位精通魔法咒语的炼金术士。请将用户的心愿/想法转化为一条华丽的魔法咒语。

原始内容：${userInput}
咒语风格：${typeMap[type] || '诗意华丽'}

请以以下格式回复：
📖 【咒语名称】一个响亮而富有魔力的咒语名称
✨ 【咒语吟唱】用优美语言编写包含原始内容的咒语正文
💫 【魔力效果】咒语会带来什么效果
🌟 【使用说明】使用咒语时的注意事项

要求：咒语正文要富有韵律感和美感，融入魔法元素如星辰、月光、元素之力等。
${i18n?.getLangInstruction?.() || ''}`;

    return this.call([
      { role: 'system', content: '你是一位古老而智慧的魔法炼金术士，擅长将凡人的心愿编织成强大的魔法咒语。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.85, maxTokens: 1536 });
  },

  // 星星许愿池
  async makeWish(wish) {
    const prompt = `你是一颗古老的许愿星，守护着一座神奇的许愿池。现在有人向你许下了愿望。

许愿内容：${wish}

请以以下格式回应：
⭐ 【星辰回响】感知愿望的力量（2-3句富有诗意的回应）
🌙 【星语低语】给予温暖而充满希望的寄语
💫 【星星祝福】一句简短的祝福语，送给许愿者

要求：语言像诗歌一样美丽，充满星辰和宇宙的意象，给人温暖和希望。
${i18n?.getLangInstruction?.() || ''}`;

    return this.call([
      { role: 'system', content: '你是一颗存在了亿万年的许愿星，温柔而智慧，能用星光编织出最暖心的回应。你的语言如诗歌般优美，充满宇宙的浪漫。' },
      { role: 'user', content: prompt },
    ], { temperature: 0.85, maxTokens: 1536 });
  },

  // 魔法解梦
  async interpretDream(dreamDescription) {
    const prompt = `你是一位精通梦境的魔法解梦师。请为以下梦境进行解读。

梦境描述：${dreamDescription}

请以以下格式回复：
🌙 【梦境画卷】用优美的语言重述梦境，捕捉其核心意象
🔮 【象征解读】解读梦境中关键象征物的寓意
💫 【魔法启示】这个梦境想传达什么信息或启示
📜 【醒世寄语】一句简短而富有哲理的话

要求：解读要专业而不失温度，既参考传统解梦智慧，又融入心理学视角，最后给予建设性的指引。
${i18n?.getLangInstruction?.() || ''}`;

    return this.call([
      { role: 'system', content: '你是一位通晓古今解梦智慧的魔法师，既能理解梦境的神秘象征，也能给出温暖人心的解读' },
      { role: 'user', content: prompt },
    ], { temperature: 0.8, maxTokens: 2048 });
  },
};
