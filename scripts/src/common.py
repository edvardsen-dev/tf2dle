import argparse
import hashlib
import json
import re
from datetime import date, datetime
from pathlib import Path

SCRIPT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = SCRIPT_ROOT / "output"


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
  keys = {record[key] for record in records if key in record}
  log(f"Loaded {len(records)} existing records from {path.resolve()}")
  return sort_records(records), keys


def ensure_dir(path, *, dry_run=False):
  if not dry_run:
    path.mkdir(parents=True, exist_ok=True)


def write_json(output_name, records, *, dry_run=False):
  path = output_dir(output_name, dry_run=dry_run) / "data.json"
  records = sort_records(records)

  if dry_run:
    log(f"DRY RUN: Would write {len(records)} records to {path.resolve()}")
    return path

  path.write_text(json.dumps(records, indent=4) + "\n")
  log(f"Wrote {len(records)} records to {path.resolve()}")
  return path


def write_merged_json(output_name, existing_records, new_records, *, dry_run=False):
  records = sort_records(existing_records + new_records)
  if existing_records:
    log(f"Keeping {len(existing_records)} existing records and adding {len(new_records)} new records")

  return write_json(output_name, records, dry_run=dry_run)


def save_progress_json(output_name, existing_records, new_records, *, dry_run=False):
  path = output_dir(output_name, dry_run=dry_run) / "data.json"
  if dry_run:
    return path

  records = sort_records(existing_records + new_records)
  path.write_text(json.dumps(records, indent=4) + "\n")
  log(f"Saved progress: {len(records)} records in {path.resolve()}")
  return path


def should_skip_date(release_date, start_date):
  return start_date is not None and (release_date is None or release_date < start_date)


def reached_limit(records, limit):
  return limit is not None and len(records) >= limit


def hash_id(value):
  digest = hashlib.sha256(value.encode("utf-8")).digest()
  return str(int.from_bytes(digest[:8], byteorder="big", signed=False))
