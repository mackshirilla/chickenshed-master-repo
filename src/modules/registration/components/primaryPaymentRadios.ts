// components/registration/components/primaryPaymentRadios.ts

import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";
import { getLineItemsForSelectedOption, renderLineItems } from "./lineItems";
import { updateTotalAmount } from "./updateTotalAmount";
import { LineItem } from "../checkoutPreview";
import { initializeAlertBoxEarly } from "./alertBoxEarly"; // Import the new alertBoxEarly

export const initializePrimaryPaymentRadios = (
  selectedPricingOption: string
) => {
  const paymentPlans = [
    { key: "Annual", id: "annualPlan", wrapId: "annualRadioWrap" },
    { key: "Monthly", id: "monthlyPlan", wrapId: "monthlyRadioWrap" },
    {
      key: "Pay-Per-Semester",
      id: "semesterPlan",
      wrapId: "semesterRadioWrap",
    },
    // Removed "Deposit" option
  ];

  // Initialize the radio buttons based on the selected option
  paymentPlans.forEach((plan) => {
    const planElement = new WFComponent(
      `#${plan.id}`
    ).getElement() as HTMLInputElement;
    const planWrapElement = new WFComponent(
      `#${plan.wrapId}`
    ).getElement() as HTMLElement;

    if (plan.key === selectedPricingOption) {
      planElement.checked = true;
      planWrapElement.classList.remove("is-disabled");
      planElement.disabled = false;
    } else {
      planWrapElement.classList.remove("is-disabled");
      planElement.disabled = false;
    }
  });

  // Attach event listeners to each payment option
  paymentPlans.forEach((plan) => {
    const input = new WFComponent(
      `#${plan.id}`
    ).getElement() as HTMLInputElement;
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.checked) {
        // Save the selected pricing option to state
        saveState({ selectedPricingOption: target.value });

        // Load the current registration state
        const registrationState = loadState();
        
        // Debugging: Log the current state
        console.log("Current Registration State:", registrationState);

        // Extract the necessary line items from the state
        const lineItemsOnly = {
          annual_line_items:
            registrationState.checkoutPreview?.annual_line_items ?? [],
          monthly_line_items:
            registrationState.checkoutPreview?.monthly_line_items ?? [],
          semester_line_items:
            registrationState.checkoutPreview?.semester_line_items ?? [],
          // Removed deposit_line_items
        };

        // Determine if deposit conditions are met
        const shouldShowDeposit =
          (registrationState.early_registration && target.value === "Monthly") ||
          (registrationState.pendingStudents?.length > 0);

        // Debugging: Log the value of shouldShowDeposit
        console.log(`shouldShowDeposit: ${shouldShowDeposit}`);

        if (shouldShowDeposit) {
          // **Only** render deposit line items
          const depositLineItems = registrationState.checkoutPreview?.deposit_line_items ?? [];
          
          // **Ensure** that deposit line items are available
          if (depositLineItems.length > 0) {
            console.log("Rendering Deposit Line Items:", depositLineItems);
            renderLineItems(depositLineItems, true); // Pass a flag to indicate deposit items
            // Update total amounts accordingly
            updateTotalAmount(true, target.value);
            console.log(`Deposit line items rendered for ${target.value}`);
          } else {
            console.warn("Deposit line items are empty or undefined.");
            // Fallback: Render primary line items if deposit line items are unavailable
            const primaryLineItems = getLineItemsForSelectedOption(
              target.value,
              lineItemsOnly
            );
            renderLineItems(primaryLineItems);
            updateTotalAmount(false, target.value);
            console.log(`Primary line items rendered for ${target.value} due to missing deposit items.`);
          }
        } else {
          // **Only** render primary line items
          const primaryLineItems = getLineItemsForSelectedOption(
            target.value,
            lineItemsOnly
          );
          renderLineItems(primaryLineItems);
          updateTotalAmount(false, target.value);
          console.log(`Primary line items rendered for ${target.value}`);
        }

        console.log(`Primary pricing option selected: ${target.value}`);

        // **Initialize alertBoxEarly after changing pricing option**
        initializeAlertBoxEarly();
      }
    });
  });
};
