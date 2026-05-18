# momo的AI魔法屋

A magic-themed AI creative tools collection driven by DeepSeek API. Multi-page HTML5 app with zero external dependencies.

## Architecture

```
momo-magic-home/
├── index.html              # Landing page with tool cards
├── .env                    # DEEPSEEK_BASE_URL, DEEPSEEK_API_KEY
├── robots.txt / sitemap.xml
├── css/
│   └── magic.css           # Shared theme: starry bg, glass cards, glow effects
├── js/
│   ├── env.js              # Env loader — reads .env, provides defaults
│   ├── magic-api.js        # MagicAPI — DeepSeek API wrapper + prompt templates
│   └── magic-utils.js      # MagicUtils — star field, typewriter, toast, settings
└── tools/
    ├── story.html           # AI story generator
    ├── fortune.html         # AI tarot fortune telling
    ├── spell.html           # Spell/alchemy generator
    ├── wish.html            # Wishing well
    └── dream.html           # Dream interpreter
```

## Key Architectural Patterns

- **No build step** — all files are vanilla HTML/CSS/JS, open directly in browser
- **Shared singleton objects** — `Env`, `MagicAPI`, `MagicUtils` are global `const` objects defined in their respective JS files
- **Tool pages follow a uniform template**: starry bg → settings modal → nav bar → tool-header → form with inputs + style options → loading indicator → result-box with placeholder/loading/result/error states
- **Initialization**: each tool page calls `Env.load()` then `MagicUtils.initToolPage({...})` which wires up the form submit handler
- **Result box lifecycle**: `result-placeholder` (idle) → `is-loading` (spinner) → `has-result` (typewriter output) or `has-error` (error message with red border)
- **CSS state classes** on `.result-box`: `is-loading`, `has-result`, `has-error`, `glow-{color}`

## Data Flow

1. User clicks submit → form handler in `initToolPage`
2. Checks `MagicAPI.hasApiKey()` (localStorage → Env fallback)
3. Collects input values, validates, shows loading state
4. Calls tool-specific `MagicAPI` method (e.g. `generateStory`, `interpretDream`)
5. Each method builds a system+user prompt and calls `MagicAPI.call(messages, options)`
6. `call()` sends POST to `{baseUrl}/v1/chat/completions` with Bearer auth
7. Response rendered via `MagicUtils.typewriter()` character-by-character

## Configuration

- `.env` file: `DEEPSEEK_BASE_URL`, `DEEPSEEK_API_KEY`
- `env.js` has hardcoded defaults that .env can override at runtime
- API key override stored in `localStorage` via settings modal
- Model: `deepseek-v4-flash` (DeepSeek reasoning model)

## Tool-Specific Prompt Patterns

Each tool uses a distinct system persona + structured format:
| Tool | System Persona | Output Format |
|------|---------------|---------------|
| story | 吟游诗人 | Free-form narrative |
| fortune | 塔罗占卜师 | ✨牌面 🔮解读 💫建议 📜祝福语 |
| spell | 炼金术士 | 📖咒语名称 ✨咒语吟唱 💫效果 🌟说明 |
| wish | 许愿星 | ⭐星辰回响 🌙星语低语 💫星星祝福 |
| dream | 解梦魔法师 | 🌙梦境画卷 🔮象征解读 💫启示 📜寄语 |

## Developing / Testing

- **Start dev server**: `cd momo-magic-home && python -m http.server 8080`
- **Cache bust**: append `?v=N` to `<script src>` when updating JS files
- **Validate HTML**: open file directly or via dev server, check F12 console

## SEO

- Each page has unique `meta description`, Open Graph, Twitter Card, and canonical URL
- `robots.txt` and `sitemap.xml` at root
- JSON-LD `WebSite` structured data on index.html
- Semantic HTML: `<nav aria-label>`, `<header>`, `<h1>`, `aria-label` on interactive elements

## .claude/settings.local.json

项目级权限配置位于 [.claude/settings.local.json](.claude/settings.local.json)。
