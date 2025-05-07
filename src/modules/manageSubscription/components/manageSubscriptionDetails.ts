import { WFComponent } from "@xatom/core";
import { loadState } from "../state/manageSubscriptionState";
import type { ManageSubscriptionResponse } from "../types";

/**
 * Renders the basic subscription details section:
 *  - Status (with "Trial" shown as "Scheduled")
 *  - Billing cycle
 *  - Financial Aid Requested (True/hidden)
 *  - Financial Aid Applied (percentage/hidden)
 */
export function manageSubscriptionDetails(): void {
  const state = loadState();
  const subscription: ManageSubscriptionResponse = state.apiData!;

  // --- Status ---
  const statusText =
    subscription.status.toLowerCase() === "trial"
      ? "Scheduled"
      : subscription.status;
  new WFComponent("#status").setText(statusText);

  // --- Billing Cycle ---
  const cycle = state.updateSubscriptionType || subscription.subscription_type;
  new WFComponent("#subscriptionType").setText(cycle);

  // --- Financial Aid ---
  const finAid = subscription.financial_aid;
  const hasAid = finAid?.selected_discount != null && finAid.selected_discount > 0;

  const reqWrap = document.querySelector(
    "#finAidRequestedWrap"
  ) as HTMLElement | null;
  const reqEl = new WFComponent("#finAidRequested");
  const appliedWrap = document.querySelector(
    "#finAidAppliedWrap"
  ) as HTMLElement | null;
  const appliedEl = new WFComponent("#finAidApplied");

  if (reqWrap && appliedWrap) {
    if (hasAid) {
      reqEl.setText("True");
      reqWrap.style.display = "flex";

      appliedEl.setText(`${finAid!.selected_discount}%`);
      appliedWrap.style.display = "flex";
    } else {
      reqWrap.style.display = "none";
      appliedWrap.style.display = "none";
    }
  } else {
    console.error("manageSubscriptionDetails: missing financial aid selectors");
  }
}
