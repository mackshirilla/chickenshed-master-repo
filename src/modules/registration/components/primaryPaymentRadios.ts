import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";
import { getLineItemsForSelectedOption, renderLineItems } from "./lineItems";
import { updateTotalAmount } from "./updateTotalAmount";
import { LineItem } from "../checkoutPreview";

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
    { key: "Deposit", id: "deposit", wrapId: "depositRadioWrap" },
  ];

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
    } else if (selectedPricingOption === "Deposit") {
      if (plan.key !== "Deposit") {
        planWrapElement.classList.add("is-disabled");
        planElement.disabled = true;
      } else {
        planWrapElement.classList.remove("is-disabled");
        planElement.disabled = false;
        planElement.checked = true;
      }
    } else {
      if (plan.key === "Deposit") {
        planWrapElement.classList.add("is-disabled");
        planElement.disabled = true;
      } else {
        planWrapElement.classList.remove("is-disabled");
        planElement.disabled = false;
      }
    }
  });

  paymentPlans.forEach((plan) => {
    const input = new WFComponent(
      `#${plan.id}`
    ).getElement() as HTMLInputElement;
    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;
      if (target.checked) {
        saveState({ selectedPricingOption: target.value });

        const registrationState = loadState();
        const lineItemsOnly = {
          annual_line_items:
            registrationState.checkoutPreview?.annual_line_items ?? [],
          monthly_line_items:
            registrationState.checkoutPreview?.monthly_line_items ?? [],
          semester_line_items:
            registrationState.checkoutPreview?.semester_line_items ?? [],
          deposit_line_items:
            registrationState.checkoutPreview?.deposit_line_items ?? [],
        };
        const lineItems = getLineItemsForSelectedOption(
          target.value,
          lineItemsOnly
        );
        renderLineItems(lineItems);

        updateTotalAmount();

        console.log(`Primary pricing option selected: ${target.value}`);
      }
    });
  });
};
