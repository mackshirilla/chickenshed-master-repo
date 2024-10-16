import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";
import { updateSecondaryTotalAmount } from "./updateSecondaryTotalAmount"; // Import the new function

export const initializeSecondaryPaymentRadios = (
  selectedPricingOption: string
) => {
  const hiddenSecondaryPricing = new WFComponent("#hiddenSecondaryPricing");
  const secondaryAmountWrap = new WFComponent("#secondaryAmountWrap");

  const state = loadState();

  if (!state.secondaryPricingOption) {
    saveState({ secondaryPricingOption: "Annual" });
  }

  if (selectedPricingOption === "Deposit") {
    hiddenSecondaryPricing.setStyle({ display: "flex" });
    secondaryAmountWrap.setStyle({ display: "flex" }); // Show the secondary amount wrap

    const initialSecondaryOption = state.secondaryPricingOption || "Annual";
    const initialRadio = new WFComponent(
      `input[name='secondaryPricing'][value='${initialSecondaryOption}']`
    ).getElement() as HTMLInputElement;

    initialRadio.checked = true;

    // Update the secondary total amount based on the initial secondary option
    updateSecondaryTotalAmount(initialSecondaryOption);
  } else {
    hiddenSecondaryPricing.setStyle({ display: "none" });
    secondaryAmountWrap.setStyle({ display: "none" }); // Hide the secondary amount wrap
  }

  document
    .querySelectorAll("input[name='secondaryPricing']")
    .forEach((input) => {
      input.addEventListener("change", (event) => {
        const target = event.target as HTMLInputElement;
        if (target.checked) {
          const secondaryPricingOption = target.value;
          saveState({ secondaryPricingOption });
          console.log(
            `Secondary pricing option selected: ${secondaryPricingOption}`
          );

          // Update the secondary total amount when a different option is selected
          updateSecondaryTotalAmount(secondaryPricingOption);
        }
      });
    });
};
