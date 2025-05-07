import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";
import { updateTotalAmount } from "./updateTotalAmount";
import { toggleError, setupValidation } from "../../../utils/formUtils";
import { validateNotEmpty, validateSelectField } from "../../../utils/validationUtils";

export const initializeFinancialAid = (): void => {
  // Load any saved financial aid data to pre-populate the form.
  loadFinancialAidData();

  const financialAidCheckbox = new WFComponent("#requestFinAid");
  const financialAidDialog = new WFComponent("#finaidForm");

  financialAidCheckbox.on("change", () => {
    const checkboxElement = financialAidCheckbox.getElement() as HTMLInputElement;
    if (checkboxElement.checked) {
      (financialAidDialog.getElement() as HTMLDialogElement).showModal();
    } else {
      saveState({ fin_aid_requested: false, selected_discount: undefined });
      document.dispatchEvent(new CustomEvent("registrationChanged"));
    }
  });

  financialAidDialog.getElement()?.addEventListener("close", () => {
    const state = loadState();
    if (!state.selected_discount) {
      (financialAidCheckbox.getElement() as HTMLInputElement).checked = false;
    }
  });

  setupFinancialAidFormValidation();

  const submitButton = new WFComponent("#submitfinancialAid");
  submitButton.on("click", () => {
    if (validateFinancialAidForm()) {
      saveFinancialAidData();
      showSuccessState();
    }
  });

  attachCloseDialogHandler(financialAidDialog);

  const annualIncomeInput = new WFComponent("#annualIncome");
  const monthlyExpenseInput = new WFComponent("#monthlyExpense");

  const formatAndSetInputValue = (component: WFComponent): void => {
    const inputEl = component.getElement() as HTMLInputElement;
    let value = inputEl.value.replace(/[^\d.-]/g, "");
    let cursorPos = inputEl.selectionStart || 0;
    const commaCountBefore = (inputEl.value.slice(0, cursorPos).match(/,/g) || []).length;
    if (value.includes(".")) {
      const [intPart, decPart] = value.split(".");
      value = `${intPart}.${decPart.slice(0, 2)}`;
    }
    const formattedValue = formatNumber(value);
    inputEl.value = formattedValue;
    const commaCountAfter = (formattedValue.slice(0, cursorPos).match(/,/g) || []).length;
    cursorPos += commaCountAfter - commaCountBefore;
    if (cursorPos > formattedValue.length) cursorPos = formattedValue.length;
    inputEl.setSelectionRange(cursorPos, cursorPos);
  };

  const formatNumber = (value: string): string => {
    const num = parseFloat(value.replace(/,/g, ""));
    if (isNaN(num)) return value;
    return num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  annualIncomeInput.on("input", () => formatAndSetInputValue(annualIncomeInput));
  monthlyExpenseInput.on("input", () => formatAndSetInputValue(monthlyExpenseInput));
};

/**
 * Loads saved financial aid data from state and populates the form fields.
 * The checkbox is set to checked only if fin_aid_requested is true.
 */
function loadFinancialAidData(): void {
  const state = loadState();
  const financialAidCheckbox = new WFComponent("#requestFinAid");
  if (state.fin_aid_requested && state.financialAidData) {
    (financialAidCheckbox.getElement() as HTMLInputElement).checked = true;
    
    const relationshipInput = new WFComponent("#finaidRelationship");
    const annualIncomeInput = new WFComponent("#annualIncome");
    const monthlyExpenseInput = new WFComponent("#monthlyExpense");
    const previousParticipantValue = state.financialAidData.previousParticipant;
    const previousParticipantInputs = document.getElementsByName("previous_participant") as NodeListOf<HTMLInputElement>;

    (relationshipInput.getElement() as HTMLSelectElement).value = state.financialAidData.relationship || "";
    (annualIncomeInput.getElement() as HTMLInputElement).value = state.financialAidData.annualIncome || "";
    (monthlyExpenseInput.getElement() as HTMLInputElement).value = state.financialAidData.monthlyExpense || "";
    
    previousParticipantInputs.forEach(radio => {
      radio.checked = (radio.value === previousParticipantValue);
    });
    console.log("[DEBUG] loadFinancialAidData: Financial aid data loaded from state.");
  } else {
    (financialAidCheckbox.getElement() as HTMLInputElement).checked = false;
  }
};

/**
 * Sets up field-level validation for the financial aid form.
 */
const setupFinancialAidFormValidation = (): void => {
  const relationshipInput = new WFComponent("#finaidRelationship");
  const relationshipError = new WFComponent("#finaidRelationshipError");
  const previousParticipantInputs = document.getElementsByName("previous_participant");
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
    setupValidation(new WFComponent(input as HTMLElement), previousParticipantError, () => {
      const selected = Array.from(previousParticipantInputs).some(radio => (radio as HTMLInputElement).checked);
      return selected ? "" : "Please select an option.";
    });
  });
};

/**
 * Validates the financial aid form.
 */
const validateFinancialAidForm = (): boolean => {
  const relationshipInput = new WFComponent("#finaidRelationship");
  const annualIncomeInput = new WFComponent("#annualIncome");
  const monthlyExpenseInput = new WFComponent("#monthlyExpense");
  const previousParticipantInputs = document.getElementsByName("previous_participant");

  const isRelationshipValid = validateSelectField(getComponentValue(relationshipInput));
  toggleError(new WFComponent("#finaidRelationshipError"), "Please select a relationship.", !isRelationshipValid);

  const isAnnualIncomeValid = validateNotEmpty(getComponentValue(annualIncomeInput));
  toggleError(new WFComponent("#annualIncomeError"), "Please enter your annual household income.", !isAnnualIncomeValid);

  const isMonthlyExpenseValid = validateNotEmpty(getComponentValue(monthlyExpenseInput));
  toggleError(new WFComponent("#monthlyExpenseError"), "Please enter your monthly expenditure.", !isMonthlyExpenseValid);

  const isPreviousParticipantValid = Array.from(previousParticipantInputs).some(radio => (radio as HTMLInputElement).checked);
  toggleError(new WFComponent("#previousParticipantError"), "Please select an option.", !isPreviousParticipantValid);

  return isRelationshipValid && isAnnualIncomeValid && isMonthlyExpenseValid && isPreviousParticipantValid;
};

/**
 * Saves the financial aid data to state.
 */
const saveFinancialAidData = (): void => {
  const relationship = (new WFComponent("#finaidRelationship").getElement() as HTMLSelectElement).value;
  const annualIncome = (new WFComponent("#annualIncome").getElement() as HTMLInputElement).value;
  const monthlyExpense = (new WFComponent("#monthlyExpense").getElement() as HTMLInputElement).value;
  const previousParticipantInput = document.querySelector("input[name='previous_participant']:checked") as HTMLInputElement | null;
  const previousParticipant = previousParticipantInput ? previousParticipantInput.value : "";

  saveState({
    fin_aid_requested: true,
    selected_discount: "",
    financialAidData: { relationship, annualIncome, monthlyExpense, previousParticipant },
  });

  console.log("[DEBUG] saveFinancialAidData: Financial aid data saved:", { relationship, annualIncome, monthlyExpense, previousParticipant });
};

/**
 * Shows a success state for the financial aid form.
 */
const showSuccessState = (): void => {
  const successMessage = new WFComponent(".success-message");
  const form = new WFComponent("#wf-form-Finaid-Form");
  form.setStyle({ display: "none" });
  successMessage.setStyle({ display: "block" });

  const applyDiscountButton = new WFComponent("#applyDiscount");
  const backFinAidButton = new WFComponent("#backFinAid");
  const financialAidDialog = new WFComponent("#finaidForm");

  applyDiscountButton.on("click", () => {
    const selectedDiscount = document.querySelector("input[name='discountValue']:checked") as HTMLInputElement | null;
    if (selectedDiscount) {
      const discountValue = selectedDiscount.value;
      saveState({ selected_discount: discountValue, fin_aid_requested: true });
      document.dispatchEvent(new CustomEvent("registrationChanged"));
      closeFinancialAidDialog(financialAidDialog);
    } else {
      console.warn("No discount selected.");
    }
  });

  backFinAidButton.on("click", () => {
    successMessage.setStyle({ display: "none" });
    form.setStyle({ display: "flex" });
  });
};

const closeFinancialAidDialog = (dialog: WFComponent): void => {
  (dialog.getElement() as HTMLDialogElement).close();
};

const attachCloseDialogHandler = (dialog: WFComponent): void => {
  const closeButton = new WFComponent("#close-dialog-btn");
  closeButton.on("click", () => closeFinancialAidDialog(dialog));

  dialog.getElement()?.addEventListener("click", (event) => {
    const rect = (dialog.getElement() as HTMLDialogElement).getBoundingClientRect();
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

const getComponentValue = (component: WFComponent): string => {
  const element = component.getElement() as HTMLInputElement | HTMLSelectElement;
  return element.value;
};

export { saveFinancialAidData, loadFinancialAidData };
