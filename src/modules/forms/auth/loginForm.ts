import { WFComponent, WFFormComponent, navigate } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import {
  validateEmail,
  validateNotEmpty,
} from "../../../utils/validationUtils";
import { handleRecaptcha } from "../../../utils/recaptchaUtils";
import { apiClient } from "../../../api/apiConfig";
import { authManager, UserData } from "../../../auth/authConfig";

type LoginResponse = {
  status: string;
  message: string;
  authToken?: string;
  user?: {
    user_id: string;
    email: string;
    role: "USER" | "STUDENT" | "GUEST";
    profile?: {
      profile_id: string;
      first_name: string;
      last_name: string;
      profile_picture: {
        url: string;
      };
    };
  };
};

export const loginForm = () => {
  const form = new WFFormComponent<{
    email: string;
    password: string;
  }>("#loginForm"); // Replace with your login form ID

  const fields = [
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address.",
    },
    {
      input: new WFComponent("#passwordInput"),
      error: new WFComponent("#passwordInputError"),
      validationFn: validateNotEmpty,
      message: "Please enter your password.",
    },
  ];

  // Component for displaying any request-level error messages
  const requestError = new WFComponent("#requestError");
  const requestAnimation = new WFComponent("#requestingAnimation");

  // Initialize validation for text input fields
  fields.slice(0, -1).forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      requestError // Includes clearing requestError on input change
    );
  });

  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    // Clear any previous request-level error messages
    toggleError(requestError, "", false);
    // Display loading animation
    requestAnimation.setStyle({ display: "flex" });

    let isFormValid = true;
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

    // Prepare data for login request
    formData = form.getFormData();

    // Send login request to API
    try {
      const response = await apiClient
        .post<LoginResponse>("/auth/login", { data: formData })
        .fetch();

      if (response.status === "success" && response.user) {
        // Transform the API response to match the expected UserData format
        const user: UserData = {
          user_id: response.user.user_id,
          email: response.user.email,
          role: response.user.role,
          profile: response.user.profile
            ? {
                profile_id: response.user.profile.profile_id,
                first_name: response.user.profile.first_name,
                last_name: response.user.profile.last_name,
                profile_pic: response.user.profile.profile_picture,
              }
            : undefined,
        };

        // Update userAuth and localStorage
        authManager.setUser(
          user, // Transformed user data
          user.role, // Set appropriate role
          response.authToken // Set the auth token
        );

        // Redirect to the page the user intended to access or default to dashboard
        const redirectUrl =
          localStorage.getItem("loginRedirect") || "/dashboard";
        localStorage.removeItem("loginRedirect");
        navigate(redirectUrl);
      } else {
        throw new Error("Login failed.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toggleError(
        requestError,
        error.response?.data?.message || "Failed to login.",
        true
      );
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    } finally {
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};
