# app/scraper.py
import requests
from bs4 import BeautifulSoup

EBAY_SEARCH_URL = (
    "https://www.ebay.com/sch/i.html?_nkw={query}&_sop=15"  # Sorted by lowest price
)


def get_game_price(title: str, platform: str):
    """Scrape the lowest price of a game from eBay."""
    search_url = EBAY_SEARCH_URL.format(
        query="+".join(f"{title} {platform}".replace(" ", "+"))
    )
    headers = {"User-Agent": "Mozilla/5.0"}

    response = requests.get(search_url, headers=headers)
    if response.status_code != 200:
        print(f"Error: Received status code {response.status_code}")
        return None

    soup = BeautifulSoup(response.text, "html.parser")

    # Find all listings and extract prices
    prices = []
    for item in soup.select(".s-item"):
        price_tag = item.select_one(".s-item__price")
        if price_tag:
            price_text = price_tag.text.replace("$", "").replace(",", "").strip()
            try:
                prices.append(float(price_text.split()[0]))  # Get only the numeric part
            except ValueError:
                continue

    return min(prices) if prices else None
