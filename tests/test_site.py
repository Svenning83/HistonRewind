from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.duplicate_ids = []
        self.anchors = []
        self.assets = []
        self.submit_buttons = []
        self.text = []

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        identifier = attrs.get("id")
        if identifier:
            if identifier in self.ids:
                self.duplicate_ids.append(identifier)
            self.ids.add(identifier)

        href = attrs.get("href", "")
        if href.startswith("#"):
            self.anchors.append(href[1:])

        if tag in ("img", "script", "link"):
            asset = attrs.get("src") or href
            if asset and not asset.startswith(("#", "http:", "https:", "data:")):
                self.assets.append(asset)

        if tag == "button" and attrs.get("type") == "submit":
            self.submit_buttons.append(attrs)

    def handle_data(self, data):
        self.text.append(data)


class SiteSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = PageParser()
        cls.page.feed((ROOT / "index.html").read_text(encoding="utf-8"))

    def test_internal_links_and_ids(self):
        self.assertEqual(self.page.duplicate_ids, [])
        self.assertEqual(sorted({anchor for anchor in self.page.anchors if anchor not in self.page.ids}), [])

    def test_local_assets_and_svg_files(self):
        self.assertEqual([asset for asset in self.page.assets if not (ROOT / asset).is_file()], [])
        for image in (ROOT / "assets").glob("*.svg"):
            with self.subTest(image=image.name):
                ET.parse(image)

    def test_prices_and_formats_are_visible(self):
        text = " ".join(self.page.text)
        for expected in ("Histon Rewind", "VHS", "Hi8", "Digital8", "£10", "40p"):
            with self.subTest(expected=expected):
                self.assertIn(expected, text)

    def test_brand_and_scroll_features(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "script.js").read_text(encoding="utf-8")
        styles = (ROOT / "styles.css").read_text(encoding="utf-8")
        self.assertNotIn("History" + " Rewind", html + script)
        for feature in ('class="scroll-progress"', 'class="comparison-range"', 'class="cassette-reel"'):
            self.assertIn(feature, html)
        self.assertIn('setAttribute("aria-valuenow"', script)
        self.assertIn(".cassette.is-playing .cassette-reel", styles)
        self.assertIn(".comparison-after img { filter:", styles)

    def test_enquiry_cannot_submit_without_javascript(self):
        self.assertEqual(len(self.page.submit_buttons), 1)
        self.assertIn("disabled", self.page.submit_buttons[0])


if __name__ == "__main__":
    unittest.main()
