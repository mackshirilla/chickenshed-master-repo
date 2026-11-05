# Unified registration staff views

Work in the existing app as an unpublished draft. Do not publish other saved drafts or change permissions.

The list should show: Parent / family, Registration date, Payment option, Amount paid, Balance remaining, Payment follow-up, Staff reviewed. Open a row to the familiar record view.

The record view should keep two tabs:

- **Overview**: amount paid, balance remaining, payment status and date; Payment option, Registration coverage, Payment follow-up; clickable Financial aid submission when present; Parent email and Staff notes.
- **Registrations**: linked Student, Program/workshop/session, session dates/time and Registration status. Preserve existing status editing and navigation to student/session records.

Use friendly payment values: `full` → Pay in full, `semester` → Pay per semester, `monthly` → Monthly payments. Full-pay-only items in a mixed cart keep their own full-payment price; the order choice describes the arrangement for items offering plans. Semester order balances exclude unpriced future semester charges, so the follow-up flag is needed even with a zero order balance.

Use the proper `financial_aid_submission_id` relationship being prepared by the backend, never expose `aid_intake` JSON or household intake on the order overview. The linked familiar aid record retains the submission fields and status workflow. No financial-aid link is shown for orders without aid. Preserve visibility of legacy subscription-related aid and Summer order aid; include unified order-linked submissions after schema sync.

Hide raw cents, JSON, internal IDs, attempt keys, provider payloads, quote fingerprints and technical event data. Keep payment amounts/status and the linked aid relationship read-only here; keep staff notes and intended registration-status controls editable.

Production currently lacks `payment_preference`, `covered_terms`, `billing_followup` and the new aid reference. Draft bindings for these can only be completed after approved Xano schema installation and Noloco schema sync. Do not create fake fields or alter production records to make the preview appear complete.
