import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchProductions, Production } from "../../api/productions";
import { saveSelectedProduction } from "./state/ticketPurchaseState";

let selectedProductionId: string | null = null;
let initialTemplateState: HTMLElement | null = null;

export const initializeProductionList = async (
  containerSelector: string
): Promise<Production[]> => {
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

  list.rowRenderer(({ rowData: rawData, rowElement, index }) => {
    // Cast rawData to match API response fields
    const rowData = rawData as unknown as {
      id: number;
      Name: string;
      Short_Description: string;
      Age_Description: string;
      Main_Image: string;
    };

    const productionCard = new WFComponent(rowElement);
    const productionTitle = productionCard.getChildAsComponent("#cardProductionTitle");
    const productionDescription = productionCard.getChildAsComponent("#cardProductionDescription");
    const productionAges = productionCard.getChildAsComponent("#cardProductionAges");
    const productionImage = productionCard.getChildAsComponent("#cardProductionImage");
    const productionInput = productionCard.getChildAsComponent(".input_card_input");
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

    const inputId = `productionInput-${index}`;
    productionInput.setAttribute("id", inputId);
    productionInput.setAttribute("value", rowData.id.toString());
    productionLabel.setAttribute("for", inputId);

    productionTitle.setText(rowData.Name);
    productionDescription.setText(rowData.Short_Description);
    productionAges.setText(rowData.Age_Description);

    if (rowData.Main_Image) {
      productionImage.setAttribute("src", rowData.Main_Image);
      productionImage.setAttribute("alt", rowData.Name || "Production Image");
    } else {
      console.warn(`Production ID ${rowData.id} does not have a main image.`);
    }

    productionInput.on("change", () => {
      selectedProductionId = (productionInput.getElement() as HTMLInputElement).value;
      saveSelectedProduction({
        id: Number(selectedProductionId),
        name: rowData.Name,
        description: rowData.Short_Description,
        imageUrl: rowData.Main_Image,
      });
      console.log("Selected Production ID:", selectedProductionId);
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const productions = await fetchProductions();
    console.log("Fetched productions:", productions);

    list.setData(productions);
    list.changeLoadingStatus(false);
    return productions;
  } catch (error) {
    console.error("Error loading productions:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
    return [];
  }
};
