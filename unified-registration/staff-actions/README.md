# Staff registration orders

This additive feature keeps website checkout, original payment snapshots and automatic initial confirmations intact. Staff actions use the existing Noloco/Xano datasource. There is no new public endpoint, API key, card charge or subscription creation.

## Staff flow

1. Create a manual order with Parent, registration total, amount already received outside the website, payment method/reference and notes. The parent’s Xano source ID comes from the relationship UUID, not Noloco’s internal record ID. Backend validation generates a friendly order reference and records the source as `staff_manual_v1`, status `manual`. Invalid details remain `manual_review` with a visible reason.
2. Add Session Registrations and optionally select that parent’s manual order. The picker excludes website checkout orders and other parents. Original parent/student/session ownership is checked again before confirmation. Source dates, program/workshop and Active status determine Lab eligibility; a Pending registration does not qualify.
3. Edit an order’s **Current balance**, reason/payment reference, staff notes, payment follow-up or reviewed flag. No Create form defaults are reused in the Edit form. Original checkout amounts, payment IDs, status, source and owner stay protected. Balance changes record the applied from/to amounts, reason, staff email and timestamp. This records staff’s asserted balance; it does not reconcile later Stripe payments automatically or execute a charge.
4. Send confirmation after current registrations are linked. Both website and manual orders use staff confirmation copy with the current recorded balance and student statuses. Manual copy explicitly identifies payment information entered by staff. Parent dashboard links remain authenticated. No per-student payment allocation is invented for manual totals.

## Processing and safety

- Metadata-based datasource writes do not reliably invoke Xano table triggers. Private task **registration_staff_queue**, source live, runs every 60 seconds and calls `registration_staff_process_queue_v1`. Allow approximately a minute for validation/dispatch, plus the app’s data refresh. The task normalizes eligible orders, skipping unchanged rows, then handles explicit send requests. It never automatically emails solely because an order or registration exists.
- Native table triggers provide immediate refresh for ordinary runtime database changes. The worker covers staff datasource writes. Xano omits `active = true` when exporting the default, so absence of that clause must not be read as disabled.
- Confirmation requests use `resend_requested=true` and the logged-in staff email. The server consumes them under an order lock, makes a distinct `emails_sent` audit entry, coalesces pending requests, limits dispatch frequency and leaves uncertain delivery for review. It never clears the original confirmation journal or replays payment fulfillment.
- A changed balance requires a non-negative two-decimal amount, reason and staff attribution. Parent/student mismatch and invalid manual totals block confirmation. Original paid/order policy/snapshot data are never fabricated as a Stripe payment.
- `registration_staff_validate_delivery_v1` always uses SendGrid sandbox mode and does not deliver mail. Valid website and manual payloads returned HTTP 200. The actual Noloco test edit changed only test order 5’s current balance and preserved its original amounts.

## Source and rollback

`model.mjs` supplies the validation/rendering helpers; `generate.mjs` builds the native sources. `installed.json` identifies additive resources. Function and trigger files are committed for review. Install functions before their references, review task activation separately, and do not bulk-push the workspace. Source table changes are in `schema-current.xs`; customer account changes are in `account_GET.xs` and the updated production candidate. The frontend release handles manual orders without a fabricated Stripe receipt link.

To stop new staff actions, disable Noloco workflow 86445 and the staff queue task, and remove/disable manual creation and dispatch controls. Preserve all orders, registrations, payment snapshots, email journals, current balances and audit entries. Keep customer read models available for already-created manual orders. Existing website checkout/fulfillment and initial confirmations remain separate.
