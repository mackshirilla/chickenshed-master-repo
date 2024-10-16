// src/modules/pages/studentProfile/editStudentDialog.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
  setupFileUpload,
} from "../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmailOptional,
  validatePhoneNumber,
  validateSelectField,
} from "../../../utils/validationUtils";
import { getStudentDetails } from "./getStudentDetails";

// Define the ApiResponse interface to type the API responses
interface ApiResponse {
  status: string;
  message?: string;
  profile_pic?: any;
  [key: string]: any;
}

export const initializeEditStudentDialog = (studentId: number) => {
  // Attempt to retrieve and initialize the "Open Edit Dialog" button
  let openEditDialogButton: WFComponent | null = null;
  try {
    openEditDialogButton = new WFComponent("#openEditStudentDialog");
  } catch (error) {
    console.warn(
      "Element #openEditStudentDialog not found. Skipping initialization of edit dialog opener."
    );
  }

  // Attempt to retrieve the edit student dialog element
  const editStudentDialogElement = document.getElementById(
    "editStudentDialog"
  ) as HTMLDialogElement | null;

  // Attempt to retrieve and initialize the "Close Dialog" button
  let closeDialogButton: WFComponent | null = null;
  try {
    closeDialogButton = new WFComponent("#close-dialog-btn");
  } catch (error) {
    console.warn(
      "Element #close-dialog-btn not found. Skipping initialization of dialog closer."
    );
  }

  // If the "Open Edit Dialog" button exists, set up the click event listener
  if (openEditDialogButton && editStudentDialogElement) {
    openEditDialogButton.on("click", () => {
      populateEditStudentForm();
      editStudentDialogElement.showModal();
    });
  }

  // If the "Close Dialog" button exists and the dialog element is present, set up the click event listener
  if (closeDialogButton && editStudentDialogElement) {
    closeDialogButton.on("click", () => {
      editStudentDialogElement.close();
    });
  }

  // Initialize the form if it exists
  let form: WFFormComponent<any> | null = null;
  try {
    form = new WFFormComponent<{
      profile_pic: File | null;
      first_name: string;
      last_name: string;
      email: string;
      phone: string;
      send_texts: boolean;
      dob: string;
      gender: string;
      school: string;
      grade: string;
      health: string;
      dismissal_names: string;
      independent_travel: boolean;
      family_involved: string;
      photo_release: boolean;
    }>("#editStudentForm");
  } catch (error) {
    console.warn(
      "Element #editStudentForm not found. Skipping form initialization."
    );
  }

  // Initialize error component for form submission errors if it exists
  let formSubmitError: WFComponent | null = null;
  try {
    formSubmitError = new WFComponent("#editStudentSubmitError");
  } catch (error) {
    console.warn(
      "Element #editStudentSubmitError not found. Skipping initialization of form submission error display."
    );
  }

  // Define validation rules for each field if the form exists
  const fields = form
    ? [
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
          message: "Invalid email format",
        },
        {
          input: new WFComponent("#phoneNumberInput"),
          error: new WFComponent("#phoneNumberInputError"),
          validationFn: validatePhoneNumber,
          message: "Phone number must be in the format (xxx) xxx-xxxx",
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
          message: "Please select a gender",
        },
        {
          input: new WFComponent("#schoolInput"),
          error: new WFComponent("#schoolInputError"),
          validationFn: validateNotEmpty,
          message: "School is required",
        },
        {
          input: new WFComponent("#gradeInput"),
          error: new WFComponent("#gradeInputError"),
          validationFn: validateSelectField,
          message: "Please select a grade",
        },
        {
          input: new WFComponent("#healthInput"),
          error: new WFComponent("#healthInputError"),
          validationFn: validateNotEmpty,
          message: "Health information is required",
        },
        {
          input: new WFComponent("#dismissalNamesInput"),
          error: new WFComponent("#dismissalNamesInputError"),
          validationFn: validateNotEmpty,
          message: "Dismissal names are required",
        },
        {
          input: new WFComponent("#familyInvolvedInput"),
          error: new WFComponent("#familyInvolvedInputError"),
          validationFn: validateNotEmpty,
          message: "Family involvement information is required",
        },
      ]
    : [];

  // Setup validation for each field if the form exists
  if (form && formSubmitError) {
    fields.forEach(({ input, error, validationFn, message }) => {
      try {
        setupValidation(
          input,
          error,
          createValidationFunction(input, validationFn, message),
          formSubmitError
        );
      } catch (error) {
        console.warn(
          `Validation setup failed for one of the fields: ${message}. Error:`,
          error
        );
      }
    });
  }

  // Setup checkbox components if they exist
  let sendTextsInput: WFComponent | null = null;
  let independentTravelInput: WFComponent | null = null;
  let photoReleaseInput: WFComponent | null = null;

  try {
    sendTextsInput = new WFComponent("#sendTextsInput");
  } catch (error) {
    console.warn(
      "Element #sendTextsInput not found. Skipping initialization of sendTextsInput."
    );
  }

  try {
    independentTravelInput = new WFComponent("#independentTravelInput");
  } catch (error) {
    console.warn(
      "Element #independentTravelInput not found. Skipping initialization of independentTravelInput."
    );
  }

  try {
    photoReleaseInput = new WFComponent("#photoReleaseInput");
  } catch (error) {
    console.warn(
      "Element #photoReleaseInput not found. Skipping initialization of photoReleaseInput."
    );
  }

  // Handle form submission if the form exists
  if (form && formSubmitError) {
    form.onFormSubmit(async (formData, event) => {
      event.preventDefault();
      // Show loading animation inside submit button if it exists
      let requestingAnimation: WFComponent | null = null;
      try {
        requestingAnimation = new WFComponent("#requestingAnimation");
        requestingAnimation.setStyle({ display: "block" });
      } catch (error) {
        console.warn(
          "Element #requestingAnimation not found. Skipping loading animation."
        );
      }

      let isFormValid = true;

      // Validate all fields
      fields.forEach(({ input, error, validationFn, message }) => {
        try {
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
        } catch (error) {
          console.warn(
            `Validation failed for field "${message}". Error:`,
            error
          );
          isFormValid = false;
        }
      });

      // No validation required for checkboxes since they are optional

      if (!isFormValid) {
        toggleError(formSubmitError, "Please correct all errors above.", true);
        // Hide loading animation if it exists
        if (requestingAnimation) {
          requestingAnimation.setStyle({ display: "none" });
        }
        return;
      } else {
        toggleError(formSubmitError, "", false);
      }

      // Disable submit button if it exists
      let submitButton: WFComponent | null = null;
      try {
        submitButton = new WFComponent("#editStudentSubmitButton");
        submitButton.setAttribute("disabled", "true");
      } catch (error) {
        console.warn(
          "Element #editStudentSubmitButton not found. Skipping disabling the submit button."
        );
      }

      // Prepare data for API
      const dataToUpdate = { ...formData };

      try {
        // Send update request to API
        const response = (await apiClient
          .post(`/profiles/students/update_profile/${studentId}`, {
            data: dataToUpdate,
          })
          .fetch()) as ApiResponse;

        if (response.status === "success") {
          // Update successful

          // Refresh the student details on the page
          await getStudentDetails(studentId);

          // Reset the form with updated information
          populateEditStudentForm();

          // Close the dialog after successful request and data refresh if the dialog exists
          if (editStudentDialogElement) {
            editStudentDialogElement.close();
          }
        } else {
          throw new Error(response.message || "Update failed");
        }
      } catch (error: any) {
        console.error("Error updating student profile:", error);
        toggleError(
          formSubmitError,
          error.message || "An error occurred",
          true
        );
      } finally {
        // Hide loading animation if it exists
        if (requestingAnimation) {
          requestingAnimation.setStyle({ display: "none" });
        }
        // Re-enable submit button if it exists
        if (submitButton) {
          submitButton.removeAttribute("disabled");
        }
      }
    });
  }

  // Set up the file upload for the profile picture if the input exists
  try {
    const profilePictureInput = new WFComponent("#profilePictureInput");
    const profilePictureInputError = new WFComponent(
      "#profilePictureInputError"
    );
    const profilePictureInputSuccess = new WFComponent(
      "#profilePictureInputSuccess"
    );
    setupFileUpload(
      profilePictureInput,
      profilePictureInputError,
      profilePictureInputSuccess,
      "/profiles/students/image-upload"
    );
  } catch (error) {
    console.warn(
      "One or more profile picture upload elements not found. Skipping file upload setup."
    );
  }
};

// Function to populate the form with existing student data
const populateEditStudentForm = () => {
  const studentData = localStorage.getItem("current_student");
  if (!studentData) {
    console.error("No student data found");
    return;
  }

  let student: any;
  try {
    student = JSON.parse(studentData);
  } catch (parseError) {
    console.error("Error parsing student data from localStorage:", parseError);
    return;
  }

  // Log the student data for debugging
  console.log("Populating form with student data:", student);

  // Helper function to set input value if the element exists
  const setInputValue = (
    selector: string,
    value: string | boolean,
    isCheckbox: boolean = false
  ) => {
    try {
      const element = document.querySelector(selector) as
        | HTMLInputElement
        | HTMLSelectElement
        | HTMLTextAreaElement
        | null;
      if (element) {
        if (isCheckbox && element instanceof HTMLInputElement) {
          element.checked = Boolean(value);
          console.log(`Set checkbox ${selector} to`, value);
        } else if (
          element instanceof HTMLInputElement ||
          element instanceof HTMLSelectElement ||
          element instanceof HTMLTextAreaElement
        ) {
          element.value = String(value);
          console.log(`Set value of ${selector} to`, value);
        } else {
          console.warn(
            `Element ${selector} is not an input, select, or textarea. Skipping setting its value.`
          );
        }
      } else {
        console.warn(
          `Element ${selector} not found. Skipping setting its value.`
        );
      }
    } catch (error) {
      console.warn(`Error setting value for ${selector}:`, error);
    }
  };

  // Set form fields using the helper function
  setInputValue("#firstNameInput", student.first_name);
  setInputValue("#lastNameInput", student.last_name);
  setInputValue("#emailInput", student.email);
  setInputValue("#phoneNumberInput", student.phone);
  setInputValue("#sendTextsInput", student.send_texts, true);
  setInputValue("#dobInput", student.dob);
  setInputValue("#genderInput", student.gender);
  setInputValue("#schoolInput", student.school);
  setInputValue("#gradeInput", student.grade);
  setInputValue("#healthInput", student.health); // Ensure this selector matches an input/select/textarea
  setInputValue("#dismissalNamesInput", student.dismissal_names);
  setInputValue("#independentTravelInput", student.independent_travel, true);
  setInputValue("#familyInvolvedInput", student.family_involved);
  setInputValue("#photoReleaseInput", student.photo_release, true);

  // Set profile picture preview using WFImage if the element exists
  try {
    const profilePictureImage = new WFImage("#profilePictureImage");
    if (student.profile_pic && student.profile_pic.url) {
      profilePictureImage.setImage(student.profile_pic.url);
      console.log("Set profile picture to:", student.profile_pic.url);
    } else {
      profilePictureImage.setImage("default-image-url");
      console.log("Set profile picture to default-image-url");
    }
  } catch (error) {
    console.warn(
      "Element #profilePictureImage not found. Skipping setting profile picture."
    );
  }
};
