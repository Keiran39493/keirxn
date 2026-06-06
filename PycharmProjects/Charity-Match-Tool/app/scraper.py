"""
Scraper to enrich ngos.json with live data from gemeinnuetzig.li.
Run standalone: python -m app.scraper
Updates founded_year, website, board_president, and address for all NGOs.
"""

import asyncio
import json
import re
from pathlib import Path

import httpx
from bs4 import BeautifulSoup

BASE_URL = "https://www.gemeinnuetzig.li/en/directory/"
DATA_PATH = Path(__file__).parent / "data" / "ngos.json"


async def fetch_profile(client: httpx.AsyncClient, slug: str) -> dict:
    url = f"{BASE_URL}{slug}/"
    try:
        resp = await client.get(url, timeout=15.0, follow_redirects=True)
        resp.raise_for_status()
    except Exception as exc:
        print(f"  SKIP {slug}: {exc}")
        return {}

    soup = BeautifulSoup(resp.text, "html.parser")
    data: dict = {}

    text = soup.get_text(separator="\n")

    # Founded year
    year_match = re.search(r"(?:founded|gegründet|gründungsjahr)[:\s]+(\d{4})", text, re.IGNORECASE)
    if year_match:
        data["founded_year"] = int(year_match.group(1))

    # Website
    for a in soup.find_all("a", href=True):
        href: str = a["href"]
        if href.startswith("http") and "gemeinnuetzig.li" not in href:
            data.setdefault("website", href)
            break

    # Board president / Präsident
    pres_match = re.search(
        r"(?:board president|präsident(?:in)?|obmann|chairman)[:\s]+([^\n,]+)",
        text,
        re.IGNORECASE,
    )
    if pres_match:
        data["board_president"] = pres_match.group(1).strip()

    # Address — look for PLZ pattern
    addr_match = re.search(r"([^\n]+\d{4}\s+\w+[^\n]*)", text)
    if addr_match:
        data["address"] = addr_match.group(1).strip()

    return data


async def enrich():
    with open(DATA_PATH, encoding="utf-8") as f:
        payload = json.load(f)

    ngos = payload["ngos"]
    print(f"Enriching {len(ngos)} NGO profiles…")

    async with httpx.AsyncClient(headers={"User-Agent": "charity-match-tool/1.0"}) as client:
        tasks = [(ngo["slug"], fetch_profile(client, ngo["slug"])) for ngo in ngos]
        for ngo in ngos:
            print(f"  Fetching {ngo['slug']}…")
            extra = await fetch_profile(client, ngo["slug"])
            for key, val in extra.items():
                if ngo.get(key) is None:
                    ngo[key] = val

    with open(DATA_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    print("Done. ngos.json updated.")


if __name__ == "__main__":
    asyncio.run(enrich())
