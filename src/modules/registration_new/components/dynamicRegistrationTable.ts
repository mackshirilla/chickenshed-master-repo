import { WFComponent } from "@xatom/core";
import { StartRegistrationResponse } from "../../../api/startRegistration";
import { loadState, saveState } from "../state/registrationState";

export interface FieldSelectors {
  textSelector: string;
  selectSelector: string;
}

export interface DynamicTableConfig {
  tableBodySelector: string;
  emptyStateSelector: string;
  templateRowSelector: string;
  addButtonSelector: string;
  isAddOn: boolean;
  fields: {
    program: FieldSelectors;
    workshop: FieldSelectors;
    session: FieldSelectors;
    student: FieldSelectors;
  };
}

export function initDynamicRegistrationTable(
  data: StartRegistrationResponse,
  config: DynamicTableConfig
): void {
  const tableBody = new WFComponent(config.tableBodySelector);
  const emptyState = new WFComponent(config.emptyStateSelector);
  const addButton = new WFComponent(config.addButtonSelector);

  const templateRow = document.querySelector(config.templateRowSelector) as HTMLElement;
  if (!templateRow) {
    console.error("Template row not found with selector:", config.templateRowSelector);
    return;
  }
  // Ensure the template row is always hidden.
  templateRow.style.display = "none";

  addButton.on("click", () => {
    emptyState.getElement().style.display = "none";

    // Clone the template row.
    const newRowElement = templateRow.cloneNode(true) as HTMLElement;
    // Remove the id from the clone so it doesn’t conflict with the template.
    newRowElement.removeAttribute("id");
    newRowElement.style.display = "table-row";

    const newRow = new WFComponent(newRowElement);
    resetRow(newRow, config);
    tableBody.appendChild(newRow);

    populateProgramOptions(newRow, data, config);
    attachRowEventListeners(newRow, data, config);
  });
}

function resetRow(row: WFComponent, config: DynamicTableConfig): void {
  const fieldsToReset = [
    { field: "program", enable: true },
    { field: "workshop", enable: false },
    { field: "session", enable: false },
    { field: "student", enable: false },
  ];

  fieldsToReset.forEach(item => {
    const textEl = row.getChildAsComponent(config.fields[item.field].textSelector);
    const selectEl = row.getChildAsComponent(config.fields[item.field].selectSelector);
    textEl.getElement().style.display = "none";
    (selectEl.getElement() as HTMLElement).style.display = "block";
    (selectEl.getElement() as HTMLSelectElement).disabled = !item.enable;
  });

  

  row.removeCssClass("confirmed");
}

function populateProgramOptions(
  row: WFComponent,
  data: StartRegistrationResponse,
  config: DynamicTableConfig
): void {
  const programSelect = row.getChildAsComponent(config.fields.program.selectSelector);
  (programSelect.getElement() as HTMLSelectElement).disabled = false;

  const programsMap = new Map<number, string>();
  data.sessions.forEach(session => {
    if (session.program.Add_On_Program === config.isAddOn) {
      programsMap.set(session.program.id, session.program.name);
    }
  });

  let optionsHTML = '<option value="">Select Program</option>';
  programsMap.forEach((name, id) => {
    optionsHTML += `<option value="${id}">${name}</option>`;
  });
  programSelect.setHTML(optionsHTML);
}

function populateWorkshopOptions(
  row: WFComponent,
  data: StartRegistrationResponse,
  selectedProgramId: string,
  config: DynamicTableConfig
): void {
  const workshopSelect = row.getChildAsComponent(config.fields.workshop.selectSelector);
  const filteredSessions = data.sessions.filter(session =>
    session.program.id.toString() === selectedProgramId && session.workshop
  );

  if (filteredSessions.length > 0) {
    (workshopSelect.getElement() as HTMLSelectElement).disabled = false;

    let optionsHTML = '<option value="">Select Workshop</option>';

    // Build a map of unique workshops
    const workshopsMap = new Map<number, string>();
    filteredSessions.forEach(session => {
      if (session.workshop) {
        workshopsMap.set(session.workshop.id, session.workshop.Name);
      }
    });

    // Sort workshops by name
    const sortedWorkshops = Array.from(workshopsMap.entries()).sort((a, b) =>
      a[1].localeCompare(b[1])
    );

    // Append options in sorted order
    sortedWorkshops.forEach(([id, name]) => {
      optionsHTML += `<option value="${id}">${name}</option>`;
    });

    workshopSelect.setHTML(optionsHTML);
    (workshopSelect.getElement() as HTMLElement).style.display = "block";
    const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
    workshopText.getElement().style.display = "none";
  } else {
    // No workshops available — disable and display " - "
    (workshopSelect.getElement() as HTMLSelectElement).disabled = true;
    (workshopSelect.getElement() as HTMLElement).style.display = "none";
    const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
    workshopText.setText(" - ");
    workshopText.getElement().style.display = "block";

    // Go directly to session select
    populateSessionOptions(row, data, selectedProgramId, null, config);
  }
}


function populateSessionOptions(
  row: WFComponent,
  data: StartRegistrationResponse,
  selectedProgramId: string,
  selectedWorkshopId: string | null,
  config: DynamicTableConfig
): void {
  const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
  (sessionSelect.getElement() as HTMLSelectElement).disabled = false;

  let filteredSessions = data.sessions.filter(
    session => session.program.id.toString() === selectedProgramId
  );

  if (selectedWorkshopId) {
    filteredSessions = filteredSessions.filter(
      session => session.workshop && session.workshop.id.toString() === selectedWorkshopId
    );
  }

  let optionsHTML = '<option value="">Select Session</option>';
  filteredSessions.forEach(session => {
    const label = `${session.Weekday} ${session.Time_block}`;
    optionsHTML += `<option value="${session.id}">${label}</option>`;
  });

  sessionSelect.setHTML(optionsHTML);
}

function populateStudentOptions(
  row: WFComponent,
  data: StartRegistrationResponse,
  config: DynamicTableConfig
): void {
  const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
  (studentSelect.getElement() as HTMLSelectElement).disabled = false;
  let optionsHTML = '<option value="">Select Student</option>';
  const currentSessionId = (row.getElement() as HTMLElement).getAttribute("data-session-id");
  const tableBodyEl = document.querySelector(config.tableBodySelector);
  let usedStudentIds: string[] = [];
  if (tableBodyEl && currentSessionId) {
    const confirmedRows = Array.from(tableBodyEl.querySelectorAll("tr.confirmed"));
    confirmedRows.forEach(tr => {
      if (tr.getAttribute("data-session-id") === currentSessionId) {
        const studentId = tr.getAttribute("data-student-id");
        if (studentId) {
          usedStudentIds.push(studentId);
        }
      }
    });
  }
  data.student_profiles.forEach(profile => {
    if (!usedStudentIds.includes(profile.id.toString())) {
      optionsHTML += `<option value="${profile.id}">${profile.full_name}</option>`;
    }
  });
  studentSelect.setHTML(optionsHTML);
}

function attachRowEventListeners(
  row: WFComponent,
  data: StartRegistrationResponse,
  config: DynamicTableConfig
): void {
  const programSelect = row.getChildAsComponent(config.fields.program.selectSelector);
  programSelect.on("change", () => {
    const selectEl = programSelect.getElement() as HTMLSelectElement;
    const selectedProgramId = selectEl.value;
    (row.getElement() as HTMLElement).setAttribute("data-program-id", selectedProgramId);
    populateWorkshopOptions(row, data, selectedProgramId, config);
    const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
    (sessionSelect.getElement() as HTMLSelectElement).disabled = false;
  });

  const workshopSelect = row.getChildAsComponent(config.fields.workshop.selectSelector);
  workshopSelect.on("change", () => {
    const selectEl = workshopSelect.getElement() as HTMLSelectElement;
    const selectedWorkshopId = selectEl.value;
    (row.getElement() as HTMLElement).setAttribute("data-workshop-id", selectedWorkshopId);
    const confirmedProgramId = (row.getElement() as HTMLElement).getAttribute("data-program-id") || "";
    populateSessionOptions(row, data, confirmedProgramId, selectedWorkshopId, config);
  });

  const sessionSelect = row.getChildAsComponent(config.fields.session.selectSelector);
  sessionSelect.on("change", () => {
    const selectEl = sessionSelect.getElement() as HTMLSelectElement;
    const selectedSessionId = selectEl.value;
    (row.getElement() as HTMLElement).setAttribute("data-session-id", selectedSessionId);
    const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
    (studentSelect.getElement() as HTMLSelectElement).disabled = false;
    populateStudentOptions(row, data, config);
  });

  const studentSelect = row.getChildAsComponent(config.fields.student.selectSelector);
  studentSelect.on("change", () => {
    const programEl = row.getChildAsComponent(config.fields.program.selectSelector).getElement() as HTMLSelectElement;
    const workshopEl = row.getChildAsComponent(config.fields.workshop.selectSelector).getElement() as HTMLSelectElement;
    const sessionEl = row.getChildAsComponent(config.fields.session.selectSelector).getElement() as HTMLSelectElement;
    const studentEl = row.getChildAsComponent(config.fields.student.selectSelector).getElement() as HTMLSelectElement;
  
    const programId = programEl.value;
    const workshopId = workshopEl.disabled ? null : workshopEl.value;
    const sessionId = sessionEl.value;
    const studentId = studentEl.value;
  
    if (!programId || !sessionId || !studentId) return;
  
    const rowEl = row.getElement() as HTMLElement;
    rowEl.setAttribute("data-program-id", programId);
    rowEl.setAttribute("data-session-id", sessionId);
    rowEl.setAttribute("data-student-id", studentId);
    if (workshopId) rowEl.setAttribute("data-workshop-id", workshopId);
  
    // Prevent duplicates
    const tableBodyEl = document.querySelector(config.tableBodySelector);
    if (tableBodyEl) {
      const duplicate = Array.from(tableBodyEl.querySelectorAll("tr.confirmed")).some(tr =>
        tr.getAttribute("data-session-id") === sessionId &&
        tr.getAttribute("data-student-id") === studentId
      );
      if (duplicate) {
        console.warn("This student is already registered for the selected session.");
        return;
      }
    }
  
    // Convert selects to display mode
    const programText = row.getChildAsComponent(config.fields.program.textSelector);
    programText.setText(programEl.options[programEl.selectedIndex].text);
  
    const workshopText = row.getChildAsComponent(config.fields.workshop.textSelector);
    workshopText.setText(workshopEl.disabled ? " - " : workshopEl.options[workshopEl.selectedIndex].text);
  
    const sessionText = row.getChildAsComponent(config.fields.session.textSelector);
    const selectedSession = data.sessions.find(session => session.id.toString() === sessionId);
    sessionText.setText(selectedSession ? `${selectedSession.Weekday} ${selectedSession.Time_block}` : "Unknown session");
  
    const studentText = row.getChildAsComponent(config.fields.student.textSelector);
    studentText.setText(studentEl.options[studentEl.selectedIndex].text);
  
    // Hide selects and show text
    [config.fields.program, config.fields.workshop, config.fields.session, config.fields.student].forEach(field => {
      const selectParent = row.getChildAsComponent(field.selectSelector).getElement().parentElement;
      if (selectParent) (selectParent as HTMLElement).style.display = "none";
      row.getChildAsComponent(field.textSelector).getElement().style.display = "block";
    });
  
  
  
    row.addCssClass("confirmed");
  
    // Save to state
    const currentItems = loadState().registrationItems || [];
    const newItem = {
      program_id: programId,
      session_id: sessionId,
      student_id: studentId,
      program_name: programText.getElement().textContent || "",
      workshop_name: workshopText.getElement().textContent || "",
      session_name: sessionText.getElement().textContent || "",
      student_name: studentText.getElement().textContent || ""
    };
    saveState({ registrationItems: [...currentItems, newItem] });
  
    document.dispatchEvent(new CustomEvent("registrationChanged"));
  });
  

 
  
  const deleteButton = row.getChildAsComponent(".remove_registration_button");
  deleteButton.on("click", () => {
    row.remove();
    const tableBodyEl = document.querySelector(config.tableBodySelector);
    if (tableBodyEl) {
      const templateRowId = config.templateRowSelector.startsWith("#")
        ? config.templateRowSelector.slice(1)
        : config.templateRowSelector;
      const emptyStateId = config.emptyStateSelector.startsWith("#")
        ? config.emptyStateSelector.slice(1)
        : config.emptyStateSelector;
      const userRows = Array.from(tableBodyEl.querySelectorAll("tr")).filter(tr => {
        return tr.id !== templateRowId && tr.id !== emptyStateId;
      });
      if (userRows.length === 0) {
        const emptyRowEl = document.querySelector(config.emptyStateSelector) as HTMLElement;
        if (emptyRowEl) {
          emptyRowEl.style.display = "table-row";
        }
      }
    }
    // Remove corresponding item from state.registrationItems.
    const state = loadState();
    const updatedItems = (state.registrationItems || []).filter(item => {
      return !(
        item.session_id === row.getAttribute("data-session-id") &&
        item.student_id === row.getAttribute("data-student-id")
      );
    });
    saveState({ registrationItems: updatedItems });
  
    document.dispatchEvent(new CustomEvent("registrationChanged"));
  });
}

export { attachRowEventListeners, populateProgramOptions };
