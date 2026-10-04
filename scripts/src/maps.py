import argparse

from bs4 import BeautifulSoup

from common import add_scraper_args, check_discovery, download_image, ensure_dir, format_date, hash_id, index_unique, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, release_date_sort_key, request_wiki, save_progress_json, should_skip_date, validate_limit, wiki_url, write_merged_json


class Map:
  def __init__(self, name, thumbnail, image, game_mode, release_date):
    self.name = name
    self.thumbnail = thumbnail
    self.image = image
    self.game_modes = [game_mode]
    self.release_date = release_date

  def add_game_mode(self, game_mode):
    if game_mode not in self.game_modes:
      self.game_modes.append(game_mode)
      self.game_modes.sort(key=str.lower)

  def to_dict(self):
    return {
      "name": self.name,
      "thumbnail": self.thumbnail,
      "image": self.image,
      "gameModes": self.game_modes,
      "releaseDate": format_date(self.release_date)
    }


def convert_to_full_image_url(thumbnail_url):
  if "/thumb/" not in thumbnail_url:
    return thumbnail_url
  parts = thumbnail_url.split("/")
  full_image_parts = [part for i, part in enumerate(parts) if part != "thumb" and i != len(parts) - 1]
  return "/".join(full_image_parts)


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
page = request_wiki(URL)
soup = BeautifulSoup(page.content, "html.parser")
table = soup.find("table", {"class": "grid"})
if table is None:
  raise ValueError("Missing map grid table")
rows = table.find_all("tr")
log(f"Found {len(rows)} map table rows")

maps = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
existing_records, existing_names = load_existing_records("maps")
map_index = {}
map_sources = {}
for row in rows:
  cells = row.find_all("td")
  if not cells:
    continue
  if len(cells) != 6 or cells[1].find("a") is None or cells[0].find("img") is None:
    raise ValueError("Malformed map grid row")
  map_name = cells[1].find("a").text.strip()
  game_mode = cells[2].text.replace("\n", "").strip()
  if not game_mode:
    raise ValueError(f"Missing game mode for {map_name}")
  release_node = cells[4].find("span")
  release_date = parse_wiki_date(release_node.text if release_node else None)
  thumbnail_url = wiki_url(cells[0].find("img").get("src"))
  image_url = convert_to_full_image_url(thumbnail_url)
  index_unique(map_sources, map_name, (image_url, release_date))
  if map_name in map_index:
    map_index[map_name].add_game_mode(game_mode)
  else:
    image_id = hash_id(map_name)
    map_index[map_name] = Map(map_name, image_id, image_id, game_mode, release_date)
    map_index[map_name].thumbnail_url = thumbnail_url
    map_index[map_name].image_url = image_url

check_discovery(map_index, existing_names, "maps")
pending_maps = [item for item in sorted(map_index.values(), key=release_date_sort_key) if item.name not in existing_names]
skipped_existing = len(map_index) - len(pending_maps)
log(f"Pending maps to inspect: {len(pending_maps)}")

for map_item in pending_maps:
  release_date = map_item.release_date

  if should_skip_date(release_date, args.start_date):
    if release_date:
      skipped_older += 1
    else:
      skipped_unknown += 1
    continue

  log(f"Including map {len(maps) + 1}: {map_item.name} ({format_date(release_date)})")

  if args.img_download and not args.dry_run:
    log(f"Downloading map images for {map_item.name}")
    download_image(map_item.thumbnail_url, thumbnail_dir / f"{map_item.thumbnail}.png")
    download_image(map_item.image_url, image_dir / f"{map_item.image}.png")

  maps[map_item.name] = map_item
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
