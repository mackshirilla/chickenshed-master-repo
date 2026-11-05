# Explicit monthly payment availability

Released November 5, 2026, with Mack’s approval.

Sessions now has one boolean: `Offer_monthly_payments`, default `false`. Monthly availability requires this field to be true and a mapped deposit price. The existing full-only rules for Summer Shed and short Mini Adventure blocks remain. Semester availability still comes from its assigned one-time price. Pending students’ per-line deposits are independent of the checkbox.

Existing intended monthly choices were retained for Sessions 1–9 and 19. Current Labs, Mini blocks and Summer remain unchanged. No Stripe products, prices, credentials or previous orders were changed.

Noloco: synchronized Xano schema and published the single Sessions record-view change. The Edit Record tab now has the editable “Offer monthly payments” checkbox and explanatory help text. Publication reported “Your app is up to date”; a separate live view showed the enabled checkbox for CP2 Saturdays. No unrelated view changes were pending.

Validation: local catalog/quote regression checks cover monthly off, missing flag, missing deposit, Pending deposit, approved tuition, semester, monthly on, and Mini/Summer full-only choices. Live read-only quotes confirmed Players full/semester/monthly amounts and Mini Pending deposit with monthly off. No payments, emails or new orders were created.

Both live catalog endpoint 793 and authoritative quote-context function 344 were narrowly patched and read back. Existing Webflow JavaScript already consumes explicit server payment options; no new script tag was required. The local generator and candidate sources match the rule.

Rollback: restore the two saved pre-change native sources in the operator evidence directory to return to prior inference; leave the additive checkbox field and stored values intact. Removing or clearing the checkbox field is unnecessary. Do not alter Stripe or confirmed orders.

The fourth pricing/setup guide is a private native Google Doc, with a source copy in `staff-guides/pricing-and-setup.md`.
