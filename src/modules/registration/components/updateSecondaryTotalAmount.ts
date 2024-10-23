// updateSecondaryTotalAmount.ts
import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { formatCurrency } from "../utils/formatting";

export const updateSecondaryTotalAmount = () => {
  const state = loadState();
  const secondaryTotalAmountElement = new WFComponent("#secondaryTotalAmount");
  const secondaryOriginalAmountElement = new WFComponent("#secondaryOriginalAmount");
  const secondaryDiscountPill = new WFComponent("#secondaryDiscountPill");
  const secondaryDiscountNumber = new WFComponent("#secondaryDiscountNumber");

  const selectedPricingOption = state.selectedPricingOption;
  let secondaryOriginalAmount: number | undefined;
  let secondaryAmountType: string = "";

  switch (selectedPricingOption) {
    case "Annual":
      secondaryOriginalAmount = state.checkoutPreview?.annual_amount_due;
      secondaryAmountType = "Per Year";
      break;
    case "Monthly":
      secondaryOriginalAmount = state.checkoutPreview?.monthly_amount_due;
      secondaryAmountType = "Per Month";
      break;
    case "Pay-Per-Semester":
      secondaryOriginalAmount = state.checkoutPreview?.semester_amount_due;
      secondaryAmountType = "Per Semester";
      break;
    default:
      console.warn("Unknown pricing option:", selectedPricingOption);
  }

  if (state.selected_discount && secondaryOriginalAmount !== undefined) {
    const discountValue = parseFloat(state.selected_discount);
    const discountedTotal = secondaryOriginalAmount * (1 - discountValue / 100);
    secondaryDiscountPill.setStyle({ display: "block" });
    secondaryDiscountNumber.setText(`${discountValue}%`);
    secondaryOriginalAmountElement.setText(
      `was ${formatCurrency(secondaryOriginalAmount)} ${secondaryAmountType}`
    );
    secondaryOriginalAmountElement.setStyle({ display: "block" });
    secondaryTotalAmountElement.setText(`${formatCurrency(discountedTotal)} ${secondaryAmountType}`);
    console.log("Applied discount to secondary total.");
  } else {
    // No discount applied
    if (secondaryOriginalAmount !== undefined) {
      secondaryTotalAmountElement.setText(`${formatCurrency(secondaryOriginalAmount)} ${secondaryAmountType}`);
    } else {
      secondaryTotalAmountElement.setText(`$0.00 ${secondaryAmountType}`);
    }
    secondaryDiscountPill.setStyle({ display: "none" });
    secondaryOriginalAmountElement.setStyle({ display: "none" });
    secondaryDiscountNumber.setText("");
    console.log("No discount applied to secondary total.");
  }
};
