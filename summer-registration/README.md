> Live release status and current operations: [LIVE-RELEASE.md](LIVE-RELEASE.md). Historical candidate notes below are retained for context.

# Summer registration release candidate

This branch adds two distinct Summer routes to the existing xAtom application. The existing header app script owns all logic; the Webflow page footers contain only the Summer styles and disabled configuration. Remove the earlier standalone Summer inline scripts when installing these footers, so the page has one controller. Enable only in the reviewed production release.

Run `npm run test:summer` and `npm run build`. Xano deployment source is under `xano/`; do not bulk promote the sandbox or include probes/test fixtures. The optional order-link column may already exist for the approved Noloco draft, but its unique index and the production code still require release review. No test-model source is a deployment entry point.

No code is pushed, tagged, published or activated by this local build. See the release checklist; live Stripe coupons/webhook/configuration and reviewed Webflow/Noloco publication remain separate release steps.
