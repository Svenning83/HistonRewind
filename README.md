# Histon Rewind

A dependency-free website for a family-run tape conversion and photo scanning service in Histon, Cambridgeshire.

## Preview locally

Run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.
Run the basic content and asset checks with `python -B -m unittest discover -s tests -v`.

## Before publishing

- Add the confirmed business email to `CONTACT_EMAIL` near the top of `script.js`. Until then, the enquiry form only prepares a message to copy; it does not send or store enquiries. With an email set, it opens the visitor's email app rather than sending through a server.
- Replace the illustrations in `assets/` and the illustrative comparison in `index.html` with real, customer-approved video and image samples. The current artwork is deliberately labelled as illustration, not actual restoration work.
- Replace the "customer stories coming soon" note with genuine testimonials only after getting permission to publish them.
- Confirm the wording about local handover, returning originals, supported tape formats, printed photographs and digital-file delivery before launch.

The prices shown are GBP 10 per tape and GBP 0.40 per individual negative or slide. If prices change, update both `index.html` and the pence-based calculation in `script.js`.
