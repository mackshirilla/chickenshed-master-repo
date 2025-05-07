// src/manageSubscription/index.ts

import { apiClient } from "../../api/apiConfig";
import type { ManageSubscriptionResponse } from "./types";
import { WFFormComponent, WFComponent } from "@xatom/core";
import { loadState, saveState } from "./state/manageSubscriptionState";
import { initManageRegistrationTable } from "./components/manageRegistrationTable";
import { initManageLineItems } from "./components/manageSubscriptionLineItems";
import { updateSubscriptionSummary } from "./components/manageSubscriptionSummary";
import { initManageDepositItems } from "./components/manageDepositLineItems";
import { updateAmountDue } from "./components/manageAmountDue";
import { updatePendingStudentsAlert } from "./components/managePendingStudentsAlert";
import { updateTrialAlert } from "./components/manageTrialAlert";
import { manageSubscriptionDetails } from "./components/manageSubscriptionDetails";
import { CancelSubscriptionDialog } from "./components/manageSubscriptionCancelDialog";

const REG_TABLE_CONFIG = {
  tableBodySelector: "#subscription_items_list",
  templateRowSelector: "#subscription_item",
  emptyStateSelector: "#subscription_empty",
};

export async function manageSubscriptionPage(): Promise<void> {
  // 1) Fetch & seed state
  const data = await apiClient
    .post<ManageSubscriptionResponse>("/subscriptions/manage-subscription")
    .fetch();
  const initialType = data.update_subscription_type || data.subscription_type;
  saveState({
    apiData: data,
    registrationItems: data.registrations,
    updateSubscriptionType: initialType,
  });

  // 2) Hide action buttons
  document
    .querySelector(".update_button_wrap")
    ?.setAttribute("style", "display:none");
  document
    .getElementById("resetRegistrations")
    ?.setAttribute("style", "display:none");

  // 3) Render registration table + hook removals
  initManageRegistrationTable(data.registrations, REG_TABLE_CONFIG);
  document
    .getElementById("subscription_items_list")
    ?.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest(
        ".remove_registration_button"
      ) as HTMLButtonElement;
      if (btn) handleRemove(btn);
    });

  // 4) Initial full render
  renderAll();
  // 4a) fire the hidden Lottie trigger now that we have a subscription
  document
    .querySelector<HTMLElement>(".success_trigger")
    ?.click();

  // 5) Dialog & form wiring for “Update Subscription”
  const form = new WFFormComponent<{ removed_because: string }>(
    "#cancelSubscriptionForm"
  );
  const dialogEl = document.querySelector<HTMLDialogElement>(
    "#removeStudentDialog"
  )!;
  const pageMain = new WFComponent(".page_main");
  const errorComp = new WFComponent("#submitUpdateError");
  const loaderComp = document.querySelector<HTMLElement>(
    "#submitUpdateLoading"
  )!;
  const submitBtn = document.getElementById("submitUpdateBtn")!;

  document
    .getElementById("submit_subscription_update")
    ?.addEventListener("click", (e) => {
      e.preventDefault();
      errorComp.getElement().style.display = "none";
      loaderComp.style.display = "none";
      pageMain.setAttribute("data-brand", "6");
      dialogEl.showModal();
    });

  form.onFormSubmit(async (dataMap, ev) => {
    ev.preventDefault();
    errorComp.getElement().style.display = "none";

    const reason = dataMap.removed_because.trim();
    if (!reason) {
      errorComp.setText("Please enter a reason for your changes.");
      errorComp.getElement().style.display = "block";
      return;
    }

    loaderComp.style.display = "block";

    try {
      const state = loadState();
      const originalIds = state.apiData!.registrations.map((r) => r.id);
      const keptIds = state.registrationItems!.map((r) => r.id);
      const toCancel = originalIds.filter((id) => !keptIds.includes(id));

      await apiClient
        .post("/subscriptions/update", {
          data: {
            subscription_id: state.apiData!.id,
            registration_item_ids: toCancel,
            reason,
          },
        })
        .fetch();

      const fresh = await apiClient
        .post<ManageSubscriptionResponse>(
          "/subscriptions/manage-subscription"
        )
        .fetch();
      saveState({
        apiData: fresh,
        registrationItems: fresh.registrations,
      });
      renderAll();

      form.showSuccessState();
      pageMain.setAttribute("data-brand", "4");
    } catch (err) {
      console.error("Update failed:", err);
      form.showErrorState();
    } finally {
      loaderComp.style.display = "none";
      submitBtn.removeAttribute("disabled");
    }
  });

  document
    .getElementById("close-dialog-btn")
    ?.addEventListener("click", () => {
      dialogEl.close();
      pageMain.setAttribute("data-brand", "2");
      form.showForm();
      form.resetForm();
      form.enableForm();
    });

  // Reset registrations
  document
    .getElementById("resetRegistrations")
    ?.addEventListener("click", () => {
      const orig = loadState().apiData!.registrations;
      saveState({ registrationItems: orig });
      renderAll();
      document
        .querySelector(".update_button_wrap")
        ?.setAttribute("style", "display:none");
      document
        .getElementById("resetRegistrations")
        ?.setAttribute("style", "display:none");
    });

  // 6) Instantiate the cancellation dialog handler
  new CancelSubscriptionDialog();
}

export function renderAll(): void {
  const s = loadState();
  const sub = s.apiData!;
  const items = s.registrationItems!;

  initManageRegistrationTable(items, REG_TABLE_CONFIG);
  initManageLineItems(sub, items, s.updateSubscriptionType!, {
    listSelector: "#subscription_line_items_list",
    wrapSelector: "#subscription_line_items_wrap",
    emptySelector: "#subscription_line_items_empty",
    templateSelector: "#subscription_line_item",
  });
  updateSubscriptionSummary();
  initManageDepositItems(sub, items, {
    containerSelector: "#deposit_line_items_container",
    listSelector: "#deposit_line_items_list",
    templateRowSelector: "#deposit_item_template",
    totalSelector: "#deposit_total",
  });
  updateAmountDue();
  updatePendingStudentsAlert(sub);
  updateTrialAlert(sub);
  manageSubscriptionDetails();
}

// expose renderAll globally so dialogs can call it
;(window as any).renderAll = renderAll;

function handleRemove(btn: HTMLButtonElement): void {
  const row = btn.closest("tr");
  if (!row) return;
  const st = loadState();
  if (st.registrationItems.length <= 1) {
    alert("You must keep at least one registration.");
    return;
  }
  row.remove();
  const kept = st.registrationItems.filter(
    (ri) =>
      !(
        ri.session_id.toString() ===
          row.getAttribute("data-session-id") &&
        ri.student_profile.id.toString() ===
          row.getAttribute("data-student-id")
      )
  );
  saveState({ registrationItems: kept });
  renderAll();
  document
    .querySelector(".update_button_wrap")
    ?.setAttribute("style", "display:block");
  document
    .getElementById("resetRegistrations")
    ?.setAttribute("style", "display:block");
}
