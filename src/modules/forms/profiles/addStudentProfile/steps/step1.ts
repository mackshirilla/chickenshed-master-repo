// src/modules/forms/profiles/addStudentProfile/stepOne.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmailOptional,
  validatePhoneNumber,
} from "../../../../../utils/validationUtils";
import { handleRecaptcha } from "../../../../../utils/recaptchaUtils";
import { apiClient } from "../../../../../api/apiConfig";
import { WFSlider } from "@xatom/slider";
import { userAuth } from "../../../../../auth/authConfig";

export const initializeStepOne = (slider: WFSlider) => {
  console.log("Initialize Add Student Form");

  // Set sidebar first name from userAuth
  const firstNameText = new WFComponent("#firstNameText");
  firstNameText.setText(userAuth.getUser().profile.first_name);

  // Step 1 Form Initialization
  const formStepOne = new WFFormComponent<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  }>("#formStepOne");

  // Check if current_student exists in local storage
  const existingStudent = localStorage.getItem("current_student");
  if (existingStudent) {
    const student = JSON.parse(existingStudent);
    formStepOne.setFromData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      phone: student.phone,
      send_texts: student.send_texts,
    });
  }

  // Define the fields with associated validation rules and error messages
  const fieldsStepOne = [
    {
      input: new WFComponent("#firstNameInput"),
      error: new WFComponent("#firstNameInputError"),
      validationFn: validateNotEmpty,
      message: "First name is required",
    },
    {
      input: new WFComponent("#lastNameInput"),
      error: new WFComponent("#lastNameInputError"),
      validationFn: validateNotEmpty,
      message: "Last name is required",
    },
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmailOptional,
      message: "Please enter a valid email address",
    },
    {
      input: new WFComponent("#phoneNumberInput"),
      error: new WFComponent("#phoneNumberInputError"),
      validationFn: validatePhoneNumber,
      message: "Please enter a valid phone number",
    },
  ];

  // Auto-format phone number input to (xxx) xxx-xxxx
  const phoneNumberInput = new WFComponent("#phoneNumberInput");
  phoneNumberInput.on("input", () => {
    const inputElement = phoneNumberInput.getElement() as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart as number;
    inputElement.value = formatPhoneNumber(inputElement.value);
    const formattedLength = inputElement.value.length;
    const cleanedLength = inputElement.value.replace(/\D/g, "").length;
    inputElement.setSelectionRange(
      cursorPosition + (formattedLength - cleanedLength),
      cursorPosition + (formattedLength - cleanedLength)
    );
  });

  // Initialize validation for each field
  fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepOneError")
    );
  });

  // Handle form submission for Step 1
  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    const stepOneRequestingAnimation = new WFComponent(
      "#stepOneRequestingAnimation"
    );
    stepOneRequestingAnimation.setStyle({ display: "block" }); // Show loading animation
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
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
      toggleError(
        new WFComponent("#submitStepOneError"),
        "Please correct all errors above.",
        true
      );
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Check if a student profile already exists in local storage
    if (existingStudent) {
      const student = JSON.parse(existingStudent);
      // Skip creating a new profile and navigate directly to the next step
      slider.goNext();
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "create_account";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);
    if (!isRecaptchaValid) {
      toggleError(
        new WFComponent("#submitStepOneError"),
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Post data to a server endpoint
    try {
      const response = await apiClient
        .post("/profiles/students/create-student", {
          data: formData,
        })
        .fetch();

      if (response.status === "success") {
        const { profile } = response;
        localStorage.setItem("current_student", JSON.stringify(profile));
        slider.goNext(); // Proceed to next step
      }
    } catch (error: any) {
      toggleError(
        new WFComponent("#submitStepOneError"),
        error.response?.data?.message || "Failed to create account.",
        true
      );
    } finally {
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });
};

// Helper function to format phone number
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  let formatted = "";
  if (cleaned.length <= 3) {
    formatted = cleaned;
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(
      3,
      6
    )}-${cleaned.slice(6, 10)}`;
  }
  return formatted;
}
