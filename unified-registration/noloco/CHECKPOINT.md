# Noloco staff draft checkpoint — November 4, 2026

## Approved live completion

Mack approved the live cutover and personally published the prior draft. On resuming, the editor had one existing unpublished view; it was preserved. Root installed the four approved production fields and the order 3 → aid 74 relationship before these bindings were made. Supported Xano **Queue schema sync** completed successfully.

- Noloco synced `paymentPreference` 8504915, `coveredTerms` 8504916, `billingFollowup` 8504917 and `financialAidSubmission` 8504918 (proper MANY_TO_ONE relationship).
- Added computed text field **Payment option** (`paymentOption`, 8504920), using the supported Noloco formula builder and verified schema formula:
  `IF({{paymentPreference}} = "full", "Pay in full", IF({{paymentPreference}} = "semester", "Pay per semester", IF({{paymentPreference}} = "monthly", "Monthly payments", "")))`.
  It does not write back to Xano or change payment preference values.
- Published list adds **Payment option** and **Payment follow-up** to the existing six friendly columns. All eight headers and columns fit the desktop full view. Preserved the user's current **Registration Orders - NEW** and **All Subscriptions - LEGACY** navigation labels.
- Published Overview shows **Payment option**, **Registration coverage**, **Payment follow-up**, and **Financial aid submission**. Payment option is a read-only computed value; coverage and aid relationship have inline editing OFF. Payment follow-up has inline editing ON as a simple staff arrangement note/status. No permission or workflow changes.
- Financial aid link explicitly opens the existing **FinAid Submissions** record page. Verified after publication and reload: order 3's link opens source aid 74, displays its existing parent/date title and **Cancelled** status, and has a working back-to-order link. Its status/amount/ownership were not modified.
- Aid list preserves both historical predicates and adds a third OR: **registration_orders from financial_aid_submission collection is not empty**. Verified aid 74 appears despite its ordinary parent/date title.
- Final pre-publication review: **3 views with unpublished changes, zero workflows**. Published under the approved live-cutover authorization with description: “Unified registration staff details: friendly payment option, registration coverage, editable arrangement follow-up and direct financial-aid link. Preserve historical aid visibility and existing shared view draft. No workflow or permission changes.”
- Verified success: Publish button has no count; opening it explicitly says **Your app is up to date**. Published overview was reloaded and verified independently of editor preview. No workflow inspectors were opened in this resumed turn, no workflows run, and no production record/payment/aid edits made by this agent.
- Historical Summer orders have blank payment option/coverage/follow-up because those fields were not backfilled; this is expected, not data loss. New unified orders will populate them. Field labels and direct aid navigation are live now.
- Published order 3 overview left open at https://chickenshednyc.noloco.co/registration-orders/view/3/overview and marked deliverable. Root owns overall website/backend activation and final release verification.

The earlier sections below record the pre-cutover draft state; the completion above supersedes their pending-binding/publication status.

App: `chickenshednyc`, project 16471. Existing Xano production datasource: `xszy-vp96-kdkh/3`. Layout changes are saved **unpublished**. No production records, permissions or live workflows were changed. The connector is read-only (`mcp:read`, `canBuild: false`); layout work used the supported browser editor.

## Saved changes

- Registration Orders sidebar/view name and list heading now cover all programs; record subtitle is **Program registration**.
- List has six current columns: **Payment status**, **Completed on**, **Parent email**, **Staff reviewed**, **Amount paid**, **Remaining balance**. Removed the long technical item summary, duplicate registration badges, staff notes and review-reason columns from the list. Data remains intact.
- Friendly amount fields use the existing currency formulas; raw cents/JSON/provider IDs remain hidden. Staff reviewed remains editable; money/payment status/parent details remain read-only. Row click still opens the record view. Default newest-paid sorting remains; the confusing user-facing `paid_at` sort control is hidden.
- Empty state is **No registration orders to review yet.** Its subtitle explains: **Filter by whether staff have reviewed this order.** Existing handled filter remains; supported editor exposed no view-specific filter-label override.
- Record retains **Overview** and **Registrations** tabs. Overview retains payment date/status/amount/balance, parent email and editable staff notes. Registrations retains linked student/session information and existing registration-status controls. Existing test order 3 and registrations 1817/1818 were not edited.
- Financial Aid Submissions draft filter now accepts legacy subscription-linked submissions **OR** record title containing **`— Order #`**. This preserves old Summer order submissions and includes new generic **Registration — Order #** titles without a program-name list. No aid submission was modified.

## Complete after approved production schema sync

Root is preparing four nullable `registration_orders` fields; these do not yet exist in the production datasource, so no fake bindings were created:

| Xano field | Staff label and behavior |
| --- | --- |
| `payment_preference` | **Payment option**, read-only; show full → Pay in full, semester → Pay per semester, monthly → Monthly payments using a supported formatter/formula after sync. |
| `covered_terms` | **Registration coverage**, read-only. |
| `billing_followup` | **Payment follow-up**, simple clear arrangement status; may be staff-managed if supported. No billing automation or amount changes. |
| `financial_aid_submission_id` | **Financial aid submission**, read-only clickable relationship to the existing familiar aid record; omit/empty when none. |

Add Payment option and Payment follow-up to the compact list and the arrangement details plus aid link to Overview. Verify actual Noloco camelCase field names after sync. Preserve permissions. Root's reviewed backfill links existing order 3 to existing same-parent aid 74; do not create duplicate aid or change its amount/status/ownership. The durable aid-list predicate can then include the direct reverse order relationship while retaining historical fallback.

## Narrow legacy workflow check

- **43148 — Session Registration Created**, ON, trigger: `session_registrations` record created. Steps: Add comment → **Only continue if Trigger.subscription Is not empty** → Add comment. New order-linked rows without subscriptions do not pass that guard. No email, charge or subscription-creation action.
- **44393 — sync session details**, ON, trigger: `session_registrations` updated, watches **session** only. One Update a record action targets the same triggering row and copies workshop/program/location and display name/weekday/time fields from session. No payment/email/subscription action. UI states this update does not trigger other workflows.
- Other subscription approval/email/cancel/waitlist items inspected in the sidebar are on-demand button workflows. `emails_sent` creation email workflow 43427 is OFF. No workflow was tested or run.
- During inspection, the action-type popover overlapped Done and inadvertently selected **Delete a record** for draft step 2 of 43148. This was caught before publication, restored through the supported editor to the original **Only continue if → Trigger.subscription → Is not empty**, and verified in the publication review: **zero workflow differences**. No live workflow or record was affected. Do not publish a workflow difference; expected release review is views only.

## Publication facts

- Final verified review: **3 unpublished changes, all 3 views**; no workflow changes. The initial editor had 2 unpublished views; the aid-list edit added the third. A pre-existing unrelated view draft remains preserved.
- The supported publication dialog supplies only aggregate changed-view counts; no names, owner, object diff or selective publish is exposed. Page context menu only provides clone/hide/delete. No unrelated draft was discarded, overwritten or published.
- Latest published rollback point: **version 173**, Mack Shrilla, 17:25, description: “Summer registration orders, linked student/session placements and financial-aid review. Preserve the current shared draft.” No version was restored/reverted.
- Official history documentation describes whole-app publication/rollback, not selective view publication: https://guides.noloco.io/settings/publishing/app-version-history . Reverting editor would overwrite shared unpublished work and was not used.
- Draft editor left open at https://chickenshednyc.noloco.co/registration-orders in Chickenshed Chrome profile, child tab 1052236069, session **Staff registration views**. It is marked as a deliverable. Root must obtain the bundled release approval and install/sync schema before the four bindings above can be completed and published.
