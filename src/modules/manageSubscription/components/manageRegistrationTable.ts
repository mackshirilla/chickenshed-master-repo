// src/manageSubscription/components/manageRegistrationTable.ts

import { WFComponent } from "@xatom/core";
import { RegistrationItem } from "../types";

export interface ManageTableConfig {
  tableBodySelector: string;
  templateRowSelector: string;
  emptyStateSelector: string;
}

/**
 * Initializes the registration table for managing subscriptions.
 * Clones the template row for each item, populates text fields,
 * sets data-attributes, and handles empty state display.
 */
export function initManageRegistrationTable(
  items: RegistrationItem[],
  config: ManageTableConfig
): void {
  // Grab elements
  const tableBodyComp = new WFComponent(config.tableBodySelector);
  const tableBodyEl = tableBodyComp.getElement();

  const templateRow = document.querySelector(
    config.templateRowSelector
  ) as HTMLElement;
  const emptyRow = document.querySelector(
    config.emptyStateSelector
  ) as HTMLElement;

  if (!templateRow) {
    console.error("Template row not found:", config.templateRowSelector);
    return;
  }
  if (!emptyRow) {
    console.error("Empty state row not found:", config.emptyStateSelector);
    return;
  }

  // Remove existing user rows (keep template and empty)
  Array.from(tableBodyEl.querySelectorAll("tr")).forEach(row => {
    if (row === templateRow || row === emptyRow) return;
    row.remove();
  });

  // Handle empty state
  if (items.length === 0) {
    emptyRow.style.display = "table-row";
    return;
  }
  emptyRow.style.display = "none";

  // Create a row per item
  items.forEach(item => {
    const newRow = templateRow.cloneNode(true) as HTMLElement;
    newRow.removeAttribute("id");
    newRow.style.display = "table-row";

    // Data attributes
    newRow.setAttribute("data-program-id", String(item.program_id));
    newRow.setAttribute("data-workshop-id", String(item.workshop_id));
    newRow.setAttribute("data-session-id", String(item.session_id));
    newRow.setAttribute("data-student-id", String(item.student_profile?.id || item.student_id));

    // Populate text fields
    const programText = newRow.querySelector("#item_program_name");
    if (programText) programText.textContent = item.program_details.name;

    // Workshop may not exist, show dash if missing
    const workshopText = newRow.querySelector("#item_workshop_name");
    const wsName = item.workshop_details?.Name || "-";
    if (workshopText) workshopText.textContent = wsName;

    // Session name
    const sessionText = newRow.querySelector("#item_session_name");
    if (sessionText) sessionText.textContent = item.session_details.Name;

    // Student full name
    const studentText = newRow.querySelector("#item_student_name");
    if (studentText) {
      studentText.textContent = `${item.student_profile.first_name} ${item.student_profile.last_name}`;
    }

    // Hide any select elements if present
    Array.from(newRow.querySelectorAll("select")).forEach(sel => {
      (sel as HTMLElement).style.display = "none";
    });

    // Hide confirm/add buttons in management view
    const confirmBtn = newRow.querySelector(".add_registration_button");
    if (confirmBtn) (confirmBtn as HTMLElement).style.display = "none";

    // Append to table body
    tableBodyEl.appendChild(newRow);
  });
}