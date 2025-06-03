// src/manageSubscription/components/manageSubscriptionSummary.ts

import { WFComponent } from "@xatom/core";
import { loadState } from "../state/manageSubscriptionState";

/**
 * Recalculates and updates the subscription summary:
 * - Aggregates current subscription line-item totals
 * - Applies any discount (financial aid or coupon)
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

  // 2) Get data from state
  const state = loadState();
  const subscription = state.apiData!;
  const discountPercentFromAid = subscription.financial_aid?.selected_discount ?? 0;
  const totalDiscount = subscription.subscription_amount_discount || 0;

  const actualDiscountPercent = subtotal > 0
    ? (totalDiscount / subtotal) * 100
    : 0;

  const isAid = discountPercentFromAid > 0;
  const label = `${actualDiscountPercent.toFixed(0)}% ${isAid ? "Financial Aid" : "Discount"}`;

  const periodType = state.updateSubscriptionType || subscription.subscription_type || "month";
  const suffix =
    periodType === "year" ? "/year"
    : periodType === "semester" ? "/semester"
    : "/month";

  // 3) Compute total after discount
  const totalAfterDiscount = subtotal - totalDiscount;

  // 4) Update UI elements
  const totalEl = new WFComponent("#subscription_total");
  const origEl = new WFComponent("#subscription_original_amount");
  const pillEl = new WFComponent("#subscription_discount_pill");
  const appliedEl = new WFComponent("#subscription_discount_applied");

  if (totalDiscount > 0) {
    appliedEl.setText(label);
    pillEl.getElement().style.display = "block";
    origEl.setText(`was $${subtotal.toFixed(2)} ${suffix}`);
    origEl.getElement().style.display = "block";
  } else {
    pillEl.getElement().style.display = "none";
    origEl.getElement().style.display = "none";
  }

  totalEl.setText(`$${totalAfterDiscount.toFixed(2)} ${suffix}`);
}
