import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import { validateEmail } from "../../../utils/validationUtils";
import { handleRecaptcha } from "../../../utils/recaptchaUtils"; // Ensure this function is implemented for reCAPTCHA handling
import { apiClient } from "../../../api/apiConfig"; // Ensure you have set up this API client for server interactions

type ForgotPasswordResponse = {
  status: string;
  message: string;
};

export const forgotPasswordForm = () => {
  const form = new WFFormComponent<{
    email: string;
  }>("#forgotPasswordForm");

  const fields = [
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address.",
    },
  ];

  const requestError = new WFComponent("#requestError");
  const requestAnimation = new WFComponent("#requestingAnimation");

  fields.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      requestError
    );
  });

  // Helper function to handle API responses
  const handleApiResponse = (response: ForgotPasswordResponse) => {
    if (response.status !== "success") {
      throw new Error(response.message || "An unknown error occurred.");
    }
    return response;
  };

  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    let isFormValid = true;

    requestAnimation.setStyle({ display: "flex" }); // Show loading animation
    toggleError(requestError, "", false); // Clear previous errors

    // Validate all fields
    fields.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(input, validationFn, message)();

      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      toggleError(requestError, "Please correct all errors above.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "forgot_password";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(requestError, "reCAPTCHA verification failed.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    // Submit data
    try {
      const response = await apiClient
        .post<ForgotPasswordResponse>("/auth/forgot-password", { data: formData })
        .fetch();

      // Process the response
      handleApiResponse(response);

      form.showSuccessState(); // Display success state for the form
      const successTrigger = new WFComponent("#onSuccessTrigger");
      successTrigger.getElement()?.click();
    } catch (error: any) {
      console.error("Forgot password failed:", error);
      toggleError(
        requestError,
        error.message || "Failed to send reset password request.",
        true
      );
    } finally {
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};
