import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";

export function updateTotalAmount(
  includeDeposit: boolean,
  subscriptionType: string | undefined,
  depositTotal: number = 0
): void {
  const state = loadState();
  const originalTotal = state.originalSubscriptionTotal || 0;
  const discount = state.selected_discount ? parseFloat(state.selected_discount) : 0;
  const discountAmount = originalTotal * (discount / 100);
  const discountedSubscriptionTotal = originalTotal - discountAmount;

  // If depositTotal is provided (i.e. pending students exist) then that is the due amount.
  const overallTotal = depositTotal > 0 ? depositTotal : discountedSubscriptionTotal;
  const suffix = subscriptionType ? "/" + subscriptionType : "";

  const discountPill = new WFComponent("#subscription_discount_pill");
  discountPill.getElement().style.display = discount > 0 ? "block" : "none";

  const discountApplied = new WFComponent("#subscription_discount_applied");
  discountApplied.setText(discount > 0 ? `${discount}%` : "");

  const originalAmount = new WFComponent("#subscription_original_amount");
  if (discount > 0) {
    originalAmount.setText(`was $${originalTotal.toFixed(2)} ${suffix}`);
    originalAmount.getElement().style.display = "block";
  } else {
    originalAmount.getElement().style.display = "none";
  }

  const subscriptionTotal = new WFComponent("#subscription_total");
  subscriptionTotal.setText(`$${discountedSubscriptionTotal.toFixed(2)} ${suffix}`);

  const overallTotalDisplay = new WFComponent("#total_amount_due");
  overallTotalDisplay.setText(`$${overallTotal.toFixed(2)}`);
}
