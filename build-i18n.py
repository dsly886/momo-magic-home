"""
build-i18n.py — Generate static multi-language HTML files for production.
Usage: python build-i18n.py
Output: dist/ directory with all 66 HTML files + static assets.
"""

import json
import re
import os
import shutil

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
    links = []
    for lang in SUPPORTED_LANGS:
        if lang == 'en':
            href = f'/{page_name}.html'
        else:
            href = f'/{page_name}.{lang}.html'
        links.append(f'  <link rel="alternate" hreflang="{lang}" href="{href}">')
    return '\n'.join(links)


def translate_html(html, translations, namespace, lang):
    """Replace data-i18n text content with translations."""

    def _full_key(key):
        return key if '.' in key else f'{namespace}.{key}'

    def _lookup(key):
        return translations.get(_full_key(key), '') or ''

    def replace_text(match):
        open_tag = match.group(1)
        key = match.group(2)
        text_content = match.group(3)
        close_tag = match.group(4)

        if not text_content.strip():
            return match.group(0)

        translated = _lookup(key)
        if translated:
            return f'{open_tag}{translated}{close_tag}'
        return match.group(0)

    # Match elements with data-i18n, capture their text content between > and closing tag
    pattern = re.compile(r'(<[^>]*data-i18n="([^"]*)"[^>]*>)(.*?)(</[^>]+>)', re.DOTALL)
    result = pattern.sub(replace_text, html)

    # Replace placeholders
    placeholder_pattern = re.compile(r'data-i18n-placeholder="([^"]*)"')
    for match in placeholder_pattern.finditer(result):
        key = match.group(1)
        translated = _lookup(key)
        if translated:
            tag_start = result.rfind('<', 0, match.start())
            tag_end = result.find('>', match.end())
            if tag_start >= 0 and tag_end >= 0:
                tag = result[tag_start:tag_end + 1]
                new_tag = re.sub(r'placeholder="[^"]*"', f'placeholder="{translated}"', tag)
                result = result[:tag_start] + new_tag + result[tag_end + 1:]

    # Replace data-i18n-meta content on <meta> elements
    for match in re.finditer(r'<meta[^>]*data-i18n-meta="([^"]*)"[^>]*>', result):
        key = match.group(1)
        translated = _lookup(key)
        if translated:
            tag = match.group(0)
            new_tag = re.sub(r'content="[^"]*"', f'content="{translated}"', tag)
            result = result.replace(tag, new_tag)

    # Replace data-i18n-title on <title> — keep the suffix
    title_pattern = re.compile(r'<title[^>]*data-i18n-title="([^"]*)"[^>]*>.*?</title>')
    title_match = title_pattern.search(result)
    if title_match:
        key = title_match.group(1)
        translated = _lookup(key)
        if translated and translated != _full_key(key):
            # Extract suffix like " - Momo's AI Magic House" from current title
            current_text = re.search(r'>([^<]+)<', title_match.group(0))
            if current_text:
                suffix = ''
                title_text = current_text.group(1)
                parts = title_text.split(' - ', 1)
                if len(parts) > 1:
                    suffix = ' - ' + parts[1]
                new_title = f'<title data-i18n-title="{key}">{translated}{suffix}</title>'
                result = result.replace(title_match.group(0), new_title)

    # Update <html lang>
    result = re.sub(r'<html lang="[^"]*"', f'<html lang="{lang}"', result)

    # Update og:locale to match language
    locale_map = {
        'zh': 'zh_CN', 'en': 'en_US', 'fr': 'fr_FR', 'de': 'de_DE',
        'ru': 'ru_RU', 'es': 'es_ES', 'pt': 'pt_PT', 'ar': 'ar_SA',
        'ja': 'ja_JP', 'ko': 'ko_KR', 'th': 'th_TH',
    }
    if lang in locale_map:
        result = re.sub(r'<meta[^>]*property="og:locale"[^>]*content="[^"]*"[^>]*>',
                        f'<meta property="og:locale" content="{locale_map[lang]}">', result)

    # Update dir for RTL
    if lang in RTL_LANGS:
        if 'dir="' in result[:200]:
            result = re.sub(r'dir="[^"]*"', 'dir="rtl"', result[:200]) + result[200:]
        else:
            result = result.replace('<html ', '<html dir="rtl" ', 1)

    return result


def build():
    raw = load_translations()

    # Flatten: { lang: { "namespace.key": "value", ... } }
    flat = {}
    for lang in SUPPORTED_LANGS:
        flat[lang] = {}
        lang_data = raw.get(lang, {})
        for namespace, keys in lang_data.items():
            for key, value in keys.items():
                flat[lang][f'{namespace}.{key}'] = value

    if os.path.exists('dist'):
        shutil.rmtree('dist')

    for src_path, page_name in PAGES:
        with open(src_path, 'r', encoding='utf-8') as f:
            source_html = f.read()

        ns = page_name.split('/')[-1]
        if ns == 'index':
            ns = 'index'

        for lang in SUPPORTED_LANGS:
            translations = flat[lang]

            html = translate_html(source_html, translations, ns, lang)

            hreflangs = build_hreflangs(page_name, lang)
            html = html.replace('</head>', f'  <!-- hreflang tags -->\n{hreflangs}\n</head>', 1)

            if lang == 'en':
                out_path = f'dist/{page_name}.html'
            else:
                out_path = f'dist/{page_name}.{lang}.html'

            os.makedirs(os.path.dirname(out_path), exist_ok=True)
            with open(out_path, 'w', encoding='utf-8') as f:
                f.write(html)
            print(f'  OK {out_path}')

    for dir_name in STATIC_DIRS:
        if os.path.exists(dir_name):
            dst = f'dist/{dir_name}'
            if os.path.exists(dst):
                shutil.rmtree(dst)
            shutil.copytree(dir_name, dst)
            print(f'  OK dist/{dir_name}/')

    for file_name in STATIC_FILES:
        if os.path.exists(file_name):
            shutil.copy2(file_name, f'dist/{file_name}')
            print(f'  OK dist/{file_name}')

    total = len(PAGES) * len(SUPPORTED_LANGS)
    print(f'\nBuild complete. {total} pages generated in dist/')


if __name__ == '__main__':
    build()
