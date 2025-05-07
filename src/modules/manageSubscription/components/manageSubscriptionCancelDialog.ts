import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { loadState, saveState } from "../state/manageSubscriptionState";
import type { ManageSubscriptionResponse } from "../types";

/**
 * Handles the "Cancel Subscription" flow:
 * 1) Opens a dialog asking for a cancellation reason
 * 2) On form submit, sends subscription_id + reason to /subscriptions/cancel
 * 3) Upon success, shows a success message and sets the page_main data-brand to 4
 * 4) On dialog close, resets data-brand to 2
 * Hides the cancel button if the subscription is already cancelled
 */
export class CancelSubscriptionDialog {
  private dialogComp = new WFComponent("#cancelSubscriptionDialog");
  private formComp = new WFFormComponent<{ removed_because: string }>(
    "#cancelFullSubscriptionForm"
  );
  private openBtnComp = new WFComponent("#openCancelSubscription");
  private closeBtnComp = new WFComponent("#close-cancel-dialog-btn");
  private submitBtnComp = new WFComponent("#submitCancel");
  private loadingComp = new WFComponent("#submitCancelLoading");
  private reasonError = new WFComponent("#submitCancelError");
  private pageMainComp = new WFComponent(".page_main");

  constructor() {
    // Hide cancel button if subscription already cancelled
    const state = loadState();
    if (state.apiData?.status === "Cancelled") {
      this.openBtnComp.getElement().style.display = "none";
    }

    this.attachListeners();
  }

  private attachListeners() {
    // Intercept form submit
    this.formComp.onFormSubmit(async (formData, ev) => {
      ev.preventDefault();
      this.reasonError.getElement().style.display = "none";
      const reason = (formData.removed_because as string).trim();
      if (!reason) {
        this.reasonError.setText("Reason is required.");
        this.reasonError.getElement().style.display = "block";
        return;
      }
      await this.submitCancel(reason);
    });

    // Open dialog
    this.openBtnComp.on("click", (e) => {
      e.preventDefault();
      this.reasonError.getElement().style.display = "none";
      this.loadingComp.getElement().style.display = "none";
      this.openDialog();
    });

    // Backdrop click → close
    const dlgEl = this.dialogComp.getElement() as HTMLDialogElement;
    dlgEl.addEventListener("click", (e: MouseEvent) => {
      if (e.target === dlgEl) this.closeDialog();
    });

    // X button
    this.closeBtnComp.on("click", () => this.closeDialog());
  }

  private openDialog() {
    // switch to cancel-dialog brand
    this.pageMainComp.setAttribute("data-brand", "6");
    (this.dialogComp.getElement() as HTMLDialogElement).showModal();
  }

  private closeDialog() {
    (this.dialogComp.getElement() as HTMLDialogElement).close();
    // reset to default
    this.pageMainComp.setAttribute("data-brand", "2");
  }

  private async submitCancel(reason: string) {
    // show loader + disable
    this.loadingComp.getElement().style.display = "block";
    this.submitBtnComp.getElement().setAttribute("disabled", "true");

    try {
      const st = loadState();
      const response = await apiClient
        .post<ManageSubscriptionResponse>("/subscriptions/cancel", {
          data: {
            subscription_id: st.apiData!.id,
            reason,
          },
        })
        .fetch();

      // filter out cancelled, waitlist, draft, pending statuses
      const visibleRegs = (response.registrations || [])
        .filter(r => {
          const s = r.status.toUpperCase();
          return s !== "CANCELLED" && s !== "WAITLIST" && s !== "DRAFT" && s !== "PENDING";
        });

      // update state with filtered registrations
      saveState({
        apiData: response,
        registrationItems: visibleRegs
      });

      // re-render page items
      ;(window as any).renderAll();

      // show success and swap to success brand
      this.formComp.showSuccessState();
      this.pageMainComp.setAttribute("data-brand", "4");
    } catch (err) {
      console.error("Cancel failed:", err);
      this.formComp.showErrorState();
    } finally {
      // hide loader + re-enable
      this.loadingComp.getElement().style.display = "none";
      this.submitBtnComp.getElement().removeAttribute("disabled");
    }
  }
}
