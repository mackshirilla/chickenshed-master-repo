# Staff order tools — published checkpoint

## Release scope and safety

Published under the approved November 4 rollout after backend coordination: exactly **2 known views and 1 new workflow**. A subsequent friendly confirmation-heading correction published exactly **1 known view**. Publish badge cleared after both. No existing legacy workflow, app permission, credential, Stripe configuration or original checkout amount was changed by this agent.

The only record write by this agent was the explicitly authorized **TEST source order 5** current-balance test: $30 and reason `TEST balance edit; no money received`. Root verified canonical current balance 3000 cents, original paid 2500 cents and original balance 7500 cents unchanged, actor `webdev@chickenshednyc.org`, and no validation error. No real payment was made. The later test confirmation outcome is recorded below when verified.

## Registration Orders list and Overview

- Readable **Items** binds `items_display`; technical item_summary remains hidden and unchanged.
- List filter exact status = paid OR review OR manual OR manual_review; archived test records are excluded.
- **Create manual order** entry enabled.
- Friendly Checkout status formula preserves website `Checkout confirmed`, review `Needs review`, manual `Staff-recorded order`, manual_review `Manual order needs attention`.
- **Current balance** replaces the original checkout-balance snapshot in list and overview. New Noloco computed field **8505052**, `currentBalance`, formula `IF(ISBLANK({{currentBalanceCents}}), {{balanceAfterCheckoutCents}}/100, {{currentBalanceCents}}/100)`, DECIMAL currency $ precision 2. Original Remaining balance formula remains unchanged.
- Overview adds read-only Recorded payment, Recorded payment method, Payment reference, Needs attention, Confirmation status, Last confirmation attempt. Original paid amount remains read-only.

## Manual order creation

`/registration-orders/new` shows required Parent, Registration total ($), Amount received ($, default 0), native Payment method dropdown; optional Payment reference and Staff notes. Instructions explain that no card is charged, then add student registrations and send confirmation when ready. Button: **Create manual order**. Public form remains OFF.

Hidden create-only values:

- status = manual
- checkout_policy = staff_manual_v1
- owner_user = Form values.manual_parent.uuid (Xano source user ID, not Noloco internal id)
- manual_created_by = Logged in User.email

No reference/attempt/quote/Stripe/paid-cents/source fields are entered by staff; root backend generates and validates metadata. No new order was created through this form by this agent.

## Optional order relationship on manual enrollment

`/session-registrations/new`: Registration order (optional), not required, no default, create-new OFF. Display current order_reference. AND filters:

1. checkout_policy = staff_manual_v1
2. status = manual
3. manual_parent = Record.student.parent_user (typed Users relationship)

Existing Approved/Pending student selection, parent derivation, Program/Workshop/Session cascade, required Session/Student/Status and historical subscription preservation remain intact. No registration was created by this agent.

## Narrow Edit order

Independent **Update a record → This record** modal. It does not reuse the Create form and has **no** status/policy/owner/Create markers, original totals/paid cents, provider IDs or quote fields enabled.

Only enabled fields:

- Current balance ($) → staff_balance_amount, optional
- Reason / payment reference → staff_balance_note, required
- Hidden staff_balance_updated_by → Logged in User.email
- Staff notes → staff_notes
- Payment follow-up → billing_followup
- Staff reviewed → handled

Modal title Edit order. Help: No card is charged. Allow a minute for balance updates. Actual rendered modal was inspected before submitting the test-only $30 write. Both website and manual orders use this narrow action. Current balance is staff-recorded, not a charge or automatic reconciliation of Stripe activity.

## Confirmation request

New workflow **86445**, **Resend registration confirmation**, published ON after root verified backend processing. On-demand only; exactly one Update a record action on registration_orders, target Trigger.id, writing resend_requested = true and resend_requested_by = User.email. No HTTP endpoint, credential, replay of payment webhook, or reset of the original confirmation ledger.

**Send confirmation** is a modal action bound to86445, Internal users / All existing roles, exact status paid OR manual. No global permissions changed. Modal previews dynamic parent_email and says: Email only. No card is charged. Manual payments are staff-recorded. Recipient: [parent email]. Friendly title Send registration confirmation?. Success notification: Confirmation requested; usually sent within a minute.

Root backend validates parent, linked registrations, documented manual totals, cooldown and dispatch ledger. Root installed private queue processing every60 seconds because datasource writes may bypass Xano database triggers. Source status/error/time fields are read-only in staff Overview. A request toast is not delivery confirmation.

## Verification results

- Fractional verification caught a Noloco INTEGER formatter truncating2025 cents to20 dollars. Corrected only computed output types to DECIMAL, preserving formulas, IDs and source snapshots: Current balance8505052, Paid amount8497170, Remaining balance8497171. All three schema-readback as DECIMAL currency$precision2; TEST5 currentBalanceCents2025 now computed20.25. Existing integer formatter values were recalculated, not edited as financial source data.
- After root SUBMITREADY and live frontend/background processing verification, submitted exactly ONE published confirmation request on TEST source order5 to the explicitly authorized `mack@bigstachedesign.com` recipient, at approximately2026-11-05 05:24UTC. Modal displayed the correct parent address, friendly heading and email-only/no-charge wording; request completed and modal closed. No retry. Noloco/source readback confirmed resend_requested=false, Confirmation sent, actorwebdev@chickenshednyc.org, last_resend_at2026-11-05T05:24:35.009Z. Refreshed published Overview visibly showed Confirmation sent and11/5/2026 12:24AM. Root verified email audit775, SENT, successfulSends1, provider HTTP202 to the authorized Mack recipient. This is provider acceptance; this agent did not inspect the recipient inbox. No repeated request.
- Latest published Overview readback shows fresh Current balance **$17.25**, original Amount paid **$25.00**, Staff-recorded order and readonly status fields. This verifies Decimal display and the fresh background tick, with original snapshots protected.

## Final cleanup and label verification

Root archived TEST source order5 and its linked TEST registration1821 after the single provider-accepted confirmation; no permanent deletion. Final label correction changed only the existing Overview timestamp label to **Last confirmation attempt**, because last_resend_at is set when an attempt starts, including failed attempts. Clean baseline had no draft count; published exactly **1 known view**, then Publish badge had no count. Published full-view readback showed Last confirmation attempt beside Confirmation sent. No additional email was sent. No pending Noloco drafts remain from this work.
