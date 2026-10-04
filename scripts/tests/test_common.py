import io
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import requests
from PIL import Image
from urllib3.exceptions import ReadTimeoutError
from urllib3.response import HTTPResponse

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
import common


def response(content=b"ok", status=200):
  result = requests.Response()
  result.status_code = status
  result._content, result._content_consumed = content, True
  result.url = common.WIKI_URL + "/wiki/Test"
  return result


def png_bytes(*, animated=False, image_format="PNG", size=(2, 2)):
  buffer = io.BytesIO()
  image = Image.new("RGBA" if image_format == "PNG" else "RGB", size, "red")
  options = {"save_all": True, "append_images": [Image.new("RGBA", size, "blue")], "duration": 100} if animated else {}
  image.save(buffer, format=image_format, **options)
  return buffer.getvalue()


class CommonTests(unittest.TestCase):
  def setUp(self):
    temporary = tempfile.TemporaryDirectory()
    self.addCleanup(temporary.cleanup)
    self.root = Path(temporary.name)
    self.enterContext(patch.object(common, "OUTPUT_ROOT", self.root))
    self.enterContext(patch.object(common, "_last_request", None))
    self.enterContext(patch.object(common.time, "sleep"))
    self.enterContext(patch.object(common, "log"))

  def test_session_timeout_and_shared_throttle(self):
    with patch.object(common.SESSION, "get", return_value=response()) as get, \
         patch.object(common.time, "monotonic", side_effect=[10, 10.25, 11]):
      common.request_wiki("/wiki/Test")
      common.request_wiki("/wiki/Other")
    get.assert_called_with(common.WIKI_URL + "/wiki/Other", timeout=(10, 30))
    common.time.sleep.assert_called_once_with(0.75)
    self.assertIn("TF2DLE", common.SESSION.headers["User-Agent"])

  def test_urls_and_offhost_redirects_rejected_before_fetch(self):
    self.assertEqual(common.wiki_url("Other", common.WIKI_URL + "/wiki/Test"), common.WIKI_URL + "/wiki/Other")
    with patch.object(common.SESSION, "get") as get:
      for url in ("https://evil.example/Test", "//evil.example/Test", "http://wiki.teamfortress.com/Test", "../Te\nst"):
        with self.assertRaises(ValueError):
          common.request_wiki(url)
      get.assert_not_called()
    redirect = HTTPResponse(status=302, headers={"Location": "https://evil.example/Test"}, body=io.BytesIO(b""))
    with patch("urllib3.connectionpool.HTTPSConnectionPool._make_request", return_value=redirect) as send:
      with self.assertRaises(ValueError):
        common.request_wiki("/wiki/Test")
      send.assert_called_once()

  def test_http_retries_and_retry_after_are_bounded(self):
    replies = [HTTPResponse(status=503, body=io.BytesIO(b""), headers={"Retry-After": "1000"}) for _ in range(3)]
    with patch("urllib3.connectionpool.HTTPSConnectionPool._make_request", side_effect=replies) as send:
      with self.assertRaises(requests.HTTPError):
        common.request_wiki("/wiki/Test")
      self.assertEqual(send.call_count, 3)
    self.assertEqual([call.args[0] for call in common.time.sleep.call_args_list], [60, 60])
    with patch.object(common.SESSION, "get", return_value=response(status=404)) as get:
      with self.assertRaises(requests.HTTPError):
        common.request_wiki("/wiki/Test")
      get.assert_called_once()

  def test_transport_timeout_retries_are_bounded(self):
    with patch("urllib3.connectionpool.HTTPSConnectionPool._make_request", side_effect=ReadTimeoutError(None, "/wiki/Test", "timeout")) as send:
      with self.assertRaises(requests.ConnectionError):
        common.request_wiki("/wiki/Test")
      self.assertEqual(send.call_count, 3)

  def test_final_response_url_checked(self):
    reply = response()
    reply.url = "https://evil.example/Test"
    with patch.object(common.SESSION, "get", return_value=reply), self.assertRaises(ValueError):
      common.request_wiki("/wiki/Test")

  def test_safe_basename_and_atomic_write_failure(self):
    self.assertEqual(common.safe_basename("Scout's Bat.png"), "Scout's Bat.png")
    self.assertEqual(common.safe_basename("[New] <wiki>"), "[New] <wiki>")
    for name in ("../Bat", "a\\b", "Bat\0", ".", "Bat "):
      with self.assertRaises(ValueError):
        common.safe_basename(name)
    path = self.root / "data.json"
    path.write_bytes(b"original")
    with patch.object(common.os, "replace", side_effect=OSError("disk failure")), self.assertRaises(OSError):
      common.atomic_write(path, b"replacement")
    self.assertEqual(path.read_bytes(), b"original")
    self.assertEqual(list(self.root.iterdir()), [path])

  def test_checkpoint_preserves_seed_and_rejects_duplicates(self):
    seed = {"name": "Old", "custom": {"untouched": True}}
    common.save_progress_json("maps", [seed], [{"name": "New"}])
    records, names = common.load_existing_records("maps")
    self.assertIn(seed, records)
    self.assertEqual(names, {"Old", "New"})
    with self.assertRaisesRegex(ValueError, "Duplicate"):
      common.save_progress_json("maps", [seed], [seed])
    common.check_discovery({"Renamed"}, {"Deleted"}, "maps")
    with self.assertRaises(ValueError):
      common.check_discovery({}, set(), "maps")

  def test_png_and_apng_validated_and_saved_unchanged(self):
    for animated in (False, True):
      content = png_bytes(animated=animated)
      common.validate_png(content)
      with patch.object(common, "request_wiki", return_value=response(content)):
        common.download_image("/w/images/Test.png", self.root / "image.png")
      self.assertEqual((self.root / "image.png").read_bytes(), content)
      with Image.open(self.root / "image.png") as image:
        self.assertEqual(image.n_frames, 2 if animated else 1)

  def test_invalid_images_do_not_replace_destination(self):
    path = self.root / "image.png"
    path.write_bytes(b"original")
    for content in (b"<html>Error</html>", png_bytes(image_format="JPEG"), png_bytes()[:40], png_bytes(size=(8193, 1))):
      with patch.object(common, "request_wiki", return_value=response(content)), self.assertRaises(ValueError):
        common.download_image("/w/images/Test.png", path)
      self.assertEqual(path.read_bytes(), b"original")
