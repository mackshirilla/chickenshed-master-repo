// src/modules/pages/accountDetails/editUserDialog.ts

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
  validateEmail,
  validatePhoneNumber,
} from "../../../utils/validationUtils";
import { getUserDetails } from "./getUserDetails";

// Define the ApiResponse interface to type the API responses
interface ApiResponse {
  status: string;
  message?: string;
  profile_pic?: any;
  [key: string]: any;
}

// Declare variables in the outer scope
let isYMemberInput: WFComponent<HTMLInputElement>;
let hiddenYMemberWrapper: WFComponent<HTMLElement>;
let yMemberIdInput: WFComponent<HTMLInputElement>;
let yMemberIdInputError: WFComponent<HTMLElement>;

export const initializeEditUserDialog = () => {
  // Retrieve and initialize the "Open Edit Dialog" button
  const openEditDialogButton = new WFComponent("#openEditUserDialog");

  // Retrieve the edit user dialog element
  const editUserDialogElement = document.getElementById(
    "editUserDialog"
  ) as HTMLDialogElement | null;

  // Retrieve and initialize the "Close Dialog" button
  const closeDialogButton = new WFComponent("#close-dialog-btn");

  // Set up the click event listener to open the dialog
  openEditDialogButton.on("click", () => {
    populateEditUserForm();
    if (editUserDialogElement) {
      editUserDialogElement.showModal();
    }
  });

  // Set up the click event listener to close the dialog
  closeDialogButton.on("click", () => {
    if (editUserDialogElement) {
      editUserDialogElement.close();
    }
  });

  // Initialize the form
  const form = new WFFormComponent<{
    profile_pic: File | null;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zip: string;
    referred_by: string;
    is_y_member: boolean;
    y_membership_id: string;
  }>("#editUserForm");

  // Initialize error component for form submission errors
  const formSubmitError = new WFComponent("#editUserSubmitError");

  // Define validation rules for each field
  const fields = [
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
      validationFn: validateEmail,
      message: "Invalid email format",
    },
    {
      input: new WFComponent("#phoneNumberInput"),
      error: new WFComponent("#phoneNumberInputError"),
      validationFn: validatePhoneNumber,
      message: "Phone number must be in the format (xxx) xxx-xxxx",
    },
    // Add other fields as necessary
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

  // Initialize components for Y Member input
  isYMemberInput = new WFComponent<HTMLInputElement>("#isYMemberInput");
  hiddenYMemberWrapper = new WFComponent("#hiddenyMemberWrapper");
  yMemberIdInput = new WFComponent<HTMLInputElement>("#yMemberIdInput");
  yMemberIdInputError = new WFComponent("#yMemberIdInputError");

  const toggleYMemberInput = () => {
    const isChecked = isYMemberInput.getElement().checked;
    if (isChecked) {
      hiddenYMemberWrapper.removeCssClass("g-hide");
    } else {
      hiddenYMemberWrapper.addCssClass("g-hide");
      // Clear the Y Membership Number input
      yMemberIdInput.getElement().value = "";
    }
  };

  // Initialize the visibility on page load
  toggleYMemberInput();

  // Add event listener to the checkbox
  isYMemberInput.on("change", () => {
    toggleYMemberInput();
  });

  // Remove validation for yMemberIdInput since it's no longer required
  // Remove the yMemberIdValidation function and related code

  // Handle form submission
  form.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    const requestingAnimation = new WFComponent("#requestingAnimationEditUser");
    requestingAnimation.setStyle({ display: "block" });

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

    // Since Y Membership Number is not required, we don't need to validate it
    // However, we can clear any previous errors
    toggleError(yMemberIdInputError, "", false);

    if (!isFormValid) {
      toggleError(formSubmitError, "Please correct all errors above.", true);
      requestingAnimation.setStyle({ display: "none" });
      return;
    } else {
      toggleError(formSubmitError, "", false);
    }

    // Disable submit button
    const submitButton = new WFComponent("#editUserSubmitButton");
    submitButton.setAttribute("disabled", "true");

    // Prepare data for API
    const dataToUpdate = { ...formData };

    try {
      // Send update request to API
      const response = (await apiClient
        .post(`/profiles/update_profile`, {
          data: dataToUpdate,
        })
        .fetch()) as ApiResponse;

      if (response.status === "success") {
        // Update successful

        // Refresh the user details on the page
        await getUserDetails();

        // Reset the form with updated information
        populateEditUserForm();

        // Close the dialog after successful request and data refresh
        if (editUserDialogElement) {
          editUserDialogElement.close();
        }
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error);
      toggleError(formSubmitError, error.message || "An error occurred", true);
    } finally {
      // Hide loading animation
      requestingAnimation.setStyle({ display: "none" });
      // Re-enable submit button
      submitButton.removeAttribute("disabled");
    }
  });

  // Set up the file upload for the profile picture
  const profilePictureInput = new WFComponent("#profilePictureInput");
  const profilePictureInputError = new WFComponent("#profilePictureInputError");
  const profilePictureInputSuccess = new WFComponent(
    "#profilePictureInputSuccess"
  );
  setupFileUpload(
    profilePictureInput,
    profilePictureInputError,
    profilePictureInputSuccess,
    "/profiles/image-upload"
  );
};

// Function to populate the form with existing user data
const populateEditUserForm = () => {
  const userData = localStorage.getItem("current_user");
  if (!userData) {
    console.error("No user data found");
    return;
  }

  let user: any;
  try {
    user = JSON.parse(userData);
  } catch (parseError) {
    console.error("Error parsing user data from localStorage:", parseError);
    return;
  }

  // Helper function to set input value
  const setInputValue = (
    selector: string,
    value: string | boolean,
    isCheckbox: boolean = false
  ) => {
    const element = document.querySelector(selector) as
      | HTMLInputElement
      | HTMLSelectElement
      | HTMLTextAreaElement
      | null;
    if (element) {
      if (isCheckbox && element instanceof HTMLInputElement) {
        element.checked = Boolean(value);
      } else {
        element.value = String(value);
      }
    }
  };

  // Set form fields
  setInputValue("#firstNameInput", user.first_name);
  setInputValue("#lastNameInput", user.last_name);
  setInputValue("#emailInput", user.email);
  setInputValue("#phoneNumberInput", user.phone);
  setInputValue("#sendTextsInput", user.send_texts, true);
  setInputValue("#addressLineOneInput", user.address_line_1);
  setInputValue("#addressLineTwoInput", user.address_line_2);
  setInputValue("#cityInput", user.city);
  setInputValue("#stateInput", user.state);
  setInputValue("#zipInput", user.zip);
  setInputValue("#referralInput", user.referred_by);
  setInputValue("#isYMemberInput", user.is_y_member, true);
  setInputValue("#yMemberIdInput", user.y_membership_id);

  // Set profile picture preview using WFImage
  const profilePictureImage = new WFImage("#profilePictureImage");
  if (user.profile_pic && user.profile_pic.url) {
    profilePictureImage.setImage(user.profile_pic.url);
  } else {
    profilePictureImage.setImage(
      "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
    );
  }

  // Update the visibility of the hidden Y Member input
  const isYMemberChecked = isYMemberInput.getElement().checked;
  if (isYMemberChecked) {
    hiddenYMemberWrapper.removeCssClass("g-hide");
  } else {
    hiddenYMemberWrapper.addCssClass("g-hide");
    // Clear the Y Membership Number input
    yMemberIdInput.getElement().value = "";
  }
};
