import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../../api/apiConfig";
import {
  toggleError,
  setupValidation,
  createValidationFunction,
} from "../../../../utils/formUtils";
import { validateNotEmpty } from "../../../../utils/validationUtils";

// CancelRegistrationDialog Component
type CancelRegistrationDialogOptions = {
  containerSelector: string;
  subscriptionId: string;
  onCancelSuccess: () => void;
};

export class CancelRegistrationDialog {
  private container: WFComponent;
  private subscriptionId: string;
  private cancelForm: WFFormComponent;
  private dialog: WFComponent;
  private pageMain: WFComponent;

  constructor(options: CancelRegistrationDialogOptions) {
    const { containerSelector, subscriptionId, onCancelSuccess } = options;

    // Initialize WFComponents
    this.container = new WFComponent(containerSelector);
    this.subscriptionId = subscriptionId;
    this.cancelForm = new WFFormComponent("#cancelSubscriptionForm");
    this.dialog = new WFComponent("#inviteCaregiverDialog");
    this.pageMain = new WFComponent(".page_main"); // Get the main page container

    // Initialize the dialog component
    this.initialize(onCancelSuccess);
  }

  private initialize(onCancelSuccess: () => void) {
    if (!this.container.getElement()) {
      console.error("Container element not found for CancelRegistrationDialog");
      return;
    }

    // Attach click event to the "Cancel Registration" button
    const openCancelDialogBtn = new WFComponent("#openCancelDialog");
    if (openCancelDialogBtn.getElement()) {
      openCancelDialogBtn.on("click", () => {
        console.log("Open Cancel Registration button clicked");
        this.openDialog();
      });
    } else {
      console.error("Open Cancel Registration button not found");
    }

    // Attach click event to close button
    const closeDialogBtn = new WFComponent("#close-dialog-btn");
    if (closeDialogBtn.getElement()) {
      closeDialogBtn.on("click", () => {
        console.log("Close dialog button clicked");
        this.closeDialog();
      });
    } else {
      console.error("Close dialog button not found");
    }

    // Setup form submission interception and validation
    this.setupFormSubmission(onCancelSuccess);
    this.setupFormValidation();
  }

  private openDialog() {
    if (this.dialog.getElement() && this.pageMain.getElement()) {
      console.log("Opening dialog");
      const dialogElement = this.dialog.getElement() as HTMLDialogElement;
      dialogElement.showModal(); // Using `showModal()` to make sure it behaves as a dialog

      // Update page_main data-brand attribute to "6" when dialog opens
      console.log("Setting page_main data-brand attribute to 6");
      this.pageMain.setAttribute("data-brand", "6");
    } else {
      console.error("Dialog or page_main element not found");
    }
  }

  private closeDialog() {
    if (this.dialog.getElement() && this.pageMain.getElement()) {
      console.log("Closing dialog");
      const dialogElement = this.dialog.getElement() as HTMLDialogElement;
      dialogElement.close(); // Using `close()` to properly close the dialog

      // Reset page_main data-brand attribute to "2" when dialog closes
      console.log("Resetting page_main data-brand attribute to 2");
      this.pageMain.setAttribute("data-brand", "2");
    } else {
      console.error("Dialog or page_main element not found");
    }
  }

  private setupFormSubmission(onCancelSuccess: () => void) {
    this.cancelForm.onFormSubmit(async (formData, event) => {
      event.preventDefault(); // Prevent form default submission
      event.stopPropagation(); // Stop any other event listeners on the form

      console.log("Form submission intercepted");

      const reason = formData.cancelled_because as string;

      if (!validateNotEmpty(reason)) {
        const errorComponent = new WFComponent("#cancelledReasonError");
        toggleError(errorComponent, "Reason for cancelling is required.", true);
        return;
      }

      try {
        // Show loading animation
        this.setLoadingState(true);

        // Make DELETE request to API to cancel subscription
        console.log(
          "Submitting cancellation to API for subscription ID:",
          this.subscriptionId
        );

        interface CancelResponse {
          status: string;
        }

        const response = (await apiClient
          .delete(`/subscriptions/${this.subscriptionId}/cancel`, {
            data: {
              reason: reason,
            },
          })
          .fetch()) as CancelResponse;

        // Extract relevant status from the response data
        if (response && response.status === "Cancelled") {
          console.log("Cancellation successful");

          // Clear any previous error messages
          const errorComponent = new WFComponent("#cancelledReasonError");
          toggleError(errorComponent, "", false); // Explicitly hide error on success

          // Close dialog and call the success callback
          this.closeDialog();
          onCancelSuccess();
        } else {
          // Handle unexpected success response format
          throw new Error(
            `Unexpected response format or status: ${response.status}`
          );
        }
      } catch (error) {
        console.error("Error cancelling registration: ", error);
        this.showErrorMessage(
          "Oops! Something went wrong while submitting the form."
        );
      } finally {
        // Hide loading animation
        this.setLoadingState(false);
      }
    });
  }

  private setupFormValidation() {
    const reasonInput = new WFComponent("#cancelledReason");
    const reasonErrorComponent = new WFComponent("#cancelledReasonError");

    if (!reasonInput.getElement() || !reasonErrorComponent.getElement()) {
      console.error("Reason input or error component not found for validation");
      return;
    }

    const validateReason = createValidationFunction(
      reasonInput,
      (input) => validateNotEmpty(input),
      "Reason for cancelling is required."
    );

    setupValidation(reasonInput, reasonErrorComponent, validateReason);
  }

  private setLoadingState(isLoading: boolean) {
    const loadingAnimation = new WFComponent("#cancelRegistrationRequesting");
    const submitButton = new WFComponent("#cancelRegistration");

    if (loadingAnimation.getElement() && submitButton.getElement()) {
      if (isLoading) {
        loadingAnimation.setStyle({ display: "block" });
        submitButton.setAttribute("disabled", "true");
      } else {
        loadingAnimation.setStyle({ display: "none" });
        submitButton.removeAttribute("disabled");
      }
    } else {
      console.error(
        "Loading animation or submit button not found for setting loading state"
      );
    }
  }

  private showErrorMessage(message: string) {
    const errorElement = new WFComponent("#submitInviteCaregiverError");
    if (errorElement.getElement()) {
      errorElement.setText(message);
      errorElement.setStyle({ display: "flex" });
    } else {
      console.error("Error element not found for showing error message");
    }
  }
}
