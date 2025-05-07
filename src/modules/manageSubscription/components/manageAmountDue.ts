// src/manageSubscription/components/manageAmountDue.ts

import { WFComponent } from "@xatom/core";
import { loadState } from "../state/manageSubscriptionState";
import type { ManageSubscriptionResponse } from "../types";

/**
 * Updates or hides the “Amount Due” container based on payment status,
 * dynamically recalculating from the rendered line items, deposits,
 * and any applied financial aid.
 *
 * - Only shows when status === "Deposit Paid".
 * - Label is always "Amount Due Upon Approval".
 * - amountDue = (sum of current subscription line‑item totals)
 *               − (sum of current deposit totals)
 *               − (financial aid discount on line items).
 */
export function updateAmountDue(): void {
  const state = loadState();
  const subscription: ManageSubscriptionResponse = state.apiData!;

  const container = document.querySelector(
    "#amountDueContainer"
  ) as HTMLElement | null;
  if (!container) {
    console.error("#amountDueContainer not found");
    return;
  }

  // only show when deposit has been paid
  if (subscription.status !== "Deposit Paid") {
    container.style.display = "none";
    return;
  }
  container.style.display = "flex";

  // set static label
  new WFComponent("#amountDueLable").setText("Amount Due Upon Approval");

  // 1) sum up all current subscription line‑item totals in the DOM
  const lineSum = Array.from(
    document.querySelectorAll("#subscription_line_items_list .line_item_total")
  ).reduce((sum, el) => {
    const num = parseFloat((el.textContent || "").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // 2) sum up all current deposit totals in the DOM
  const depositSum = Array.from(
    document.querySelectorAll("#deposit_line_items_list .line_item_total")
  ).reduce((sum, el) => {
    const num = parseFloat((el.textContent || "").replace(/[^0-9.]/g, ""));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  // 3) compute financial aid discount
  const discountPercent =
    state.apiData?.financial_aid?.selected_discount ?? 0;
  const discountAmount = (lineSum * discountPercent) / 100;

  // 4) compute final due
  const amountDue = Math.max(0, lineSum - depositSum - discountAmount);

  // 5) render amount due
  new WFComponent("#total_amount_due_next_invoice").setText(
    `$${amountDue.toFixed(2)}`
  );
}
