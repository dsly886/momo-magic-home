/* ===== momo的AI魔法屋 - 多语言引擎 ===== */

const i18n = {
  currentLang: 'en',
  dir: 'ltr',
  translations: null,

  // 国家→语言映射（ip-api returns ISO 3166-1 alpha-2 country codes）
  _countryToLang: {
    CN: 'zh', TW: 'zh', HK: 'zh',
    US: 'en', GB: 'en', AU: 'en', CA: 'en', NZ: 'en', IE: 'en', SG: 'en',
    FR: 'fr', BE: 'fr', CH: 'fr', LU: 'fr', MC: 'fr',
    DE: 'de', AT: 'de', NL: 'de',
    RU: 'ru', BY: 'ru', KZ: 'ru',
    ES: 'es', MX: 'es', AR: 'es', CO: 'es', CL: 'es', PE: 'es',
    PT: 'pt', BR: 'pt', AO: 'pt', MZ: 'pt',
    SA: 'ar', AE: 'ar', EG: 'ar', QA: 'ar', KW: 'ar', MA: 'ar', DZ: 'ar', TN: 'ar', JO: 'ar', LB: 'ar', IQ: 'ar',
    JP: 'ja',
    KR: 'ko',
    TH: 'th',
  },

  // 语言名称（用于切换器显示）
  _langNames: {
    zh: '中文',
    en: 'English',
    fr: 'Français',
    de: 'Deutsch',
    ru: 'Русский',
    es: 'Español',
    pt: 'Português',
    ar: 'العربية',
    ja: '日本語',
    ko: '한국어',
    th: 'ภาษาไทย',
  },

  _supportedLangs: ['zh', 'en', 'fr', 'de', 'ru', 'es', 'pt', 'ar', 'ja', 'ko', 'th'],

  async init() {
    try {
      // Try relative path first, then parent-relative for subdirectory pages
      let resp = await fetch('i18n/translations.json?v=2');
      if (!resp.ok) resp = await fetch('../i18n/translations.json?v=2');
      this.translations = await resp.json();
    } catch {
      console.warn('[i18n] Failed to load translations.json');
      this.translations = {};
    }
    this.currentLang = await this._detectLang();
    this.dir = this.currentLang === 'ar' ? 'rtl' : 'ltr';
    this.apply();
    this.injectSwitcher();
  },

  // 检测语言：localStorage > IP检测 > navigator.language > 'en'
  async _detectLang() {
    // 1. localStorage 手动选择
    const stored = localStorage.getItem('momo_lang');
    if (stored && this._supportedLangs.includes(stored)) return stored;

    // 2. IP 检测
    try {
      const resp = await fetch('https://ip-api.com/json/?fields=countryCode');
      const data = await resp.json();
      const lang = this._countryToLang[data.countryCode];
      if (lang) return lang;
    } catch {
      // IP 检测失败, 继续降级
    }

    // 3. navigator.language
    const navLang = (navigator.language || '').slice(0, 2);
    if (navLang && this._supportedLangs.includes(navLang)) return navLang;

    // 4. 默认
    return 'en';
  },

  // 获取翻译文本（含降级：currentLang → en → 原始 key）
  t(key) {
    const parts = key.split('.');
    const namespace = parts[0];
    const k = parts[1];

    // Try current language
    let val = this.translations?.[this.currentLang]?.[namespace]?.[k];
    if (val) return val;

    // Fallback to English
    val = this.translations?.en?.[namespace]?.[k];
    if (val) return val;

    // Return key itself
    return key;
  },

  // 替换所有 data-i18n 元素
  apply() {
    // Update html lang and dir
    document.documentElement.lang = this.currentLang;
    document.documentElement.dir = this.dir;

    // Replace textContent for data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.textContent = this.t(key);
    });

    // Replace placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.dataset.i18nPlaceholder;
      el.placeholder = this.t(key);
    });

    // Update page title if data-i18n-title on <title>
    const titleEl = document.querySelector('title[data-i18n-title]');
    if (titleEl) {
      const key = titleEl.dataset.i18nTitle;
      const translated = this.t(key);
      if (translated && translated !== key) {
        document.title = translated + ' - Momo\'s AI Magic House';
      }
    }

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && metaDesc.dataset.i18nMeta) {
      const translated = this.t(metaDesc.dataset.i18nMeta);
      if (translated && translated !== metaDesc.dataset.i18nMeta) {
        metaDesc.content = translated;
      }
    }
  },

  // 手动切换语言
  setLang(code) {
    if (!this._supportedLangs.includes(code)) return;
    this.currentLang = code;
    this.dir = code === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('momo_lang', code);
    this.apply();
    // Update switcher button text
    const btn = document.querySelector('.lang-switcher-btn');
    if (btn) btn.innerHTML = '🌐 ' + (this._langNames[code] || code) + ' ▾';
    // Close dropdown
    document.querySelector('.lang-switcher')?.classList.remove('open');
  },

  // 注入语言切换器到导航栏
  injectSwitcher() {
    const nav = document.querySelector('.tool-nav') || document.querySelector('.home-nav');
    if (!nav) return;

    const container = document.createElement('div');
    container.className = 'lang-switcher';
    container.innerHTML = `
      <button class="lang-switcher-btn" aria-label="Switch language">
        🌐 ${this._langNames[this.currentLang] || 'English'} ▾
      </button>
      <div class="lang-switcher-dropdown">
        ${this._supportedLangs.map(code =>
          `<button class="lang-option${code === this.currentLang ? ' active' : ''}" data-lang="${code}">${this._langNames[code]}</button>`
        ).join('')}
      </div>
    `;

    // Toggle dropdown
    container.querySelector('.lang-switcher-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      container.classList.toggle('open');
    });

    // Select language
    container.querySelectorAll('.lang-option').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setLang(btn.dataset.lang);
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      container.classList.remove('open');
    });

    nav.appendChild(container);
  },

  // AI 语言指令（追加到 prompt 末尾）
  getLangInstruction() {
    const map = {
      zh: '请用中文回复。',
      en: 'Please respond in English.',
      fr: 'Veuillez répondre en français.',
      de: 'Bitte antworten Sie auf Deutsch.',
      ru: 'Пожалуйста, ответьте на русском.',
      es: 'Por favor, responde en español.',
      pt: 'Por favor, responda em português.',
      ar: 'الرجاء الرد باللغة العربية.',
      ja: '日本語で回答してください。',
      ko: '한국어로 답변해 주세요.',
      th: 'กรุณาตอบเป็นภาษาไทย',
    };
    return map[this.currentLang] || map.en;
  },
};
