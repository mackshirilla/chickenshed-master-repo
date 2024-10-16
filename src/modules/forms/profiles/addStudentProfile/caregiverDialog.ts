// src/modules/forms/profiles/addStudentProfile/caregiverDialog.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../utils/formUtils";
import { validateEmail } from "../../../../utils/validationUtils";
import { handleRecaptcha } from "../../../../utils/recaptchaUtils";
import { apiClient } from "../../../../api/apiConfig";

export const initializeCaregiverDialog = (slider: WFSlider) => {
  console.log("Initialize Invite Caregiver Form");

  // Caregiver Form Initialization
  const caregiverForm = new WFFormComponent<{
    caregiver_email: string;
  }>("#inviteCaregiverDialog");

  // Define the fields with associated validation rules and error messages
  const fieldsCaregiver = [
    {
      input: new WFComponent("#caregiverEmailInput"),
      error: new WFComponent("#caregiverEmailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address",
    },
  ];

  // Initialize validation for each field
  fieldsCaregiver.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitInviteCaregiverError")
    );
  });

  // Handle form submission for Caregiver Form
  caregiverForm.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    const caregiverRequestingAnimation = new WFComponent(
      "#caregiverRequestingAnimation"
    );
    caregiverRequestingAnimation.setStyle({ display: "block" }); // Show loading animation

    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsCaregiver.forEach(({ input, error, validationFn, message }) => {
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
      toggleError(
        new WFComponent("#submitInviteCaregiverError"),
        "Please correct all errors above.",
        true
      );
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "complete_caregiver";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);
    if (!isRecaptchaValid) {
      toggleError(
        new WFComponent("#submitInviteCaregiverError"),
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Post data to a server endpoint
    try {
      const response = await apiClient
        .post("/caregivers/invite", {
          data: formData,
        })
        .fetch();

      if (response.status === "success") {
        const onSuccessTrigger = new WFComponent(
          "#inviteCaregiverSuccessTrigger"
        );
        caregiverForm.showSuccessState();
        onSuccessTrigger.getElement().click();
      }
    } catch (error: any) {
      toggleError(
        new WFComponent("#submitInviteCaregiverError"),
        error.response?.data?.message || "Failed to create account.",
        true
      );
    } finally {
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });

  // Initialize reset form button
  const resetCaregiverForm = new WFComponent("#resetCaregiverForm");
  resetCaregiverForm.on("click", () => {
    caregiverForm.resetForm();
    caregiverForm.showForm();
    const onSuccessTrigger = new WFComponent("#inviteCaregiverSuccessTrigger");
    onSuccessTrigger.getElement().click();
  });
};
