# Staff actions follow-up — November 4, 2026

Completed under Mack's approved routine Noloco staff cleanup. Only known intended views were published: an initial **2 views**, then **1 view** to reliably commit the short editing instructions. Both publication reviews showed views only, no workflow changes. Publish returned to a clean count after each publication. No permissions were changed; no records, orders, charges, emails or workflow runs were created/executed.

## Payment wording

- Added Noloco-only computed text field `checkoutStatus` (8505009): `IF({{status}} = "paid", "Checkout confirmed", IF({{status}} = "review", "Needs review", {{status}}))`.
- Replaced raw status display in the Registration Orders list and Overview highlights with **Checkout status**. Underlying source status remains unchanged.
- List balance label is **Order balance**. Overview label is **Balance after checkout**. Existing Payment option and editable Payment follow-up remain.
- Verified published order 4 after reload: Checkout confirmed, Balance after checkout $1,969, Amount paid $0, Monthly payments, Needs arrangement. This is consistent with a confirmed discounted checkout plus outstanding tuition; it is not a claim that all tuition was paid.
- The balance is the confirmed order snapshot. Later staff Stripe charges do not automatically reconcile it, and future unpriced semester payments are excluded. No payment ledger was added. This qualification must remain clear in staff handoff; the attempted highlight help text did not have an independently verified live readback, so do not claim the long caveat appears on the page.

## Manual registration form repaired

Published path: `/session-registrations/new`.

- Removed only the obsolete Student option filter `parent_user = Record.subscription.user`; retained student Status **Approved or Pending**.
- Removed the Program option filter `id = Invalid item`.
- Hid Subscription from manual entry. Historical subscription links and records were preserved.
- Exposed registration Status, retaining the safe existing **Draft** default. Student, Session and Status are required.
- Kept Program and Workshop because existing cascading Session options depend on them. Without saving any form/record, verified **Players → Players 1/2/3/4 → Players 2 → CP2 Fridays/Tuesdays/Saturdays** choices load correctly.
- Kept existing hidden `parent_user = Form values.student.parent_user`; parent is correctly taken from the selected child rather than independently mismatched.
- Verified retained hidden `product = Form values.session.Tuition_product`; no subscription dependency. Existing hidden session/program/workshop display defaults and legacy derived-session workflow remain unchanged.
- Live reloaded form visibly shows Student, Program, Workshop, Session and Status, no Subscription. The published help states: **The parent is taken automatically from this student profile. This records enrollment only; it does not collect payment.** Save remains disabled until required fields are filled. No Save was pressed.
- Manual enrollment does not create a payment order, collect/record payment, send the new order confirmation or guarantee the order-linked dashboard treatment. Backend checkout eligibility/price validation is not a substitute for staff judgment when entering manual enrollments.

## Existing registration edit path

- Order 4 Registrations list already has directly editable Active status controls for the current Web Development admin.
- Clicking its day/time row link opened `/session-registrations/view/1820/details`. That existing registration page has **Edit** and **Edit Record**; entering edit mode without changing values showed editable Status, Student, Parent, Program, Workshop, Session and other legacy fields. No value was changed or saved.
- Student and Session relationship links navigate to the student profile and session respectively. This explains why users can appear to land on the wrong record when trying to edit a registration.
- Published **Student registrations** heading and verified visible subtitle after reload: **Change status here, or click a row’s day or time to open the registration. Choose Edit, then Edit Record for other changes.** No new workflow/action or permission expansion was needed.
- A specific non-admin staff account's permissions were not impersonated or changed. The current admin path works; if another staff account remains blocked, identify that role/account and inspect the existing rules rather than broadening access speculatively.

## Manual orders and resending

- Registration Orders list creation remains disabled. These payment records are created by the validated checkout/confirmation backend; raw manual creation would require fabricating payment provenance, quote/snapshot/source fields and could misstate confirmed payment. Manual **enrollment** is now available separately. An offline financial-order flow requires a separate, explicit design (amount, payment source/reference, approval and confirmation behavior), not a generic Add record form.
- No receipt/confirmation resend field exists on the order table. Root verified the current send-confirmation backend uses an idempotent claim ledger: rerunning it does not resend already accepted messages. Do not reset that journal or replay a payment webhook to resend mail.
- Small future feature: explicit staff-authorized **Resend registration confirmation** action with recipient preview, audit record and normal rate/duplicate protection. Stripe receipt resend is a separate provider action for an actual payment; a $0 checkout may have no charge receipt. No emails were sent in this cleanup.

Published order 4 Registrations view was left open and marked deliverable. No frontend/Stripe files were edited by this agent.
