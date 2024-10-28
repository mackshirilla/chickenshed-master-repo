import { fetchWorkshops, Workshop } from "../../api/workshops";
import { saveSelectedWorkshop } from "./state/selectedWorkshop";
import { WFDynamicList, WFComponent } from "@xatom/core";

let initialTemplateState: HTMLElement | null = null;

export const initializeWorkshopList = async (programId: string) => {
  const containerSelector = "#selectWorkshopList";
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Workshop list container not found");
    return;
  }

  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  } else {
    container.innerHTML = "";
    container.appendChild(initialTemplateState.cloneNode(true));
  }

  const list = new WFDynamicList<Workshop>(containerSelector, {
    rowSelector: "#cardSelectWorkshop",
    loaderSelector: "#workshopListLoading",
    emptySelector: "#workshopListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "flex",
    });
    return emptyElement;
  });

  try {
    const workshops = await fetchWorkshops(programId);

    // Ensure workshops is always an array and sort it alphabetically by name
    const workshopArray = (Array.isArray(workshops) ? workshops : []).sort(
      (a, b) => a.fieldData.name.localeCompare(b.fieldData.name)
    );

    list.rowRenderer(({ rowData, rowElement, index }) => {
      const workshopCard = new WFComponent(rowElement);
      const workshopTitle =
        workshopCard.getChildAsComponent("#cardWorkshopTitle");
      const workshopDescription = workshopCard.getChildAsComponent(
        "#cardWorkshopDescription"
      );
      const workshopAges =
        workshopCard.getChildAsComponent("#cardWorkshopAges");
      const workshopImage =
        workshopCard.getChildAsComponent<HTMLImageElement>(
          "#cardWorkshopImage"
        );
      const workshopInput =
        workshopCard.getChildAsComponent<HTMLInputElement>(".input_card_input");

      const inputId = `workshopInput-${index}`;
      workshopInput.setAttribute("id", inputId);
      workshopInput.setAttribute("name", "workshop");
      workshopInput.setAttribute("value", rowData.id);

      const workshopLabel = workshopCard.getChildAsComponent("label");
      workshopLabel.setAttribute("for", inputId);

      // Updated property access to match the response object
      workshopTitle.setText(rowData.fieldData["name"]);
      workshopDescription.setText(rowData.fieldData["short-description"]);
      workshopAges.setText(rowData.fieldData["age-range"]);
      workshopImage.setAttribute("src", rowData.fieldData["main-image"].url);

      // Get the #registrationTrue element inside the row
      const registrationTrueElement =
        workshopCard.getChildAsComponent("#registrationTrue");

      // Set display and input disabled state based on the 'registered' property
      if (rowData.registered === true) {
        registrationTrueElement.setStyle({ display: "flex" });
        workshopInput.setAttribute("disabled", "true");
      } else {
        registrationTrueElement.setStyle({ display: "none" });
        workshopInput.removeAttribute("disabled");
      }

      workshopInput.on("change", () => {
        saveSelectedWorkshop({
          id: rowData.id,
          name: rowData.fieldData["name"],
          imageUrl: rowData.fieldData["main-image"].url,
          ageRange: rowData.fieldData["age-range"],
        });
      });

      rowElement.setStyle({ display: "flex" });
      return rowElement;
    });

    list.setData(workshopArray);
  } catch (error) {
    console.error("Error loading workshops:", error);
    list.setData([]); // Handle case where no workshops are available or an error occurred
  }
};