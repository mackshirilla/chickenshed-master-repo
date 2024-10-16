// src/modules/forms/profiles/addStudentProfile/stepTwo.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
  setupFileUpload,
} from "../../../../../utils/formUtils";
import {
  validateNotEmpty,
  validateSelectField,
} from "../../../../../utils/validationUtils";
import { WFSlider } from "@xatom/slider";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

export const initializeStepTwo = (slider: WFSlider) => {
  console.log("Initialize Step Two Form");

  // Step 2 Form Initialization
  const formStepTwo = new WFFormComponent<{
    profile_pic: string;
    grade: string;
    school: string;
    dob: string;
    gender: string;
  }>("#formStepTwo");

  // File Upload Setup for Profile Picture
  const profilePictureInput = new WFComponent("#profilePictureInput");
  const profilePictureInputError = new WFComponent("#profilePictureInputError");
  const profilePictureInputSuccess = new WFComponent(
    "#profilePictureInputSuccess"
  );

  setupFileUpload(
    profilePictureInput,
    profilePictureInputError,
    profilePictureInputSuccess,
    "/profiles/students/image-upload" // Replace with your actual endpoint
  )
    .then((imageUrl) => {
      console.log("Image uploaded successfully: ", imageUrl);

      // Indicate success but no need to update form input as per your setup.
      profilePictureInputSuccess.setText("Image uploaded successfully!");
    })
    .catch((error) => {
      console.error("Error uploading image: ", error.message);
    });

  // Define the fields with associated validation rules and error messages
  const fieldsStepTwo = [
    {
      input: new WFComponent("#gradeInput"),
      error: new WFComponent("#gradeInputError"),
      validationFn: validateSelectField,
      message: "Grade is required",
    },
    {
      input: new WFComponent("#schoolInput"),
      error: new WFComponent("#schoolInputError"),
      validationFn: validateNotEmpty,
      message: "School is required",
    },
    {
      input: new WFComponent("#dobInput"),
      error: new WFComponent("#dobInputError"),
      validationFn: validateNotEmpty,
      message: "Date of birth is required",
    },
    {
      input: new WFComponent("#genderInput"),
      error: new WFComponent("#genderInputError"),
      validationFn: validateSelectField,
      message: "Please select an option",
    },
  ];

  // Initialize validation for each field
  fieldsStepTwo.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepTwoError")
    );
  });

  // Handle form submission for Step 2
  formStepTwo.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepTwo.forEach(({ input, error, validationFn, message }) => {
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
        new WFComponent("#submitStepTwoError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    // Proceed to the next step
    slider.goNext();
  });

  // Handle back button for Step 2
  const backStepButton = new WFComponent("#backStepTwo");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(2);
    unmarkStepAsCompleted(1);
    unmarkStepAsCompleted(2);
  });
};
