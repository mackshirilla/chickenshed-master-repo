# Unified registration build plan

Updated November 4, 2026 with the product-option, Labs, saved-card, and semester-payment clarifications. Implementation is authorized in the existing sandbox and local repository. This is not permission to publish, promote, modify production, or cancel/migrate existing subscriptions.

## Result

Extend the working Summer order-based flow to Players, My Little Adventure and Labs. Reuse the new Webflow registration/success designs, order-linked session registrations, aid submissions, SendGrid confirmation and simplified staff view. Keep the dashboard shell and useful student/resources/history pages. No new workspace or registration system.

## Checkout rules

- Every product can be full-pay-only. A cart containing only full-pay-only products shows no payment preference select.
- Reveal a required, initially unselected payment preference when a selected product offers plan options. It applies only to items offering those options; full-pay-only items remain full pay in the same cart. Offer only options supported by all selected items with plans.
- Full pay reads Single_sale_price_id. Semester reads the explicitly assigned, verified one-time Semester_price_id. Monthly records the preference and collects the line's assigned Deposit product Single_sale_price_id for staff follow-up. Never use Annual or Monthly fields in the new checkout, create subscriptions, or invent prices. Semester is a payment arrangement against the registered session, not a separate date-bounded enrollment; no academic semester dates or automatic Semester 1/2 selection are required. Its order covers the assigned one-time semester amount, and later semester payments are flagged for staff follow-up without inventing their dates or total.
- Configured deposits are per line. A Pending student pays an assigned deposit where configured; Approved monthly also pays that deposit. Pending plus monthly charges it once. A full-pay-only product without a deposit collects full tuition.
- Aid coupons are created/reused automatically for the current cart’s charged tuition products; no fixed product list or coupon-ID environment map. Customer-entered coupons follow their Stripe configuration with no added product restriction.
- Aid applies to eligible tuition, including Labs. It does not automatically discount deposits. Keep the existing intake and linked aid submission. No-aid checkout permits coupons, including 100%; a discounted deposit does not erase unpaid future tuition.
- Keep Summer's current package/deposit behavior. A regular-program payment preference never changes Summer's package payment.
- Save the payment method for future off-session staff charges on every paid checkout: full, semester, monthly, Summer and Labs. Reuse the family's Stripe Customer or have Checkout create one, then link the canonical customer to the existing contact/order. Stripe Checkout supplies the saved-card notice; do not repeat it on the registration page. Staff arrangements remain manual. Do not overwrite existing subscription payment defaults as an incidental side effect. A $0/no-payment checkout may collect no card; do not claim one was saved.

## Labs eligibility

Eligibility is checked on the backend for each student, independently of the parent's memberships and other children:

1. The student has an Active Players registration in workshop CP2, CP3 or CP4 whose verified coverage contains the Lab's complete session-date range; or
2. The same cart contains that student's qualifying Players item covering the Lab dates and it will become Active after confirmed checkout.

Approved profile alone, Players 1, MLA, a sibling's registration, Pending/Paused/Trial/Waitlist registration, and the wrong term do not qualify. Recheck fresh eligibility during fulfillment before inserting registrations. If it changes while Checkout is open, retain the confirmed payment for staff review and do not activate the Lab automatically.

Labs have no special exclusions from aid or payment rules. Their current catalog has only Single sale prices and no assigned deposits/semester prices, so those particular items offer full pay only. This is an intended capability, not a missing-feature blocker. If a Lab is later explicitly configured with valid plan prices, the generic checkout supports it without a Lab-specific pricing branch.

Use canonical session/workshop IDs and dates, not a product name or a global subscription boolean. Order-backed Players coverage comes from the paid order's recorded session dates. Legacy Active enrollment uses its owned linked session dates for every billing cadence. A payment cadence does not shorten registration coverage. Missing, mismatched or non-covering session dates still fail eligibility; never infer enrollment coverage from a billing charge date.

## Records and fulfillment

After canonical Stripe payment confirmation (including valid zero-total completion), create one order-linked session registration per child/session. Current Approved profiles start Active; Pending profiles start Pending. Preserve existing staff status changes on repeated events, and prevent duplicate email/registration fulfillment.

Keep registration_orders with minimal additive preference, covered_terms and billing_followup fields. Keep per-line price, aid, coverage and deposit facts in the saved quote. Parent endpoints enforce ownership and omit private aid intake, internal payloads and payment credentials. Save only Stripe IDs; card details remain at Stripe.

The old Lab flow checked a family subscription flag and created Pending registrations before payment. Its legacy success handler activates all registrations matching a Checkout Session. At release, route new Lab entries to unified registration, stop old creation routes from accepting new orders, and have legacy Checkout/PaymentIntent handlers recognize the new canonical policy. Preserve old in-flight orders and subscription history; do not fulfill new policy orders through both handlers. Generalize legacy dashboard exclusions by registration_order_id.

## Catalog and term verification

Already verified read-only against Stripe:

- Ten regular Semester prices are active, USD, one-time. Five assigned regular deposit products are valid.
- CP2 Saturdays needs its existing verified one-time price mapped into Single sale before activation. No Annual runtime fallback.
- Eight Lab Single sale prices are active USD one-time. Product 38 has an incorrect Xano Product_id; canonical Stripe product is recorded in the audit.
- Acting Lab session/product names disagree for sessions 26/27, and session 27 dates are already past. Exclude ended Labs and resolve customer-facing catalog conflicts before activating those rows.
- Lab Semester/deposit mappings are absent: expose these as full-pay-only products. No new production prices are needed merely to unify checkout.

Mack chose to omit academic semester dates. No new semester-date field or cutoff is needed. Keep valid session dates for enrollment and Lab coverage; they are independent of the payment arrangement.

## Page, email, dashboard and staff changes

Use the new pages/designs, with general names/slugs at release. Keep grid layout, spacing, edit/colored delete controls, stable summary height, loading feedback, profile-required dialog, aid form and zero-total success handling. Add the conditional product-driven payment select in its own bento card with clear spacing. Success items each use a separate bento card with gaps; Register another child uses the site button style. Retain a clear per-line summary. Show the familiar blue notice for selected Pending students, with their names, review status and deposit-credit explanation; hide it when none remain. Long program/workshop/session/student text wraps within its column instead of overlapping adjacent fields.

Reuse general order confirmation and one branded email. Correct recipient comes from the owned order in production; sandbox email is restricted to mack@bigstachedesign.com and is marked TEST. Only paid/fulfilled orders send; uncertain sends are reviewed rather than blindly retried.

My registrations shows student/session, covered term, actual staff-controlled status, owned order details, amount paid and manual follow-up. Active registrations retain owned class-resource links. Register remains available to existing subscribers. Keep legacy subscription billing/history access; do not route new order-backed records through subscription editing/cancellation.

Noloco keeps the short payment summary and Registrations tab, student/session links and status controls. Add preference/covered term/billing follow-up bindings only once additive production fields exist. Preserve the unrelated existing Noloco draft; do not publish it inadvertently.

## Focused validation and release

1. Correct Single sale/Semester/assigned Deposit amounts; per-line deposits; mixed Approved/Pending statuses; no recurring-price fallback.
2. Full-pay-only cart hides plan selector; adding an item with plans reveals it. Mixed preference and aid allocate correctly, including full-pay-only Labs.
3. Labs: qualifying levels, ownership, sibling/Pending/wrong-term rejection, same-cart Active qualification and fresh fulfillment check.
4. Canonical zero-total coupon confirmation, replay preservation, owned receipt/dashboard, one linked aid record and one email.
5. Genuine positive-amount Stripe test checkout verifies the card is attached to the correct Customer and the contact/order link is retained. Test full/semester/monthly request configuration; do not treat a free coupon as card-save proof.
6. Regression smoke check of current Summer flows, legacy subscription/history/resources, canonical event isolation and legacy Lab orders. No large test-suite expansion. Checkout stays visibly disabled until the newest quote is ready; stale responses cannot unlock it, the cart locks while Checkout opens, and the server rejects a stale fingerprint.

Mack performs a complete non-production walkthrough and reviews customer email and parent/staff records before a coordinated release. Release prerequisites include reviewed catalog corrections/session mappings, canonical policy isolation, saved-card staff workflow verification, additive production schema/configuration, versioned repository assets, Webflow page/config/redirect changes and safe Noloco publication. None of these is permission to deploy now.

Rollback closes new checkout first but keeps in-flight fulfillment and owned receipts available. Restore only changed frontend/configuration/routes; retain orders, registrations, customer links, staff decisions and unrelated drafts.
