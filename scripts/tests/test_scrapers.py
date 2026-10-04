import contextlib
import io
import json
import runpy
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import common
from test_common import png_bytes, response

SRC = Path(__file__).resolve().parents[1] / "src"


def map_row(name, mode="Payload", released="October 1, 2026", image="Test.png"):
  return f'''<tr><td><img src="/w/images/thumb/a/ab/{image}/100px-{image}"></td>
    <td><a>{name}</a></td><td>{mode}</td><td></td><td><span>{released}</span></td><td></td></tr>'''


def map_page(*rows):
  return '<table class="grid">' + "".join(rows) + '</table>'


def weapon_page(href="/wiki/Bat", name="Scout's Bat"):
  return f'''<table class="wikitable"><tr><th>Weapons</th></tr><tr><th>Slot</th></tr>
    <tr><th><img src="/w/images/Bat.png"><a href="{href}"><b>{name}</b></a></th></tr></table>'''


def infobox(label="Used by:"):
  return f'''<table><tr><td>{label}</td><td>Scout</td></tr><tr><td>Slot:</td><td><a>Melee</a></td></tr>
    <tr><td>Released:</td><td>October 1, 2026</td></tr></table>'''


def cosmetic_index():
  return '<h2><span>List of cosmetic items</span></h2><ul>' + "".join(
    f'<li><a href="/wiki/List_of_{name}_cosmetics">{name}</a></li>' for name in ("Scout", "Soldier")
  ) + '</ul>'


def cosmetic_page(href="/wiki/Hat"):
  return f'<table><tr style="vertical-align:top;"><td><a title="Hat" href="{href}"><img src="/w/images/Hat.png"></a></td></tr></table>'


def unusual_table(name="Glow", series="Series 1 Unusual effects"):
  return f'''<table class="wikitable"><tr><th class="header">{series}</th></tr>
    <tr><td rowspan="2">Cosmetic effects</td><td><img alt="Unusual {name}.png" src="/w/images/{name}.png"></td></tr></table>'''


def unusual_page(*tables):
  return "".join(tables) + '<table class="wikitable"></table>' * 3


class ScraperTests(unittest.TestCase):
  def setUp(self):
    temporary = tempfile.TemporaryDirectory()
    self.addCleanup(temporary.cleanup)
    self.root = Path(temporary.name)
    self.pages, self.urls = {}, []

  def scrape(self, name, *args):
    def get(url, **kwargs):
      self.urls.append(url)
      value = self.pages[url.removeprefix(common.WIKI_URL)]
      return response(value.encode() if isinstance(value, str) else value)

    with patch.object(common, "OUTPUT_ROOT", self.root), patch.object(common, "_last_request", None), \
         patch.object(common.SESSION, "get", side_effect=get), patch.object(common.time, "sleep"), \
         patch.object(sys, "argv", [name + ".py", *args]), contextlib.redirect_stdout(io.StringIO()):
      return runpy.run_path(str(SRC / f"{name}.py"))

  def records(self, name):
    return json.loads((self.root / name / "data.json").read_text())

  def test_maps_limit_checkpoints_all_modes_and_resume_preserves_seed(self):
    self.pages["/wiki/List_of_maps"] = map_page(map_row("Alpha"), map_row("Beta"), map_row("Alpha", "Control Point"))
    seed = {"name": "Deleted", "custom": "preserved"}
    (self.root / "maps").mkdir()
    (self.root / "maps" / "data.json").write_text(json.dumps([seed]))
    with patch.object(common, "save_progress_json", wraps=common.save_progress_json) as save:
      self.scrape("maps", "--limit", "1")
    self.assertEqual(save.call_args.args[2][0]["gameModes"], ["Control Point", "Payload"])
    self.assertEqual([record["name"] for record in self.records("maps")], ["Alpha", "Deleted"])
    self.scrape("maps", "--limit", "1")
    self.assertEqual([record["name"] for record in self.records("maps")], ["Alpha", "Beta", "Deleted"])
    self.assertIn(seed, self.records("maps"))

  def test_date_filter_and_dry_run(self):
    self.pages["/wiki/List_of_maps"] = map_page(map_row("Old", released="January 1, 2000"), map_row("New"), map_row("Unknown", released=""))
    result = self.scrape("maps", "--start-date", "2026-01-01", "--dry-run", "--img-download")
    self.assertEqual([record["name"] for record in result["records"]], ["New"])
    self.assertEqual(list(self.root.iterdir()), [])

  def test_invalid_image_not_checkpointed_and_resume_downloads_both_map_images(self):
    self.pages.update({"/wiki/List_of_maps": map_page(map_row("Alpha")),
                       "/w/images/thumb/a/ab/Test.png/100px-Test.png": b"not an image"})
    with self.assertRaises(ValueError):
      self.scrape("maps", "--img-download")
    self.assertFalse((self.root / "maps" / "data.json").exists())
    self.pages.update({"/w/images/thumb/a/ab/Test.png/100px-Test.png": png_bytes(), "/w/images/a/ab/Test.png": png_bytes()})
    self.scrape("maps", "--img-download")
    for directory in ("images", "thumbnails"):
      self.assertEqual((self.root / "maps" / directory / f"{common.hash_id('Alpha')}.png").read_bytes(), png_bytes())

  def test_weapon_images_and_seeded_detail_skipping(self):
    self.pages.update({"/wiki/Weapons": weapon_page(), "/wiki/Bat": infobox() + '<div class="tf-killnotice-icon"><img src="/w/images/Kill.png"></div>',
                       "/w/images/Bat.png": png_bytes(), "/w/images/Kill.png": png_bytes()})
    self.scrape("weapons", "--img-download")
    for directory in ("images", "kill-icons"):
      self.assertTrue((self.root / "weapons" / directory / "Scout's Bat.png").exists())
    self.urls.clear()
    self.scrape("weapons", "--img-download")
    self.assertEqual(self.urls, [common.WIKI_URL + "/wiki/Weapons"])

  def test_weapon_aliases_skip_only_seeded_app_names(self):
    spellings = (("Force-a-Nature", "Force-A-Nature"), ("Spy-Cicle", "Spy-cicle"),
                 ("\u00dcbersaw", "Ubersaw"), ("L'\u00c9tranger", "L'Etranger"))
    self.pages["/wiki/Weapons"] = "".join(weapon_page(f"/wiki/Weapon{index}", wiki_name)
                                           for index, (wiki_name, _) in enumerate(spellings))
    seeds = [{"name": app_name, "custom": {"preserved": index}} for index, (_, app_name) in enumerate(spellings)]
    (self.root / "weapons").mkdir()
    (self.root / "weapons" / "data.json").write_text(json.dumps(seeds))
    result = self.scrape("weapons", "--img-download")
    self.assertEqual(result["records"], [])
    self.assertEqual({record["name"]: record for record in self.records("weapons")}, {record["name"]: record for record in seeds})
    self.assertEqual(self.urls, [common.WIKI_URL + "/wiki/Weapons"])
    self.assertEqual(list((self.root / "weapons" / "images").iterdir()), [])
    self.assertEqual(list((self.root / "weapons" / "kill-icons").iterdir()), [])

  def test_unseeded_weapon_aliases_keep_wiki_names(self):
    names = ("Force-a-Nature", "Spy-Cicle", "\u00dcbersaw", "L'\u00c9tranger")
    self.pages["/wiki/Weapons"] = "".join(weapon_page(f"/wiki/Weapon{index}", name) for index, name in enumerate(names))
    self.pages.update({f"/wiki/Weapon{index}": infobox() for index in range(len(names))})
    self.scrape("weapons")
    self.assertEqual({record["name"] for record in self.records("weapons")}, set(names))

  def test_matching_cosmetic_class_duplicates_keep_first_class(self):
    self.pages.update({"/wiki/Cosmetic_items": cosmetic_index(), "/wiki/List_of_Scout_cosmetics": cosmetic_page(),
                       "/wiki/List_of_Soldier_cosmetics": cosmetic_page(), "/wiki/Hat": infobox("Worn by:")})
    self.scrape("cosmetics", "--limit", "1")
    self.assertEqual(len(self.records("cosmetics")), 1)
    self.assertEqual(self.records("cosmetics")[0]["usedBy"], "Scout")
    self.assertEqual(self.urls.count(common.WIKI_URL + "/wiki/Hat"), 1)

  def test_unusual_animation_and_limit_resume(self):
    content = png_bytes(animated=True)
    self.pages.update({"/wiki/Unusual": unusual_page(unusual_table(), unusual_table("Second")),
                       "/w/images/Glow.png": content, "/w/images/Second.png": content})
    self.scrape("unusuals", "--img-download", "--limit", "1")
    self.assertEqual((self.root / "unusuals" / "images" / f"{common.hash_id('Glow')}.png").read_bytes(), content)
    self.scrape("unusuals", "--img-download", "--limit", "1")
    self.assertEqual({record["name"] for record in self.records("unusuals")}, {"Glow", "Second"})

  def test_unusual_effect_name_rows_do_not_replace_category(self):
    table = '''<table class="wikitable"><tr><th class="header">Series 1 Unusual effects</th></tr>
      <tr><td rowspan="7">Cosmetic effects</td><td><img alt="Unusual First RED.png" src="/w/images/First_RED.png"></td>
        <td><img alt="Unusual First BLU.png" src="/w/images/First_BLU.png"></td></tr>
      <tr><td rowspan="2">Rowspanned effect name</td><td>RED</td><td>BLU</td></tr>
      <tr><td>First variant name</td></tr>
      <tr><td rowspan="2"><img alt="Unusual Next.png" src="/w/images/Next.png"></td></tr>
      <tr><td rowspan="2">Taunt effects</td><td><img alt="Unusual Taunt.png" src="/w/images/Taunt.png"></td></tr>
      <tr><td rowspan="2">Weapon effects</td><td><img alt="Unusual Weapon.png" src="/w/images/Weapon.png"></td></tr></table>'''
    self.pages["/wiki/Unusual"] = unusual_page(table)
    self.scrape("unusuals")
    self.assertEqual({record["name"]: record["type"] for record in self.records("unusuals")}, {
      "First RED": "Cosmetic effects", "First BLU": "Cosmetic effects", "Next": "Cosmetic effects",
      "Taunt": "Taunt effects", "Weapon": "Weapon effects",
    })

  def test_conflicting_duplicates_fail_before_limit(self):
    self.pages.update({"/wiki/List_of_maps": map_page(map_row("Alpha"), map_row("Alpha", image="Other.png")),
                       "/wiki/Weapons": weapon_page() + weapon_page("/wiki/Other"),
                       "/wiki/Cosmetic_items": cosmetic_index(), "/wiki/List_of_Scout_cosmetics": cosmetic_page(),
                       "/wiki/List_of_Soldier_cosmetics": cosmetic_page("/wiki/Other"),
                       "/wiki/Unusual": unusual_page(unusual_table(), unusual_table(series="Series 2 Unusual effects"))})
    for name in ("maps", "weapons", "cosmetics", "unusuals"):
      with self.subTest(name=name), self.assertRaisesRegex(ValueError, "Conflicting duplicate"):
        self.scrape(name, "--limit", "1")
      self.assertFalse((self.root / name / "data.json").exists())

  def test_broken_and_empty_sources_fail(self):
    for name, path, empty in (("maps", "/wiki/List_of_maps", map_page()), ("weapons", "/wiki/Weapons", "<table></table>"),
                              ("cosmetics", "/wiki/Cosmetic_items", '<h2>List of cosmetic items</h2><ul></ul>'),
                              ("unusuals", "/wiki/Unusual", unusual_page())):
      for html in ("<html>Maintenance page</html>", empty):
        with self.subTest(name=name, html=html), self.assertRaises(ValueError):
          self.pages[path] = html
          self.scrape(name)
        self.assertFalse((self.root / name / "data.json").exists())
