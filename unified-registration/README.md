# Unified registration — unpublished build

This branch extends the working Summer order flow to Players, MLA and Labs. It is a sandbox prototype and coordinated release candidate, not an instruction to deploy or change the live header script.

The gate is `#registration-orders-config` JSON with `enabled: true`. Without that gate, the existing production registration/Summer/Lab routes retain their previous behavior. Production transport accepts only the canonical production host/API and forbids a sandbox tenant; the loopback preview accepts only the existing sandbox tenant. No test credential is included in this repository.

## Current behavior

Products offering only Single sale are full-pay-only; their carts show no payment preference field. Adding a product with Semester and/or assigned Deposit options reveals the required select. That preference applies only to products offering plans; full-pay-only items remain full pay. Semester is one-time, monthly collects the assigned per-line deposit for staff follow-up, and Annual/Monthly price fields are never used by new checkout.

Aid applies to eligible tuition including Labs, with no automatic aid on deposits. The backend checks each Lab student's Active Players 2/3/4 coverage or qualifying same-cart registration that will become Active. Profile approval alone, Pending registrations and sibling membership do not qualify.

Confirmed orders create linked session registrations, use current Approved/Pending profile status, preserve staff changes on replay, and reuse familiar aid submissions, owned receipts, email and dashboard. Cards are saved with Stripe for off-session staff arrangements for full, semester and monthly paid checkouts. A first saved card becomes a new customer's invoice default; existing defaults are preserved. Free checkouts do not claim to collect a card.

## Validation

Run `npm run test:registration`, `npm run test:summer`, and `npm run build` from the repository root. The evidence folder records genuine Stripe test checkouts, canonical Xano fulfillment, signed-event replay and one accepted SendGrid confirmation. No real funds moved. Source/predicate checks of legacy guard candidates are distinct from production deployment tests. Focused delayed-response checks verify disabled checkout, stale-response rejection, one request on repeated clicks, locked checkout controls, and recovery after failures. Backend reservation rejects an outdated payment-plan fingerprint.

`tools/generate-unified-xano.mjs` and `tools/generate-unified-email.mjs` regenerate the sandbox pack from `test-model`. They are local code generators and do not call Xano, Stripe or SendGrid. They reuse the proven Summer scaffold; run the unified generators only. `account_GET.xs` and `resources_GET.xs` are maintained alongside the generated routes.

## Release prerequisites

Read [PLAN.md](PLAN.md). Review the live catalog corrections and session mappings before activation. Semester is a payment arrangement, not a separate date-bounded enrollment; use actual registered session dates for Lab eligibility, and flag later semester payments for staff follow-up. No academic semester dates are required. Current Lab products intentionally have only Single sale pricing. Do not invent missing plan prices. CP2 Saturdays needs its existing verified one-time full price mapped into Single sale; Lab product 38 has an incorrect Stripe product ID; conflicting/ended Acting Lab rows need review.

The `xano/sandbox` pack uses test keys, fictional-fixture guards, test-only Stripe validation and local/staging return URLs. **Do not promote it to production.** The separate local `xano/production-candidate` pack defaults closed and references existing live credentials without reading or copying them. It still requires isolated compilation, release review and approval; it has not been deployed. Regenerate it with `node unified-registration/tools/prepare-production-candidate.mjs`. Reconcile additive `payment_preference`, `covered_terms`, `billing_followup` order fields with live schema. Follow [RELEASE.md](RELEASE.md) for cutover and rollback, preserving current Summer policy/receipts.

Apply reviewed `xano/legacy-guards` candidates only as part of that coordinated release. They protect Checkout/PaymentIntent handling, close legacy creation routes under `unified_registration_enabled`, and exclude order-backed rows from subscription views. Published source hashes must match the manifest before any changes. Preserve old in-flight orders and unrelated drafts.

Webflow page/configuration/slug/redirect changes, a versioned asset release, and Noloco bindings/publication still require the final coordinated release review. The unrelated existing Noloco draft must not be accidentally published. No subscriptions are cancelled or migrated here.

The local walkthrough lives at `http://127.0.0.1:4817/registration-test` while the temporary server/login and Stripe test listener are running. Use fresh fictional profiles `TEST Final Approved Child` and `TEST Final Pending Child`. Never open files through `file://`.
