# Histon Rewind

A dependency-free website for a family-run tape conversion and photo scanning service in Histon, Cambridgeshire.

## Preview locally

Run `python -m http.server 8000` in this folder, then open `http://localhost:8000`.
Run the basic content and asset checks with `python -B -m unittest discover -s tests -v`.

## Before publishing

- The form posts over HTTPS to FormSubmit, a third-party service that forwards enquiries to `histonrewind@gmail.com`. Before sharing the site, submit a test enquiry from the published page, open the FormSubmit activation email in that Gmail inbox and confirm the address, then send a second test enquiry and verify it arrives (including checking spam). We have not sent a test or activated the address here. Visitors can also email the address directly.
- FormSubmit processes visitors' names, email addresses, optional phone numbers and messages. Review its terms/privacy practices and add an appropriate privacy notice before collecting customer data.
- Replace the illustrations in `assets/` and the illustrative comparison in `index.html` with real, customer-approved video and image samples. The current artwork is deliberately labelled as illustration, not actual restoration work.
- Replace the "customer stories coming soon" note with genuine testimonials only after getting permission to publish them.
- Confirm the wording about local handover, returning originals, supported tape formats, printed photographs and digital-file delivery before launch.

The prices shown are GBP 10 per tape and GBP 0.40 per individual negative or slide. If prices change, update both `index.html` and the pence-based calculation in `script.js`.
