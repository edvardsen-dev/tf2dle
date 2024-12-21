import requests
from bs4 import BeautifulSoup
import json
import sys

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

# If the script should download images (map thumbnails an original images)
enable_img_download = '--img-download' in sys.argv

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

    map_release_date = tds[4].find("span")

    # Not all maps have a release date
    if map_release_date:
      map_release_date = map_release_date.text
    else:
      map_release_date = "unknown"

    hashmap[map_name] = Map(map_name, hahsed_map_name, hahsed_map_name, map_game_mode, map_release_date)

# Convert hashmap to json
maps_json = json.dumps([map_instance.to_dict() for map_instance in hashmap.values()], indent=4)

# Write json to file
with open("maps.json", "w") as file:
  file.write(maps_json)
