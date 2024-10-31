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
  fields.forEach(({ input, error, validationFn, message }) => {
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
    const recaptchaAction = "login"; // Changed action to "login" for better context
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

        // Determine the redirect URL based on user role
        let redirectUrl = "/dashboard"; // Default redirect

        if (user.role === "STUDENT") {
          redirectUrl = "/student-dashboard";
        } else if (user.role === "USER") {
          redirectUrl = "/dashboard";
        } else {
          // Handle other roles or set a default
          redirectUrl = "/dashboard";
        }

        // Optionally, check for a stored redirect URL
        const storedRedirect = localStorage.getItem("loginRedirect");
        if (storedRedirect) {
          redirectUrl = storedRedirect;
          localStorage.removeItem("loginRedirect");
        }

        // Navigate to the determined URL
        navigate(redirectUrl);
      } else {
        throw new Error(response.message || "Login failed.");
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      toggleError(
        requestError,
        error.response?.data?.message || error.message || "Failed to login.",
        true
      );
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    } finally {
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};
