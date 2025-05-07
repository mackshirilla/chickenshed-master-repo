// src/manageSubscription/components/manageSubscriptionUpdateDialog.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { loadState, saveState } from "../state/manageSubscriptionState";
import type { ManageSubscriptionResponse } from "../types";

/**
 * Handles the "Update Subscription" flow:
 * 1) Opens a confirmation dialog asking for a reason
 * 2) On form submit, sends old+new payload to /subscriptions/update
 * 3) Can be closed via the “X” or clicking outside (backdrop)
 */
export class UpdateSubscriptionDialog {
  private dialogComp = new WFComponent("#removeStudentDialog");
  private formComp = new WFFormComponent("#cancelSubscriptionForm");
  private closeBtnComp = new WFComponent("#close-dialog-btn");
  private submitBtnComp = new WFComponent("#removeStudentSubmit");
  private loadingComp = new WFComponent("#removeStudentRequesting");
  private reasonError = new WFComponent("#removedReasonError");
  private pageMainComp = new WFComponent(".page_main");

  constructor() {
    this.attachListeners();
  }

  private attachListeners() {
    // 1) “Update Subscription” opens dialog
    const updateBtn = document.getElementById("submit_subscription_update");
    if (updateBtn) {
      updateBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.openDialog();
      });
    }

    // 2) Backdrop click → close
    const dlgEl = this.dialogComp.getElement() as HTMLDialogElement;
    dlgEl.addEventListener("click", (e: MouseEvent) => {
      if (e.target === dlgEl) {
        this.closeDialog();
      }
    });

    // 3) “X” button → close
    this.closeBtnComp.on("click", () => this.closeDialog());

    // 4) Form submit (WFFormComponent intercept)
    this.formComp.onFormSubmit(async (formData, ev) => {
      ev.preventDefault();
      const reason = (formData.removed_because as string).trim();
      if (!reason) {
        this.reasonError.setText("Reason is required.");
        this.reasonError.getElement().style.display = "block";
        return;
      }
      this.reasonError.getElement().style.display = "none";
      await this.submitUpdate(reason);
    });
  }

  private openDialog() {
    // set data-brand to “6”
    this.pageMainComp.setAttribute("data-brand", "6");
    const dlg = this.dialogComp.getElement() as HTMLDialogElement;
    dlg.showModal();
  }

  private closeDialog() {
    // reset data-brand to “2”
    this.pageMainComp.setAttribute("data-brand", "2");
    const dlg = this.dialogComp.getElement() as HTMLDialogElement;
    dlg.close();
  }

  private async submitUpdate(reason: string) {
    // disable & show loader
    this.loadingComp.getElement().style.display = "block";
    this.submitBtnComp.getElement().setAttribute("disabled", "true");

    try {
      const st = loadState();
      const oldSub = st.apiData!;
      const newSub: ManageSubscriptionResponse = {
        ...oldSub,
        registrations: st.registrationItems!,
        subscription_type: st.updateSubscriptionType!,
        update_subscription_type: st.updateSubscriptionType!,
      };

      const payload = { old: oldSub, new: newSub, reason };
      const response = await apiClient
        .post<ManageSubscriptionResponse>("/subscriptions/update", { data: payload })
        .fetch();

      // update state + UI
      saveState({ apiData: response });
      this.closeDialog();
      // re-render your page (assuming renderAll is globally available)
      ;(window as any).renderAll();
    } catch (err) {
      console.error("Update failed:", err);
      this.formComp.showErrorState();
    } finally {
      // hide loader & re-enable
      this.loadingComp.getElement().style.display = "none";
      this.submitBtnComp.getElement().removeAttribute("disabled");
    }
  }
}
