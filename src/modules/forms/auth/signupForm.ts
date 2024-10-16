import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  createCheckboxValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmail,
  validatePasswordRequirements,
} from "../../../utils/validationUtils";
import { handleRecaptcha } from "../../../utils/recaptchaUtils"; // Ensure this function is implemented for reCAPTCHA handling
import { apiClient } from "../../../api/apiConfig"; // Ensure you have set up this API client for server interactions

type CreateAccountResponse = {
  status: string;
  message: string;
};

export const signupForm = () => {
  // Initialize the main form component with the specified form ID
  const form = new WFFormComponent<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    terms_of_service: boolean;
  }>("#createAccountForm");

  // Define fields with associated validation rules and messages
  const fields = [
    {
      input: new WFComponent("#firstNameInput"),
      error: new WFComponent("#firstNameInputError"),
      validationFn: validateNotEmpty,
      message: "This field is required.",
    },
    {
      input: new WFComponent("#lastNameInput"),
      error: new WFComponent("#lastNameInputError"),
      validationFn: validateNotEmpty,
      message: "This field is required.",
    },
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address.",
    },
    {
      input: new WFComponent("#passwordInput"),
      error: new WFComponent("#passwordInputError"),
      validationFn: validatePasswordRequirements,
      message: "Password must meet the requirements below.",
    },
    {
      input: new WFComponent("#termsInput"),
      error: new WFComponent("#termsInputError"),
      message: "Please agree to the terms and conditions.",
    },
  ];

  // Component for displaying any request-level error messages
  const requestError = new WFComponent("#requestError");
  const requestAnimation = new WFComponent("#requestingAnimation");

  // Initialize validation for text input fields
  fields.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      requestError // Includes clearing requestError on input change
    );
  });

  // Initialize validation specifically for the checkbox
  const termsField = fields[fields.length - 1];
  setupValidation(
    termsField.input,
    termsField.error,
    createCheckboxValidationFunction(termsField.input, termsField.message),
    requestError
  );

  // Dynamic feedback for password requirements
  const passwordRequirements = [
    new WFComponent("#lengthCheck"),
    new WFComponent("#lowercaseCheck"),
    new WFComponent("#uppercaseCheck"),
    new WFComponent("#digitCheck"),
    new WFComponent("#charCheck"),
  ];

  // Function to update visual indicators for password strength based on user input
  const updatePasswordRequirements = (password: string) => {
    const checks = [
      password.length >= 8,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
    ];

    passwordRequirements.forEach((requirement, index) => {
      if (checks[index]) {
        requirement.addCssClass("passed");
      } else {
        requirement.removeCssClass("passed");
      }
    });
  };

  // Attach a handler to update password requirements as the user types
  fields
    .find(({ input }) => input === fields[3].input)
    ?.input.on("input", () => {
      const inputElement = fields[3].input.getElement() as HTMLInputElement;
      updatePasswordRequirements(inputElement.value);
    });

  // Handle form submission
  form.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop the form from submitting normally
    let isFormValid = true;

    requestAnimation.setStyle({ display: "flex" }); // Show loading animation

    // Clear the requestError at the beginning of each submission attempt
    toggleError(requestError, "", false);

    // Validate all fields before proceeding
    fields.forEach(({ input, error, validationFn, message }) => {
      const errorMessage =
        input === termsField.input
          ? createCheckboxValidationFunction(input, message)()
          : createValidationFunction(input, validationFn, message)();

      if (errorMessage) {
        toggleError(error, errorMessage, true);

        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      console.log("Validation failed:", formData);
      toggleError(requestError, "Please correct all errors above.", true);
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "create_account";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(requestError, "reCAPTCHA verification failed.", true);
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Prepare data for submission
    formData = form.getFormData();
    console.log("Form data:", formData);

    // Post data to a server endpoint
    try {
      const response = await apiClient
        .post<CreateAccountResponse>("/auth/create-account", {
          data: formData,
        })
        .fetch();
      if (response.status === "success") {
        form.showSuccessState(); // Display success state for the form
        const successTrigger = new WFComponent("#onSuccessTrigger");
        successTrigger.getElement()?.click();
      } else {
        throw new Error("Failed to create account.");
      }
    } catch (error) {
      console.error("Account creation failed:", error);
      toggleError(
        requestError,
        error.response.data.message || "Failed to create account.",
        true
      );
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    } finally {
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};
