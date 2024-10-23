// updateTotalAmount.ts
import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { formatCurrency } from "../utils/formatting";
import { updateSecondaryTotalAmount } from "./updateSecondaryTotalAmount";

export const updateTotalAmount = (
  includeDeposit: boolean = false,
  selectedPricingOption?: string
) => {
  const state = loadState();
  const totalAmountElement = new WFComponent("#primaryTotalAmount");
  const primaryOriginalAmountElement = new WFComponent("#primaryOriginalAmount");
  const primaryDiscountPill = new WFComponent("#primaryDiscountPill");
  const primaryDiscountNumber = new WFComponent("#primaryDiscountNumber");
  
  // Elements for secondary total
  const secondaryAmountWrap = new WFComponent("#secondaryAmountWrap");
  const secondaryTotalAmountElement = new WFComponent("#secondaryTotalAmount");
  const secondaryOriginalAmountElement = new WFComponent("#secondaryOriginalAmount");
  const secondaryDiscountPill = new WFComponent("#secondaryDiscountPill");
  const secondaryDiscountNumber = new WFComponent("#secondaryDiscountNumber");

  console.log(`updateTotalAmount called with includeDeposit=${includeDeposit} and selectedPricingOption=${selectedPricingOption}`);

  let primaryTotal: number | undefined;
  let primaryOriginal: number | undefined;
  let primaryAmountType: string = ""; // e.g., "Per Year"

  const pricingOption = selectedPricingOption || state.selectedPricingOption;

  switch (pricingOption) {
    case "Annual":
      primaryOriginal = state.checkoutPreview?.annual_amount_due;
      primaryAmountType = "Per Year";
      break;
    case "Monthly":
      primaryOriginal = state.checkoutPreview?.monthly_amount_due;
      primaryAmountType = "Per Month";
      break;
    case "Pay-Per-Semester":
      primaryOriginal = state.checkoutPreview?.semester_amount_due;
      primaryAmountType = "Per Semester";
      break;
    default:
      console.warn("Unknown pricing option:", pricingOption);
  }

  if (!includeDeposit) {
    // No deposit; apply discounts to primary total if applicable
    if (state.selected_discount) {
      const discountValue = parseFloat(state.selected_discount);
      primaryTotal = primaryOriginal
        ? primaryOriginal * (1 - discountValue / 100)
        : 0;
      primaryDiscountPill.setStyle({ display: "block" });
      primaryDiscountNumber.setText(`${discountValue}%`);
      primaryOriginalAmountElement.setText(
        `was ${formatCurrency(primaryOriginal!)} ${primaryAmountType}`
      );
      primaryOriginalAmountElement.setStyle({ display: "block" });
      console.log("Applied discount to primary total.");
    } else {
      primaryTotal = primaryOriginal;
      primaryDiscountPill.setStyle({ display: "none" });
      primaryOriginalAmountElement.setStyle({ display: "none" });
      primaryDiscountNumber.setText("");
      console.log("No discount applied to primary total.");
    }

    if (primaryTotal !== undefined) {
      totalAmountElement.setText(`${formatCurrency(primaryTotal)} ${primaryAmountType}`);
    } else {
      totalAmountElement.setText(`$0.00 ${primaryAmountType}`);
    }

    // Hide secondary total elements if previously shown
    secondaryAmountWrap.setStyle({ display: "none" });
    console.log("SecondaryAmountWrap hidden.");
    // Clear secondary totals
    secondaryTotalAmountElement.setText(`$0.00 ${primaryAmountType}`);
    secondaryOriginalAmountElement.setStyle({ display: "none" });
    secondaryDiscountPill.setStyle({ display: "none" });
    secondaryDiscountNumber.setText("");
  } else {
    // Deposit is included; primary total reflects deposit total, secondary total reflects main payment option
    const depositAmount = state.checkoutPreview?.deposit_amount_due;
    if (depositAmount !== undefined) {
      totalAmountElement.setText(`${formatCurrency(depositAmount)} Total`);
    } else {
      totalAmountElement.setText(`$0.00 Total`);
    }

    // Calculate and display secondary total with discount if applicable
    updateSecondaryTotalAmount();

    // Show secondary total elements
    secondaryAmountWrap.setStyle({ display: "flex", flexDirection: "column" });
    console.log("SecondaryAmountWrap displayed as flex.");

    // Hide primary discount pill since discounts are applied to secondary total
    primaryDiscountPill.setStyle({ display: "none" });
    primaryDiscountNumber.setText("");
    primaryOriginalAmountElement.setStyle({ display: "none" });
    console.log("Primary discount pill hidden.");
  }
};
