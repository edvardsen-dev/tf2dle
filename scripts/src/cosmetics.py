import argparse
import time

import requests
from bs4 import BeautifulSoup

from common import add_scraper_args, ensure_dir, find_table_value, format_date, hash_id, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, release_date_sort_key, save_progress_json, should_skip_date, validate_limit, write_merged_json


class Cosmetic:
  def __init__(self, name, image, used_by, release_date):
    self.name = name
    self.image = image
    self.used_by = used_by
    self.release_date = release_date

  def to_dict(self):
    return {
      "name": self.name,
      "image": self.image,
      "usedBy": self.used_by,
      "releaseDate": format_date(self.release_date)
    }


def used_by_from_page_path(path):
  parts = path.split("/")[-1].split("_")
  if len(parts) == 5:
    return f"{parts[2]} {parts[3]}"

  return parts[2]


parser = argparse.ArgumentParser(description="Scrape TF2 cosmetic items")
add_scraper_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log_scraper_start("cosmetics scraper", args)

BASE_URL = "https://wiki.teamfortress.com"
URL = f"{BASE_URL}/wiki/Cosmetic_items"
scraper_output_dir = output_dir("cosmetics", dry_run=args.dry_run)
image_dir = scraper_output_dir / "images"

if args.img_download and not args.dry_run:
  ensure_dir(image_dir)
  log(f"Writing cosmetic images to {image_dir.resolve()}")

log(f"Fetching cosmetic index: {URL}")
page = requests.get(URL)
soup = BeautifulSoup(page.content, "html.parser")
class_pages = [item.find("a")["href"] for item in soup.find("h2", string="List of cosmetic items").find_next("ul").find_all("li")]
log(f"Found {len(class_pages[:-1])} cosmetic class pages")

cosmetics = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
scanned = 0
existing_records, existing_names = load_existing_records("cosmetics")

for class_page in class_pages[:-1]:
  if reached_limit(cosmetics, args.limit):
    break

  time.sleep(2)
  log(f"Fetching cosmetic class page: {BASE_URL + class_page}")

  cosmetic_page = requests.get(BASE_URL + class_page)
  cosmetic_soup = BeautifulSoup(cosmetic_page.content, "html.parser")
  used_by = used_by_from_page_path(class_page)
  page_candidates = []

  for row in cosmetic_soup.find_all("tr", attrs={"style": "vertical-align:top;"}):
    for link in row.find_all("a"):
      image = link.find("img")
      name = link.get("title")
      href = link.get("href")
      if not image or not name or not href or name.startswith("List of ") or name in cosmetics:
        continue

      if name in existing_names:
        skipped_existing += 1
        continue

      page_candidates.append((name, href, image))

  log(f"Pending cosmetics on this page: {len(page_candidates)}")

  for name, href, image in page_candidates:
    if reached_limit(cosmetics, args.limit):
      break

    scanned += 1
    time.sleep(1)
    log(f"Scraping cosmetic candidate {scanned}: {name}")
    item_page = requests.get(BASE_URL + href)
    item_soup = BeautifulSoup(item_page.content, "html.parser")
    release_text = find_table_value(item_soup, "Released:")
    release_date = parse_wiki_date(release_text)

    if should_skip_date(release_date, args.start_date):
      if release_date:
        skipped_older += 1
      else:
        skipped_unknown += 1
      continue

    image_id = hash_id(name)
    image_url = BASE_URL + image["src"]
    log(f"Including cosmetic {len(cosmetics) + 1}: {name} ({format_date(release_date)})")

    if args.img_download and not args.dry_run:
      log(f"Downloading cosmetic image for {name}")
      (image_dir / f"{image_id}.png").write_bytes(requests.get(image_url).content)

    cosmetics[name] = Cosmetic(name, image_id, used_by, release_date)
    records = [cosmetic.to_dict() for cosmetic in sorted(cosmetics.values(), key=release_date_sort_key)]
    save_progress_json("cosmetics", existing_records, records, dry_run=args.dry_run)

    if reached_limit(cosmetics, args.limit):
      log(f"Reached limit of {args.limit} cosmetics")
      break

records = [cosmetic.to_dict() for cosmetic in sorted(cosmetics.values(), key=release_date_sort_key)]
write_merged_json("cosmetics", existing_records, records, dry_run=args.dry_run)
log(f"Skipped {skipped_existing} records already present in output")

if args.start_date:
  log(f"Filter: releaseDate >= {args.start_date}")
  log(f"Skipped {skipped_older} older records and {skipped_unknown} records with unknown release dates")

log("Finished cosmetics scraper")
