import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import {
  validateEmail,
  validatePasswordRequirements,
} from "../../../utils/validationUtils";
import { handleRecaptcha } from "../../../utils/recaptchaUtils"; // Ensure this function is implemented for reCAPTCHA handling
import { apiClient } from "../../../api/apiConfig"; // Ensure you have set up this API client for server interactions

type forgotPasswordResponse = {
  status: string;
  message: string;
};

export const forgotPasswordForm = () => {
  // Initialize the main form component with the specified form ID
  const form = new WFFormComponent<{
    email: string;
  }>("#forgotPasswordForm");

  // define fields with associated validation rules and messages
  const fields = [
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address.",
    },
  ];

  // Component for displaying any request-level error messages
  const requestError = new WFComponent("#requestError");
  const requestAnimation = new WFComponent("#requestingAnimation");

  // Initialize validation for text input fields
  fields.slice(0).forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      requestError // Includes clearing requestError on input change
    );
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
      toggleError(requestError, "Please correct all errors above.", true);
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "forgot_password";
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
        .post<forgotPasswordResponse>("/auth/forgot-password", {
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
