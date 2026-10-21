# Histon Rewind

A dependency-free website for a family-run tape conversion and photo scanning service in Histon, Cambridgeshire.

## Preview locally

Run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.
Run the basic content and asset checks with `python -B -m unittest discover -s tests -v`.

## Before publishing

- The form posts over HTTPS to Formspree at `https://formspree.io/f/mljgqowe`. JavaScript shows an on-page confirmation only after Formspree accepts the enquiry, or an uncertain-delivery warning if the request fails/times out. Without JavaScript, the form posts normally and Formspree displays its own confirmation. `thank-you.html` is retained but is no longer the form's redirect target.
- Confirm the Formspree form delivers to `histonrewind@gmail.com`. After publishing, send a test enquiry and check both the on-page confirmation and the inbox (including spam). We have not sent a test from here. The direct email link remains available.
- Formspree processes visitors' names, email addresses, optional phone numbers and messages. Review its terms/privacy practices and add an appropriate privacy notice before collecting customer data.
- Replace the illustrations in `assets/` and the illustrative comparison in `index.html` with real, customer-approved video and image samples. The current artwork is deliberately labelled as illustration, not actual restoration work.
- Replace the "customer stories coming soon" note with genuine testimonials only after getting permission to publish them.
- Confirm the wording about local handover, returning originals, supported tape formats, printed photographs and digital-file delivery before launch.

The prices shown are GBP 10 per tape and GBP 0.40 per individual negative or slide. If prices change, update both `index.html` and the pence-based calculation in `script.js`.
