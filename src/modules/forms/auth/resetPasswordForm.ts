// src/modules/auth/passwordResetForm.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import {
  validateNotEmpty,
  validatePasswordsMatch,
} from "../../../utils/validationUtils";
import { apiClient } from "../../../api/apiConfig";
import { handleRecaptcha } from "../../../utils/recaptchaUtils";
import { authManager } from "../../../auth/authConfig";

type PasswordResetResponse = {
  status: string;
  message: string;
};

export const passwordResetForm = () => {
  const form = new WFFormComponent<{
    password: string;
    confirmPassword: string;
  }>("#passwordResetForm"); // Replace with your form ID

  const fields = [
    {
      input: new WFComponent("#passwordInput"),
      error: new WFComponent("#passwordInputError"),
      validationFn: validateNotEmpty,
      message: "Please enter a new password.",
    },
    {
      input: new WFComponent("#confirmPasswordInput"),
      error: new WFComponent("#confirmPasswordInputError"),
      validationFn: (confirmPassword) =>
        validatePasswordsMatch(form.getFormData().password, confirmPassword), // Access actual values
      message: "Passwords do not match.",
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
    .find(({ input }) => input === fields[0].input)
    ?.input.on("input", () => {
      const inputElement = fields[0].input.getElement() as HTMLInputElement;
      updatePasswordRequirements(inputElement.value);
    });

  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();
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

    try {
      const response = await apiClient
        .post<PasswordResetResponse>("/auth/reset-password", {
          data: formData,
        })
        .fetch();

      if (response.status === "success") {
        form.showSuccessState(); // Show success message
        const successTrigger = new WFComponent("#onSuccessTrigger");
        successTrigger.getElement()?.click();
      } else {
        // Handle error
        throw new Error(response.message);
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
