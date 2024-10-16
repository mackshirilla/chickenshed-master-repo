import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { formatCurrency } from "../utils/formatting";

export const updateTotalAmount = () => {
  const state = loadState();
  const totalAmountElement = new WFComponent("#primaryTotalAmount");
  const primaryOriginalAmountElement = new WFComponent(
    "#primaryOriginalAmount"
  );
  const primaryDiscountPill = new WFComponent("#primaryDiscountPill");
  const primaryDiscountNumber = new WFComponent("#primaryDiscountNumber");

  let totalAmount: number | undefined;
  let originalAmount: number | undefined;
  let amountType: string = ""; // To hold the type of amount (e.g., "Per Year")

  switch (state.selectedPricingOption) {
    case "Annual":
      originalAmount = state.checkoutPreview?.annual_amount_due;
      amountType = "Per Year";
      break;
    case "Monthly":
      originalAmount = state.checkoutPreview?.monthly_amount_due;
      amountType = "Per Month";
      break;
    case "Pay-Per-Semester":
      originalAmount = state.checkoutPreview?.semester_amount_due;
      amountType = "Per Semester";
      break;
    case "Deposit":
      originalAmount = state.checkoutPreview?.deposit_amount_due;
      amountType = ""; // Deposit might not need a period label
      break;
    default:
      console.warn("Unknown pricing option:", state.selectedPricingOption);
  }

  if (state.selected_discount && state.selectedPricingOption !== "Deposit") {
    const discountValue = parseFloat(state.selected_discount);
    totalAmount = originalAmount
      ? originalAmount * (1 - discountValue / 100)
      : 0;
    primaryDiscountPill.setStyle({ display: "block" });
    primaryDiscountNumber.setText(`${discountValue}%`);
    primaryOriginalAmountElement.setText(
      `was ${formatCurrency(originalAmount!)} ${amountType}`
    );
    primaryOriginalAmountElement.setStyle({ display: "block" });
  } else {
    totalAmount = originalAmount;
    primaryDiscountPill.setStyle({ display: "none" });
    primaryOriginalAmountElement.setStyle({ display: "none" });
  }

  if (totalAmount !== undefined) {
    totalAmountElement.setText(`${formatCurrency(totalAmount)} ${amountType}`);
  } else {
    totalAmountElement.setText(`$0.00 ${amountType}`);
  }
};
