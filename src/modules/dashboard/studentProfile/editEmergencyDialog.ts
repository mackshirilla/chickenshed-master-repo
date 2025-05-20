// src/modules/pages/studentProfile/editEmergencyDialog.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmailOptional,
  validatePhoneNumber,
} from "../../../utils/validationUtils";
import { getStudentDetails } from "./getStudentDetails";

// Define the ApiResponse interface to type the API responses
interface ApiResponse {
  status: string;
  message?: string;
  [key: string]: any;
}

export const initializeEditEmergencyDialog = (studentId: number) => {
  const openDialogButton = new WFComponent("#openEmergencyContactDialog");
  const emergencyDialog = document.getElementById(
    "editEmergencyContactDialog"
  ) as HTMLDialogElement;
  // Allow clicking outside the dialog (on the backdrop) to close it
if (emergencyDialog) {
  emergencyDialog.addEventListener("click", (event) => {
    if (event.target === emergencyDialog) {
      emergencyDialog.close();
    }
  });
}
  const closeDialogButton = new WFComponent("#close-emergency-dialog-btn");

  // Open the dialog when the button is clicked
  openDialogButton.on("click", async () => {
    // Fetch the latest student details before populating the form
    await getStudentDetails(studentId);

    // Populate the form with the latest emergency contact details
    populateEmergencyContactForm();

    // Update the emergency contact full name on the page
    updateEmergencyContactFullName();

    emergencyDialog.showModal();
  });

  // Close the dialog when the close button is clicked
  closeDialogButton.on("click", () => {
    emergencyDialog.close();
  });

  // Initialize the form
  const form = new WFFormComponent<{
    emergency_first_name: string;
    emergency_last_name: string;
    emergency_email: string;
    emergency_phone: string;
    emergency_relationship: string;
  }>("#editEmergencyContactForm");

  // Initialize error component for form submission errors
  const formSubmitError = new WFComponent("#editEmergencySubmitError");

  // Define validation rules
  const fields = [
    {
      input: new WFComponent("#emergencyFirstNameInput"),
      error: new WFComponent("#emergencyFirstNameInputError"),
      validationFn: validateNotEmpty,
      message: "First name is required",
    },
    {
      input: new WFComponent("#emergencyLastNameInput"),
      error: new WFComponent("#emergencyLastNameInputError"),
      validationFn: validateNotEmpty,
      message: "Last name is required",
    },
    {
      input: new WFComponent("#emergencyEmailInput"),
      error: new WFComponent("#emergencyEmailInputError"),
      validationFn: validateEmailOptional,
      message: "Invalid email format",
    },
    {
      input: new WFComponent("#emergencyPhoneInput"),
      error: new WFComponent("#emergencyPhoneInputError"),
      validationFn: validatePhoneNumber,
      message: "Phone number must be in the format (xxx) xxx-xxxx",
    },
    {
      input: new WFComponent("#emergencyRelationshipInput"),
      error: new WFComponent("#emergencyRelationshipInputError"),
      validationFn: validateNotEmpty,
      message: "Relationship is required",
    },
  ];

  // Setup validation for each field
  fields.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      formSubmitError
    );
  });

  // Handle form submission
  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();

    let isFormValid = true;

    // Validate all fields
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
      toggleError(formSubmitError, "Please correct all errors above.", true);
      return;
    } else {
      toggleError(formSubmitError, "", false);
    }

    // Show loading animation inside submit button
    const requestingAnimation = new WFComponent(
      "#requestingEmergencyAnimation"
    );
    requestingAnimation.setStyle({ display: "block" });

    // Disable submit button
    const submitButton = new WFComponent("#editEmergencySubmitButton");
    submitButton.setAttribute("disabled", "true");

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
        populateEmergencyContactForm();

        // Update the emergency contact full name on the page
        updateEmergencyContactFullName();

        // Close the dialog after successful request and data refresh
        emergencyDialog.close();
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Error updating emergency contact:", error);
      toggleError(formSubmitError, error.message || "An error occurred", true);
    } finally {
      requestingAnimation.setStyle({ display: "none" });
      submitButton.removeAttribute("disabled");
    }
  });

  // Update the emergency contact full name on page load
  updateEmergencyContactFullName();
};

// Function to populate the form with existing emergency contact data
const populateEmergencyContactForm = () => {
  const studentData = localStorage.getItem("current_student");
  if (!studentData) {
    console.error("No student data found");
    return;
  }

  const student = JSON.parse(studentData);

  // Set form fields directly from student object
  const emergencyFirstNameInput = new WFComponent(
    "#emergencyFirstNameInput"
  ).getElement() as HTMLInputElement;
  emergencyFirstNameInput.value = student.emergency_first_name || "";

  const emergencyLastNameInput = new WFComponent(
    "#emergencyLastNameInput"
  ).getElement() as HTMLInputElement;
  emergencyLastNameInput.value = student.emergency_last_name || "";

  const emergencyEmailInput = new WFComponent(
    "#emergencyEmailInput"
  ).getElement() as HTMLInputElement;
  emergencyEmailInput.value = student.emergency_email || "";

  const emergencyPhoneInput = new WFComponent(
    "#emergencyPhoneInput"
  ).getElement() as HTMLInputElement;
  emergencyPhoneInput.value = student.emergency_phone || "";

  const emergencyRelationshipInput = new WFComponent(
    "#emergencyRelationshipInput"
  ).getElement() as HTMLInputElement;
  emergencyRelationshipInput.value = student.emergency_relationship || "";
};

// Function to update the emergency contact full name on the page
const updateEmergencyContactFullName = () => {
  const studentData = localStorage.getItem("current_student");
  if (!studentData) {
    console.error("No student data found");
    return;
  }

  const student = JSON.parse(studentData);

  const fullName = `${student.emergency_first_name || ""} ${
    student.emergency_last_name || ""
  }`.trim();

  const fullNameComponent = new WFComponent("#emergencyContactFullName");
  fullNameComponent.setText(fullName);
};
