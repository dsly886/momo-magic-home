# 多语言国际化 (i18n) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 11-language support to momo-magic-home with IP-based auto-detection and English fallback.

**Architecture:** Source HTML files keep `data-i18n` attributes with English base text; `js/i18n.js` handles runtime language detection + text replacement; a Python build script generates static language variants for production SEO. All translations live in a single `i18n/translations.json`.

**Tech Stack:** Vanilla JS (no frameworks), Python 3 stdlib (build script), ip-api.com (IP geolocation).

---

### Translation Key Inventory (~112 keys × 11 languages)

All keys organized by namespace. This enumeration drives every task below.

**common** (12): `settings_title`, `settings_desc`, `api_key_label`, `api_key_placeholder`, `get_api_key_link`, `get_api_key_url`, `cancel_btn`, `save_btn`, `back_link`, `footer`, `settings_btn`, `settings_saved`, `copied`, `need_api_key`, `fill_all_fields`, `error_check_console`

**index** (17): `hero_title`, `hero_subtitle`, `card_story_title`, `card_story_desc`, `card_story_magic`, `card_fortune_title`, `card_fortune_desc`, `card_fortune_magic`, `card_spell_title`, `card_spell_desc`, `card_spell_magic`, `card_wish_title`, `card_wish_desc`, `card_wish_magic`, `card_dream_title`, `card_dream_desc`, `card_dream_magic`

**story** (15): `page_title`, `meta_desc`, `header_title`, `header_desc`, `theme_label`, `theme_placeholder`, `characters_label`, `characters_placeholder`, `style_label`, `style_fantasy`, `style_warm`, `style_adventure`, `submit_btn`, `loading_text`, `result_title`, `placeholder_text`, `copy_btn`

**fortune** (16): `page_title`, `meta_desc`, `header_title`, `header_desc`, `question_label`, `question_placeholder`, `category_label`, `category_general`, `category_love`, `category_career`, `category_wealth`, `submit_btn`, `loading_text`, `result_title`, `placeholder_text`, `copy_btn`

**spell** (15): `page_title`, `meta_desc`, `header_title`, `header_desc`, `wish_label`, `wish_placeholder`, `type_label`, `type_poetic`, `type_ancient`, `type_cute`, `submit_btn`, `loading_text`, `result_title`, `placeholder_text`, `copy_btn`

**wish** (13): `page_title`, `meta_desc`, `header_title`, `header_desc`, `wish_label`, `wish_placeholder`, `submit_btn`, `loading_text`, `result_title`, `placeholder_text`, `copy_btn`, `result_decoration`

**dream** (14): `page_title`, `meta_desc`, `header_title`, `header_desc`, `dream_label`, `dream_placeholder`, `dream_hint`, `submit_btn`, `loading_text`, `result_title`, `placeholder_text`, `copy_btn`

**Total:** ~112 keys

## File Structure

### Files to Create
- `i18n/translations.json` — All 11 language translation data
- `js/i18n.js` — i18n engine: detection, text replacement, switcher
- `build-i18n.py` — Build script for static file generation

### Files to Modify
- `index.html` — Add data-i18n, change text to English
- `tools/story.html` — Same
- `tools/fortune.html` — Same
- `tools/spell.html` — Same
- `tools/wish.html` — Same
- `tools/dream.html` — Same
- `css/magic.css` — Language switcher styles + RTL support
- `js/magic-api.js` — Append language instruction to prompts
- `js/magic-utils.js` — Integrate `i18n.init()` into page init

---

### Task 1: Create i18n/translations.json

**Files:**
- Create: `i18n/translations.json`

Structured by language → namespace → key. Every language has the exact same keys.
The complete file is ~2000 lines. Below shows the full structure. Write all 11 languages.

**Language codes**: `zh`, `en`, `fr`, `de`, `ru`, `es`, `pt`, `ar`, `ja`, `ko`, `th`

All translations JSON follows this structure:

```json
{
  "zh": {
    "common": { ... },
    "index": { ... },
    "story": { ... },
    "fortune": { ... },
    "spell": { ... },
    "wish": { ... },
    "dream": { ... }
  },
  "en": { ... },
  "fr": { ... },
  "de": { ... },
  "ru": { ... },
  "es": { ... },
  "pt": { ... },
  "ar": { ... },
  "ja": { ... },
  "ko": { ... },
  "th": { ... }
}
```

- [ ] **Step 1: Write English translations (base language)**

```json
{
  "en": {
    "common": {
      "settings_title": "⚙️ Settings",
      "settings_desc": "Enter your DeepSeek API Key to unlock the magic. The key is stored only in your browser.",
      "api_key_label": "DeepSeek API Key",
      "api_key_placeholder": "sk-...",
      "get_api_key_link": "Don't have an API Key?",
      "get_api_key_url": "https://platform.deepseek.com/",
      "cancel_btn": "Cancel",
      "save_btn": "💾 Save",
      "back_link": "← Back to Magic House",
      "footer": "🏰 Momo's AI Magic House · Powered by DeepSeek",
      "settings_btn": "⚙️ Settings",
      "settings_saved": "✅ Settings saved",
      "copied": "✨ Copied to clipboard",
      "need_api_key": "Please configure your DeepSeek API Key in Settings first",
      "fill_all_fields": "Please fill in all fields ✨",
      "error_check_console": "Check the console (F12) for error details"
    },
    "index": {
      "hero_title": "Momo's AI Magic House",
      "hero_subtitle": "✨ Ignite your imagination with the power of AI ✨",
      "card_story_title": "AI Story Workshop",
      "card_story_desc": "Enter a theme and characters, let AI weave magical tales",
      "card_story_magic": "✦ Fantasy Narratives ✦",
      "card_fortune_title": "Magic Fortune Teller",
      "card_fortune_desc": "Tarot readings — AI reveals the threads of destiny",
      "card_fortune_magic": "✦ Fate's Guidance ✦",
      "card_spell_title": "Spell Alchemy Forge",
      "card_spell_desc": "Turn your wishes into magnificent magical incantations",
      "card_spell_magic": "✦ Spell Weaving ✦",
      "card_wish_title": "Wishing Well",
      "card_wish_desc": "Make a wish upon a star, receive a poetic reply",
      "card_wish_magic": "✦ Starry Wishes ✦",
      "card_dream_title": "Dream Interpreter",
      "card_dream_desc": "Describe your dream, AI helps unlock its mysteries",
      "card_dream_magic": "✦ Whispers of Dreams ✦"
    },
    "story": {
      "page_title": "AI Story Workshop",
      "meta_desc": "AI Story Workshop — Enter a theme and characters, let AI weave unique magical tales. Supports fantasy, heartwarming, and adventurous styles.",
      "header_title": "AI Story Workshop",
      "header_desc": "Share your ideas, AI weaves one-of-a-kind magical stories for you",
      "theme_label": "📌 Story Theme / Setting",
      "theme_placeholder": "e.g., Moonlight Forest, Undersea Kingdom, Castle in the Clouds...",
      "characters_label": "👤 Main Characters",
      "characters_placeholder": "e.g., A brave little rabbit, a talking star...",
      "style_label": "🎭 Story Style",
      "style_fantasy": "🧙 Fantasy",
      "style_warm": "🌺 Heartwarming",
      "style_adventure": "⚔️ Adventure",
      "submit_btn": "✨ Weave a Story",
      "loading_text": "📖 The bard is weaving a tale...",
      "result_title": "✦ Story ✦",
      "placeholder_text": "Enter a theme and characters, click \"Weave a Story\" to begin",
      "copy_btn": "📋 Copy Story"
    },
    "fortune": {
      "page_title": "Magic Fortune Teller",
      "meta_desc": "Magic Fortune Teller — Ask the AI fortuneteller a question and receive a tarot-style reading covering love, career, wealth, and more.",
      "header_title": "Magic Fortune Teller",
      "header_desc": "Ask the fortuneteller a question, AI tarot reveals the threads of destiny",
      "question_label": "🔮 What would you like to ask?",
      "question_placeholder": "e.g., What does my career look like? Any hints about love?...",
      "category_label": "📂 Fortune Category",
      "category_general": "🌟 General",
      "category_love": "💕 Love",
      "category_career": "💼 Career",
      "category_wealth": "💰 Wealth",
      "submit_btn": "🔮 Begin Reading",
      "loading_text": "🔮 The tarot cards are being arranged...",
      "result_title": "✦ Reading ✦",
      "placeholder_text": "Enter a question, click \"Begin Reading\" to see results",
      "copy_btn": "📋 Copy Reading"
    },
    "spell": {
      "page_title": "Spell Alchemy Forge",
      "meta_desc": "Spell Alchemy Forge — Turn your wishes into magnificent magical incantations. Choose from poetic, ancient, or playful styles.",
      "header_title": "Spell Alchemy Forge",
      "header_desc": "Turn your wishes and ideas into unique magical incantations",
      "wish_label": "💭 What is your wish?",
      "wish_placeholder": "e.g., I wish to face challenges bravely, I want a life full of creativity and surprises...",
      "type_label": "🎨 Spell Style",
      "type_poetic": "✨ Poetic",
      "type_ancient": "🏮 Ancient",
      "type_cute": "🎀 Playful",
      "submit_btn": "🪄 Forge a Spell",
      "loading_text": "🪄 The alchemy forge is crafting an incantation...",
      "result_title": "✦ Spell ✦",
      "placeholder_text": "Enter your wish, click \"Forge a Spell\" to see results",
      "copy_btn": "📋 Copy Spell"
    },
    "wish": {
      "page_title": "Wishing Well",
      "meta_desc": "Wishing Well — Make a wish upon the stars, receive a poetic reply from the universe. Every wish is answered with warmth and hope.",
      "header_title": "Wishing Well",
      "header_desc": "Make a wish upon the stars, receive a poetic reply from the cosmos",
      "wish_label": "🌟 Write your wish",
      "wish_placeholder": "Write your most sincere wish...\ne.g., I wish my family health and happiness, I hope to find my direction in life...",
      "submit_btn": "⭐ Wish Upon a Star",
      "loading_text": "⭐ The stars are listening to your wish...",
      "result_title": "✦ Reply from the Stars ✦",
      "placeholder_text": "Write your wish, click \"Wish Upon a Star\" to see the reply",
      "copy_btn": "📋 Save This Reply",
      "result_decoration": "🌙 ⭐ 🌟"
    },
    "dream": {
      "page_title": "Dream Interpreter",
      "meta_desc": "Dream Interpreter — Describe your dream and AI reveals its symbolic meaning and spiritual insights. Blends traditional wisdom with psychology.",
      "header_title": "Dream Interpreter",
      "header_desc": "Describe your dream, AI helps unlock its mysteries and revelations",
      "dream_label": "🌜 Describe your dream",
      "dream_placeholder": "Describe your dream in as much detail as possible — what did you see? How did you feel? Any special scenes or people?\n\ne.g., I dreamed I was running on clouds, surrounded by golden light, with a crystal castle in the distance...",
      "dream_hint": "The more detail you provide, the more accurate the interpretation ✨",
      "submit_btn": "🌙 Interpret Dream",
      "loading_text": "🌙 The dream interpreter is analyzing your dream...",
      "result_title": "✦ Dream Reading ✦",
      "placeholder_text": "Enter your dream, click \"Interpret Dream\" to see results",
      "copy_btn": "📋 Save Interpretation"
    }
  }
}
```

- [ ] **Step 2: Write Chinese translations**

The Chinese translations are extracted from the current HTML source text. Use the same key structure as `en` above.

```json
{
  "zh": {
    "common": {
      "settings_title": "⚙️ 设置",
      "settings_desc": "输入你的 DeepSeek API Key 来解锁魔法力量。API Key 仅存储在本地浏览器中。",
      "api_key_label": "DeepSeek API Key",
      "api_key_placeholder": "sk-...",
      "get_api_key_link": "没有 API Key？",
      "get_api_key_url": "https://platform.deepseek.com/",
      "cancel_btn": "取消",
      "save_btn": "💾 保存",
      "back_link": "← 返回魔法屋",
      "footer": "🏰 momo的AI魔法屋 · Powered by DeepSeek",
      "settings_btn": "⚙️ 设置",
      "settings_saved": "✅ 设置已保存",
      "copied": "✨ 已复制到剪贴板",
      "need_api_key": "请先在设置中配置 DeepSeek API Key",
      "fill_all_fields": "请填写完整信息 ✨",
      "error_check_console": "请检查控制台 (F12) 查看详细错误信息"
    },
    "index": {
      "hero_title": "momo的AI魔法屋",
      "hero_subtitle": "✨ 用 AI 的力量，点亮你的奇思妙想 ✨",
      "card_story_title": "AI 故事工坊",
      "card_story_desc": "输入主题与角色，让 AI 为你编织魔法故事",
      "card_story_magic": "✦ 奇幻叙事 ✦",
      "card_fortune_title": "魔法占卜屋",
      "card_fortune_desc": "塔罗占卜，AI 为你揭示命运的线索",
      "card_fortune_magic": "✦ 命运指引 ✦",
      "card_spell_title": "咒语炼金炉",
      "card_spell_desc": "把你的心愿变成华丽的魔法咒语",
      "card_spell_magic": "✦ 咒语编织 ✦",
      "card_wish_title": "星星许愿池",
      "card_wish_desc": "向星星许愿，收获一首诗意的回应",
      "card_wish_magic": "✦ 星语心愿 ✦",
      "card_dream_title": "魔法解梦",
      "card_dream_desc": "描述你的梦境，AI 帮你解读其中奥秘",
      "card_dream_magic": "✦ 梦境的低语 ✦"
    },
    "story": {
      "page_title": "AI 故事工坊",
      "meta_desc": "AI 故事工坊 - 输入主题和角色，让AI为你编织独一无二的魔法故事。支持奇幻魔法、温馨治愈、冒险刺激三种风格。",
      "header_title": "AI 故事工坊",
      "header_desc": "输入你的创意，AI 为你编织独一无二的魔法故事",
      "theme_label": "📌 故事主题 / 背景",
      "theme_placeholder": "例如：月光森林、海底王国、云端的城堡...",
      "characters_label": "👤 主要角色",
      "characters_placeholder": "例如：勇敢的小兔子、会说话的星星...",
      "style_label": "🎭 故事风格",
      "style_fantasy": "🧙 奇幻魔法",
      "style_warm": "🌺 温馨治愈",
      "style_adventure": "⚔️ 冒险刺激",
      "submit_btn": "✨ 编织故事",
      "loading_text": "📖 吟游诗人正在编织故事...",
      "result_title": "✦ 故事 ✦",
      "placeholder_text": "输入主题和角色，点击「编织故事」开始",
      "copy_btn": "📋 复制故事"
    },
    "fortune": {
      "page_title": "魔法占卜屋",
      "meta_desc": "魔法占卜屋 - 向AI占卜师提问，获得塔罗风格的占卜解读。涵盖综合运势、爱情、事业、财富四大领域。",
      "header_title": "魔法占卜屋",
      "header_desc": "向占卜师提问，AI 塔罗为你揭示命运的线索",
      "question_label": "🔮 你想要占卜什么？",
      "question_placeholder": "例如：我最近的工作运会如何？感情方面有什么提示？...",
      "category_label": "📂 占卜领域",
      "category_general": "🌟 综合运势",
      "category_love": "💕 爱情",
      "category_career": "💼 事业",
      "category_wealth": "💰 财富",
      "submit_btn": "🔮 开始占卜",
      "loading_text": "🔮 塔罗牌正在排列中...",
      "result_title": "✦ 占卜结果 ✦",
      "placeholder_text": "输入问题，点击「开始占卜」查看结果",
      "copy_btn": "📋 复制结果"
    },
    "spell": {
      "page_title": "咒语炼金炉",
      "meta_desc": "咒语炼金炉 - 把你的心愿和想法变成华丽的魔法咒语。支持诗意华丽、古风典雅、可爱俏皮三种风格。",
      "header_title": "咒语炼金炉",
      "header_desc": "把你的心愿和想法，变成独一无二的魔法咒语",
      "wish_label": "💭 你想要实现什么心愿？",
      "wish_placeholder": "例如：希望我能勇敢面对挑战、想要生活充满创意和惊喜...",
      "type_label": "🎨 咒语风格",
      "type_poetic": "✨ 诗意华丽",
      "type_ancient": "🏮 古风典雅",
      "type_cute": "🎀 可爱俏皮",
      "submit_btn": "🪄 炼制咒语",
      "loading_text": "🪄 炼金炉正在炼制咒语...",
      "result_title": "✦ 咒语 ✦",
      "placeholder_text": "输入心愿，点击「炼制咒语」查看结果",
      "copy_btn": "📋 复制咒语"
    },
    "wish": {
      "page_title": "星星许愿池",
      "meta_desc": "星星许愿池 - 向星空许下心愿，AI以诗意的语言回应你。每一份愿望都会收到来自星辰的温暖回信。",
      "header_title": "星星许愿池",
      "header_desc": "向星空许下心愿，收获来自宇宙的诗意回应",
      "wish_label": "🌟 写下你的愿望",
      "wish_placeholder": "写下你心中最真诚的愿望...\n例如：希望家人健康快乐、希望能找到人生的方向...",
      "submit_btn": "⭐ 向星星许愿",
      "loading_text": "⭐ 星星正在聆听你的愿望...",
      "result_title": "✦ 星辰的回信 ✦",
      "placeholder_text": "写下心愿，点击「向星星许愿」查看回应",
      "copy_btn": "📋 保存这份回应",
      "result_decoration": "🌙 ⭐ 🌟"
    },
    "dream": {
      "page_title": "魔法解梦",
      "meta_desc": "魔法解梦 - 描述你的梦境，AI解读其中的象征意义和心灵启示。结合传统解梦智慧和心理学视角。",
      "header_title": "魔法解梦",
      "header_desc": "描述你的梦境，AI 帮你解读其中的奥秘与启示",
      "dream_label": "🌜 描述你的梦境",
      "dream_placeholder": "尽量详细地描述你的梦境——你看到了什么？感受到了什么？有哪些特别的场景或人物？\n\n例如：我梦见自己在云层上奔跑，周围是金色的光芒，远处有一座水晶做的城堡...",
      "dream_hint": "描述越详细，解读越精准 ✨",
      "submit_btn": "🌙 解读梦境",
      "loading_text": "🌙 解梦师正在解读你的梦境...",
      "result_title": "✦ 梦境解读 ✦",
      "placeholder_text": "输入梦境，点击「解读梦境」查看结果",
      "copy_btn": "📋 保存解读"
    }
  }
}
```

- [ ] **Step 3: Write French translations (fr)**

Create the `fr` section with the same key structure. All values translated to French.

Key French translations (representative sample — write all ~112 keys):

```json
{
  "fr": {
    "common": {
      "settings_title": "⚙️ Paramètres",
      "settings_desc": "Entrez votre clé API DeepSeek pour débloquer la magie. La clé est stockée uniquement dans votre navigateur.",
      "api_key_label": "Clé API DeepSeek",
      "api_key_placeholder": "sk-...",
      "get_api_key_link": "Pas de clé API ?",
      "get_api_key_url": "https://platform.deepseek.com/",
      "cancel_btn": "Annuler",
      "save_btn": "💾 Enregistrer",
      "back_link": "← Retour au Manoir Magique",
      "footer": "🏰 Le Manoir Magique de Momo · Propulsé par DeepSeek",
      "settings_btn": "⚙️ Paramètres",
      "settings_saved": "✅ Paramètres enregistrés",
      "copied": "✨ Copié dans le presse-papier",
      "need_api_key": "Veuillez d'abord configurer votre clé API DeepSeek dans les paramètres",
      "fill_all_fields": "Veuillez remplir tous les champs ✨",
      "error_check_console": "Vérifiez la console (F12) pour les détails de l'erreur"
    },
    "index": {
      "hero_title": "Le Manoir Magique de Momo",
      "hero_subtitle": "✨ Libérez votre imagination avec la puissance de l'IA ✨",
      "card_story_title": "Atelier d'Histoires IA",
      "card_story_desc": "Entrez un thème et des personnages, laissez l'IA tisser des contes magiques",
      "card_story_magic": "✦ Récits Fantastiques ✦",
      "card_fortune_title": "Voyant Magique",
      "card_fortune_desc": "Lecture de tarot — l'IA révèle les fils du destin",
      "card_fortune_magic": "✦ Guide du Destin ✦",
      "card_spell_title": "Forge Alchimique de Sorts",
      "card_spell_desc": "Transformez vos souhaits en incantations magiques",
      "card_spell_magic": "✦ Tissage de Sorts ✦",
      "card_wish_title": "Puits aux Souhaits",
      "card_wish_desc": "Faites un vœu sur une étoile, recevez une réponse poétique",
      "card_wish_magic": "✦ Vœux Étoilés ✦",
      "card_dream_title": "Interprète des Rêves",
      "card_dream_desc": "Décrivez votre rêve, l'IA vous aide à percer ses mystères",
      "card_dream_magic": "✦ Murmures des Rêves ✦"
    },
    "story": {
      "page_title": "Atelier d'Histoires IA",
      "meta_desc": "Atelier d'Histoires IA — Entrez un thème et des personnages, laissez l'IA tisser des contes magiques uniques.",
      "header_title": "Atelier d'Histoires IA",
      "header_desc": "Partagez vos idées, l'IA tisse des histoires magiques uniques pour vous",
      "theme_label": "📌 Thème / Cadre",
      "theme_placeholder": "ex: Forêt de Lune, Royaume Sous-Marin, Château dans les Nuages...",
      "characters_label": "👤 Personnages",
      "characters_placeholder": "ex: Un petit lapin courageux, une étoile qui parle...",
      "style_label": "🎭 Style",
      "style_fantasy": "🧙 Fantastique",
      "style_warm": "🌺 Douceur",
      "style_adventure": "⚔️ Aventure",
      "submit_btn": "✨ Tisser une Histoire",
      "loading_text": "📖 Le barde tisse un conte...",
      "result_title": "✦ Histoire ✦",
      "placeholder_text": "Entrez un thème et des personnages, cliquez sur « Tisser une Histoire »",
      "copy_btn": "📋 Copier l'Histoire"
    },
    "fortune": { /* same structure — all values in French */ },
    "spell": { /* same structure — all values in French */ },
    "wish": { /* same structure — all values in French */ },
    "dream": { /* same structure — all values in French */ }
  }
}
```

- [ ] **Step 4: Write German translations (de)**

Create the `de` section with the same key structure, all values in German.

- [ ] **Step 5: Write Russian translations (ru)**

Create the `ru` section, all values in Russian.

- [ ] **Step 6: Write Spanish translations (es)**

Create the `es` section, all values in Spanish.

- [ ] **Step 7: Write Portuguese translations (pt)**

Create the `pt` section, all values in Portuguese.

- [ ] **Step 8: Write Arabic translations (ar)**

Create the `ar` section, all values in Arabic.

- [ ] **Step 9: Write Japanese translations (ja)**

Create the `ja` section, all values in Japanese.

- [ ] **Step 10: Write Korean translations (ko)**

Create the `ko` section, all values in Korean.

- [ ] **Step 11: Write Thai translations (th)**

Create the `th` section, all values in Thai.

---

### Task 2: Create js/i18n.js

**Files:**
- Create: `js/i18n.js`

The i18n engine handles: language detection (localStorage > ip-api > navigator), text replacement, switcher injection.

- [ ] **Step 1: Write the complete i18n.js**

```js
/* ===== momo的AI魔法屋 - 多语言引擎 ===== */

const i18n = {
  currentLang: 'en',
  dir: 'ltr',
  translations: null,
  _detectPromise: null,

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
      const resp = await fetch('i18n/translations.json' + '?v=' + Date.now());
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
    document.querySelector('.lang-switcher').classList.remove('open');
  },

  // 注入语言切换器到导航栏
  injectSwitcher() {
    const nav = document.querySelector('.tool-nav');
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
```

- [ ] **Step 2: Validate the file loads without errors**

Run: `python -m http.server 8080` in the project root, open browser console, verify no `i18n` errors.

---

### Task 3: Add language switcher CSS to magic.css

**Files:**
- Modify: `css/magic.css`

- [ ] **Step 1: Add language switcher + RTL styles to the end of magic.css**

```css
/* === Language Switcher === */
.lang-switcher {
  position: relative;
  display: inline-block;
}

.lang-switcher-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--color-text-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
  white-space: nowrap;
}

.lang-switcher-btn:hover {
  color: var(--color-text);
  border-color: var(--color-magic-purple);
}

.lang-switcher-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  background: var(--bg-secondary);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  padding: 6px;
  min-width: 150px;
  z-index: 200;
  animation: fade-in-up 0.15s ease-out;
  max-height: 320px;
  overflow-y: auto;
}

.lang-switcher.open .lang-switcher-dropdown {
  display: block;
}

.lang-option {
  display: block;
  width: 100%;
  padding: 8px 14px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--color-text-dim);
  font-size: 13px;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s;
  font-family: inherit;
  white-space: nowrap;
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.lang-option.active {
  color: var(--color-magic-pink);
  background: rgba(232, 121, 249, 0.1);
}

/* === RTL Support === */
html[dir="rtl"] .lang-option {
  text-align: right;
}

html[dir="rtl"] .tool-nav .back-link {
  margin-right: 0;
  margin-left: auto;
}

html[dir="rtl"] .tool-body .form-group label {
  text-align: right;
}
```

---

### Task 4: Convert index.html to English + data-i18n

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Change `<html lang="zh-CN">` to `<html lang="en">`**

- [ ] **Step 2: Add data-i18n attributes to all translatable elements, change text to English**

Key changes:

```html
<!-- Title -->
<h1 class="title-glow" data-i18n="index.hero_title">Momo's AI Magic House</h1>
<p class="subtitle" data-i18n="index.hero_subtitle">✨ Ignite your imagination with the power of AI ✨</p>

<!-- Settings Modal -->
<h2 data-i18n="common.settings_title">⚙️ Settings</h2>
<p class="modal-desc" data-i18n="common.settings_desc">Enter your DeepSeek API Key to unlock the magic...</p>

<!-- Tool cards -->
<a href="tools/story.html" class="tool-card card-story">
  <span class="card-icon">📖</span>
  <span class="card-title" data-i18n="index.card_story_title">AI Story Workshop</span>
  <span class="card-desc" data-i18n="index.card_story_desc">Enter a theme and characters, let AI weave magical tales</span>
  <span class="card-magic" data-i18n="index.card_story_magic">✦ Fantasy Narratives ✦</span>
</a>
<!-- ... repeat for 5 cards ... -->

<!-- Footer -->
<div class="footer">
  <p data-i18n="common.footer">🏰 Momo's AI Magic House · Powered by DeepSeek</p>
</div>

<!-- Cancel / Save buttons in modal -->
<button class="btn-secondary" onclick="MagicUtils.closeSettings()" data-i18n="common.cancel_btn">Cancel</button>
<button class="btn-magic" onclick="MagicUtils.saveSettings()" data-i18n="common.save_btn">💾 Save</button>
```

- [ ] **Step 3: Add data-i18n-title to `<title>` and data-i18n-meta to `<meta description>`**

```html
<title data-i18n-title="index.hero_title">Momo's AI Magic House</title>
<meta name="description" data-i18n-meta="index.meta_desc" content="...">
```

- [ ] **Step 4: Add i18n.js script tag and init call**

```html
<script src="js/env.js?v=2"></script>
<script src="js/i18n.js?v=1"></script>
<script src="js/magic-utils.js?v=2"></script>
<script src="js/magic-api.js?v=2"></script>
<script>
  const container = document.getElementById('stars-container');
  MagicUtils.createStarryBg(container);

  Env.load().then(() => {
    i18n.init().then(() => {
      // i18n applied
    });
  });

  // Settings modal click outside
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) MagicUtils.closeSettings();
  });
  document.getElementById('api-key-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') MagicUtils.saveSettings();
  });
</script>
```

---

### Task 5: Convert tools/story.html to English + data-i18n

**Files:**
- Modify: `tools/story.html`

- [ ] **Step 1: Change `<html lang="zh-CN">` to `<html lang="en">`**

- [ ] **Step 2: Add data-i18n to all translatable elements**

```html
<title data-i18n-title="story.page_title">AI Story Workshop</title>
<meta name="description" data-i18n-meta="story.meta_desc" content="...">

<!-- Settings Modal — uses common keys -->
<h2 data-i18n="common.settings_title">⚙️ Settings</h2>
<p class="modal-desc" data-i18n="common.settings_desc">Enter your DeepSeek API Key...</p>

<!-- Nav -->
<a href="../index.html" class="back-link" data-i18n="common.back_link">← Back to Magic House</a>
<button class="btn-secondary" onclick="MagicUtils.openSettings()" data-i18n="common.settings_btn">⚙️ Settings</button>

<!-- Header -->
<span class="tool-icon">📖</span>
<h1 data-i18n="story.header_title">AI Story Workshop</h1>
<p data-i18n="story.header_desc">Share your ideas, AI weaves one-of-a-kind magical stories for you</p>

<!-- Form -->
<label data-i18n="story.theme_label">📌 Story Theme / Setting</label>
<input data-i18n-placeholder="story.theme_placeholder" placeholder="e.g., Moonlight Forest...">

<label data-i18n="story.characters_label">👤 Main Characters</label>
<input data-i18n-placeholder="story.characters_placeholder" placeholder="e.g., A brave little rabbit...">

<label data-i18n="story.style_label">🎭 Story Style</label>
<button type="button" class="style-option selected" data-value="fantasy" data-i18n="story.style_fantasy">🧙 Fantasy</button>
<button type="button" class="style-option" data-value="warm" data-i18n="story.style_warm">🌺 Heartwarming</button>
<button type="button" class="style-option" data-value="adventure" data-i18n="story.style_adventure">⚔️ Adventure</button>

<button type="submit" class="btn-magic" id="submit-btn" data-i18n="story.submit_btn">✨ Weave a Story</button>

<!-- Loading -->
<span data-i18n="story.loading_text">📖 The bard is weaving a tale...</span>

<!-- Result box -->
<div class="result-title" data-i18n="story.result_title">✦ Story ✦</div>
<div class="result-placeholder">
  <div class="placeholder-icon">📖</div>
  <span data-i18n="story.placeholder_text">Enter a theme and characters, click "Weave a Story" to begin</span>
</div>
<button class="btn-copy" onclick="copyResult()" data-i18n="story.copy_btn">📋 Copy Story</button>
```

- [ ] **Step 3: Update script section — add i18n.init()**

```html
<script src="../js/i18n.js?v=1"></script>
<script>
  // ... existing code ...

  Env.load().then(() => {
    i18n.init();
  });

  MagicUtils.initToolPage({
    title: 'AI Story Workshop',
    // ... rest unchanged
  });
</script>
```

---

### Task 6: Convert tools/fortune.html to English + data-i18n

**Files:**
- Modify: `tools/fortune.html`

- [ ] **Step 1–3: Same pattern as Task 5, using `fortune.*` keys and `common.*` keys.**

Apply the same transformations:
- All text to English
- Add `data-i18n="fortune.key"` on all text elements
- Add `data-i18n-placeholder` on inputs
- Add `data-i18n-title` on `<title>`, `data-i18n-meta` on `<meta description>`
- Update script to load i18n.js and call `i18n.init()`

---

### Task 7: Convert tools/spell.html to English + data-i18n

**Files:**
- Modify: `tools/spell.html`

- [ ] **Step 1–3: Same pattern using `spell.*` keys.**

---

### Task 8: Convert tools/wish.html to English + data-i18n

**Files:**
- Modify: `tools/wish.html`

- [ ] **Step 1–3: Same pattern using `wish.*` keys.**

---

### Task 9: Convert tools/dream.html to English + data-i18n

**Files:**
- Modify: `tools/dream.html`

- [ ] **Step 1–3: Same pattern using `dream.*` keys.**

---

### Task 10: Modify magic-api.js — add language instruction

**Files:**
- Modify: `js/magic-api.js`

- [ ] **Step 1: Append language instruction to all 5 API methods**

```js
// In generateStory — add to the prompt string:
const prompt = `...\n\n${i18n?.getLangInstruction?.() || ''}`;

// In doFortune — add to the prompt string:
const prompt = `...\n\n${i18n?.getLangInstruction?.() || ''}`;

// In castSpell — add to the prompt string:
const prompt = `...\n\n${i18n?.getLangInstruction?.() || ''}`;

// In makeWish — add to the prompt string:
const prompt = `...\n\n${i18n?.getLangInstruction?.() || ''}`;

// In interpretDream — add to the prompt string:
const prompt = `...\n\n${i18n?.getLangInstruction?.() || ''}`;
```

Also update the error message to use translation:

```js
async call(messages, options = {}) {
  const apiKey = this.getApiKey();
  if (!apiKey) {
    const msg = i18n?.t?.('common.need_api_key') || '请先在设置中配置 DeepSeek API Key';
    throw new Error(msg);
  }
  // ... rest
}
```

- [ ] **Step 2: Bump cache version** on the script tag in all HTML pages (`?v=2`).

---

### Task 11: Modify magic-utils.js — integrate i18n

**Files:**
- Modify: `js/magic-utils.js`

- [ ] **Step 1: Update toast messages, copy messages, and validation to use i18n.t()**

```js
// In copyToClipboard / fallbackCopy:
this.showToast(i18n?.t?.('common.copied') || '✨ 已复制到剪贴板');

// In saveSettings:
this.showToast(i18n?.t?.('common.settings_saved') || '✅ 设置已保存');

// In initToolPage validation:
this.showToast(i18n?.t?.('common.fill_all_fields') || '请填写完整信息 ✨');

// In initToolPage error display (the innerHTML with error):
const errorMsg = i18n?.t?.('common.error_check_console') || '请检查控制台 (F12) 查看详细错误信息';
```

- [ ] **Step 2: Bump version** (`?v=2`).

---

### Task 12: Create build-i18n.py

**Files:**
- Create: `build-i18n.py`

- [ ] **Step 1: Write the build script**

```python
"""
build-i18n.py — Generate static multi-language HTML files for production.
Usage: python build-i18n.py
Output: dist/ directory with all 66 HTML files + static assets.
"""

import json
import re
import os
import shutil

# Pages to process: (source_path, output_name)
PAGES = [
    ('index.html', 'index'),
    ('tools/story.html', 'tools/story'),
    ('tools/fortune.html', 'tools/fortune'),
    ('tools/spell.html', 'tools/spell'),
    ('tools/wish.html', 'tools/wish'),
    ('tools/dream.html', 'tools/dream'),
]

SUPPORTED_LANGS = ['zh', 'en', 'fr', 'de', 'ru', 'es', 'pt', 'ar', 'ja', 'ko', 'th']
RTL_LANGS = {'ar'}

STATIC_DIRS = ['css', 'js', 'i18n']
STATIC_FILES = ['robots.txt', 'sitemap.xml']


def load_translations(path='i18n/translations.json'):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def build_hreflangs(page_name, current_lang):
    """Build hreflang link tags for all language variants."""
    links = []
    for lang in SUPPORTED_LANGS:
        if lang == 'en':
            href = f'{page_name}.html'
        else:
            href = f'{page_name}.{lang}.html'
        links.append(f'  <link rel="alternate" hreflang="{lang}" href="{href}">')
    return '\n'.join(links)


def translate_html(html, translations, namespace, lang):
    """Replace data-i18n text content with translations."""

    def replace_text(match):
        el_start = match.group(0)
        key = match.group(1)
        # Find the text content between > and <
        text_match = re.search(r'(>)(.*?)(<)', el_start[match.end():], re.DOTALL)
        if not text_match:
            # Try to find end of self-closing or other patterns
            return el_start
        translated = translations.get(key, '')
        if not translated:
            return el_start
        return el_start + text_match.group(1) + translated + text_match.group(3)

    def replace_attr(match):
        full = match.group(0)
        key = match.group(1)
        attr = match.group(2)
        translated = translations.get(key, '')
        if not translated:
            return full
        return re.sub(f'{attr}="[^"]*"', f'{attr}="{translated}"', full)

    # Process data-i18n elements
    result = html
    data_i18n_pattern = re.compile(r'<[^>]*data-i18n="([^"]*)"[^>]*>')
    
    # For each data-i18n element, replace its textContent
    for match in data_i18n_pattern.finditer(html):
        el_start = match.group(0)
        key = match.group(1)
        ns_key = f'{namespace}.{key}' if not '.' in key else key
        # Check if key is already namespaced (e.g. "common.settings_title")
        full_key = key if '.' in key else f'{namespace}.{key}'
        translated = translations.get(full_key, '')
        if not translated:
            translated = translations.get(key, '')
        if not translated:
            continue
        
        # Replace textContent only (not attributes)
        content_match = re.search(r'>([^<]*)<', el_start)
        if content_match and content_match.group(1).strip():
            result = result.replace(el_start, el_start.replace(content_match.group(1), translated))

    # Process data-i18n-placeholder
    placeholder_pattern = re.compile(r'data-i18n-placeholder="([^"]*)"')
    for match in placeholder_pattern.finditer(result):
        key = match.group(1)
        full_key = key if '.' in key else f'{namespace}.{key}'
        translated = translations.get(full_key, '')
        if not translated:
            continue
        orig_pattern = f'placeholder="[^"]*"'
        result = re.sub(orig_pattern, f'placeholder="{translated}"', result, count=1)

    # Update <html lang>
    result = re.sub(r'<html lang="[^"]*"', f'<html lang="{lang}"', result)

    # Update dir for RTL
    if lang in RTL_LANGS:
        if 'dir="' in result[:200]:
            result = re.sub(r'dir="[^"]*"', 'dir="rtl"', result[:200]) + result[200:]
        else:
            result = result.replace('<html ', f'<html dir="rtl" ', 1)

    return result


def build():
    # Load translations as flat key→value per language
    raw = load_translations()
    
    # Flatten: { lang: { "namespace.key": "value", ... } }
    flat = {}
    for lang in SUPPORTED_LANGS:
        flat[lang] = {}
        lang_data = raw.get(lang, {})
        for namespace, keys in lang_data.items():
            for key, value in keys.items():
                flat[lang][f'{namespace}.{key}'] = value

    # Ensure dist directory clean
    if os.path.exists('dist'):
        shutil.rmtree('dist')

    # Process each page for each language
    for src_path, page_name in PAGES:
        with open(src_path, 'r', encoding='utf-8') as f:
            source_html = f.read()

        # Determine namespace from page_name
        ns = page_name.split('/')[-1]  # "story", "fortune", etc.
        if ns == 'index':
            ns = 'index'

        for lang in SUPPORTED_LANGS:
            translations = flat[lang]

            # Build translated HTML
            html = translate_html(source_html, translations, ns, lang)

            # Inject hreflang (before </head>)
            hreflangs = build_hreflangs(page_name, lang)
            html = html.replace('</head>', f'  <!-- hreflang tags -->\n{hreflangs}\n</head>', 1)

            # Determine output path
            if lang == 'en':
                out_path = f'dist/{page_name}.html'
            else:
                out_path = f'dist/{page_name}.{lang}.html'

            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f'  ✓ {out_path}')

    # Copy static assets
    for dir_name in STATIC_DIRS:
        if os.path.exists(dir_name):
            shutil.copytree(dir_name, f'dist/{dir_name}')
            print(f'  ✓ dist/{dir_name}/')

    for file_name in STATIC_FILES:
        if os.path.exists(file_name):
            shutil.copy2(file_name, f'dist/{file_name}')
            print(f'  ✓ dist/{file_name}')

    print(f'\n✅ Build complete. {len(PAGES) * len(SUPPORTED_LANGS)} pages generated in dist/')


if __name__ == '__main__':
    build()
```

- [ ] **Step 2: Run the build script and verify output**

Run: `cd momo-magic-home && python build-i18n.py`

Expected output:
```
  ✓ dist/index.html
  ✓ dist/index.zh.html
  ✓ dist/index.fr.html
  ... (66 files total)
  ✓ dist/css/
  ✓ dist/js/
  ✓ dist/robots.txt
✅ Build complete. 66 pages generated in dist/
```

- [ ] **Step 3: Spot-check a generated non-English file**

Run: `head -30 dist/tools/story.fr.html`
Verify: `<html lang="fr">`, text content is in French, hreflang tags present.

---

### Task 13: Final verification

- [ ] **Step 1: Verify all pages load without JS errors**

Run: `python -m http.server 8080` in project root. Open `http://localhost:8080/index.html` in browser. Check F12 console for errors.

- [ ] **Step 2: Verify language switcher works**

On any page, click the 🌐 dropdown, switch to a different language. Verify all UI text changes immediately.

- [ ] **Step 3: Verify AI output matches selected language**

Submit a form (e.g. story generation) with language set to French. Verify the AI response comes back in French.

- [ ] **Step 4: Verify built dist files**

Run `python build-i18n.py`, then serve from `dist/`:
`cd dist && python -m http.server 8081`
Open `http://localhost:8081/tools/story.fr.html` — verify static French page.

- [ ] **Step 5: Update cache bust versions**

All `<script src="...">` tags across all 6 pages should have `?v=2` (incremented from `?v=1`).
