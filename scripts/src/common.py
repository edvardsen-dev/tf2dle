import argparse
import hashlib
import json
import os
import re
import tempfile
import time
from datetime import date, datetime
from io import BytesIO
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import requests
from PIL import Image
from requests.adapters import HTTPAdapter
from urllib3.util import Retry

SCRIPT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = SCRIPT_ROOT / "output"
WIKI_URL = "https://wiki.teamfortress.com"
REQUEST_INTERVAL = 1.0
REQUEST_TIMEOUT = (10, 30)
_last_request = None


def wiki_url(value, base=WIKI_URL):
  if not isinstance(value, str) or not value or re.search(r"[\x00-\x20\x7f\\]", value):
    raise ValueError(f"Invalid wiki URL: {value!r}")
  url = urljoin(base, value)
  parts = urlsplit(url)
  if (parts.scheme != "https" or parts.hostname != "wiki.teamfortress.com"
      or parts.username is not None or parts.password is not None or parts.port not in (None, 443)):
    raise ValueError(f"URL must use the HTTPS TF2 wiki host: {url!r}")
  return url


def _check_redirect(response, **kwargs):
  if response.is_redirect:
    wiki_url(response.headers["Location"], base=response.url)


SESSION = requests.Session()
SESSION.headers.update({"User-Agent": "TF2DLE-data-updater/1.0 (Team Fortress 2 wiki data and image scraper)"})
SESSION.mount("https://", HTTPAdapter(max_retries=Retry(
  total=2, status_forcelist=[429, 500, 502, 503, 504], backoff_factor=1,
  retry_after_max=60, raise_on_status=False,
)))
SESSION.hooks["response"].append(_check_redirect)
SESSION.max_redirects = 5


def request_wiki(value):
  global _last_request
  url = wiki_url(value)
  if _last_request is not None:
    time.sleep(max(0, REQUEST_INTERVAL - (time.monotonic() - _last_request)))
  _last_request = time.monotonic()
  response = SESSION.get(url, timeout=REQUEST_TIMEOUT)
  wiki_url(response.url)
  response.raise_for_status()
  return response


def safe_basename(value):
  if (not isinstance(value, str) or not value or value in (".", "..")
      or re.search(r'[\x00-\x1f\x7f/\\]', value) or value.endswith((".", " "))):
    raise ValueError(f"Unsafe file basename: {value!r}")
  return value


def atomic_write(path, content):
  path = Path(path)
  safe_basename(path.name)
  temporary = None
  try:
    with tempfile.NamedTemporaryFile(dir=path.parent, prefix=f".{path.name}.", suffix=".tmp", delete=False) as file:
      temporary = Path(file.name)
      file.write(content)
      file.flush()
      os.fsync(file.fileno())
    os.replace(temporary, path)
  finally:
    if temporary is not None:
      temporary.unlink(missing_ok=True)


def validate_png(content):
  try:
    with Image.open(BytesIO(content)) as image:
      if image.format != "PNG":
        raise ValueError(f"Expected PNG image, got {image.format}")
      width, height = image.size
      if not (0 < width <= 8192 and 0 < height <= 8192 and width * height <= 16_000_000):
        raise ValueError(f"Unreasonable image dimensions: {width}x{height}")
      image.verify()
    with Image.open(BytesIO(content)) as image:
      frames = image.n_frames
      if frames > 1000 or frames * width * height > 100_000_000:
        raise ValueError(f"Unreasonable image frame count: {frames}")
      for frame in range(frames):
        image.seek(frame)
        image.load()
  except (OSError, SyntaxError) as error:
    raise ValueError(f"Invalid PNG image: {error}") from error


def download_image(url, path):
  path = Path(path)
  safe_basename(path.name)
  content = request_wiki(url).content
  validate_png(content)
  # Keep the original bytes, including animation and transparency.
  atomic_write(path, content)


def index_unique(index, name, value):
  if not isinstance(name, str) or not name.strip():
    raise ValueError("Missing discovered record name")
  if name in index and index[name] != value:
    raise ValueError(f"Conflicting duplicate discovery: {name}")
  index[name] = value


def validate_records(records, *, key="name"):
  if not isinstance(records, list):
    raise ValueError("Expected a JSON record list")
  keys = set()
  for record in records:
    if not isinstance(record, dict) or not isinstance(record.get(key), str) or not record[key].strip():
      raise ValueError(f"Record is missing a valid {key}")
    if record[key] in keys:
      raise ValueError(f"Duplicate record {key}: {record[key]}")
    keys.add(record[key])
  return keys


def check_discovery(names, existing_names, label):
  if not names:
    raise ValueError(f"No {label} discovered; wiki structure may have changed")
  # Allow renamed/deleted entries, but reject a near-total discovery collapse.
  if len(existing_names) >= 20 and len(names) < len(existing_names) // 2:
    raise ValueError(f"Suspiciously few {label} discovered: {len(names)} vs {len(existing_names)} existing")


def log(message):
  print(f"INFO: {message}", flush=True)


def log_scraper_start(name, args):
  log(f"Starting {name}")
  log(f"Dry run: {'yes' if args.dry_run else 'no'}")
  log(f"Image download: {'yes' if getattr(args, 'img_download', False) and not args.dry_run else 'no'}")
  log(f"Start date: {args.start_date if getattr(args, 'start_date', None) else 'none'}")
  log(f"Limit: {args.limit if args.limit else 'none'}")


def parse_date(value):
  try:
    return datetime.strptime(value, "%Y-%m-%d").date()
  except ValueError:
    raise argparse.ArgumentTypeError("expected date format YYYY-MM-DD")


def parse_wiki_date(value):
  if not value:
    return None

  text = " ".join(value.split())

  iso_match = re.search(r"\d{4}-\d{2}-\d{2}", text)
  if iso_match:
    return datetime.strptime(iso_match.group(0), "%Y-%m-%d").date()

  month_match = re.search(r"[A-Z][a-z]+ \d{1,2}, \d{4}", text)
  if month_match:
    return datetime.strptime(month_match.group(0), "%B %d, %Y").date()

  return None


def format_date(value):
  return value.isoformat() if value else "unknown"


def find_table_value(soup, label):
  label_cell = soup.find(lambda tag: tag.name == "td" and tag.get_text(" ", strip=True) == label)
  value_cell = label_cell.find_next_sibling("td") if label_cell else None
  return value_cell.get_text(" ", strip=True) if value_cell else None


def release_date_sort_key(item):
  return (item.release_date if item.release_date else date.max, item.name.lower())


def record_sort_key(record):
  release_date = parse_wiki_date(record.get("releaseDate")) if record.get("releaseDate") and record["releaseDate"] != "unknown" else date.max
  if release_date is None:
    release_date = date.max

  return (release_date, record.get("name", "").lower())


def sort_records(records):
  return sorted(records, key=record_sort_key)


def add_scraper_args(parser):
  parser.add_argument("--start-date", type=parse_date, help="Only include records released on or after this date (YYYY-MM-DD)")
  parser.add_argument("--img-download", action="store_true", help="Download images for included records")
  parser.add_argument("--dry-run", action="store_true", help="Scrape and print a summary without writing files or downloading images")
  parser.add_argument("--limit", type=int, help="Stop after N included records")


def add_common_args(parser):
  parser.add_argument("--dry-run", action="store_true", help="Print what would happen without writing files")
  parser.add_argument("--limit", type=int, help="Process at most N records")


def validate_limit(parser, limit):
  if limit is not None and limit < 1:
    parser.error("--limit must be greater than 0")


def output_dir(name, *, dry_run=False):
  path = OUTPUT_ROOT / name
  if not dry_run:
    path.mkdir(parents=True, exist_ok=True)

  return path


def output_data_path(name):
  return output_dir(name, dry_run=True) / "data.json"


def load_existing_records(output_name, *, key="name"):
  path = output_data_path(output_name)
  if not path.exists():
    log(f"No existing output found at {path.resolve()}")
    return [], set()

  records = json.loads(path.read_text())
  keys = validate_records(records, key=key)
  log(f"Loaded {len(records)} existing records from {path.resolve()}")
  return sort_records(records), keys


def ensure_dir(path, *, dry_run=False):
  if not dry_run:
    path.mkdir(parents=True, exist_ok=True)


def write_json(output_name, records, *, dry_run=False):
  validate_records(records)
  path = output_dir(output_name, dry_run=dry_run) / "data.json"
  records = sort_records(records)

  if dry_run:
    log(f"DRY RUN: Would write {len(records)} records to {path.resolve()}")
    return path

  atomic_write(path, (json.dumps(records, indent=4) + "\n").encode("utf-8"))
  log(f"Wrote {len(records)} records to {path.resolve()}")
  return path


def write_merged_json(output_name, existing_records, new_records, *, dry_run=False):
  records = sort_records(existing_records + new_records)
  if existing_records:
    log(f"Keeping {len(existing_records)} existing records and adding {len(new_records)} new records")

  return write_json(output_name, records, dry_run=dry_run)


def save_progress_json(output_name, existing_records, new_records, *, dry_run=False):
  records = sort_records(existing_records + new_records)
  validate_records(records)
  path = output_dir(output_name, dry_run=dry_run) / "data.json"
  if dry_run:
    return path

  atomic_write(path, (json.dumps(records, indent=4) + "\n").encode("utf-8"))
  log(f"Saved progress: {len(records)} records in {path.resolve()}")
  return path


def should_skip_date(release_date, start_date):
  return start_date is not None and (release_date is None or release_date < start_date)


def reached_limit(records, limit):
  return limit is not None and len(records) >= limit


def hash_id(value):
  digest = hashlib.sha256(value.encode("utf-8")).digest()
  return str(int.from_bytes(digest[:8], byteorder="big", signed=False))
