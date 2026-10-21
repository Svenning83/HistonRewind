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
        self.forms = []
        self.form_fields = []
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

        if tag == "form":
            self.forms.append(attrs)
        if tag in ("input", "textarea") and attrs.get("name"):
            self.form_fields.append(attrs)
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

    def test_live_wordmark_matches_signal_colour_study(self):
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        self.assertEqual(html.count('class="brand-chevrons" aria-hidden="true">&#9666;&#9666;</span>'), 2)
        self.assertEqual(html.count('<span class="brand-name">HISTON<span>REWIND</span></span>'), 2)
        self.assertNotIn('class="brand-mark"', html)
        self.assertIn('aria-label="Histon Rewind, back to top"', html)

    def test_enquiry_posts_to_form_provider_without_javascript(self):
        self.assertEqual(len(self.page.forms), 1)
        self.assertEqual(self.page.forms[0]["action"], "https://formspree.io/f/mljgqowe")
        self.assertEqual(self.page.forms[0]["method"], "POST")
        self.assertTrue({"name", "email", "phone", "message", "_gotcha"}.issubset(
            {field["name"] for field in self.page.form_fields}
        ))
        self.assertFalse({"_subject", "_next", "_honey", "_captcha"} & {
            field["name"] for field in self.page.form_fields
        })
        for field in self.page.form_fields:
            if field["name"] in ("name", "email", "message"):
                self.assertIn("required", field)
        self.assertEqual(len(self.page.submit_buttons), 1)
        self.assertNotIn("disabled", self.page.submit_buttons[0])
        html = (ROOT / "index.html").read_text(encoding="utf-8")
        script = (ROOT / "script.js").read_text(encoding="utf-8")
        self.assertIn('href="mailto:histonrewind@gmail.com"', html)
        self.assertIn("Your details are sent to Formspree", html)
        self.assertIn("We aim to reply to all enquiries within 48 hours.", html)
        self.assertIn('id="enquiry-status" role="status" aria-live="polite" hidden', html)
        self.assertNotIn('id="enquiry-success"', html)
        self.assertIn('enquiryForm.addEventListener("submit"', script)
        self.assertIn('headers: { Accept: "application/json" }', script)
        self.assertIn("if (!response.ok) throw", script)
        self.assertIn('window.location.assign("thank-you.html")', script)

    def test_thank_you_page_is_local_and_clear(self):
        page = PageParser()
        html = (ROOT / "thank-you.html").read_text(encoding="utf-8")
        page.feed(html)
        self.assertEqual([asset for asset in page.assets if not (ROOT / asset).is_file()], [])
        self.assertIn('href="index.html"', html)
        self.assertIn("Your enquiry has been submitted.", html)
        self.assertIn("We aim to reply to all emails within 48 hours.", html)
        self.assertIn("mailto:histonrewind@gmail.com", html)


if __name__ == "__main__":
    unittest.main()
