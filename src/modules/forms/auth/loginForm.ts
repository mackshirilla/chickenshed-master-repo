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
    id: string;
    email: string;
    role: "USER" | "STUDENT" | "GUEST";
    profile?: {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
      profile_pic?: {
        url: string;
      };
    };
  };
};

export const loginForm = () => {
  const form = new WFFormComponent<{
    email: string;
    password: string;
  }>("#loginForm");

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
  const handleApiResponse = (response: LoginResponse) => {
    if (response.status !== "success") {
      throw new Error(response.message || "An unknown error occurred.");
    }
    return response;
  };

  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();

    toggleError(requestError, "", false); // Clear previous errors
    requestAnimation.setStyle({ display: "flex" }); // Show loading animation

    let isFormValid = true;

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
    const recaptchaAction = "login";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(requestError, "reCAPTCHA verification failed.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    formData = form.getFormData(); // Prepare form data

    try {
      const response = await apiClient
        .post<LoginResponse>("/auth/login", { data: formData })
        .fetch();

      // Handle API response
      const result = handleApiResponse(response);

      // Transform the API response to match the expected UserData format
      const user: UserData = {
        user_id: result.user?.id || "",
        email: result.user?.email || "",
        role: result.user?.role || "GUEST",
        profile: result.user?.profile
          ? {
              profile_id: result.user.profile.id,
              first_name: result.user.profile.first_name,
              last_name: result.user.profile.last_name,
              profile_pic: result.user.profile.profile_pic,
            }
          : undefined,
      };

      // Update userAuth and localStorage
      authManager.setUser(
        user, // Transformed user data
        user.role, // Set appropriate role
        result.authToken // Set the auth token
      );

      // Determine the redirect URL based on user role
      let redirectUrl = "/dashboard"; // Default redirect

      if (user.role === "STUDENT") {
        redirectUrl = "/student-dashboard";
      } else if (user.role === "USER") {
        redirectUrl = "/dashboard";
      } else {
        redirectUrl = "/dashboard";
      }

      // Optionally, check for a stored redirect URL
      const storedRedirect = localStorage.getItem("loginRedirect");
      if (storedRedirect) {
        redirectUrl = storedRedirect;
        localStorage.removeItem("loginRedirect");
      }

      navigate(redirectUrl); // Navigate to the determined URL
    } catch (error: any) {
      console.error("Login failed:", error);
      toggleError(
        requestError,
        error.message || "Failed to login.",
        true
      );
    } finally {
      requestAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};
