# Summer registration live release — November 4, 2026

The Summer bridge is live at https://www.chickenshednyc.org/summer-camp-registration. This note supersedes the historical candidate/release-plan wording in this folder.

Frontend release: v.1.0.12. Initial launch was v.1.0.10; v.1.0.11 removed the redundant floating “Summer registration” notice. The v.1.0.12 update adds correct free-coupon receipt wording and coupon fulfillment. The shared header loads the versioned `dist/app.js`; regular registration and Labs bundles remain unchanged.

Families can add multiple children. Approved students pay tuition less selected financial aid; Pending students pay the existing $100 deposit per child. Archived students are unavailable. Aid applies to tuition, not deposits. A confirmed order creates linked session registrations in Pending status for staff review and the familiar financial-aid record when requested. Staff can open Registration Orders in Noloco and use its Registrations tab.

With no financial aid, Stripe Checkout accepts valid promotion codes, including 100%. Codes follow their existing Stripe restrictions and cannot stack with aid. The canonical Stripe line-item discount is allocated to each child and recorded separately from aid. A coupon credits the amount being paid at checkout: covering a Pending student's deposit does not forgive their remaining tuition. Free completed orders create registrations and send confirmation even when Stripe creates no PaymentIntent. Receipts show coupon discount and “No payment required.”

Live email uses the ordering account's email and `testMode:false`, not the sandbox's fixed test recipient or `[TEST]` subject. SendGrid confirmation is separate from a Stripe payment receipt. No-cost orders do not produce a card charge.

## Release targets

- GitHub: mackshirilla/chickenshed-master-repo, main and codex/summer-registration-bridge.
- Production worktree used for clean builds: `/Users/mackshirilla/Documents/Codex/2026-11-03/task-4/summer-release`.
- Original `/Users/mackshirilla/chickenshed-master-repo` checkout deliberately remains on its earlier local HEAD with unrelated unfinished regular-payment fixes. Do not reset or blindly pull over that work; integrate it separately.
- Xano workspace 3, live branch v1, Summer group 64, canonical `summer26`. Production functions 332–340; APIs 788–792. API base: `https://xszy-vp96-kdkh.n7c.xano.io/api:summer26/summer`.
- Runtime flags: `summer_runtime_mode=live`, `summer_checkout_enabled=true`, `summer_confirmation_email_enabled=true`. Existing production Stripe/SendGrid credentials are reused privately. No credential values belong in Git.
- Live Stripe endpoint `we_1UYBtJDK5b8P0zFQ3HJjNGyW`, destination `/summer/payment-events`, handles completed, async success/failure and expired Checkout events. Existing endpoints remain intact.
- Existing Summer products 73–76, sessions 64–66, program 13; one-time live prices used without changing Lab classification. Financial-aid coupons are limited to the three tuition products.
- Legacy isolation patches: APIs 281, 304, 284, 290, 176 and 241. Labs APIs 344, 345 and 347 were not changed.
- Webflow published only to both custom domains. Its webflow.io staging host intentionally retains an older version and is not the current test destination. Success URL: `/checkout-success/summer-camp-success`.
- Noloco: internal staff Registration Orders list/detail with Registrations tab and inline registration status editing. The existing automatic Send Email workflow 43427 stays off; the Summer backend sends its own confirmation.

## Validation

28 focused model tests, integrated registration/receipt DOM checks, actual production bundle build, and a genuine Stripe test-mode 100% Checkout passed. Test order 15 in the existing Xano sandbox recorded $0 paid, $900 coupon discount, $1,500 remaining tuition for the Pending child, two linked registrations (5 and 6), and no duplicates on replay. SendGrid accepted one confirmation (202). The private finalizer retrieved the actual Stripe Session; the previously verified signed receiver was unchanged. No real money was charged. The user's own live 100% test remains the final customer walkthrough.

## Test-data cleanup and rollback

Keep these clearly labeled production test rows for review until cleanup is requested: registration_orders 2; synthetic student_profiles 460/461; session_registrations 1815/1816 linked to order 2. Delete only those identified test rows when ready, respecting relationships. Do not delete genuine orders or staff decisions.

To pause new registrations, set `summer_checkout_enabled=false`; optionally disable the Summer page config. Keep runtime, receipt and signed webhook fulfillment available for in-flight orders. Preserve paid orders, registration links and legacy isolation guards. Roll back only the specific Summer resource or versioned frontend if needed; do not restore an entire Noloco/Webflow draft or bulk-promote a sandbox. Before/after source hashes and snapshots are retained in the local bridge evidence folder.
