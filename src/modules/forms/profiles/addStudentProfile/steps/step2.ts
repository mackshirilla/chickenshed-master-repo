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

/**
 * Initializes Step Two of the Add Student Profile Form.
 * Handles image uploads, field validations, and form submissions.
 * @param slider - The WFSlider instance controlling the form steps.
 */
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

  // Set up file upload with enhanced functionality
  setupFileUpload(
    profilePictureInput,
    profilePictureInputError,
    profilePictureInputSuccess,
    "/profiles/students/image-upload" // Replace with your actual endpoint
  )
    .then((imageUrl) => {
      console.log("Image uploaded successfully: ", imageUrl);

      // Update the 'profile_pic' field in the form with the uploaded image URL
      const profilePicInputElement = document.querySelector(
        "#profile_pic"
      ) as HTMLInputElement;
      if (profilePicInputElement) {
        profilePicInputElement.value = imageUrl;
        console.log(`'profile_pic' field set to: ${imageUrl}`);
      } else {
        console.warn(
          "Profile picture input element ('#profile_pic') not found."
        );
      }

      // Indicate success to the user
      profilePictureInputSuccess.setText("Image uploaded successfully!");
    })
    .catch((error) => {
      console.error("Error uploading image: ", error.message);
      toggleError(
        profilePictureInputError,
        "Failed to upload image. Please try again.",
        true
      );
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
    console.log("Step Two Form submission initiated.");

    let isFormValid = true;

    // Validate all fields before proceeding
    fieldsStepTwo.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(
        input,
        validationFn,
        message
      )();
      console.log(
        `Validation result for ${input.getElement().id}: "${errorMessage}"`
      );
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
      console.log("Form validation failed. Errors are displayed.");
      return;
    }

    // **Check if an image was uploaded by examining the 'profile_pic' field**
    if (!formData.profile_pic) {
      localStorage.removeItem("image_upload");
      console.log("No image uploaded. Cleared 'image_upload' from local storage.");
    } else {
      // Optionally, you can ensure 'image_upload' is set correctly if needed
      // Example:
      // localStorage.setItem("image_upload", formData.profile_pic);
      console.log("'profile_pic' exists. No action taken on 'image_upload'.");
    }

    // Proceed to the next step
    console.log("Form is valid. Navigating to the next step.");
    slider.goNext();
  });

  // Handle back button for Step 2
  const backStepButton = new WFComponent("#backStepTwo");
  backStepButton.on("click", () => {
    console.log("Back button clicked. Navigating to the previous step.");
    slider.goPrevious();
    unsetActiveStep(2);
    unmarkStepAsCompleted(1);
    unmarkStepAsCompleted(2);
  });
};
