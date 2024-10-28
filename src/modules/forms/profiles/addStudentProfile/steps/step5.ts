import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmail,
  validatePhoneNumber,
} from "../../../../../utils/validationUtils";
import { WFSlider } from "@xatom/slider";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepFive = (slider: WFSlider) => {
  console.log("Initialize Step Five Form - Emergency Contact");

  // Step 5 Form Initialization
  const formStepFive = new WFFormComponent<{
    emergency_first_name: string;
    emergency_last_name: string;
    emergency_email: string;
    emergency_phone: string;
    emergency_relationship: string;
  }>("#formStepFive");

  // Define the fields with associated validation rules and error messages
  const fieldsStepFive = [
    {
      input: new WFComponent("#emergencyFirstNameInput"),
      error: new WFComponent("#emergencyFirstNameInputError"),
      validationFn: validateNotEmpty,
      message: "First name is required",
    },
    {
      input: new WFComponent("#emergencyLastNameInput"),
      error: new WFComponent("#emergencyLastNameInputError"),
      validationFn: validateNotEmpty,
      message: "Last name is required",
    },
    {
      input: new WFComponent("#emergencyEmailInput"),
      error: new WFComponent("#emergencyEmailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address",
    },
    {
      input: new WFComponent("#emergencyPhoneInput"),
      error: new WFComponent("#emergencyPhoneInputError"),
      validationFn: validatePhoneNumber,
      message: "Please enter a valid phone number",
    },
    {
      input: new WFComponent("#emergencyRelationshipInput"),
      error: new WFComponent("#emergencyRelationshipInputError"),
      validationFn: validateNotEmpty,
      message: "Relationship is required",
    },
  ];

  // Auto-format phone number input to (xxx) xxx-xxxx
  const emergencyPhoneNumberInput = new WFComponent("#emergencyPhoneInput");
  emergencyPhoneNumberInput.on("input", () => {
    const inputElement =
      emergencyPhoneNumberInput.getElement() as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart as number;
    inputElement.value = formatPhoneNumber(inputElement.value);
    const formattedLength = inputElement.value.length;
    const cleanedLength = inputElement.value.replace(/\D/g, "").length;
    inputElement.setSelectionRange(
      cursorPosition + (formattedLength - cleanedLength),
      cursorPosition + (formattedLength - cleanedLength)
    );
  });

  // Initialize validation for each field
  fieldsStepFive.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepFiveError")
    );
  });

  // Handle form submission for Step 5
  formStepFive.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepFive.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(
        input,
        validationFn,
        message
      )();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      console.log("Validation failed:", formData);
      toggleError(
        new WFComponent("#submitStepFiveError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    // Proceed to the next step
    slider.goNext();
  });

  // Handle back button for Step 5
  const backStepButton = new WFComponent("#backStepFive");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(5);
    unmarkStepAsCompleted(4);
    unmarkStepAsCompleted(5);
  });
};

// Helper function to format phone number
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  let formatted = "";
  if (cleaned.length <= 3) {
    formatted = cleaned;
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(
      3,
      6
    )}-${cleaned.slice(6, 10)}`;
  }
  return formatted;
}
