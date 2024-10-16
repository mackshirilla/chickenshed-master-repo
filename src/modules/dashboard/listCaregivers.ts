// src/modules/pages/caregivers/listCaregivers.ts

import { WFDynamicList, WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../api/apiConfig";
import { handleRecaptcha } from "../../utils/recaptchaUtils";
import { toggleError, createValidationFunction } from "../../utils/formUtils";
import { validateEmail } from "../../utils/validationUtils";
import {
  initializeDynamicAdditionalStudentList,
  reloadAdditionalStudentList,
} from "./listAdditionalStudents";

interface Caregiver {
  id: number;
  status: string;
  name: string;
  email: string;
}

interface CaregiverApiResponse {
  caregivers: Caregiver[];
}

interface CaregiverResponse {
  status: string;
  message: string;
}

// Declare dialog forms and reset buttons first
const resendInviteForm = new WFFormComponent("#resendCaregiverInviteForm");
const deleteCaregiverForm = new WFFormComponent("#deleteCaregiverForm");
const inviteCaregiverForm = new WFFormComponent("#inviteCaregiverForm");

const resetCaregiverForm = new WFComponent("#resetCaregiverForm");
const resetDeleteCaregiverForm = new WFComponent("#resetDeleteCaregiverForm");
const resetResendInviteForm = new WFComponent(
  "#resetResendCaregiverInviteForm"
);

// Declare success triggers
const resendCaregiverInviteSuccessTrigger = new WFComponent(
  "#resendCaregiverInviteSuccessTrigger"
);
const deleteCaregiverSuccessTrigger = new WFComponent(
  "#deleteCaregiverSuccessTrigger"
);
const inviteCaregiverSuccessTrigger = new WFComponent(
  "#inviteCaregiverSuccessTrigger"
);

// Flags to track success state
let isResendInviteSuccess = false;
let isDeleteCaregiverSuccess = false;
let isInviteCaregiverSuccess = false;

// Attach reset button event listeners
resetCaregiverForm.on("click", () => {
  console.log("Reset Caregiver Form clicked");
  inviteCaregiverForm.resetForm();
  inviteCaregiverForm.showForm();
  if (isInviteCaregiverSuccess) {
    inviteCaregiverSuccessTrigger.getElement().click();
    isInviteCaregiverSuccess = false;
  }
});

resetDeleteCaregiverForm.on("click", () => {
  console.log("Reset Delete Caregiver Form clicked");
  deleteCaregiverForm.resetForm();
  deleteCaregiverForm.showForm();
  if (isDeleteCaregiverSuccess) {
    deleteCaregiverSuccessTrigger.getElement().click();
    isDeleteCaregiverSuccess = false;
  }
});

resetResendInviteForm.on("click", () => {
  console.log("Reset Resend Invite Form clicked");
  resendInviteForm.resetForm();
  resendInviteForm.showForm();
  if (isResendInviteSuccess) {
    resendCaregiverInviteSuccessTrigger.getElement().click();
    isResendInviteSuccess = false;
  }
});

export async function fetchCaregiverProfiles(): Promise<Caregiver[]> {
  try {
    const getCaregivers = apiClient.get<CaregiverApiResponse>("/caregivers");
    const response = await getCaregivers.fetch();
    console.log("API response:", response); // Log the entire response for debugging

    if (response.caregivers && Array.isArray(response.caregivers)) {
      return response.caregivers;
    } else {
      throw new Error("Invalid response structure");
    }
  } catch (error) {
    console.error("Error fetching caregiver profiles:", error);
    throw error;
  }
}

export async function initializeDynamicCaregiverList(
  containerSelector: string
) {
  // Ensure the container exists before initializing the list
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Container not found for selector:", containerSelector);
    return;
  }

  // Initialize a new instance of WFDynamicList
  const list = new WFDynamicList<Caregiver>(containerSelector, {
    rowSelector: "#caregiverCard",
    loaderSelector: "#caregiversLoading",
    emptySelector: "#caregiversEmpty",
  });

  // Initialize the additional student list
  initializeDynamicAdditionalStudentList("#listAdditionalStudentProfiles");

  let selectedEmail: string | null = null;
  let selectedCaregiverId: number | null = null;

  // Customize the rendering of the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  // Customize the rendering of the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "block",
    });
    return emptyElement;
  });

  // Customize the rendering of list items
  list.rowRenderer(({ rowData, rowElement }) => {
    const caregiverCard = new WFComponent(rowElement);

    // Element to display name or email
    const caregiverDisplayName =
      caregiverCard.getChildAsComponent("#caregiverEmail");

    // Conditional display of name or email
    const displayName = rowData.name ? rowData.name : rowData.email;
    caregiverDisplayName.setText(displayName);

    // Status and buttons
    const caregiverStatus =
      caregiverCard.getChildAsComponent("#caregiverStatus");
    const resendButton =
      caregiverCard.getChildAsComponent(".resend-invite-btn");
    const deleteButton = caregiverCard.getChildAsComponent(
      ".delete-caregiver-btn"
    );

    caregiverStatus.setText(rowData.status);

    // Hide the resend button if the status is "Active"
    if (rowData.status === "Active") {
      resendButton.setStyle({ display: "none" });
    }

    // Attach event listener to the resend button
    resendButton.on("click", () => {
      const dialog = document.getElementById(
        "resendCaregiverInviteDialog"
      ) as HTMLDialogElement;
      if (dialog) {
        selectedEmail = rowData.email; // Store the email for later use
        console.log("Selected email:", selectedEmail);
        dialog.showModal();
        document.body.style.overflow = "hidden"; // Prevent page scroll

        const closeDialog = () => {
          dialog.close();
          document.body.style.overflow = "auto"; // Restore page scroll
          resetResendInviteForm.getElement().click();
        };

        // Close dialog when clicking outside of it
        const closeOutsideClick = (event: MouseEvent) => {
          if (event.target === dialog) {
            closeDialog();
          }
        };
        dialog.addEventListener("click", closeOutsideClick);

        // Close dialog on pressing ESC key
        const closeOnEsc = (event: KeyboardEvent) => {
          if (event.key === "Escape" && dialog.open) {
            closeDialog();
          }
        };
        document.addEventListener("keydown", closeOnEsc);

        // Close dialog when clicking the close button
        const closeDialogBtn = dialog.querySelector(
          "#close-dialog-btn"
        ) as HTMLButtonElement;
        if (closeDialogBtn) {
          closeDialogBtn.addEventListener("click", () => {
            closeDialog();
          });
        }

        // Remove event listeners when the dialog is closed
        dialog.addEventListener(
          "close",
          () => {
            dialog.removeEventListener("click", closeOutsideClick);
            document.removeEventListener("keydown", closeOnEsc);
          },
          { once: true }
        );
      } else {
        console.error("Dialog element not found");
      }
    });

    // Attach event listener to the delete button
    const dashboardWrapper = new WFComponent(".page_main");

    deleteButton.on("click", () => {
      dashboardWrapper.setAttribute("data-brand", "6");
      const dialog = document.getElementById(
        "deleteCaregiverDialog"
      ) as HTMLDialogElement;
      if (dialog) {
        selectedCaregiverId = rowData.id; // Store the caregiver ID for later use
        console.log("Selected caregiver ID:", selectedCaregiverId);
        dialog.showModal();
        document.body.style.overflow = "hidden"; // Prevent page scroll

        const closeDialog = () => {
          dialog.close();
          document.body.style.overflow = "auto"; // Restore page scroll
          resetDeleteCaregiverForm.getElement().click();
          dashboardWrapper.setAttribute("data-brand", "2");
        };

        // Close dialog when clicking outside of it
        const closeOutsideClick = (event: MouseEvent) => {
          if (event.target === dialog) {
            closeDialog();
            dashboardWrapper.setAttribute("data-brand", "2");
          }
        };
        dialog.addEventListener("click", closeOutsideClick);

        // Close dialog on pressing ESC key
        const closeOnEsc = (event: KeyboardEvent) => {
          if (event.key === "Escape" && dialog.open) {
            closeDialog();
            dashboardWrapper.setAttribute("data-brand", "2");
          }
        };
        document.addEventListener("keydown", closeOnEsc);

        // Close dialog when clicking the close button
        const closeDialogBtn = dialog.querySelector(
          "#close-dialog-btn"
        ) as HTMLButtonElement;
        if (closeDialogBtn) {
          closeDialogBtn.addEventListener(
            "click",
            () => {
              closeDialog();
              dashboardWrapper.setAttribute("data-brand", "2");
            },
            { once: true }
          );
        }

        // Remove event listeners when the dialog is closed
        dialog.addEventListener(
          "close",
          () => {
            dialog.removeEventListener("click", closeOutsideClick);
            document.removeEventListener("keydown", closeOnEsc);
          },
          { once: true }
        );
      } else {
        console.error("Dialog element not found");
      }
    });

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Handle resend invite form submission
  const caregiverRequestingAnimation = new WFComponent(
    "#caregiverRequestingAnimation"
  );
  const submitCaregiverError = new WFComponent("#submitCaregiverError");
  const onSuccessTrigger = new WFComponent(
    "#resendCaregiverInviteSuccessTrigger"
  );

  resendInviteForm.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop the form from submitting normally
    caregiverRequestingAnimation.setStyle({ display: "block" }); // Show loading animation

    if (!selectedEmail) {
      console.error("No email selected");
      toggleError(
        submitCaregiverError,
        "No email selected. Please try again.",
        true
      );
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    console.log("Selected email before sending:", selectedEmail);

    // Handle reCAPTCHA verification
    const recaptchaAction = "resend_caregiver_invite";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(
        submitCaregiverError,
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Post data to a server endpoint
    try {
      console.log("Sending request to /caregivers/invite with data:", {
        caregiver_email: selectedEmail,
      });
      const response = await apiClient
        .post("/caregivers/invite", {
          data: { caregiver_email: selectedEmail },
        })
        .fetch();

      console.log("Invite sent successfully:", response);
      resendInviteForm.showSuccessState(); // Show success state
      isResendInviteSuccess = true;
      onSuccessTrigger.getElement().click(); // Trigger the resend success action
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation

      // Reload the caregiver list
      await reloadCaregiverList(list);

      // Reload the additional student list
      await reloadAdditionalStudentList();
    } catch (error) {
      console.error("Error sending invite:", error);
      toggleError(
        submitCaregiverError,
        error.response?.data?.message || "Failed to send invite.",
        true
      );
      caregiverRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });

  // Handle delete caregiver form submission
  const caregiverDeletingAnimation = new WFComponent(
    "#caregiverDeletingAnimation"
  );
  const submitDeleteCaregiverError = new WFComponent(
    "#submitDeleteCaregiverError"
  );
  const onDeleteSuccessTrigger = new WFComponent(
    "#deleteCaregiverSuccessTrigger"
  );

  deleteCaregiverForm.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop the form from submitting normally
    caregiverDeletingAnimation.setStyle({ display: "block" }); // Show loading animation

    if (!selectedCaregiverId) {
      console.error("No caregiver ID selected");
      toggleError(
        submitDeleteCaregiverError,
        "No caregiver ID selected. Please try again.",
        true
      );
      caregiverDeletingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    console.log("Selected caregiver ID before deleting:", selectedCaregiverId);

    // Handle reCAPTCHA verification
    const recaptchaAction = "delete_caregiver";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(
        submitDeleteCaregiverError,
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      caregiverDeletingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Delete data from the server endpoint
    try {
      console.log(
        `Sending delete request to /caregivers/${selectedCaregiverId}`
      );
      const response = await apiClient
        .delete(`/caregivers/${selectedCaregiverId}`)
        .fetch();

      console.log("Caregiver deleted successfully:", response);
      deleteCaregiverForm.showSuccessState(); // Show success state
      isDeleteCaregiverSuccess = true;
      onDeleteSuccessTrigger.getElement().click(); // Trigger the delete success action
      caregiverDeletingAnimation.setStyle({ display: "none" }); // Hide loading animation

      // Reload the caregiver list
      await reloadCaregiverList(list);

      // Reload the additional student list
      await reloadAdditionalStudentList();
    } catch (error) {
      console.error("Error deleting caregiver:", error);
      toggleError(
        submitDeleteCaregiverError,
        error.response?.data?.message || "Failed to delete caregiver.",
        true
      );
      caregiverDeletingAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });

  // Initialize the form components

  const fieldsCaregiver = [
    {
      input: new WFComponent("#caregiverEmailInput"),
      error: new WFComponent("#caregiverEmailInputError"),
      validationFn: validateEmail,
      message: "Please enter a valid email address",
    },
  ];

  // Handle invite caregiver form submission
  const caregiverInviteAnimation = new WFComponent(
    "#caregiverRequestingAnimation"
  );
  const submitInviteCaregiverError = new WFComponent(
    "#submitInviteCaregiverError"
  );
  const inviteSuccessTrigger = new WFComponent(
    "#inviteCaregiverSuccessTrigger"
  );

  inviteCaregiverForm.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop the form from submitting normally
    caregiverInviteAnimation.setStyle({ display: "block" }); // Show loading animation

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
        submitInviteCaregiverError,
        "Please correct all errors above.",
        true
      );
      caregiverInviteAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "invite_caregiver";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(
        submitInviteCaregiverError,
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      caregiverInviteAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    // Post data to a server endpoint
    try {
      console.log("Sending request to /caregivers/invite with data:", formData);
      const response = await apiClient
        .post<CaregiverResponse>("/caregivers/invite", { data: formData })
        .fetch();

      if (response.status === "success") {
        inviteCaregiverForm.showSuccessState();
        isInviteCaregiverSuccess = true;
        inviteSuccessTrigger.getElement().click();
        caregiverInviteAnimation.setStyle({ display: "none" }); // Hide loading animation

        // Reload the caregiver list
        await reloadCaregiverList(list);

        // Reload the additional student list
        await reloadAdditionalStudentList();
      }
    } catch (error) {
      toggleError(
        submitInviteCaregiverError,
        error.response?.data?.message || "Failed to send invite.",
        true
      );
      caregiverInviteAnimation.setStyle({ display: "none" }); // Hide loading animation
    }
  });

  // Load and display caregiver profiles
  try {
    await reloadCaregiverList(list);
  } catch (error) {
    console.error("Error loading caregiver profiles:", error);
  }

  // Attach event listener to the invite caregiver button
  const inviteCaregiverButton = document.getElementById("inviteCaregiver");
  if (inviteCaregiverButton) {
    inviteCaregiverButton.addEventListener("click", () => {
      const dialog = document.getElementById(
        "inviteCaregiverDialog"
      ) as HTMLDialogElement;
      if (dialog) {
        dialog.showModal();
        document.body.style.overflow = "hidden"; // Prevent page scroll

        const closeDialog = () => {
          dialog.close();
          document.body.style.overflow = "auto"; // Restore page scroll
          resetCaregiverForm.getElement().click();
        };

        // Close dialog when clicking outside of it
        const closeOutsideClick = (event: MouseEvent) => {
          if (event.target === dialog) {
            closeDialog();
          }
        };
        dialog.addEventListener("click", closeOutsideClick);

        // Close dialog on pressing ESC key
        const closeOnEsc = (event: KeyboardEvent) => {
          if (event.key === "Escape" && dialog.open) {
            closeDialog();
          }
        };
        document.addEventListener("keydown", closeOnEsc);

        // Close dialog when clicking the close button
        const closeDialogBtn = dialog.querySelector(
          "#close-dialog-btn"
        ) as HTMLButtonElement;
        if (closeDialogBtn) {
          closeDialogBtn.addEventListener(
            "click",
            () => {
              closeDialog();
            },
            { once: true }
          );
        }

        // Remove event listeners when the dialog is closed
        dialog.addEventListener(
          "close",
          () => {
            dialog.removeEventListener("click", closeOutsideClick);
            document.removeEventListener("keydown", closeOnEsc);
          },
          { once: true }
        );
      } else {
        console.error("Dialog element not found");
      }
    });
  } else {
    console.error("Invite caregiver button not found");
  }
}

// Function to reload the caregiver list
export async function reloadCaregiverList(list: WFDynamicList<Caregiver>) {
  try {
    const caregivers = await fetchCaregiverProfiles();

    console.log("Fetched caregivers:", caregivers); // Log the fetched caregivers for debugging

    // Sort caregivers alphabetically by email
    caregivers.sort((a, b) => a.email.localeCompare(b.email));

    list.setData(caregivers);

    // Log all resend buttons found in the dynamic list
    const resendButtons = list
      .getElement()
      .querySelectorAll(".resend-invite-btn");
    console.log("Resend buttons found:", resendButtons);

    // Log all delete buttons found in the dynamic list
    const deleteButtons = list
      .getElement()
      .querySelectorAll(".delete-caregiver-btn");
    console.log("Delete buttons found:", deleteButtons);
  } catch (error) {
    console.error("Error reloading caregiver profiles:", error);
  }
}
