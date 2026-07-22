import argparse
from pathlib import Path

from PIL import Image

from common import add_common_args, ensure_dir, log, output_dir, validate_limit


parser = argparse.ArgumentParser(description="Compress images into scripts/output/compress")
parser.add_argument("--path", required=True, type=Path, help="Directory containing images to compress")
parser.add_argument("--ext", required=True, choices=["png", "jpg", "jpeg"], help="Image extension to process")
add_common_args(parser)
args = parser.parse_args()
validate_limit(parser, args.limit)
log("Starting image compression")
log(f"Input path: {args.path}")
log(f"Extension: {args.ext}")
log(f"Dry run: {'yes' if args.dry_run else 'no'}")
log(f"Limit: {args.limit if args.limit else 'none'}")

if not args.path.is_dir():
  parser.error(f"directory does not exist: {args.path}")

files = sorted(args.path.glob(f"*.{args.ext}"))
if args.limit:
  files = files[:args.limit]
log(f"Found {len(files)} images to compress")

compress_output_dir = output_dir("compress", dry_run=args.dry_run)
ensure_dir(compress_output_dir, dry_run=args.dry_run)

for index, file_path in enumerate(files, start=1):
  output_path = compress_output_dir / file_path.name
  if output_path.exists():
    log(f"Skipping existing compressed image {index}/{len(files)}: {file_path.name}")
    continue

  log(f"Compressing image {index}/{len(files)}: {file_path.name}")

  if args.dry_run:
    continue

  image = Image.open(file_path)
  image.save(output_path, args.ext, optimize=True, quality=20)

if args.dry_run:
  log(f"DRY RUN: Would write {len(files)} compressed images to {compress_output_dir.resolve()}")
else:
  log(f"Wrote {len(files)} compressed images to {compress_output_dir.resolve()}")

log("Finished image compression")
