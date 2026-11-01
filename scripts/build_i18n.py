#!/usr/bin/env python3
"""Build per-language copies of the site for search engines.

Run by the Pages workflow before upload. For every page it:
  * writes /de/, /fr/ and /it/ copies (the page text is translated by assets/i18n.js in the browser),
  * sets <html lang>, a translated <title>, a canonical URL and hreflang links to every language version,
and writes sitemap.xml listing all versions.

Usage: python3 scripts/build_i18n.py [site_dir]   (default: current directory; files are modified in place)
"""
import json
import re
import sys
from pathlib import Path

SITE = "https://keirxn.com"
LANGS = ["en", "de", "fr", "it"]
SKIP = {"404.html"}

root = Path(sys.argv[1] if len(sys.argv) > 1 else ".").resolve()

# Read the [English, Deutsch, Français, Italiano] rows from i18n.js to translate page titles.
DICT = {}
norm = lambda s: re.sub(r"\s+", " ", s).strip()
for line in (root / "assets/i18n.js").read_text(encoding="utf-8").splitlines():
    m = re.match(r'\s*(\[".*"\]),?\s*$', line)
    if not m:
        continue
    try:
        row = json.loads(m.group(1))
    except json.JSONDecodeError:
        continue
    if len(row) == 4:
        DICT[norm(row[0])] = dict(zip(LANGS, row))


def tr(text, lang):
    return DICT.get(norm(text), {}).get(lang, text)


def url(lang, page):
    path = "" if page == "index.html" else page
    return f"{SITE}/{path}" if lang == "en" else f"{SITE}/{lang}/{path}"


def head_links(lang, page):
    tags = [f'<link rel="canonical" href="{url(lang, page)}">']
    tags += [f'<link rel="alternate" hreflang="{l}" href="{url(l, page)}">' for l in LANGS]
    tags.append(f'<link rel="alternate" hreflang="x-default" href="{url("en", page)}">')
    return "\n  ".join(tags)


pages = sorted(p.name for p in root.glob("*.html") if p.name not in SKIP)

for page in pages:
    src = (root / page).read_text(encoding="utf-8")
    for lang in LANGS:
        html = src.replace("</head>", f"  {head_links(lang, page)}\n</head>", 1)
        if lang != "en":
            html = re.sub(r'<html lang="[^"]*"', f'<html lang="{lang}"', html, count=1)
            html = re.sub(r'((?:src|href|action)=")assets/', r"\1../assets/", html)
            html = re.sub(
                r"<title>(.*?)</title>",
                lambda m: "<title>" + " · ".join(tr(p, lang) for p in m.group(1).split(" · ")) + "</title>",
                html, count=1, flags=re.S,
            )
            out = root / lang / page
            out.parent.mkdir(exist_ok=True)
        else:
            out = root / page
        out.write_text(html, encoding="utf-8")

entries = []
for page in pages:
    alts = "".join(
        f'\n    <xhtml:link rel="alternate" hreflang="{l}" href="{url(l, page)}"/>' for l in LANGS
    )
    for lang in LANGS:
        entries.append(f"  <url>\n    <loc>{url(lang, page)}</loc>{alts}\n  </url>")
(root / "sitemap.xml").write_text(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
    + "\n".join(entries) + "\n</urlset>\n",
    encoding="utf-8",
)
print(f"Built {len(pages)} pages x {len(LANGS)} languages, {len(entries)} sitemap entries")
