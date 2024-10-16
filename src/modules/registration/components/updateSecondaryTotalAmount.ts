import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { formatCurrency } from "../utils/formatting";

export const updateSecondaryTotalAmount = (secondaryPricingOption: string) => {
  const state = loadState();
  const totalAmountElement = new WFComponent("#secondaryTotalAmount");
  const secondaryOriginalAmountElement = new WFComponent(
    "#secondaryOriginalAmount"
  );
  const secondaryDiscountPill = new WFComponent("#secondaryDiscountPill");
  const secondaryDiscountNumber = new WFComponent("#secondaryDiscountNumber");

  let totalAmount: number | undefined;
  let originalAmount: number | undefined;
  let amountType: string = "";

  switch (secondaryPricingOption) {
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
    default:
      console.warn("Unknown secondary pricing option:", secondaryPricingOption);
  }

  if (state.selected_discount && state.selectedPricingOption === "Deposit") {
    const discountValue = parseFloat(state.selected_discount);
    totalAmount = originalAmount
      ? originalAmount * (1 - discountValue / 100)
      : 0;
    secondaryDiscountPill.setStyle({ display: "block" });
    secondaryDiscountNumber.setText(`${discountValue}%`);
    secondaryOriginalAmountElement.setText(
      `was ${formatCurrency(originalAmount!)} ${amountType}`
    );
    secondaryOriginalAmountElement.setStyle({ display: "block" });
  } else {
    totalAmount = originalAmount;
    secondaryDiscountPill.setStyle({ display: "none" });
    secondaryOriginalAmountElement.setStyle({ display: "none" });
  }

  if (totalAmount !== undefined) {
    totalAmountElement.setText(`${formatCurrency(totalAmount)} ${amountType}`);
  } else {
    totalAmountElement.setText(`$0.00 ${amountType}`);
  }
};
