import argparse
from datetime import datetime
import json
from pathlib import Path

class Map:
  """Class representing a TF2 map"""
  def __init__(self, name, thumbnail, image, game_mode, release_date):
    self.name = name
    self.thumbnail = thumbnail
    self.image = image
    self.game_modes = [game_mode]
    self.release_date = release_date

  def add_game_mode(self, game_mode):
    self.game_modes.append(game_mode)

  def __str__(self):
    return f"Map: {self.name}\nThumbnail: {self.thumbnail}\nImage: {self.image}\nGame Modes: {self.game_modes}\nRelease Date: {self.release_date}"
  
  def to_dict(self):
    """Converts the object to a dictionary"""
    return {
      'name': self.name,
      'thumbnail': self.thumbnail,
      'image': self.image,
      'gameModes': self.game_modes,
      'releaseDate': self.release_date
    }
  
def convert_to_full_image_url(thumbnail_url):
  """Converts the url of a thumbnail to the url of the full image"""
  parts = thumbnail_url.split('/')

  full_image_parts = [part for i, part in enumerate(parts) if part != 'thumb' and i != len(parts) - 1]

  full_image_url = '/'.join(full_image_parts)

  return full_image_url

def parse_date(value):
  """Parses a YYYY-MM-DD date string"""
  try:
    return datetime.strptime(value, "%Y-%m-%d").date()
  except ValueError:
    raise argparse.ArgumentTypeError("expected date format YYYY-MM-DD")

def release_date_sort_key(map_instance):
  if map_instance.release_date == "unknown":
    return datetime.max.date()

  return parse_date(map_instance.release_date)

parser = argparse.ArgumentParser(description="Scrape official TF2 maps")
parser.add_argument("--img-download", action="store_true", help="Download map thumbnails and full images")
parser.add_argument("--start-date", type=parse_date, help="Only include maps released on or after this date (YYYY-MM-DD)")
args = parser.parse_args()

import requests
from bs4 import BeautifulSoup

# If the script should download images (map thumbnails an original images)
enable_img_download = args.img_download

# Go to the wiki page
URL = "https://wiki.teamfortress.com/wiki/List_of_maps"
page = requests.get(URL)

# Parse the html
soup = BeautifulSoup(page.content, "html.parser")

# Select all table rows
table = soup.find("table", {"class": "grid"})
tbody = table.find("tbody")
trs = tbody.find_all("tr")

# Initialize empty hashmap. Some maps have multiple rows where 
# each row represents a different game mode. We want to combine these rows into one map object.
hashmap = {}
skipped_older_maps = 0
skipped_unknown_date_maps = 0

# Loop through each row
for tr in trs:
  # Find all table data
  tds = tr.find_all("td")

  # If there are not 7 table data, skip
  if not len(tds) == 6:
    continue

  map_name = tds[1].find("a").text
  map_game_mode = tds[2].text.replace("\n", "")

  # If map is already added, add game mode to that map
  if map_name in hashmap.keys():
    hashmap[map_name].add_game_mode(map_game_mode)
  else:
    map_release_date = tds[4].find("span")

    # Not all maps have a release date
    if map_release_date:
      map_release_date = map_release_date.text.strip()
    else:
      map_release_date = "unknown"

    if args.start_date:
      if map_release_date == "unknown":
        skipped_unknown_date_maps += 1
        continue

      if parse_date(map_release_date) < args.start_date:
        skipped_older_maps += 1
        continue

    # Else, create new game
    map_thumbnail = "https://wiki.teamfortress.com" + tds[0].find("img")["src"]
    map_image = convert_to_full_image_url(map_thumbnail)

    # Hashed map name
    hahsed_map_name = str(hash(map_name))
    if enable_img_download:
      # Download map thumbnail
      img_data = requests.get(map_thumbnail).content
      with open(f"images/maps/thumbnails/{hahsed_map_name}.png", "wb") as file:
        file.write(img_data)

      # Download map image
      img_data = requests.get(map_image).content
      with open(f"images/maps/{hahsed_map_name}.png", "wb") as file:
        file.write(img_data)

    hashmap[map_name] = Map(map_name, hahsed_map_name, hahsed_map_name, map_game_mode, map_release_date)

# Convert hashmap to json
maps_json = json.dumps([map_instance.to_dict() for map_instance in sorted(hashmap.values(), key=release_date_sort_key)], indent=4)

# Write json to file
output_path = Path("maps.json")
with output_path.open("w") as file:
  file.write(maps_json)

print(f"Wrote {len(hashmap)} maps to {output_path.resolve()}")
if args.start_date:
  print(f"Filter: releaseDate >= {args.start_date}")
  print(f"Skipped {skipped_older_maps} older maps and {skipped_unknown_date_maps} maps with unknown release dates")
