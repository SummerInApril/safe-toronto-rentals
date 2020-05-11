import feedparser
import urllib.parse


def lookup():
    """Look up articles for location"""

    # Check cache
    try:
        if geo in lookup.cache:
            return lookup.cache[geo]
    except AttributeError:
        lookup.cache = {}
    geo=1

    # Replace special characters
    escaped = urllib.parse.quote(geo, safe="")

    # Get feed from Google
    feed = feedparser.parse(f"https://www.kijiji.ca/rss-srp-condo-for-sale/city-of-toronto/page-{escaped}/c643l1700273")

    lookup.cache[geo] = [{"link": item["link"], "title": item["title"]} for item in feed["item"]]

    # Return results
    return lookup.cache[geo]
