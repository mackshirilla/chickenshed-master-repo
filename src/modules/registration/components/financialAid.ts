import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";
import { updateTotalAmount } from "./updateTotalAmount";
import { updateSecondaryTotalAmount } from "./updateSecondaryTotalAmount";
import { toggleError, setupValidation } from "../../../utils/formUtils";
import {
  validateNotEmpty,
  validateSelectField,
} from "../../../utils/validationUtils";

// Function to initialize the financial aid checkbox and dialog
export const initializeFinancialAid = () => {
  const financialAidCheckbox = new WFComponent("#requestFinAid");
  const financialAidDialog = new WFComponent("#finaidForm");

  // Show dialog when checkbox is checked
  financialAidCheckbox.on("change", () => {
    const checkboxElement =
      financialAidCheckbox.getElement() as HTMLInputElement;
    const state = loadState(); // Load the state here
    if (checkboxElement.checked) {
      (financialAidDialog.getElement() as HTMLDialogElement).showModal();
    } else {
      // Reset financial aid-related state
      saveState({ fin_aid_requested: false, selected_discount: undefined });

      // Update totals to reset to original values
      if (state.selectedPricingOption === "Deposit") {
        updateSecondaryTotalAmount(state.secondaryPricingOption);
      } else {
        updateTotalAmount();
      }
    }
  });

  // Close dialog event to uncheck checkbox if no discount is applied
  financialAidDialog.getElement()?.addEventListener("close", () => {
    const state = loadState();
    if (!state.selected_discount) {
      (financialAidCheckbox.getElement() as HTMLInputElement).checked = false;
    }
  });

  // Form validation
  setupFinancialAidFormValidation();

  // Handle form submission
  const submitButton = new WFComponent("#submitfinancialAid");
  submitButton.on("click", () => {
    if (validateFinancialAidForm()) {
      saveFinancialAidData();
      showSuccessState();
    }
  });

  // Attach close dialog function to close button and outside click
  attachCloseDialogHandler(financialAidDialog);

  // Format currency in real-time as the user types
  const annualIncomeInput = new WFComponent("#annualIncome");
  const monthlyExpenseInput = new WFComponent("#monthlyExpense");

  const formatAndSetInputValue = (component: WFComponent) => {
    const inputElement = component.getElement() as HTMLInputElement;
    let value = inputElement.value.replace(/[^\d.-]/g, ""); // Remove non-numeric characters except for digits, dots, and dashes

    // Save the cursor position before formatting
    let cursorPosition = inputElement.selectionStart || 0;

    // Calculate the number of commas before formatting
    const commaCountBefore = (
      inputElement.value.slice(0, cursorPosition).match(/,/g) || []
    ).length;

    // Handle the case where the user might enter multiple decimal points
    if (value.includes(".")) {
      const [integerPart, decimalPart] = value.split(".");
      value = `${integerPart}.${decimalPart.slice(0, 2)}`;
    }

    // Format the number
    const formattedValue = formatNumber(value);
    inputElement.value = formattedValue;

    // Calculate the number of commas after formatting
    const commaCountAfter = (
      inputElement.value.slice(0, cursorPosition).match(/,/g) || []
    ).length;

    // Adjust cursor position based on the difference in comma count
    cursorPosition += commaCountAfter - commaCountBefore;

    // Ensure cursor position does not exceed the input length
    if (cursorPosition > formattedValue.length) {
      cursorPosition = formattedValue.length;
    }

    // Set the cursor position back to the calculated position
    inputElement.setSelectionRange(cursorPosition, cursorPosition);
  };

  const formatNumber = (value: string): string => {
    const number = parseFloat(value.replace(/,/g, ""));
    if (isNaN(number)) return value;
    return number.toLocaleString("en-US", {
      minimumFractionDigits: 0, // No decimals during typing
      maximumFractionDigits: 0, // No decimals during typing
    });
  };

  annualIncomeInput.on("input", () =>
    formatAndSetInputValue(annualIncomeInput)
  );
  monthlyExpenseInput.on("input", () =>
    formatAndSetInputValue(monthlyExpenseInput)
  );
};

// Function to close the financial aid dialog
const closeFinancialAidDialog = (dialog: WFComponent) => {
  (dialog.getElement() as HTMLDialogElement).close();
};

// Function to attach close dialog handler
const attachCloseDialogHandler = (dialog: WFComponent) => {
  const closeButton = new WFComponent("#close-dialog-btn");

  closeButton.on("click", () => closeFinancialAidDialog(dialog));

  dialog.getElement()?.addEventListener("click", (event) => {
    const rect = (
      dialog.getElement() as HTMLDialogElement
    ).getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    ) {
      closeFinancialAidDialog(dialog);
    }
  });
};

// Function to validate the financial aid form
const setupFinancialAidFormValidation = () => {
  const relationshipInput = new WFComponent("#finaidRelationship");
  const relationshipError = new WFComponent("#finaidRelationshipError");

  const previousParticipantInputs = document.getElementsByName(
    "previous_participant"
  );
  const previousParticipantError = new WFComponent("#previousParticipantError");

  const annualIncomeInput = new WFComponent("#annualIncome");
  const annualIncomeError = new WFComponent("#annualIncomeError");

  const monthlyExpenseInput = new WFComponent("#monthlyExpense");
  const monthlyExpenseError = new WFComponent("#monthlyExpenseError");

  setupValidation(relationshipInput, relationshipError, () =>
    validateSelectField(getComponentValue(relationshipInput))
      ? ""
      : "Please select a relationship."
  );

  setupValidation(annualIncomeInput, annualIncomeError, () =>
    validateNotEmpty(getComponentValue(annualIncomeInput))
      ? ""
      : "Please enter your annual household income."
  );

  setupValidation(monthlyExpenseInput, monthlyExpenseError, () =>
    validateNotEmpty(getComponentValue(monthlyExpenseInput))
      ? ""
      : "Please enter your monthly expenditure."
  );

  Array.from(previousParticipantInputs).forEach((input) => {
    setupValidation(
      new WFComponent(input as HTMLElement),
      previousParticipantError,
      () => {
        const selected = Array.from(previousParticipantInputs).some(
          (radio) => (radio as HTMLInputElement).checked
        );
        return selected ? "" : "Please select an option.";
      }
    );
  });
};

// Function to validate the financial aid form on submit
const validateFinancialAidForm = () => {
  const relationshipInput = new WFComponent("#finaidRelationship");
  const annualIncomeInput = new WFComponent("#annualIncome");
  const monthlyExpenseInput = new WFComponent("#monthlyExpense");
  const previousParticipantInputs = document.getElementsByName(
    "previous_participant"
  );

  const isRelationshipValid = validateSelectField(
    getComponentValue(relationshipInput)
  );
  toggleError(
    new WFComponent("#finaidRelationshipError"),
    "Please select a relationship.",
    !isRelationshipValid
  );

  const isAnnualIncomeValid = validateNotEmpty(
    getComponentValue(annualIncomeInput)
  );
  toggleError(
    new WFComponent("#annualIncomeError"),
    "Please enter your annual household income.",
    !isAnnualIncomeValid
  );

  const isMonthlyExpenseValid = validateNotEmpty(
    getComponentValue(monthlyExpenseInput)
  );
  toggleError(
    new WFComponent("#monthlyExpenseError"),
    "Please enter your monthly expenditure.",
    !isMonthlyExpenseValid
  );

  const isPreviousParticipantValid = Array.from(previousParticipantInputs).some(
    (radio) => (radio as HTMLInputElement).checked
  );
  toggleError(
    new WFComponent("#previousParticipantError"),
    "Please select an option.",
    !isPreviousParticipantValid
  );

  return (
    isRelationshipValid &&
    isAnnualIncomeValid &&
    isMonthlyExpenseValid &&
    isPreviousParticipantValid
  );
};

// Function to save financial aid data to state
const saveFinancialAidData = () => {
  const relationshipComponent = new WFComponent("#finaidRelationship");
  const relationshipElement =
    relationshipComponent.getElement() as HTMLSelectElement;
  const relationship = relationshipElement.value;

  const annualIncomeComponent = new WFComponent("#annualIncome");
  const annualIncomeElement =
    annualIncomeComponent.getElement() as HTMLInputElement;
  const annualIncome = annualIncomeElement.value;

  const monthlyExpenseComponent = new WFComponent("#monthlyExpense");
  const monthlyExpenseElement =
    monthlyExpenseComponent.getElement() as HTMLInputElement;
  const monthlyExpense = monthlyExpenseElement.value;

  const previousParticipantInput = document.querySelector(
    "input[name='previous_participant']:checked"
  ) as HTMLInputElement | null;
  const previousParticipant = previousParticipantInput
    ? previousParticipantInput.value
    : "";

  saveState({
    fin_aid_requested: true,
    financialAidData: {
      relationship,
      annualIncome,
      monthlyExpense,
      previousParticipant,
    },
  });

  console.log("Financial aid data saved:", {
    relationship,
    annualIncome,
    monthlyExpense,
    previousParticipant,
  });
};

// Function to display success state and discount selection
const showSuccessState = () => {
  const successMessage = new WFComponent(".success-message");
  const form = new WFComponent("#wf-form-Finaid-Form");
  form.setStyle({ display: "none" });
  successMessage.setStyle({ display: "block" });

  const applyDiscountButton = new WFComponent("#applyDiscount");
  const backFinAidButton = new WFComponent("#backFinAid");
  const financialAidDialog = new WFComponent("#finaidForm");

  applyDiscountButton.on("click", () => {
    const selectedDiscount = document.querySelector(
      "input[name='discountValue']:checked"
    ) as HTMLInputElement | null;

    if (selectedDiscount) {
      const discountValue = selectedDiscount.value;
      const state = loadState();

      saveState({ selected_discount: discountValue });
      saveState({ fin_aid_requested: true });

      if (state.selectedPricingOption === "Deposit") {
        // Apply discount to secondary total amount
        updateSecondaryTotalAmount(state.secondaryPricingOption);
      } else {
        // Apply discount to primary total amount
        updateTotalAmount();
      }

      console.log(`Discount applied: ${discountValue}%`);

      // Close the dialog
      closeFinancialAidDialog(financialAidDialog);
    } else {
      console.warn("No discount selected.");
      // Optionally provide feedback to the user about selecting a discount
    }
  });

  backFinAidButton.on("click", () => {
    successMessage.setStyle({ display: "none" });
    form.setStyle({ display: "flex" });
  });
};

// Helper function to get the value of a component
const getComponentValue = (component: WFComponent): string => {
  const element = component.getElement() as
    | HTMLInputElement
    | HTMLSelectElement;
  return element.value;
};
