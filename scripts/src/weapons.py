import argparse

from bs4 import BeautifulSoup

from common import add_scraper_args, check_discovery, download_image, ensure_dir, find_table_value, format_date, index_unique, load_existing_records, log, log_scraper_start, output_dir, parse_wiki_date, reached_limit, release_date_sort_key, request_wiki, safe_basename, save_progress_json, should_skip_date, validate_limit, wiki_url, write_merged_json


class Weapon:
  def __init__(self, name, link, image):
    self.name = name
    self.link = link
    self.image = image
    self.kill_icon = None
    self.release_date = None
    self.used_by = []
    self.slot = []
    self.ammo_loaded = None
    self.ammo_carried = None
    self.reload_type = None
    self.qualities = []
    self.attributes = []

  def add_attribute(self, attribute):
    self.attributes.append(attribute)

  def to_dict(self):
    return {
      "name": self.name,
      "link": self.link,
      "image": self.image,
      "killIcon": self.kill_icon,
      "releaseDate": format_date(self.release_date),
      "usedBy": self.used_by,
      "slot": self.slot,
      "ammoLoaded": self.ammo_loaded,
      "ammoCarried": self.ammo_carried,
      "reloadType": self.reload_type,
      "qualities": self.qualities,
      "attributes": [attribute.to_dict() for attribute in self.attributes]
    }


class Attribute:
  def __init__(self, text, variant):
    self.text = text
    self.variant = variant

  def to_dict(self):
    return {
      "text": self.text,
      "variant": self.variant
    }


ATTRIBUTE_CLASS_MAP = {
  "att_level": "level",
  "att_positive": "positive",
  "att_negative": "negative",
  "att_neutral": "neutral"
}

# Wiki spellings differ from shipped app names; aliases only identify seeded records.
EXISTING_NAME_ALIASES = {
  "Force-a-Nature": "Force-A-Nature",
  "Spy-Cicle": "Spy-cicle",
  "\u00dcbersaw": "Ubersaw",
  "L'\u00c9tranger": "L'Etranger",
}

parser = argparse.ArgumentParser(description="Scrape official TF2 weapons")
add_scraper_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log_scraper_start("weapons scraper", args)

BASE_URL = "https://wiki.teamfortress.com"
URL = f"{BASE_URL}/wiki/Weapons"
scraper_output_dir = output_dir("weapons", dry_run=args.dry_run)
image_dir = scraper_output_dir / "images"
kill_icon_dir = scraper_output_dir / "kill-icons"

if args.img_download and not args.dry_run:
  ensure_dir(image_dir)
  ensure_dir(kill_icon_dir)
  log(f"Writing weapon images to {image_dir.resolve()}")
  log(f"Writing kill icons to {kill_icon_dir.resolve()}")

log(f"Fetching weapon list: {URL}")
page = request_wiki(URL)
soup = BeautifulSoup(page.content, "html.parser")
tables = soup.find_all("table", {"class": "wikitable"})
log(f"Found {len(tables)} weapon tables")

weapon_index = {}
weapon_sources = {}
for table in tables:
  for row in table.find_all("tr")[2:]:
    row_header = row.find("th")
    if row_header is None:
      continue

    name_node = row_header.find("b")
    name_link = name_node.find_parent("a") if name_node else None
    if name_link is None:
      continue

    name = name_link.text.strip()
    href = name_link.get("href")
    image_node = row_header.find("img")
    if image_node is None:
      raise ValueError(f"Missing weapon image: {name}")
    image_link = image_node.get("src")
    safe_basename(name)
    index_unique(weapon_sources, name, (wiki_url(href), wiki_url(image_link)))
    weapon_index[name] = Weapon(name, href, image_link)

log(f"Indexed {len(weapon_index)} weapons")

weapons = {}
skipped_older = 0
skipped_unknown = 0
skipped_existing = 0
scanned = 0
existing_records, existing_names = load_existing_records("weapons")
check_discovery(weapon_index, existing_names, "weapons")
pending_weapons = [weapon for weapon in weapon_index.values()
                   if weapon.name not in existing_names and EXISTING_NAME_ALIASES.get(weapon.name) not in existing_names]
skipped_existing = len(weapon_index) - len(pending_weapons)
log(f"Pending weapons to inspect: {len(pending_weapons)}")

for weapon in pending_weapons:
  scanned += 1
  log(f"Scraping weapon {scanned}/{len(pending_weapons)}: {weapon.name}")

  weapon_page = request_wiki(weapon.link)
  weapon_soup = BeautifulSoup(weapon_page.content, "html.parser")
  if not find_table_value(weapon_soup, "Used by:") or not find_table_value(weapon_soup, "Slot:"):
    raise ValueError(f"Missing weapon infobox: {weapon.name}")

  release_text = find_table_value(weapon_soup, "Released:")
  weapon.release_date = parse_wiki_date(release_text)

  if should_skip_date(weapon.release_date, args.start_date):
    if weapon.release_date:
      skipped_older += 1
    else:
      skipped_unknown += 1
    continue

  log(f"Including weapon {len(weapons) + 1}: {weapon.name} ({format_date(weapon.release_date)})")

  kill_icon_div = weapon_soup.find("div", {"class": "tf-killnotice-icon"})
  if kill_icon_div:
    kill_icon = kill_icon_div.find("img")
    if kill_icon:
      weapon.kill_icon = kill_icon.get("src")
      wiki_url(weapon.kill_icon)

  used_by_text = find_table_value(weapon_soup, "Used by:")
  if used_by_text:
    weapon.used_by = [value.strip() for value in used_by_text.split(", ")]

  slot_label = weapon_soup.find(lambda tag: tag.name == "td" and tag.get_text(" ", strip=True) == "Slot:")
  if slot_label:
    weapon.slot = [slot.text.strip() for slot in slot_label.find_next_sibling("td").find_all("a")]

  weapon.ammo_loaded = find_table_value(weapon_soup, "Ammo loaded:")
  weapon.ammo_carried = find_table_value(weapon_soup, "Ammo carried:")
  weapon.reload_type = find_table_value(weapon_soup, "Reload type:")

  for quality in weapon_soup.find_all("div", {"class": "quality-tag"}):
    weapon.qualities.append(quality.find("a").find("span").text.strip())

  attribute_container = weapon_soup.find("td", class_="loadout-tooltip-container")
  attributes = attribute_container.find_all("span", class_=lambda x: x and x.startswith("att_")) if attribute_container else []
  for attribute in attributes:
    attribute_class = attribute.get("class")[0]
    for br in attribute.find_all("br"):
      br.replace_with("\n")

    if attribute_class in ATTRIBUTE_CLASS_MAP:
      weapon.add_attribute(Attribute(attribute.text, ATTRIBUTE_CLASS_MAP[attribute_class]))

  if args.img_download and not args.dry_run:
    log(f"Downloading weapon images for {weapon.name}")
    download_image(weapon.image, image_dir / f"{safe_basename(weapon.name)}.png")
    if weapon.kill_icon:
      download_image(weapon.kill_icon, kill_icon_dir / f"{safe_basename(weapon.name)}.png")

  weapons[weapon.name] = weapon
  records = [weapon.to_dict() for weapon in sorted(weapons.values(), key=release_date_sort_key)]
  save_progress_json("weapons", existing_records, records, dry_run=args.dry_run)

  if reached_limit(weapons, args.limit):
    log(f"Reached limit of {args.limit} weapons")
    break

records = [weapon.to_dict() for weapon in sorted(weapons.values(), key=release_date_sort_key)]
write_merged_json("weapons", existing_records, records, dry_run=args.dry_run)
log(f"Skipped {skipped_existing} records already present in output")

if args.start_date:
  log(f"Filter: releaseDate >= {args.start_date}")
  log(f"Skipped {skipped_older} older records and {skipped_unknown} records with unknown release dates")

log("Finished weapons scraper")
