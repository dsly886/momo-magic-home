# momo的AI魔法屋 — 多语言国际化设计方案

## 概述

为 momo-magic-home 项目增加多语言支持，覆盖 11 种语言，通过 IP 地理定位自动识别用户语言，
支持手动切换，未识别或超出范围时默认英文。

## 架构策略

采用 **模板 + 构建脚本** 方案（方案 C）：

| 阶段 | 机制 | 用途 |
|------|------|------|
| 开发 | 源 HTML（根目录 + `tools/`），`data-i18n` 属性，运行时 JS 替换 | 快速预览，无需构建 |
| 构建 | `python build-i18n.py` 读取源 HTML + 翻译数据，输出 11 语言静态文件 | 生产部署，SEO 最优 |
| 部署 | `dist/` 目录直接部署，每种语言独立 URL + hreflang | Google 直接索引目标语言 |

### 目录结构

源文件保留原位，构建输出独立。

```
momo-magic-home/
├── index.html                  # 源 HTML（英文 base + data-i18n）
├── tools/
│   └── {story,fortune,spell,wish,dream}.html
├── i18n/
│   └── translations.json       # 11 种语言翻译数据
├── js/
│   ├── env.js                  # 不变
│   ├── i18n.js                 # 新增：语言检测 + 文本替换引擎
│   ├── magic-utils.js          # 修改：集成 i18n.init()
│   └── magic-api.js            # 修改：prompts 追加语言指令
├── css/magic.css               # 不变（+ 语言切换器样式）
├── build-i18n.py               # 新增：构建脚本
└── dist/                       # 构建输出（完整站点副本）
```

## 支持的语言

| 代码 | 语言 | 国家映射 | 文字方向 |
|------|------|---------|---------|
| `zh` | 中文 | CN, TW, HK | LTR |
| `en` | English | US, GB, AU, CA... | LTR |
| `fr` | Français | FR, BE, CA, CH... | LTR |
| `de` | Deutsch | DE, AT, CH... | LTR |
| `ru` | Русский | RU | LTR |
| `es` | Español | ES, MX, AR... | LTR |
| `pt` | Português | PT, BR | LTR |
| `ar` | العربية | SA, AE, EG... | **RTL** |
| `ja` | 日本語 | JP | LTR |
| `ko` | 한국어 | KR | LTR |
| `th` | ภาษาไทย | TH | LTR |

## 翻译数据结构

单一 JSON 文件 `i18n/translations.json`，按语言 → 页面命名空间组织。
每页约 15-20 个翻译键，共约 120 个键 × 11 语言 = ~1320 条翻译。

```json
{
  "zh": {
    "common": { /* 跨页面共享文本 */ },
    "index": { /* 首页 */ },
    "story": { /* 故事工坊 */ },
    "fortune": { /* 占卜屋 */ },
    "spell": { /* 咒语炉 */ },
    "wish": { /* 许愿池 */ },
    "dream": { /* 解梦 */ }
  }
}
```

**降级策略**：`currentLang` → `en` → 原始 `data-i18n` 属性的 key。

## IP 语言检测（i18n.js）

```
优先级: localStorage > ip-api.com IP检测 > navigator.language > 'en'
```

1. 检查 `localStorage.getItem('momo_lang')` — 用户手动选择过则直接使用
2. 调用 `ip-api.com/json/?fields=countryCode`（JSONP，无需 API Key）
   → countryCode 映射到语言代码（DE→de, JP→ja, CN→zh...）
3. 若不在 11 种语言内或检测失败 → `navigator.language` 前两位匹配
4. 仍不匹配 → 默认 `'en'`

## 源 HTML 改造约定

源 HTML 文件保留在原位（根目录 `index.html` + `tools/` 下的 5 个页面），不改路径结构。

- 所有源 HTML 改为英文书写（SEO 默认语言）
- 可翻译元素添加 `data-i18n="namespace.key"`
- placeholder 属性用 `data-i18n-placeholder="namespace.key"`
- 图片 alt 用 `data-i18n-alt="namespace.key"`
- 构建时被翻译替换。在浏览器直接打开时，JS 运行时做同样的替换

### 示例

```html
<h1 data-i18n="story.header_title">AI Story Workshop</h1>
<input data-i18n-placeholder="story.theme_placeholder" placeholder="e.g., Moonlight Forest...">
```

## i18n.js API

```js
const i18n = {
  currentLang: 'en',        // 当前语言代码
  dir: 'ltr',               // rtl for Arabic
  translations: null,        // 从 translations.json 加载

  async init(),              // 加载翻译 → 检测语言 → apply()
  t(key),                    // 获取翻译文本（含降级）
  apply(),                   // 遍历 [data-i18n] 替换 textContent
  setLang(code),             // 切换语言 → 存 localStorage → apply()
  detectLang(),              // IP 检测逻辑
  injectSwitcher(),          // 在导航栏注入 🌐 下拉菜单
  getLangInstruction(),      // 返回 AI 语言指令
}
```

## 语言切换器

- 导航栏右侧：`🌐` 图标按钮 → 展开下拉列表，显示 11 种语言名称
- 点击后调用 `i18n.setLang(code)`，立即切换界面语言
- 选择写入 `localStorage`，后续访问自动使用该语言（跳过 IP 检测）

## AI 输出语言控制

`magic-api.js` 中所有 prompt 末尾追加 `i18n.getLangInstruction()`，确保 AI 回复匹配用户界面语言。

```js
// 示例
generateStory(theme, characters, style) {
  const prompt = `...\n\n${i18n.getLangInstruction()}`;
  ...
}
```

## Build 脚本（build-i18n.py）

构建时从源 HTML 原位读取，输出到 `dist/`。构建产物保留 `data-i18n` 属性和所有 JS 文件，确保用户在静态页面上仍可手动切换语言。

```python
# 伪流程
for lang in translations:
    for page in PAGES:
        1. 读取根目录 {page}.html（或 tools/{page}.html）
        2. 用 translations[lang][namespace] 替换 data-i18n 元素文本
        3. 设置 <html lang="{code}"> 和 dir="rtl"（ar）
        4. 注入 hreflang tags（11 个链接）
        5. 保留 data-i18n 属性（运行时切换仍需）
        6. 写入 dist/{page}.{lang}.html（英文不追加后缀）
    复制完整静态资源: dist/css/, dist/js/, dist/i18n/, dist/robots.txt
```

### hreflang 注入示例

```html
<link rel="alternate" hreflang="zh" href="story.zh.html">
<link rel="alternate" hreflang="en" href="story.html">
<link rel="alternate" hreflang="fr" href="story.fr.html">
<!-- ... 共 11 个 -->
```

### 命名规则

| 情况 | 文件名 |
|------|--------|
| 英文（默认） | `index.html`, `tools/story.html` |
| 其他语言 | `index.zh.html`, `tools/story.ja.html` |
| 阿拉伯语 | `index.ar.html`, `tools/dream.ar.html` |

## 不涉及的范围

- 不修改 CSS 体系（仅增加语言切换器样式）
- 不修改 env.js
- 不引入外部 npm 包或构建工具（仅 Python 标准库）
- 不支持用户自定义翻译

## 翻译文件生成

所有翻译条目暂由开发者填写初始版本。后续可考虑接入翻译管理平台。
预计首次填充约 1320 条翻译。

## 工作量估计

| 模块 | 文件 | 工作量 |
|------|-----|--------|
| 翻译数据 | `i18n/translations.json` | ~1320 条翻译键值对 |
| i18n 引擎 | `js/i18n.js` | 语言检测 + 文本替换 + 切换器 |
| 模板改造 | `templates/*.html` (6 页) | 每页加 data-i18n 属性 + 保留英文文本 |
| API 改造 | `js/magic-api.js` | 追加语言指令 |
| 初始化集成 | `js/magic-utils.js` | 集成 i18n.init() |
| 构建脚本 | `build-i18n.py` | 模板 → 静态文件生成 |
| CSS | `css/magic.css` | 语言切换器 + RTL 样式 |
