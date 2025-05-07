import { WFComponent } from "@xatom/core";
import { loadState, saveState } from "../state/registrationState";

export function loadRegistrationUI(): void {
  const state = loadState();
  if (!state.registrationItems || state.registrationItems.length === 0) {
    console.log("[DEBUG] loadRegistrationUI: No registration items to load.");
    return;
  }

  const tableBodyEl = document.getElementById("subscription_items_list");
  if (!tableBodyEl) {
    console.error("Table body not found.");
    return;
  }

  // Get the template row.
  const templateRow = document.getElementById("subscription_item");
  if (!templateRow) {
    console.error("Template row not found.");
    return;
  }
  // Ensure the template row remains hidden.
  templateRow.style.display = "none";

  // Remove any confirmed rows that are clones (i.e. that do not have the id "subscription_item").
  const allRows = Array.from(tableBodyEl.getElementsByTagName("tr"));
  allRows.forEach(row => {
    if (row.id !== "subscription_item") {
      row.remove();
    }
  });

  // Hide the empty state element.
  const emptyStateEl = document.getElementById("subscription_empty");
  if (emptyStateEl) {
    emptyStateEl.style.display = "none";
  }

  // For each saved registration item, clone the template row and append it.
  state.registrationItems.forEach(item => {
    const newRow = templateRow.cloneNode(true) as HTMLElement;
    // Remove id so it's not the template.
    newRow.removeAttribute("id");
    newRow.classList.add("confirmed");
    newRow.style.display = "table-row";

    // Set data attributes.
    newRow.setAttribute("data-program-id", item.program_id || "");
    newRow.setAttribute("data-session-id", item.session_id || "");
    newRow.setAttribute("data-student-id", item.student_id || "");

    // Populate display text fields.
    const programTextEl = newRow.querySelector("#item_program_name");
    if (programTextEl) {
      programTextEl.textContent = item.program_name || "";
      (programTextEl as HTMLElement).style.display = "block";
    }
    const workshopTextEl = newRow.querySelector("#item_workshop_name");
    if (workshopTextEl) {
      workshopTextEl.textContent = item.workshop_name || "";
      (workshopTextEl as HTMLElement).style.display = "block";
    }
    const sessionTextEl = newRow.querySelector("#item_session_name");
    if (sessionTextEl) {
      sessionTextEl.textContent = item.session_name || "";
      (sessionTextEl as HTMLElement).style.display = "block";
    }
    const studentTextEl = newRow.querySelector("#item_student_name");
    if (studentTextEl) {
      studentTextEl.textContent = item.student_name || "";
      (studentTextEl as HTMLElement).style.display = "block";
    }

    // Hide select elements and the confirm button.
    const selects = newRow.querySelectorAll("select");
    selects.forEach(sel => (sel as HTMLElement).style.display = "none");
    const confirmButton = newRow.querySelector(".add_registration_button");
    if (confirmButton) {
      (confirmButton as HTMLElement).style.display = "none";
    }

    // Attach delete event listener.
    const deleteButton = newRow.querySelector(".remove_registration_button");
    if (deleteButton) {
      (deleteButton as HTMLElement).addEventListener("click", () => {
        newRow.remove();
        const currentItems = loadState().registrationItems || [];
        const updatedItems = currentItems.filter(stateItem => {
          return !(
            stateItem.session_id === newRow.getAttribute("data-session-id") &&
            stateItem.student_id === newRow.getAttribute("data-student-id")
          );
        });
        saveState({ registrationItems: updatedItems });
        // If no confirmed rows remain (other than template), show the empty state.
        const remainingRows = Array.from(tableBodyEl.getElementsByTagName("tr")).filter(r => r.id === "subscription_item" ? false : true);
        if (remainingRows.length === 0) {
          const emptyEl = document.getElementById("subscription_empty");
          if (emptyEl) {
            emptyEl.style.display = "table-row";
          }
        }
        document.dispatchEvent(new CustomEvent("registrationChanged"));
      });
    }

    tableBodyEl.appendChild(newRow);
  });
  console.log("[DEBUG] loadRegistrationUI: UI reloaded from state.");
}
