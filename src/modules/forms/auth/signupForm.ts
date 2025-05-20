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
import { handleRecaptcha } from "../../../utils/recaptchaUtils";
import { apiClient } from "../../../api/apiConfig";

type CreateAccountResponse = {
  status: string;
  message: string;
};

export const signupForm = () => {
  const form = new WFFormComponent<{
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    terms_of_service: boolean;
    company?: string;
    website?: string;
  }>("#createAccountForm");

  const honeypotCompany = new WFComponent("#companyInput");
  const honeypotWebsite = new WFComponent("#websiteInput");

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

  const termsField = fields[fields.length - 1];
  setupValidation(
    termsField.input,
    termsField.error,
    createCheckboxValidationFunction(termsField.input, termsField.message),
    requestError
  );

  const passwordRequirements = [
    new WFComponent("#lengthCheck"),
    new WFComponent("#lowercaseCheck"),
    new WFComponent("#uppercaseCheck"),
    new WFComponent("#digitCheck"),
    new WFComponent("#charCheck"),
  ];

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

  fields
    .find(({ input }) => input === fields[3].input)
    ?.input.on("input", () => {
      const inputElement = fields[3].input.getElement() as HTMLInputElement;
      updatePasswordRequirements(inputElement.value);
    });

  const handleApiResponse = (response: CreateAccountResponse) => {
    if (response.status !== "success") {
      throw new Error(response.message || "An unknown error occurred.");
    }
    return response;
  };

  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    let isFormValid = true;

    requestAnimation.setStyle({ display: "flex" });
    toggleError(requestError, "", false);

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
      toggleError(requestError, "Please correct all errors above.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    const companyValue = (honeypotCompany.getElement() as HTMLInputElement).value.trim();
    const websiteValue = (honeypotWebsite.getElement() as HTMLInputElement).value.trim();

    if (companyValue !== "" || websiteValue !== "") {
      console.warn("Honeypot fields triggered. Possible bot.");
      toggleError(requestError, "Spam detected. Submission blocked.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    const recaptchaAction = "create_account";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(requestError, "reCAPTCHA verification failed.", true);
      requestAnimation.setStyle({ display: "none" });
      return;
    }

    try {
      const response = await apiClient
        .post<CreateAccountResponse>("/auth/create-account", { data: formData })
        .fetch();

      handleApiResponse(response);
      form.showSuccessState();
      const successTrigger = new WFComponent("#onSuccessTrigger");
      successTrigger.getElement()?.click();
    } catch (error: any) {
      console.error("Error:", error);
      toggleError(requestError, error.message || "Failed to create account.", true);
    } finally {
      requestAnimation.setStyle({ display: "none" });
    }
  });
};
