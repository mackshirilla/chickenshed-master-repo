// src/manageSubscription/components/manageSubscriptionSummary.ts

import { WFComponent } from "@xatom/core";
import { loadState } from "../state/manageSubscriptionState";

/**
 * Recalculates and updates the subscription summary:
 * - Aggregates current subscription line-item totals
 * - Applies any discount (financial aid)
 * - Updates the UI elements for the subscription total and original amount, appending the billing period suffix
 */
export function updateSubscriptionSummary(): void {
  // 1) Aggregate current line items from the DOM
  const lineTotals = Array.from(
    document.querySelectorAll("#subscription_line_items_list .line_item_total")
  ).map(el => {
    const text = (el.textContent || "").replace(/[^0-9.]/g, "");
    return parseFloat(text) || 0;
  });
  const subtotal = lineTotals.reduce((sum, amt) => sum + amt, 0);

  // 2) Get discount percentage and billing period from state
  const state = loadState();
  const discountPercent = state.apiData?.financial_aid?.selected_discount || 0;
  const periodType = state.updateSubscriptionType || state.apiData?.subscription_type || "month";
  const suffix =
    periodType === "year" ? "/year"
    : periodType === "semester" ? "/semester"
    : "/month";

  // 3) Compute discounted total
  const discountAmount = subtotal * (discountPercent / 100);
  const totalAfterDiscount = subtotal - discountAmount;

  // 4) Update UI elements
  const totalEl = new WFComponent("#subscription_total");
  const origEl = new WFComponent("#subscription_original_amount");
  const pillEl = new WFComponent("#subscription_discount_pill");
  const appliedEl = new WFComponent("#subscription_discount_applied");

  if (discountPercent > 0) {
    appliedEl.setText(`${discountPercent}%`);
    pillEl.getElement().style.display = "block";
    origEl.setText(`was $${subtotal.toFixed(2)} ${suffix}`);
    origEl.getElement().style.display = "block";
  } else {
    pillEl.getElement().style.display = "none";
    origEl.getElement().style.display = "none";
  }

  // Always update the subscription total display with suffix
  totalEl.setText(`$${totalAfterDiscount.toFixed(2)} ${suffix}`);
}
