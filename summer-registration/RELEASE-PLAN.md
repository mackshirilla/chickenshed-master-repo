# Minimal Summer Shed release and rollback

The current nine-function production candidate is prepared locally and compiled only behind blocked sandbox routes. It is **not deployed or enabled**. Mack's personal sandbox order 12 remains $900 paid / $1,500 remaining. Linked Pending session registrations now pass native sandbox checks; their production table migration and Noloco relationship display remain release steps. Noloco's unrelated draft is preserved. See [SESSION-REGISTRATION-LINKS.md](SESSION-REGISTRATION-LINKS.md).

## What passed

- Three original isolation candidates (281, 304, 284), plus unchanged Labs 344/345/347, compiled as separate, execution-blocked sandbox APIs. Thirteen essential sandbox regression checks passed: regular and Labs selectors/payloads, canonical Summer rejection, subscriber access to Summer, mixed amounts and no-aid full pay, accounting-policy handling, authentication boundaries and the closed old issuer. Provider/accounting spies stop legacy probes before real effects. This is not a full hosted legacy checkout test. See `evidence/isolation-regression-result.json`.
- The final nine production Summer functions and five customer APIs compiled in the same existing sandbox. Their separate live runtime gate remained closed. Four local mode/signature/disabled-page/receipt checks passed; no production credentials or services were used. The final production payload uses Dashboard-managed payment methods and disables invoice creation. See `evidence/session-link-release-validation.json` and `evidence/production-candidate-local-check.json`.
- Read-only Stripe dashboard review confirmed all four existing live webhook destinations. It exposed one necessary additional isolation patch: 290 `sales/payment-succeeded` always adds a legacy sale and attempts to save a default payment method. Its Summer guard now has a blocked sandbox compilation and three local policy/preservation checks. No actual canonical live PaymentIntent call or production delivery was executed. See `evidence/payment-intent-isolation-check.json`.
- Earlier isolation validation left all original documents unchanged. The latest approved extension changes only the session-registration table outside Summer resources; 52 non-Summer documents remained byte-for-byte unchanged. Never promote the validation scaffolding or fictional fixtures.

The earlier genuine signed Stripe **test** payment, cancel/resume, owned receipt and canonical finalizer replay evidence remains in `TEST-PAYMENT-RESULT.md`. Mack's later personal checkout and actual SendGrid Inbox delivery are documented in `EMAIL-CONFIRMATION.md`. Latest link checks create exactly two Pending placements on a synthetic paid transition, zero on an unpaid order, and preserve staff status during concurrent replays.

## Exact proposed production scope

1. **Add the isolated adapter and relation:** API group `Summer Registration`, canonical `summer26`, five APIs (`summer/start`, `quote`, `checkout`, `receipt`, `payment-events`) and nine `summer_live_*` functions from `release/production-candidate/manifest.json`. Reuse production order table 65. Add one nullable `registration_order_id` field and the reviewed order/student/session unique index to existing session-registration table **14** before deploying the referring code. Paid fulfillment creates Pending placements and the separate Summer confirmation. No subscription or student-profile status change; no public staff API. The additive schema and its original hash are in `release/session-links/manifest.json`; recheck current source before editing.
2. **Apply six narrow existing-handler/query patches:** 281 excludes canonical Summer program 13; 304 resolves each requested Session and rejects Summer before Stripe or registration writes; 284 acknowledges canonical Summer Checkout policy before generic accounting/fulfillment; 290 acknowledges explicitly marked, canonically retrieved live Summer PaymentIntents before legacy sale/default-method writes. Also apply 176/241's Summer exclusions from `release/session-links/manifest.json` before enabling new placements, protecting older customer subscription detail routes. The original accounting/selector manifests are under `release/isolation-candidate/`. Labs 344/345/347 remain unchanged. Never merge the obsolete checkout-test branch.
3. **Create only missing Stripe resources:** keep the four verified existing live one-time prices ($800/$1,600/$2,200 and $100 deposit). Create five once-only aid coupons (10/20/35/50/75%) restricted to the three tuition products; preserve shared coupons and exclude the deposit. Create the dedicated signed destination `https://xszy-vp96-kdkh.n7c.xano.io/api:summer26/summer/payment-events`, version `2025-01-27.acacia`, for completed, async success, expired and async failure events. Exact unexecuted payloads are in `release/live-setup-plan.json`.
4. **Configure privately, closed first:** reuse existing production Stripe/SendGrid key references without exporting their values. Securely place the new live signing secret in `summer_stripe_webhook_secret` and coupon IDs in `summer_stripe_coupon_ids`. Verify the production sender and that Noloco's create-on-emails_sent sender remains off or excludes Summer; enable `summer_confirmation_email_enabled` only at approved release. `summer_runtime_mode` must equal `live`; `summer_checkout_enabled` stays false until approved launch. No test keys or tenant headers.
5. **Wire the familiar pages:** origin `https://www.chickenshednyc.org`; registration `/summer-camp-registration`; receipt `/checkout-success/summer-camp-success`. Local production bundles/configuration are under `release/production-frontend/`, saved **enabled=false**. Preserve Mack's copied design/nav/footer and existing `auth_config.token` contract. Review Webflow's full pending publication scope before publication.
6. **Sync the relation and finish the staff list, then review publication:** `/registration-orders` is built and restricted to existing internal Team Admins. After the production column syncs, add the order's related session registrations list with clickable student/session links and editable placement status. Include Pending rows; keep order financial fields read-only and preserve current permissions. Do not connect the production TEST copy to sandbox student IDs. Noloco currently has four changed views including unrelated work; no selective publish route was verified. Publish only the fully reviewed shared draft.

The Summer source still needs integration into the original Git project, with its existing dirty work preserved, followed by a versioned build/release and the reviewed Webflow script update. The isolated folder is not a pushed Git release.

Summer receipts and staff accounting intentionally use `registration_orders` and Stripe. They do not populate the old All Sales views. Later balance collection is manual for this short bridge.

## Supported application path

Do not enable disabled direct bulk pushes. Do not promote the whole sandbox, a partial multidoc release with unverified replacement semantics, or the obsolete branch. Xano documents resource-level XanoScript editing and API draft publication in its normal builder: [API editor](https://docs.xano.com/building/logic/apis), [XanoScript editor](https://www.xano.com/learn/build-with-code-in-xano-using-xanoscript). After explicit release approval, use those supported resource editors for only the manifest-listed objects and patches, checking current source/drafts for conflicts before saving/publishing. This path has not been executed or verified against the current production editor permissions. If unavailable, stop and resolve that specific deployment method; do not substitute a bypass.

## Minimal release checks

Before activation, compare the four published source hashes to the saved originals and review any intervening drafts. Confirm current production catalog/student fields and order-table indexes without broad secret/data exports. Confirm Stripe live receipt settings read-only; do not send a customer email or make a real payment as part of preparation.

After approved setup, keep checkout closed while checking source/mode/configuration, authenticated owner-only start/quote/receipt and ordinary regular/Labs selection. A normal Summer quote should preserve mixed $620/$940 and no-aid $800/$0 behavior. Any actual charged smoke test needs its own specified authorization; no real charge is authorized here. At launch, verify first legitimate Summer order against Stripe, signed event, owned receipt and Noloco sync. Avoid a large new test suite.

## Rollback

Set `summer_checkout_enabled=false` and disable Summer registration first. Keep `summer_runtime_mode=live`, signed event processing, signing-secret configuration and owned receipts available to reconcile Checkout Sessions already opened. Preserve all paid orders and payment references.

Keep the Summer exclusions in 281/304 and customer queries 176/241 while Summer placements exist; removing them can reopen old selectors/detail routes. Keep the 284/290 acknowledgements while outstanding Summer events can arrive. Preserve the link column, paid orders, placement rows and staff status edits. Restore a legacy resource only from its exact reviewed backup after reconciliation, not by whole-branch promotion. No need to change Labs.

Hide the Summer staff page if necessary while preserving records and internal restrictions. Do not revert the entire Noloco draft or Webflow site to overwrite another builder's work. Disable a new webhook only after pending delivery/reconciliation is complete; do not delete payment history or shared Stripe resources.

## Approval still needed for release

Current scope is sandbox implementation and release preparation. Eventual live release covers the nine functions/five APIs/group, additive session-registration schema, six exact legacy patches, tuition-only live coupons, dedicated live webhook and secure secret placement, environment activation and reviewed Webflow/Noloco publication. Shared Noloco publication depends on reviewing unrelated work. No production checkout code/configuration, live Stripe resources, publication or payments were changed by this extension.


## Summer aid compatibility update — November 4

See [FINANCIAL-AID.md](FINANCIAL-AID.md) for the existing-table submission bridge. Summer checkout now prepares one linked financial-aid submission per aided family order, with retry/update/cancel behavior. The existing Noloco FinAid Submissions filter is updated in draft to include Summer titles alongside its original subscription-linked condition. No production aid rows or checkout code were changed; no publication occurred. Noloco now shows four pending view changes; its unrelated draft still requires review before whole-draft publication.


## Summer confirmation update — November 4

See [EMAIL-CONFIRMATION.md](EMAIL-CONFIRMATION.md) for the now-working SendGrid confirmation, nine-function production candidate, test-only sender setup, actual Inbox delivery and exact Noloco review/cleanup records. Mack’s personal test was $900 paid / $1,500 remaining with no aid selected. Sandbox order 12 and mail journal 2 match the clearly marked Noloco source order 2. Production checkout code and publication remain unchanged. Current local test expiry: 20:48:39 UTC / 3:48 PM Eastern.
