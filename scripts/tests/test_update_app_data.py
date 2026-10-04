import io
import json
import os
import subprocess
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import update_app_data as updater


class UpdateTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        self.seeds = {}
        for dataset, path in updater.DATA_PATHS.items():
            self.seeds[dataset] = [self.record(dataset, "Existing", "1")]
            indent = "\t" if dataset == "weapons" else 4
            self.write(path, (json.dumps(self.seeds[dataset], indent=indent) + "\n").encode())
        self.metadata = "export const DATA_LAST_UPDATED = '2020-01-01';\nexport const OTHER = true;\n"
        self.write(updater.METADATA_PATH, self.metadata.encode())
        image = io.BytesIO()
        Image.new("RGB", (2, 3), "red").save(image, format="PNG")
        self.png = image.getvalue()

    def record(self, dataset, name, image):
        value = {"name": name, "image": image, "releaseDate": "unknown"}
        if dataset == "maps":
            value["thumbnail"] = image
        if dataset == "weapons":
            value["image"] = "/w/images/example.png"
        return value

    def write(self, path, content):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(content)

    def snapshot(self):
        return {str(path.relative_to(self.root)): (path.read_bytes(), path.stat().st_mtime_ns)
                for folder in ("src", "static") for path in (self.root / folder).rglob("*") if path.is_file()}

    def scrape(self, additions=False, mutate=None, failure=None):
        def run(command, **kwargs):
            dataset = Path(command[1]).stem
            self.assertEqual(command, [sys.executable, str(self.root / f"scripts/src/{dataset}.py"), "--img-download"])
            self.assertEqual(kwargs, {"check": True})
            for name in updater.DATASETS:
                self.assertTrue((self.root / f"scripts/output/{name}/data.json").exists())
            records = json.loads((self.root / f"scripts/output/{dataset}/data.json").read_bytes())
            if additions:
                item = self.record(dataset, "[New] wiki", "2")
                records.append(item)
                for source, _ in updater.asset_paths(dataset, item):
                    self.write(Path("scripts/output") / source, self.png)
            if mutate:
                mutate(dataset, records)
            self.write(f"scripts/output/{dataset}/data.json", json.dumps(records[::-1], indent=4, sort_keys=True).encode())
            if dataset == failure:
                raise subprocess.CalledProcessError(1, command)
        return patch.object(updater.subprocess, "run", side_effect=run)

    def test_noop_preserves_app_files_and_unrelated_output(self):
        self.write("scripts/output/compress/keep.png", b"keep")
        self.write("scripts/output/maps/stale", b"stale")
        before = self.snapshot()
        with self.scrape() as scripts:
            self.assertFalse(updater.run_update(self.root))
        self.assertEqual(scripts.call_count, 4)
        self.assertEqual([Path(call.args[0][1]).stem for call in scripts.call_args_list], list(updater.DATASETS))
        self.assertEqual(self.snapshot(), before)
        self.assertFalse((self.root / "scripts/output/maps/stale").exists())
        self.assertEqual((self.root / "scripts/output/compress/keep.png").read_bytes(), b"keep")
        report = (self.root / "scripts/output/update-report.md").read_text()
        self.assertIn("No new data", report)
        self.assertNotIn("unknown release date", report)
        self.assertFalse((self.root / "scripts/output/update-report.json").exists())

    def test_additions_publish_all_runbook_paths_and_metadata(self):
        with self.scrape(additions=True):
            self.assertTrue(updater.run_update(self.root))
        images = list((self.root / "static").rglob("*.png"))
        self.assertEqual(len(images), 5)
        for dataset, path in updater.DATA_PATHS.items():
            self.assertEqual(json.loads((self.root / path).read_bytes()), self.seeds[dataset] + [self.record(dataset, "[New] wiki", "2")])
            for _, destination in updater.asset_paths(dataset, self.record(dataset, "[New] wiki", "2")):
                self.assertEqual((self.root / destination).read_bytes(), self.png)
        today = datetime.now(timezone.utc).date().isoformat()
        self.assertEqual((self.root / updater.METADATA_PATH).read_text(), self.metadata.replace("2020-01-01", today))
        report = (self.root / "scripts/output/update-report.md").read_text()
        self.assertIn("Record and image validation: successful", report)
        self.assertIn("&#91;New&#93; wiki", report)
        self.assertEqual(report.count("unknown release date"), 4)

    def test_changed_deleted_and_duplicate_records_prevent_publication(self):
        for change in (lambda rows: rows[0].update(releaseDate="2021-01-01"), lambda rows: rows.pop(0), lambda rows: rows.append(rows[0])):
            before = self.snapshot()
            with self.scrape(additions=True, mutate=lambda name, rows: change(rows) if name == "unusuals" else None):
                with self.assertRaises(ValueError):
                    updater.run_update(self.root)
            self.assertEqual(self.snapshot(), before)

    def test_invalid_seed_fails_before_subprocess(self):
        self.write(updater.DATA_PATHS["unusuals"], b"[]")
        before = self.snapshot()
        with self.scrape() as scripts, self.assertRaises(ValueError):
            updater.run_update(self.root)
        scripts.assert_not_called()
        self.assertEqual(self.snapshot(), before)

    def test_subprocess_and_missing_or_invalid_image_fail_without_app_edits(self):
        for failure in ("subprocess", "missing", "invalid"):
            def mutate(name, rows):
                if name == "unusuals" and failure != "subprocess":
                    path = self.root / "scripts/output/unusuals/images/2.png"
                    path.unlink() if failure == "missing" else path.write_bytes(b"not PNG")
            before = self.snapshot()
            with self.scrape(additions=True, mutate=mutate, failure="unusuals" if failure == "subprocess" else None):
                with self.assertRaises((ValueError, FileNotFoundError, subprocess.CalledProcessError)):
                    updater.run_update(self.root)
            self.assertEqual(self.snapshot(), before)
            self.assertIn("Update failed", (self.root / "scripts/output/update-report.md").read_text())

    def test_formatting_preserves_tabs_and_baseline_order(self):
        for dataset, path in updater.DATA_PATHS.items():
            self.seeds[dataset].append(self.record(dataset, "Second", "3"))
            self.write(path, (json.dumps(self.seeds[dataset], indent="\t" if dataset == "weapons" else 4) + "\n").encode())
        with self.scrape(additions=True):
            updater.run_update(self.root)
        for dataset, path in updater.DATA_PATHS.items():
            text = (self.root / path).read_text()
            self.assertIn('\n\t{\n\t\t"name"' if dataset == "weapons" else '\n    {\n        "name"', text)
            self.assertEqual([item["name"] for item in json.loads(text)], ["Existing", "Second", "[New] wiki"])

    def test_unsafe_filenames_and_baseline_collisions_are_rejected(self):
        cases = [("cosmetics", "image", "../escape"), ("cosmetics", "image", 2),
                 ("cosmetics", "image", "1"), ("weapons", "name", "../escape"),
                 ("maps", "thumbnail", None)]
        for dataset, field, value in cases:
            before = self.snapshot()
            with self.scrape(additions=True, mutate=lambda name, rows: rows[-1].update({field: value}) if name == dataset else None):
                with self.assertRaises(ValueError):
                    updater.run_update(self.root)
            self.assertEqual(self.snapshot(), before)
        self.write("static/images/cosmetics/2.png", self.png)
        before = self.snapshot()
        with self.scrape(additions=True), self.assertRaisesRegex(ValueError, "collision"):
            updater.run_update(self.root)
        self.assertEqual(self.snapshot(), before)

    def test_cli_outputs_changed_only_on_success(self):
        output = self.root / "github-output"
        with patch.dict(os.environ, {"GITHUB_OUTPUT": str(output)}), patch.object(sys, "stdout", io.StringIO()), patch.object(sys, "stderr", io.StringIO()):
            with patch.object(updater, "run_update", side_effect=ValueError("failed")):
                self.assertEqual(updater.main([]), 1)
            self.assertFalse(output.exists())
            for changed in (False, True):
                with patch.object(updater, "run_update", return_value=changed):
                    self.assertEqual(updater.main([]), 0)
            self.assertEqual(output.read_text(), "changed=false\nchanged=true\n")

    def test_checked_in_seeds_are_valid(self):
        for dataset, path in updater.DATA_PATHS.items():
            records = updater.load_records((updater.ROOT / path).read_bytes())
            for record in records:
                list(updater.asset_paths(dataset, record))
