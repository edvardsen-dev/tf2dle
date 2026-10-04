import argparse

from bs4 import BeautifulSoup

from common import add_scraper_args, check_discovery, download_image, ensure_dir, find_table_value, format_date, hash_id, index_unique, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, release_date_sort_key, request_wiki, save_progress_json, should_skip_date, validate_limit, wiki_url, write_merged_json


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
page = request_wiki(URL)
soup = BeautifulSoup(page.content, "html.parser")
heading = soup.find(lambda tag: tag.name == "h2" and tag.get_text(strip=True) == "List of cosmetic items")
class_list = heading.find_next_sibling("ul") if heading else None
if class_list is None:
  raise ValueError("Missing cosmetic class list")
class_pages = []
for item in class_list.find_all("li"):
  link = item.find("a")
  href = wiki_url(link.get("href") if link else None)
  if href.rsplit("/", 1)[-1] == "List_of_retired_items":
    continue
  if not href.rsplit("/", 1)[-1].startswith("List_of_") or not href.endswith("_cosmetics"):
    raise ValueError(f"Unexpected cosmetic class page: {href}")
  if href not in class_pages:
    class_pages.append(href)
if not class_pages:
  raise ValueError("No cosmetic class pages discovered")
log(f"Found {len(class_pages)} cosmetic class pages")

cosmetics = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
scanned = 0
existing_records, existing_names = load_existing_records("cosmetics")

cosmetic_index = {}
cosmetic_classes = {}
for class_page in class_pages:
  log(f"Fetching cosmetic class page: {class_page}")

  cosmetic_page = request_wiki(class_page)
  cosmetic_soup = BeautifulSoup(cosmetic_page.content, "html.parser")
  used_by = used_by_from_page_path(class_page)
  page_names = set()

  for row in cosmetic_soup.find_all("tr", attrs={"style": "vertical-align:top;"}):
    for link in row.find_all("a"):
      image = link.find("img")
      name = link.get("title")
      href = link.get("href")
      if not image or (name and name.startswith("List of ")):
        continue
      index_unique(cosmetic_index, name, (wiki_url(href), wiki_url(image.get("src"))))
      # Multi-class items appear on several lists; retain the first class as before.
      cosmetic_classes.setdefault(name, used_by)
      page_names.add(name)
  if not page_names:
    raise ValueError(f"No cosmetic items discovered on {class_page}")

check_discovery(cosmetic_index, existing_names, "cosmetics")
skipped_existing = len(set(cosmetic_index) & existing_names)
log(f"Pending cosmetics to inspect: {len(cosmetic_index) - skipped_existing}")
for name, (href, image_url) in cosmetic_index.items():
  if name in existing_names:
    continue
  scanned += 1
  log(f"Scraping cosmetic candidate {scanned}: {name}")
  item_page = request_wiki(href)
  item_soup = BeautifulSoup(item_page.content, "html.parser")
  if not find_table_value(item_soup, "Worn by:"):
    raise ValueError(f"Missing cosmetic infobox: {name}")
  release_text = find_table_value(item_soup, "Released:")
  release_date = parse_wiki_date(release_text)

  if should_skip_date(release_date, args.start_date):
    if release_date:
      skipped_older += 1
    else:
      skipped_unknown += 1
    continue

  image_id = hash_id(name)
  log(f"Including cosmetic {len(cosmetics) + 1}: {name} ({format_date(release_date)})")

  if args.img_download and not args.dry_run:
    log(f"Downloading cosmetic image for {name}")
    download_image(image_url, image_dir / f"{image_id}.png")

  cosmetics[name] = Cosmetic(name, image_id, cosmetic_classes[name], release_date)
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
