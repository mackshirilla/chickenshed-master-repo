// src/modules/dashboard/donations/components/CancelDonationSubscriptionDialog.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../../api/apiConfig";
import {
  toggleError,
  setupValidation,
  createValidationFunction,
} from "../../../../utils/formUtils";
import { validateNotEmpty } from "../../../../utils/validationUtils";

// CancelDonationSubscriptionDialog Component
export class CancelDonationSubscriptionDialog {
  private container: WFComponent;
  private subscriptionId: string;
  private cancelForm: WFFormComponent;
  private dialog: WFComponent;
  private pageMain: WFComponent;

  constructor(options: {
    containerSelector: string;
    subscriptionId: string;
    onCancelSuccess: () => void;
  }) {
    const { containerSelector, subscriptionId, onCancelSuccess } = options;
    this.container = new WFComponent(containerSelector);
    this.subscriptionId = subscriptionId;
    this.cancelForm = new WFFormComponent("#cancelSubscriptionForm");
    this.dialog = new WFComponent("#cancelSubscriptionDialog");
    this.pageMain = new WFComponent(".page_main");
    this.initialize(onCancelSuccess);
  }

  private initialize(onCancelSuccess: () => void) {
    const openCancelDialogBtn = new WFComponent("#openCancelSubscription");
    openCancelDialogBtn.on("click", () => this.openDialog());

    const closeDialogBtn = new WFComponent("#close-cancel-dialog-btn");
    closeDialogBtn.on("click", () => this.closeDialog());

    this.setupFormSubmission(onCancelSuccess);
    this.setupFormValidation();
  }

  private openDialog() {
    const dialogEl = this.dialog.getElement() as HTMLDialogElement;
    dialogEl?.showModal();
    this.pageMain.setAttribute("data-brand", "6");
  }

  private closeDialog() {
    const dialogEl = this.dialog.getElement() as HTMLDialogElement;
    dialogEl?.close();
    this.pageMain.setAttribute("data-brand", "2");
  }

  private setupFormSubmission(onCancelSuccess: () => void) {
    this.cancelForm.onFormSubmit(async (formData, event) => {
      event.preventDefault();
      const reason = formData.removed_because as string;

      if (!validateNotEmpty(reason)) {
        toggleError(
          new WFComponent("#submitCancelError"),
          "Reason for cancelling is required.",
          true
        );
        return;
      }

      this.setLoadingState(true);

      try {
        const response = await apiClient
          .delete<{ status?: string }>(
            `/donate/subscription/${this.subscriptionId}`,
            { data: { reason } }
          )
          .fetch();

        if (response?.status === "Cancelled") {
          toggleError(new WFComponent("#submitCancelError"), "", false);
          this.closeDialog();
          onCancelSuccess();
        } else {
          throw new Error(`Unexpected status: ${response?.status}`);
        }
      } catch (error) {
        console.error("Cancel subscription failed:", error);
        this.showErrorMessage(
          "Oops! Something went wrong while submitting the form."
        );
      } finally {
        this.setLoadingState(false);
      }
    });
  }

  private setupFormValidation() {
    const reasonInput = new WFComponent("#removedReason");
    const reasonError = new WFComponent("#submitCancelError");
    const validate = createValidationFunction(
      reasonInput,
      validateNotEmpty,
      "Reason for cancelling is required."
    );
    setupValidation(reasonInput, reasonError, validate);
  }

  private setLoadingState(isLoading: boolean) {
    const loading = new WFComponent("#submitCancelLoading");
    const submit = new WFComponent("#submitCancel");
    loading.setStyle({ display: isLoading ? "block" : "none" });
    isLoading
      ? submit.setAttribute("disabled", "true")
      : submit.removeAttribute("disabled");
  }

  private showErrorMessage(message: string) {
    const error = new WFComponent("#submitUpdateError");
    error.setText(message);
    error.setStyle({ display: "flex" });
  }

  public static hideCancelButtonIfOneTime(subscriptionType: string | undefined) {
    const cancelWrap = new WFComponent("#cancelSubscriptionWrap");
    if (!subscriptionType || subscriptionType === "one-time") {
      cancelWrap.setStyle({ display: "none" });
    } else {
      cancelWrap.setStyle({ display: "flex" });
    }
  }
}
