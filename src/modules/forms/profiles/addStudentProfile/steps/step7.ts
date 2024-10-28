import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import { validateNotEmpty } from "../../../../../utils/validationUtils";
import { WFSlider } from "@xatom/slider";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepSeven = (slider: WFSlider) => {
  console.log(
    "Initialize Step Seven Form - Family Involvement & Photo Release"
  );

  // Step 7 Form Initialization
  const formStepSeven = new WFFormComponent<{
    family_involved: string;
    photo_release: boolean;
    student_id: number | null;
  }>("#formStepSeven");

  // Define fields with associated validation rules and error messages
  const fieldsStepSeven = [
    {
      input: new WFComponent("#familyInvolvedInput"),
      error: new WFComponent("#familyInvolvedInputError"),
      validationFn: validateNotEmpty,
      message: "Family involvement is required",
    },
  ];

  // Initialize validation for each field
  fieldsStepSeven.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepSevenError")
    );
  });

  // Handle form submission for Step 7
  formStepSeven.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepSeven.forEach(({ input, error, validationFn, message }) => {
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
        new WFComponent("#submitStepSevenError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    // Proceed to the next step
    slider.goNext();
  });

  // Handle back button for Step 7
  const backStepButton = new WFComponent("#backStepSeven");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(7);
    unmarkStepAsCompleted(6);
    unmarkStepAsCompleted(7);
  });
};
