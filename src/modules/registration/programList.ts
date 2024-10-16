// Assuming the code is from a file like src/registration/initializeProgramList.ts

import { fetchPrograms, Program } from "../../api/programs";
import { saveSelectedProgram } from "./state/selectedProgram";
import { WFDynamicList, WFComponent } from "@xatom/core";

let initialTemplateState: HTMLElement | null = null;

export const initializeProgramList = async () => {
  const containerSelector = "#selectProgramList";
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Program list container not found");
    return;
  }

  // Save the initial state of the container template
  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  } else {
    // Reset container to the initial state
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
  }

  const list = new WFDynamicList<Program>(containerSelector, {
    rowSelector: "#cardSelectProgram",
    loaderSelector: "#programListLoading",
    emptySelector: "#programListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  try {
    const programs = await fetchPrograms();
    list.rowRenderer(({ rowData, rowElement, index }) => {
      const programCard = new WFComponent(rowElement);
      const programTitle = programCard.getChildAsComponent("#cardProgramTitle");
      const programDescription = programCard.getChildAsComponent(
        "#cardProgramDescription"
      );
      const programAges = programCard.getChildAsComponent("#cardProgramAges");
      const programImage =
        programCard.getChildAsComponent<HTMLImageElement>("#cardProgramImage");
      const programInput =
        programCard.getChildAsComponent<HTMLInputElement>(".input_card_input");

      // Generate a unique ID for each radio button
      const inputId = `programInput-${index}`;
      programInput.setAttribute("id", inputId);
      programInput.setAttribute("name", "program"); // Group radio buttons
      programInput.setAttribute("value", rowData.id);

      // Associate the label with the radio button
      const programLabel = programCard.getChildAsComponent("label");
      programLabel.setAttribute("for", inputId);

      // Updated property access to match the response object
      programTitle.setText(rowData.fieldData["name"]);
      programDescription.setText(rowData.fieldData["short-description"]);
      programAges.setText(rowData.fieldData["age-range"]);
      programImage.setAttribute("src", rowData.fieldData["main-image"].url);

      // Get the #registrationTrue element inside the row
      const registrationTrueElement =
        programCard.getChildAsComponent("#registrationTrue");

      // Set display and input disabled state based on the 'registered' property
      if (rowData.registered === true) {
        registrationTrueElement.setStyle({ display: "flex" });
        programInput.setAttribute("disabled", "true");
      } else {
        registrationTrueElement.setStyle({ display: "none" });
        programInput.removeAttribute("disabled");
      }

      programInput.on("change", () => {
        saveSelectedProgram({
          id: rowData.id,
          name: rowData.fieldData["name"],
          imageUrl: rowData.fieldData["main-image"].url,
          ageRange: rowData.fieldData["age-range"],
        });
      });

      rowElement.setStyle({ display: "flex" });
      return rowElement;
    });

    list.setData(programs);
  } catch (error) {
    console.error("Error loading programs:", error);
    list.setData([]);
  }
};
