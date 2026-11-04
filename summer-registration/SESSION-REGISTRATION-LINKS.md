# Summer session-registration links

Implemented and verified in the existing Xano sandbox on November 4 after Mack approved this extension. Production schema/code and Noloco publication remain unchanged. The earlier read-only assessment is retained below as design context.

## Current result

- Sandbox `session_registrations` table **44** has one optional nullable `registration_order_id` relation to `registration_orders`, plus a unique order/student/session index. Existing field definitions were preserved. Production table **14** still awaits that reviewed migration.
- Canonical paid fulfillment creates the placement rows inside the existing order transaction. Each row has real student, parent, program, session, workshop, location and tuition-product references; it starts **Pending** regardless of whether payment was full tuition or deposit. Xano stores the empty optional subscription reference as `0`; no subscription is created. No additional payment or email action is introduced.
- The approved real Stripe-test order **12** was deliberately linked in the sandbox to registrations **1/2**. One row was changed to **Waitlist** to simulate staff work. Two concurrent replays preserved that status and kept exactly those same IDs.
- A separate synthetic paid transition, order **13**, created registrations **3/4**, both Pending and correctly linked to students **1/2** and sessions **64/65**. The synthetic unpaid order **14** has zero registrations. The existing financial-aid retry/cancel/reapply/privacy check still passed with the new fulfillment code. No provider requests, email or real charges were made by these checks.
- All **22** local tests passed. The final nine-function production pack compiled in the sandbox behind closed runtime/blocked customer routes, along with blocked copies of the two new legacy query exclusions. API 241's blocked predicate copy omits unavailable old response addons; the production candidate preserves them. Local exact-predicate checks preserve regular/Labs results while excluding Summer. **52** non-Summer source documents remained byte-for-byte unchanged; only the intended session table was changed outside Summer resources.

The production changes are prepared under `release/session-links/manifest.json`: the table migration and narrow exclusions for published APIs **176/241**. No production checkout code or table was changed. The live runtime guard remains closed.

## Noloco release dependency

Noloco is connected to production workspace 3, not this sandbox. Its schema cannot expose the new reverse order relationship until production table 14 receives the nullable column and Noloco syncs it. The actual linked collection therefore remains a release step, not a completed staff UI. Keep the existing draft and permissions intact; once synced, add an order-related registrations list with clickable student/session fields and status editing. Do not expose order money/JSON fields as editable or publish the unrelated shared draft. The existing order click action remains **Nothing** pending that wiring; the inspection-only Open panel change was reverted.

The original TEST order copy in production table 65 remains untouched. Never link it to sandbox numeric student IDs. No production backfill was performed.

## Confirmed fit

The existing `session_registrations` table already has student, parent, program, workshop, session, location and product relationships. Its subscription reference is optional, and existing one-time Lab registration code writes rows without a subscription. Noloco reads this as `xanoSessionRegistrations` (229950). The existing statuses include Pending, Deposit Paid, Active, Waitlist, Cancelled and Archived. The Summer order already preserves the selected student/session IDs in its canonical quote; what is missing is a relational enrollment record and a staff navigation link.

Noloco's current All Session Registrations page has student/parent/program/workshop/session/location filters. Two enabled table workflows were inspected without running or editing them: **Session Registration Created** (43148) contains comments and a condition; **sync session details** (44393) watches the session relationship and copies descriptive session fields to the row. No billing/webhook action appears in those workflows. Read-only production Xano metadata currently reports zero workspace triggers. These observations do not inventory unrelated external integrations.

## Implemented design and remaining staff wiring

1. Add one nullable `registration_order_id` relation on existing `session_registrations`, referencing `registration_orders`. Preserve the existing student/session references. This gives an order many registrations and a student their actual registrations without replacing either table.
2. During canonical confirmed-payment fulfillment, create one registration per order child/session selection. Use the saved canonical quote and canonical session details, never client-provided names or IDs without ownership validation. Keep subscription fields empty and program Summer Shed; do not invoke the legacy registration/subscription checkout or billing finalizer.
3. Start rows as **Pending** for staff review, with the order supplying full-payment/deposit/balance facts. Keep placement status separate from payment status; staff can choose Active/Waitlist/Cancelled without automatically collecting a balance or changing the student profile's approval status. Ensure Pending is visible in the related staff list at release.
4. Serialize fulfillment with the existing order lock, reuse existing rows on payment-event replay, and never reset a staff-edited status. Use an order/student/session key, preferably a nullable-compatible unique index, rather than a loose student-only match. Link insertion should commit with the canonical order fulfillment so a partial failure is retryable. Do not create registration rows for unpaid, abandoned or mismatched/review payments.
5. Give the Summer order a simple related registrations list in Noloco, with clickable student/session links and editable placement status. Preserve other order/accounting fields and existing staff permissions. Ensure Pending rows are visible there even if the existing global list filters omit them.

Orders remain the payment/balance record; registrations remain the child/session placement record. No balance collection, subscription lifecycle, new email, or wider accounting feature is needed.

## One required isolation detail

The current published frontend API 176 includes Active rows with `subscription_id == 0`, and student-profile API 241 includes Active/Paused rows. Existing student registration cards build subscription-oriented detail URLs. Merely inserting Summer rows and later marking them Active could surface them through those older screens. For the smallest staff-focused bridge, explicitly exclude Summer from those legacy customer queries (or deliberately route to the Summer receipt); don't assume a null subscription alone isolates them. Review the affected queries and ownership checks before deploying this addition. Existing regular/Labs results must stay intact.

## Focused validation

Use the existing sandbox family: paid mixed-family order creates exactly two correctly linked rows; no unpaid order creates rows; replay creates no duplicates and preserves a staff-edited status. Verify the Noloco related list and existing regular/Labs query isolation. Do not attach the production TEST copy to numeric sandbox student IDs: source IDs across environments are not interchangeable. Existing order 12 may be used for a deliberate sandbox-only backfill check, never an automatic production backfill.

Evidence: `evidence/session-registration-links.json`, `evidence/session-link-paid-transition.json`, `evidence/session-link-release-validation.json`, `evidence/session-registration-link-assessment.json`, published source copies under `evidence/session-links-source/`, and final native source under `xano/session-link-readback/`. The native probe is sandbox-only and must never be deployed.
