import argparse
from datetime import date

import requests
from bs4 import BeautifulSoup

from common import add_scraper_args, ensure_dir, format_date, hash_id, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, release_date_sort_key, save_progress_json, should_skip_date, validate_limit, write_merged_json


class Map:
  def __init__(self, name, thumbnail, image, game_mode, release_date):
    self.name = name
    self.thumbnail = thumbnail
    self.image = image
    self.game_modes = [game_mode]
    self.release_date = release_date

  def add_game_mode(self, game_mode):
    self.game_modes.append(game_mode)

  def to_dict(self):
    return {
      "name": self.name,
      "thumbnail": self.thumbnail,
      "image": self.image,
      "gameModes": self.game_modes,
      "releaseDate": format_date(self.release_date)
    }


def convert_to_full_image_url(thumbnail_url):
  parts = thumbnail_url.split("/")
  full_image_parts = [part for i, part in enumerate(parts) if part != "thumb" and i != len(parts) - 1]
  return "/".join(full_image_parts)


def map_row_sort_key(row):
  cells = row.find_all("td")
  if len(cells) != 6:
    return (date.max, "", "")

  release_node = cells[4].find("span")
  release_date = parse_wiki_date(release_node.text if release_node else None) or date.max
  map_name = cells[1].find("a").text.strip().lower()
  game_mode = cells[2].text.replace("\n", "").strip().lower()
  return (release_date, map_name, game_mode)


parser = argparse.ArgumentParser(description="Scrape official TF2 maps")
add_scraper_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log_scraper_start("maps scraper", args)

BASE_URL = "https://wiki.teamfortress.com"
URL = f"{BASE_URL}/wiki/List_of_maps"
scraper_output_dir = output_dir("maps", dry_run=args.dry_run)
image_dir = scraper_output_dir / "images"
thumbnail_dir = scraper_output_dir / "thumbnails"

if args.img_download and not args.dry_run:
  ensure_dir(image_dir)
  ensure_dir(thumbnail_dir)
  log(f"Writing map images to {image_dir.resolve()}")
  log(f"Writing map thumbnails to {thumbnail_dir.resolve()}")

log(f"Fetching map list: {URL}")
page = requests.get(URL)
soup = BeautifulSoup(page.content, "html.parser")
rows = soup.find("table", {"class": "grid"}).find("tbody").find_all("tr")
rows = sorted(rows, key=map_row_sort_key)
log(f"Found {len(rows)} map table rows")

maps = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
existing_records, existing_names = load_existing_records("maps")
seen_map_names = set()
pending_map_names = set()
for row in rows:
  cells = row.find_all("td")
  if len(cells) != 6:
    continue

  map_name = cells[1].find("a").text.strip()
  if map_name in seen_map_names:
    continue

  seen_map_names.add(map_name)
  if map_name not in existing_names:
    pending_map_names.add(map_name)

skipped_existing = len(seen_map_names) - len(pending_map_names)
log(f"Pending maps to inspect: {len(pending_map_names)}")

for row in rows:
  cells = row.find_all("td")
  if len(cells) != 6:
    continue

  map_name = cells[1].find("a").text.strip()
  game_mode = cells[2].text.replace("\n", "").strip()

  if map_name in maps:
    maps[map_name].add_game_mode(game_mode)
    records = [map_item.to_dict() for map_item in sorted(maps.values(), key=release_date_sort_key)]
    save_progress_json("maps", existing_records, records, dry_run=args.dry_run)
    log(f"Updated map game modes: {map_name}")
    continue

  if map_name in existing_names:
    continue

  release_node = cells[4].find("span")
  release_date = parse_wiki_date(release_node.text if release_node else None)

  if should_skip_date(release_date, args.start_date):
    if release_date:
      skipped_older += 1
    else:
      skipped_unknown += 1
    continue

  thumbnail_url = BASE_URL + cells[0].find("img")["src"]
  image_url = convert_to_full_image_url(thumbnail_url)
  image_id = hash_id(map_name)
  log(f"Including map {len(maps) + 1}: {map_name} ({format_date(release_date)})")

  if args.img_download and not args.dry_run:
    log(f"Downloading map images for {map_name}")
    (thumbnail_dir / f"{image_id}.png").write_bytes(requests.get(thumbnail_url).content)
    (image_dir / f"{image_id}.png").write_bytes(requests.get(image_url).content)

  maps[map_name] = Map(map_name, image_id, image_id, game_mode, release_date)
  records = [map_item.to_dict() for map_item in sorted(maps.values(), key=release_date_sort_key)]
  save_progress_json("maps", existing_records, records, dry_run=args.dry_run)

  if reached_limit(maps, args.limit):
    log(f"Reached limit of {args.limit} maps")
    break

records = [map_item.to_dict() for map_item in sorted(maps.values(), key=release_date_sort_key)]
write_merged_json("maps", existing_records, records, dry_run=args.dry_run)
log(f"Skipped {skipped_existing} records already present in output")

if args.start_date:
  log(f"Filter: releaseDate >= {args.start_date}")
  log(f"Skipped {skipped_older} older records and {skipped_unknown} records with unknown release dates")

log("Finished maps scraper")
