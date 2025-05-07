import { startRegistration } from "../../api/startRegistration";
import { initDynamicRegistrationTable } from "./components/dynamicRegistrationTable";
import { updateCheckoutLineItems } from "./components/checkoutLineItems";
import { initializeFinancialAid } from "./components/financialAid";
import { saveState, loadState } from "./state/registrationState";
import { updatePendingStudentsAlert } from "./components/pendingStudentsAlert";
import { submitCheckout } from "./components/checkoutSubmission";
import { loadRegistrationUI } from "./components/loadRegistrationUi";
import { WFComponent } from "@xatom/core";
import { showActionRequiredDialogIfNoStudentProfiles } from "./components/actionRequiredDialog";

export async function newProgramRegistration(): Promise<void> {
  console.log("new registration");

  try {
    const response = await startRegistration({});
    console.log("Registration started:", response);

    // Save the API response in state.
    saveState({ apiData: response });

    // Always initialize the dynamic registration table (this sets up the add button and template row).
    initDynamicRegistrationTable(response, {
      tableBodySelector: "#subscription_items_list",
      emptyStateSelector: "#subscription_empty",
      templateRowSelector: "#subscription_item",
      addButtonSelector: "#subscription_items_table tfoot #add_subscription_item",
      isAddOn: false,
      fields: {
        program: { textSelector: "#item_program_name", selectSelector: "#program-select-1" },
        workshop: { textSelector: "#item_workshop_name", selectSelector: "#workshop-select-1" },
        session: { textSelector: "#item_session_name", selectSelector: "#session-select-1" },
        student: { textSelector: "#item_student_name", selectSelector: "#student-select-1" },
      }
    });

    // Rehydrate the UI if there are saved registration items.
    const state = loadState();
    if (state.registrationItems && state.registrationItems.length > 0) {
      loadRegistrationUI();
    }

    // Set subscription type select value from state.
    const subscriptionTypeSelect = document.getElementById("subscription_type") as HTMLSelectElement;
    if (subscriptionTypeSelect && state.subscriptionType) {
      subscriptionTypeSelect.value = state.subscriptionType;
    }

    updateCheckoutLineItems(response);
    updatePendingStudentsAlert(response);

    // Show action required dialog if no student profiles are returned.
    showActionRequiredDialogIfNoStudentProfiles(response);

    // After initial response is loaded, if the loading animation trigger exists, click it.
    const successTrigger = document.querySelector(".success_trigger") as HTMLElement;
    if (successTrigger) {
      successTrigger.click();
    }

    // Setup an event to update the checkout button's enabled/disabled state.
    function updateCheckoutButtonState() {
      const confirmedRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
      const checkoutBtn = document.getElementById("submit_registration_checkout") as HTMLButtonElement;
      if (confirmedRows.length === 0) {
        checkoutBtn.disabled = true;
      } else {
        checkoutBtn.disabled = false;
      }
    }
    updateCheckoutButtonState();
    document.addEventListener("registrationChanged", () => {
      updateCheckoutLineItems(response);
      updatePendingStudentsAlert(response);
      updateCheckoutButtonState();
    });

    // When subscription type changes, update state and line items.
    if (subscriptionTypeSelect) {
      subscriptionTypeSelect.addEventListener("change", () => {
        saveState({ subscriptionType: subscriptionTypeSelect.value });
        updateCheckoutLineItems(response);
      });
    }

    // Setup checkout button behavior.
    const checkoutButton = new WFComponent("#submit_registration_checkout");
    checkoutButton.on("click", async (e: Event) => {
      e.preventDefault();
      const btnEl = checkoutButton.getElement() as HTMLButtonElement;
      if (btnEl.disabled) return;
      btnEl.disabled = true;

      // Show loading animation.
      const loadingAnim = document.getElementById("submit_registration_checkout_animation");
      if (loadingAnim) {
        loadingAnim.style.display = "block";
      }

      try {
        await submitCheckout();
        // If submitCheckout() returns successfully and redirects, this code may not run.
      } catch (error) {
        console.error(error);
      } finally {
        // Hide loading animation and re-enable the button if not redirected.
        if (loadingAnim) loadingAnim.style.display = "none";
        btnEl.disabled = false;
      }
    });

  } catch (error) {
    console.error("Error starting registration:", error);
  }
  initializeFinancialAid();
}
