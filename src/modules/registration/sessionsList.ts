// components/sessionsList.ts

import { fetchSessions, Session } from "../../api/sessions";
import { updateSelectedItemUI } from "./utils/updateUi";
import { fetchStudentProfiles, StudentProfile } from "../../api/students";
import {
  saveSelectedSession,
  resetSelectedSessions,
  updateSelectedSessions,
} from "./state/selectedSessions";
import {
  logPricingOption,
  loadState,
  saveState,
} from "./state/registrationState";
import { loadSelectedProgram } from "./state/selectedProgram";
import { loadSelectedWorkshop } from "./state/selectedWorkshop";
import { WFDynamicList, WFComponent } from "@xatom/core";

let initialTemplateState: HTMLElement | null = null;
let sessionData: Session[] = [];

export const initializeSessionList = async (
  workshopId: string,
  programId: string
) => {
  const containerSelector = "#selectSessionList";
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Session list container not found");
    return;
  }

  resetSelectedSessions();

  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  } else {
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
  }

  const list = new WFDynamicList<Session>(containerSelector, {
    rowSelector: "#sessionSelectWrap",
    loaderSelector: "#sessionListLoading",
    emptySelector: "#sessionListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  // Correct usage with destructuring to get 'students'
  let studentProfiles: StudentProfile[] = [];
  try {
    const { students } = await fetchStudentProfiles(); // Destructure to get 'students'
    studentProfiles = students; // Assign the students array to studentProfiles
  } catch (error) {
    console.error("Error fetching student profiles:", error);
  }

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const sessionCard = new WFComponent(rowElement);
    const sessionWeekday = sessionCard.getChildAsComponent(
      "#cardSessionWeekday"
    );
    const sessionTime = sessionCard.getChildAsComponent("#cardSessionTime");
    const sessionLocation = sessionCard.getChildAsComponent(
      "#cardSessionLocation"
    );
    const sessionPrice = sessionCard.getChildAsComponent("#cardSessionPrice");
    const sessionInput =
      sessionCard.getChildAsComponent<HTMLInputElement>("#cardSessionInput");
    const studentsList = sessionCard.getChildAsComponent("#selectStudentsList");
    const hiddenFieldWrap = sessionCard.getChildAsComponent(
      ".hidden_form_field-wrap"
    );

    const inputId = `sessionInput-${index}`;
    sessionInput.setAttribute("id", inputId);
    sessionInput.setAttribute("value", rowData.id);

    const label = sessionCard.getChildAsComponent("label");
    label.setAttribute("for", inputId);

    // Updated property access to match the Session interface
    sessionWeekday.setText(rowData.fieldData.weekday);
    sessionTime.setText(rowData.fieldData.timeBlock);
    sessionLocation.setText(rowData.fieldData.location);

    const initialPrice = updateSessionPrice(sessionPrice, rowData);

    studentsList.removeAllChildren();
    studentProfiles.forEach((student) => {
      const studentId = student.id;
      const uniqueStudentId = `${inputId}-student-${studentId}`;
      const studentPill = new WFComponent(document.createElement("label"));
      studentPill.addCssClass("pill-item");
      studentPill.setAttribute("for", uniqueStudentId);

      const studentCheckbox = new WFComponent(document.createElement("input"));
      studentCheckbox.setAttribute("type", "checkbox");
      studentCheckbox.addCssClass("pill-checkbox");
      studentCheckbox.setAttribute("id", uniqueStudentId);
      studentCheckbox.setAttribute("name", "selectedStudents");
      studentCheckbox.setAttribute("value", studentId.toString());

      const studentName = new WFComponent(document.createElement("span"));
      studentName.addCssClass("pill-label");
      studentName.addCssClass("has-icon");
      studentName.setText(`${student.first_name} ${student.last_name}`);

      const pillIcon = new WFComponent(document.createElement("div"));
      pillIcon.addCssClass("pill-icon");
      pillIcon.addCssClass("w-embed");
      pillIcon.setHTML(
        `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor"><path d="M0 0h24v24H0V0z" fill="none"></path><path d="M9 16.2l-3.5-3.5c-.39-.39-1.01-.39-1.4 0-.39.39-.39 1.01 0 1.4l4.19 4.19c.39.39 1.02.39 1.41 0L20.3 7.7c.39-.39.39-1.01 0-1.4-.39-.39-1.01-.39-1.4 0L9 16.2z"></path></svg>`
      );

      studentPill.appendChild(studentCheckbox);
      studentPill.appendChild(studentName);
      studentPill.appendChild(pillIcon);
      studentsList.appendChild(studentPill);

      studentCheckbox.on("change", () => {
        const studentCheckboxElement =
          studentCheckbox.getElement() as HTMLInputElement;
        const studentIdInt = parseInt(studentCheckboxElement.value);

        const sessionChangedEvent = new CustomEvent("sessionChanged", {
          detail: {
            sessionId: rowData.id,
            studentId: studentIdInt,
            checked: studentCheckboxElement.checked,
            initialPriceSelection: initialPrice,
          },
        });
        document.dispatchEvent(sessionChangedEvent);

        updateSelectedSessions(
          rowData.id,
          studentIdInt,
          studentCheckboxElement.checked
        );
      });
    });

    sessionInput.on("change", () => {
      const inputElement = sessionInput.getElement() as HTMLInputElement;
      if (inputElement.checked) {
        hiddenFieldWrap.setStyle({ display: "flex" });
      } else {
        hiddenFieldWrap.setStyle({ display: "none" });
        const studentCheckboxes =
          studentsList.getChildAsComponents<HTMLInputElement>(".pill-checkbox");
        studentCheckboxes.forEach((checkbox) => {
          const studentCheckboxElement =
            checkbox.getElement() as HTMLInputElement;
          studentCheckboxElement.checked = false;
          const studentIdInt = parseInt(studentCheckboxElement.value);

          const sessionChangedEvent = new CustomEvent("sessionChanged", {
            detail: {
              sessionId: rowData.id,
              studentId: studentIdInt,
              checked: false,
              initialPriceSelection: initialPrice,
            },
          });
          document.dispatchEvent(sessionChangedEvent);

          updateSelectedSessions(rowData.id, studentIdInt, false);
        });
      }
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const sessions = await fetchSessions(workshopId, programId);

    if (Array.isArray(sessions) && sessions.length > 0) {
      sessionData = sessions;
      list.setData(sessions);

      // Set default pricing option to 'Annual' if not already set
      let registrationState = loadState();
      if (!registrationState.selectedPricingOption) {
        registrationState.selectedPricingOption = "Annual";
        saveState(registrationState);
      }
      updateAllSessionPrices();
    } else {
      list.setData([]);
    }

    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading sessions:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }

  document
    .querySelector("#updatePriceAnnual")
    ?.addEventListener("change", () => {
      logPricingOption("Annual");
      updateAllSessionPrices();
    });

  document
    .querySelector("#updatePriceMonthly")
    ?.addEventListener("change", () => {
      logPricingOption("Monthly");
      updateAllSessionPrices();
    });

  document
    .querySelector("#updatePriceSemester")
    ?.addEventListener("change", () => {
      logPricingOption("Pay-Per-Semester");
      updateAllSessionPrices();
    });

  document
    .querySelector("#updatePriceDeposit")
    ?.addEventListener("change", () => {
      logPricingOption("Deposit");
      updateAllSessionPrices();
    });

  initializeFilterSelect();
  updateSelectedItemUI(); // Ensure selected item UI is updated initially
};

// Update the selected item UI
/*const updateSelectedItemUI = () => {
  const selectedProgram = loadSelectedProgram();
  const selectedWorkshop = loadSelectedWorkshop();

  const selectedProgramTitle = new WFComponent("#selectedProgramTitle");
  const selectedWorkshopTitle = new WFComponent("#selectedWorkshopTitle");
  const selectedAgeRange = new WFComponent("#selectedAgeRange");
  const selectedImage = new WFComponent("#selectedImage");

  if (selectedProgram.id) {
    selectedProgramTitle.setText(selectedProgram.name);

    if (selectedWorkshop.id) {
      selectedWorkshopTitle.setText(selectedWorkshop.name);
      selectedWorkshopTitle.setStyle({ display: "block" });
      selectedAgeRange.setText(selectedWorkshop.ageRange); // Use workshop age range

      // Use the workshop image if available, otherwise use the program image
      const imageUrl = selectedWorkshop.imageUrl || selectedProgram.imageUrl;
      selectedImage.setAttribute("src", imageUrl);
    } else {
      selectedWorkshopTitle.setStyle({ display: "none" });
      selectedAgeRange.setText(selectedProgram.ageRange); // Use program age range if no workshop selected
      selectedImage.setAttribute("src", selectedProgram.imageUrl);
    }
  }
};*/

updateSelectedItemUI();

const updateSessionPrice = (sessionPrice: WFComponent, rowData: Session) => {
  const registrationState = JSON.parse(
    localStorage.getItem("registrationState") || "{}"
  );
  const selectedPricingOption =
    registrationState.selectedPricingOption || "Annual";
  let price: string;

  switch (selectedPricingOption) {
    case "Annual":
      price = rowData.fieldData.displayedAnnualPrice;
      break;
    case "Monthly":
      price = rowData.fieldData.displayedMonthlyPrice;
      break;
    case "Pay-Per-Semester":
      price = rowData.fieldData.displayedSemesterPrice;
      break;
    case "Deposit":
      price = rowData.fieldData.displayedDepositPrice;
      break;
    default:
      price = ""; // Or any default value you choose
  }

  sessionPrice.setText(price);
  return price;
};

const updateAllSessionPrices = () => {
  const sessionCards = document.querySelectorAll("#sessionSelectWrap");
  sessionCards.forEach((sessionCard) => {
    const sessionPriceElement = sessionCard.querySelector(
      "#cardSessionPrice"
    ) as HTMLElement;
    const sessionPrice = new WFComponent(sessionPriceElement);
    const sessionInputElement = sessionCard.querySelector(
      ".session-input"
    ) as HTMLInputElement;
    const sessionId = sessionInputElement.value;
    const rowData = sessionData.find((session) => session.id === sessionId);
    if (sessionPrice && rowData) {
      updateSessionPrice(sessionPrice, rowData);
    }
  });
};

const initializeFilterSelect = () => {
  const selectElement = document.getElementById("singleSelectInput");

  if (selectElement) {
    selectElement.addEventListener("change", (event) => {
      const selectedValue = (event.target as HTMLSelectElement).value;
      filterSessionsByLocation(selectedValue);
    });
  }
};

const filterSessionsByLocation = (location: string) => {
  const sessionCards = document.querySelectorAll("#sessionSelectWrap");

  sessionCards.forEach((sessionCard) => {
    const sessionLocationElement = sessionCard.querySelector(
      "#cardSessionLocation"
    ) as HTMLElement;
    const sessionLocation = sessionLocationElement?.textContent || "";

    if (location === "N/A" || sessionLocation === location) {
      (sessionCard as HTMLElement).style.display = "flex";
    } else {
      (sessionCard as HTMLElement).style.display = "none";
    }
  });
};

// Function to validate and submit session selections
export const validateAndSubmitSessions = (): boolean => {
  const registrationState = JSON.parse(
    localStorage.getItem("registrationState") || "{}"
  );
  const submitStepThreeError = new WFComponent("#submitStepThreeError");

  // Ensure that at least one session is selected
  if (
    !registrationState.selectedSessions ||
    registrationState.selectedSessions.length === 0
  ) {
    submitStepThreeError.setText("Please select at least one session.");
    submitStepThreeError.setStyle({ display: "block" });
    return false;
  }

  // Ensure each selected session has associated students
  for (const session of registrationState.selectedSessions) {
    if (!session.studentIds || session.studentIds.length === 0) {
      submitStepThreeError.setText(
        "Please select at least one student for each session."
      );
      submitStepThreeError.setStyle({ display: "block" });
      return false;
    }
  }

  // Hide the error message if validation passes
  submitStepThreeError.setStyle({ display: "none" });

  // If validation passes, save state or submit data to the server
  saveState(registrationState);

  return true;
};
