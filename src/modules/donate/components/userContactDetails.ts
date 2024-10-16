// userContactDetails.ts
import { WFComponent } from "@xatom/core";
import {
  validateNotEmpty,
  validateEmail,
} from "../../../utils/validationUtils";
import { toggleError, setupValidation } from "../../../utils/formUtils";
import { saveDonationState } from "../state/donationState";
import { userAuth } from "../../../auth/authConfig";

// Initialize the user contact details
export const initializeUserContactDetails = () => {
  // Elements
  const firstNameInput = new WFComponent("#firstNameInput");
  const lastNameInput = new WFComponent("#lastNameInput");
  const emailInput = new WFComponent("#emailInput");
  const firstNameInputError = new WFComponent("#firstNameInputError");
  const lastNameInputError = new WFComponent("#lastNameInputError");
  const emailInputError = new WFComponent("#emailInputError");
  const emailWrap = new WFComponent("#emailWrap");

  // Check if user is authenticated and hide email field if so
  const user = userAuth.getUser();
  if (user && user.email) {
    emailWrap.setStyle({ display: "none" });
    saveDonationState({ email: user.email });
  } else {
    emailWrap.setStyle({ display: "grid" });

    // Setup validation for email field
    setupValidation(
      emailInput,
      emailInputError,
      createValidationFunction(
        emailInput,
        validateEmail,
        "Invalid email address."
      )
    );
  }

  // Setup validation for first name and last name fields
  setupValidation(
    firstNameInput,
    firstNameInputError,
    createValidationFunction(
      firstNameInput,
      validateNotEmpty,
      "First name is required."
    )
  );

  setupValidation(
    lastNameInput,
    lastNameInputError,
    createValidationFunction(
      lastNameInput,
      validateNotEmpty,
      "Last name is required."
    )
  );

  // Save input data to state
  firstNameInput.on("input", () => {
    const firstName = (firstNameInput.getElement() as HTMLInputElement).value;
    saveDonationState({ firstName });
  });

  lastNameInput.on("input", () => {
    const lastName = (lastNameInput.getElement() as HTMLInputElement).value;
    saveDonationState({ lastName });
  });

  emailInput.on("input", () => {
    const email = (emailInput.getElement() as HTMLInputElement).value;
    saveDonationState({ email });
  });
};

// Utility function for validation
function createValidationFunction(
  inputComponent: WFComponent,
  validationFn: (input: string) => boolean,
  errorMessage: string
): () => string {
  return () => {
    const inputElement = inputComponent.getElement() as HTMLInputElement;
    const isValid = validationFn(inputElement.value);
    return isValid ? "" : errorMessage;
  };
}
