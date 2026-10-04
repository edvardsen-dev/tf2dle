"""Run all scrapers once and publish validated additions to app data.

Each run resets only scripts/output/{maps,weapons,cosmetics,unusuals}, seeding
them from current app JSON. Compression and other local output are untouched.
Published records retain baseline order and indentation, with additions appended.
"""

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

import common


ROOT = Path(__file__).resolve().parents[2]
DATASETS = ("maps", "weapons", "cosmetics", "unusuals")
DATA_PATHS = {name: f"src/lib/server/data/{name}.json" for name in DATASETS}
METADATA_PATH = "src/lib/appMetadata.ts"
# JSON field, scraper image directory, app image directory. Kill icons stay in output.
ASSETS = {
    "maps": (
        ("image", "images", "static/images/maps/originals"),
        ("thumbnail", "thumbnails", "static/images/maps/thumbnails"),
    ),
    "weapons": (("name", "images", "static/images/weapons/thumbnails"),),
    "cosmetics": (("image", "images", "static/images/cosmetics"),),
    "unusuals": (("image", "images", "static/images/unusuals"),),
}
DATE_DECLARATION = re.compile(
    r"(?m)^(export const DATA_LAST_UPDATED = (['\"]))\d{4}-\d{2}-\d{2}(\2;)$"
)


def load_records(content):
    records = json.loads(content)
    if not isinstance(records, list) or not records:
        raise ValueError("Expected a nonempty record list")
    common.validate_records(records)
    return records


def asset_paths(dataset, record):
    for field, source, destination in ASSETS[dataset]:
        filename = f"{common.safe_basename(record.get(field))}.png"
        yield Path(dataset) / source / filename, Path(destination) / filename


def markdown_text(value):
    return "".join(char if char.isalnum() or char == " " else f"&#{ord(char)};" for char in str(value))


def run_update(root=ROOT):
    """Return a changed flag; scraper or validation failures raise before app writes."""
    root = Path(root)
    output = root / "scripts/output"
    report = ["# App data update", ""]
    try:
        baseline, seed_text = {}, {}
        for dataset, path in DATA_PATHS.items():
            seed_text[dataset] = (root / path).read_text(encoding="utf-8")
            baseline[dataset] = load_records(seed_text[dataset])
        metadata = (root / METADATA_PATH).read_text(encoding="utf-8")
        if len(list(DATE_DECLARATION.finditer(metadata))) != 1:
            raise ValueError("Expected one DATA_LAST_UPDATED date declaration")
        claimed = {
            str(destination).casefold()
            for dataset in DATASETS for record in baseline[dataset]
            for _, destination in asset_paths(dataset, record)
        }

        for dataset in DATASETS:
            directory = output / dataset
            if directory.exists():
                shutil.rmtree(directory)
            directory.mkdir(parents=True)
            (directory / "data.json").write_text(seed_text[dataset], encoding="utf-8")
        for dataset in DATASETS:
            subprocess.run(
                [sys.executable, str(root / f"scripts/src/{dataset}.py"), "--img-download"],
                check=True,
            )

        pending, warnings = {}, []
        for dataset, path in DATA_PATHS.items():
            records = load_records((output / dataset / "data.json").read_bytes())
            by_name = {record["name"]: record for record in records}
            for record in baseline[dataset]:
                if (
                    record["name"] not in by_name
                    or json.dumps(record, sort_keys=True) != json.dumps(by_name[record["name"]], sort_keys=True)
                ):
                    raise ValueError(f"{dataset}: baseline record deleted or modified: {record['name']}")
            existing_names = {record["name"] for record in baseline[dataset]}
            additions = [record for record in records if record["name"] not in existing_names]
            report.extend([
                f"## {dataset}",
                f"Records: {len(baseline[dataset])} before, {len(records)} after, {len(additions)} added.",
                *(f"- {markdown_text(record['name'])}" for record in additions), "",
            ])
            for record in additions:
                if not isinstance(record.get("image"), str) or not record["image"].strip():
                    raise ValueError(f"{dataset}: missing string image field: {record['name']}")
                if record.get("releaseDate", "unknown") == "unknown":
                    warnings.append(f"{dataset}: {record['name']} has an unknown release date")
                for source, destination in asset_paths(dataset, record):
                    target = root / destination
                    key = str(destination).casefold()
                    if key in claimed or target.exists() or (
                        target.parent.exists() and any(
                            item.name.casefold() == target.name.casefold() for item in target.parent.iterdir()
                        )
                    ):
                        raise ValueError(f"Image filename collision: {destination}")
                    content = (output / source).read_bytes()
                    common.validate_png(content)
                    claimed.add(key)
                    pending[destination] = content
            if additions:
                text = seed_text[dataset]
                indentation = re.search(r"(?m)^([ \t]+)\S", text)
                indent = indentation[1] if indentation else ("\t" if dataset == "weapons" else "    ")
                serialized = json.dumps(baseline[dataset] + additions, indent=indent, ensure_ascii=text.isascii())
                pending[Path(path)] = (serialized + ("\n" if text.endswith("\n") else "")).encode("utf-8")

        report.append("Record and image validation: successful.")
        if warnings:
            report.extend(["", "## Warnings", *(f"- {markdown_text(warning)}" for warning in warnings)])
        if not pending:
            report.extend(["", "No new data. App files were not changed."])
            return False

        today = datetime.now(timezone.utc).date().isoformat()
        updated_metadata = DATE_DECLARATION.sub(lambda match: f"{match[1]}{today}{match[3]}", metadata)
        if updated_metadata != metadata:
            pending[Path(METADATA_PATH)] = updated_metadata.encode("utf-8")
        # Every dataset and required new image has passed validation before any app writes.
        for path, content in pending.items():
            target = root / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
        report.extend(["", f"Published additions. Data updated on {today} UTC."])
        return True
    except Exception as error:
        report.extend(["", f"Update failed: {markdown_text(error)}"])
        raise
    finally:
        output.mkdir(parents=True, exist_ok=True)
        (output / "update-report.md").write_text("\n".join(report) + "\n", encoding="utf-8")


def main(argv=None):
    argparse.ArgumentParser(description=__doc__).parse_args(argv)
    try:
        changed = run_update()
    except Exception as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 1
    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as output:
            output.write(f"changed={str(changed).lower()}\n")
    print("Data updated." if changed else "No new data.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
