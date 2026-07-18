# Scraper

This folder contains python file that scrapes for different thing. Belove is a list of all the files and what the scrape:

## List of scrapers

- [maps.py](#maps)
- [weapons.py](#weapons)
- [cosmetics.py](#cosmetics)

<h3 id="maps">Maps</h3>

Scrapes the web for all official tf2 maps. This is what it collects for each map:

```
- name          # Name of the map
- thumbnail     # A link to the thumbnail
- image         # A link to full size image
- game modes    # A list of all available game mode for the map
- release date  # The release date of the map
```

Options:

```
python maps.py --start-date 2024-01-28
python maps.py --start-date 2024-01-28 --img-download
```

`--start-date` only includes maps released on or after the given `YYYY-MM-DD` date. When combined with `--img-download`, only images for included maps are downloaded.

The script writes `maps.json` to the directory where the command is run, sorted by release date, and prints the resolved output path when it finishes.

<h3 id="weapons">Weapons</h3>

Scrapes the web for all official tf2 weapons.

```
- name          # Name of weapon
- link          # Link to weapon wiki page
- image         # Image icon
- killIcon      # Icon shown in kill feed
- releaseDate   # The date / patch the weapon was release
- usedBy        # Array of class names
- slot          # Array of slots
- ammoLoaded
- ammoCarried
- reloadType    # How the weapon is reloaded
- qualitities   # Array of available qualities for the weapons
- attributes    # Array of attributes
    - text      # Text description of weapon
    - variant   # Type of attribute (level, neutral, positive, negative)
```

#### Manual changes

Some manual changes has been done to the `weapons.json`:

- The script does not add weapons from the jungle inferno update. These has been manually added as there is only 5-6 weapons. (Check if this still is true when running the script)

<h3 id="cosmetics">Cosmetics</h3>

## Setting up python environment

1. Cd into folder

```
cd scripts
```

3. Create environment

```
python -m venv .
```

4. Activate environment:

```
./Scripts/activate
```

5. Install requirements

```
pip install -r requirements.txt
```

## Running python files

1. Make sure you have activated your python environment

```
./Scripts/activate
```

2. Run a python file

```
python <filename>
```
