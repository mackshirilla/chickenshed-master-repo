import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchProductions, Production } from "../../api/productions";
import { saveSelectedProduction } from "./state/ticketPurchaseState";

let selectedProductionId: string | null = null;
let initialTemplateState: HTMLElement | null = null;

export const initializeProductionList = async (
  containerSelector: string
): Promise<Production[]> => {
  // Update return type to Promise<Production[]>
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Production list container not found.");
    return [];
  }

  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  container.innerHTML = "";
  container.appendChild(initialTemplateState.cloneNode(true));

  const list = new WFDynamicList<Production>(containerSelector, {
    rowSelector: "#cardSelectProduction",
    loaderSelector: "#productionListLoading",
    emptySelector: "#productionListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const productionCard = new WFComponent(rowElement);
    const productionTitle = productionCard.getChildAsComponent(
      "#cardProductionTitle"
    );
    const productionDescription = productionCard.getChildAsComponent(
      "#cardProductionDescription"
    );
    const productionAges = productionCard.getChildAsComponent(
      "#cardProductionAges"
    );
    const productionImage = productionCard.getChildAsComponent(
      "#cardProductionImage"
    );
    const productionInput =
      productionCard.getChildAsComponent(".input_card_input");
    const productionLabel = productionCard.getChildAsComponent("label");

    if (
      !productionTitle ||
      !productionDescription ||
      !productionAges ||
      !productionInput ||
      !productionImage ||
      !productionLabel
    ) {
      console.error("Production elements not found.");
      return;
    }

    if (rowData && rowData.fieldData) {
      const inputId = `productionInput-${index}`;
      productionInput.setAttribute("id", inputId);
      productionInput.setAttribute("value", rowData.id);
      productionLabel.setAttribute("for", inputId);

      productionTitle.setText(rowData.fieldData.name);
      productionDescription.setText(rowData.fieldData["short-description"]);
      productionAges.setText(rowData.fieldData["age-description"]);

      if (rowData.fieldData["main-image"]?.url) {
        productionImage.setAttribute(
          "src",
          rowData.fieldData["main-image"].url
        );
        productionImage.setAttribute(
          "alt",
          rowData.fieldData["main-image"].alt || "Production Image"
        );
      } else {
        console.warn(`Production ID ${rowData.id} does not have a main image.`);
      }

      productionInput.on("change", () => {
        selectedProductionId = (
          productionInput.getElement() as HTMLInputElement
        ).value;
        saveSelectedProduction({
          id: rowData.id,
          name: rowData.fieldData.name,
          description: rowData.fieldData["short-description"],
          imageUrl: rowData.fieldData["main-image"].url, // Save production image URL
        });
        console.log("Selected Production ID:", selectedProductionId);
      });

      rowElement.setStyle({ display: "flex" });
    } else {
      console.error("Incomplete production data:", rowData);
    }

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const productions = await fetchProductions();
    console.log("Fetched productions:", productions);

    if (productions.length > 0) {
      list.setData(productions);
    } else {
      list.setData([]); // Trigger the empty state
    }

    list.changeLoadingStatus(false);
    return productions; // Return the list of productions
  } catch (error) {
    console.error("Error loading productions:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
    return []; // Return an empty array in case of error
  }
};
