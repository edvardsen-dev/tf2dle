import argparse
from datetime import date

import requests
from bs4 import BeautifulSoup

from common import add_scraper_args, ensure_dir, format_date, hash_id, load_existing_records, log, log_scraper_start, output_dir, parse_date, reached_limit, release_date_sort_key, save_progress_json, should_skip_date, validate_limit, write_merged_json


class Unusual:
  def __init__(self, name, image, series, item_type, release_date):
    self.name = name
    self.image = image
    self.series = series
    self.type = item_type
    self.release_date = release_date

  def to_dict(self):
    return {
      "name": self.name,
      "image": self.image,
      "series": self.series,
      "type": self.type,
      "releaseDate": format_date(self.release_date)
    }


SERIES_RELEASE_DATES = {
  "Series 1 Unusual effects": "2010-09-30",
  "Series 2 Unusual effects": "2011-02-03",
  "Series 3 Unusual effects": "2011-08-18",
  "Summer 2020 Pack Unusual effects": "2020-06-19",
  "Summer 2021 Pack Unusual effects": "2021-06-22",
  "Summer 2022 Pack Unusual effects": "2022-06-21",
  "Summer 2023 Update Unusual effects": "2023-07-12",
  "Summer 2024 Update Unusual effects": "2024-07-18",
  "Summer 2025 Update Unusual effects": "2025-07-24",
  "Summer 2026 Update Unusual effects": "2026-07-07",
  "Very Scary Halloween Special Unusual effects": "2011-10-27",
  "Spectral Halloween Special Unusual effects": "2012-10-26",
  "Scream Fortress V Unusual effects": "2013-10-29",
  "Scream Fortress VI Unusual effects": "2014-10-29",
  "Scream Fortress VII Unusual effects": "2015-10-28",
  "Scream Fortress VIII Unusual effects": "2016-10-21",
  "Scream Fortress X Unusual effects": "2018-10-19",
  "Scream Fortress XI Unusual effects": "2019-10-10",
  "Scream Fortress XII Unusual effects": "2020-10-01",
  "Scream Fortress XIII Unusual effects": "2021-10-05",
  "Scream Fortress XIV Unusual effects": "2022-10-05",
  "Scream Fortress XV Unusual effects": "2023-10-09",
  "Scream Fortress XVI Unusual effects": "2024-10-10",
  "Scream Fortress XVII Unusual effects": "2025-10-09",
  "Smissmas 2019 Unusual effects": "2019-12-16",
  "Smissmas 2020 Unusual effects": "2020-12-03",
  "Smissmas 2021 Unusual effects": "2021-12-02",
  "Smissmas 2022 Unusual effects": "2022-12-05",
  "Smissmas 2023 Unusual effects": "2023-12-07",
  "Smissmas 2024 Unusual effects": "2024-12-11",
  "Smissmas 2025 Unusual effects": "2025-12-09",
  "Community Sparkle Unusual effects": "2011-08-18",
  "Robotic Boogaloo Unusual effects": "2013-05-17",
  "Love & War Update Unusual effects": "2014-06-18",
  "End of the Line Update Unusual effects": "2014-12-08",
  "Gun Mettle Update Unusual effects": "2015-07-02",
  "Invasion Community Update Unusual effects": "2015-10-06"
}

REMOVED_UNUSUALS = {"Unusual Energy Orb.png"}


def unusual_table_sort_key(table):
  series = table.find("th", class_="header").get_text(strip=True)
  release_date = parse_date(SERIES_RELEASE_DATES[series]) if series in SERIES_RELEASE_DATES else date.max
  return (release_date, series.lower())

parser = argparse.ArgumentParser(description="Scrape TF2 unusual effects")
add_scraper_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log_scraper_start("unusuals scraper", args)

BASE_URL = "https://wiki.teamfortress.com"
URL = f"{BASE_URL}/wiki/Unusual"
scraper_output_dir = output_dir("unusuals", dry_run=args.dry_run)
image_dir = scraper_output_dir / "images"

if args.img_download and not args.dry_run:
  ensure_dir(image_dir)
  log(f"Writing unusual images to {image_dir.resolve()}")

log(f"Fetching unusual effects page: {URL}")
page = requests.get(URL)
soup = BeautifulSoup(page.content, "html.parser")
tables = soup.find_all("table", class_="wikitable")[:-3]
tables = sorted(tables, key=unusual_table_sort_key)
log(f"Found {len(tables)} unusual effect tables")

unusuals = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
existing_records, existing_names = load_existing_records("unusuals")
pending_unusual_count = 0
for table in tables:
  for image in table.find_all("img"):
    image_alt = image["alt"]
    if image_alt in REMOVED_UNUSUALS:
      continue

    name = image_alt.replace("Unusual ", "").replace(".png", "")
    if name in existing_names:
      skipped_existing += 1
      continue

    pending_unusual_count += 1

log(f"Pending unusuals to inspect: {pending_unusual_count}")

for table in tables:
  if reached_limit(unusuals, args.limit):
    break

  series = table.find("th", class_="header").get_text(strip=True)
  release_date = parse_date(SERIES_RELEASE_DATES[series]) if series in SERIES_RELEASE_DATES else None
  log(f"Processing unusual series: {series} ({format_date(release_date)})")

  if should_skip_date(release_date, args.start_date):
    skipped_count = len(table.find_all("img"))
    if release_date:
      skipped_older += skipped_count
    else:
      skipped_unknown += skipped_count
    log(f"Skipping series {series}: release date before filter or unknown")
    continue

  rows = table.find_all("tr")
  item_type = None
  index = 1

  while index < len(rows):
    first_cell = rows[index].find("td")
    if first_cell and first_cell.has_attr("rowspan"):
      item_type = first_cell.get_text(strip=True)

    images = rows[index].find_all("img")
    has_variant = index + 2 < len(rows) and rows[index + 2].find("img") is None

    for image in images:
      image_alt = image["alt"]
      if image_alt in REMOVED_UNUSUALS:
        continue

      name = image_alt.replace("Unusual ", "").replace(".png", "")
      if name in existing_names:
        continue

      image_id = hash_id(name)
      log(f"Including unusual {len(unusuals) + 1}: {name} ({series})")

      if args.img_download and not args.dry_run:
        log(f"Downloading unusual image for {name}")
        (image_dir / f"{image_id}.png").write_bytes(requests.get(BASE_URL + image["src"]).content)

      unusuals[name] = Unusual(name, image_id, series, item_type, release_date)
      records = [unusual.to_dict() for unusual in sorted(unusuals.values(), key=release_date_sort_key)]
      save_progress_json("unusuals", existing_records, records, dry_run=args.dry_run)

      if reached_limit(unusuals, args.limit):
        log(f"Reached limit of {args.limit} unusuals")
        break

    if reached_limit(unusuals, args.limit):
      break

    index += 3 if has_variant else 2

records = [unusual.to_dict() for unusual in sorted(unusuals.values(), key=release_date_sort_key)]
write_merged_json("unusuals", existing_records, records, dry_run=args.dry_run)
log(f"Skipped {skipped_existing} records already present in output")

if args.start_date:
  log(f"Filter: releaseDate >= {args.start_date}")
  log(f"Skipped {skipped_older} older records and {skipped_unknown} records with unknown release dates")

log("Finished unusuals scraper")
