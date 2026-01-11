import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchProductions, Production } from "../../api/productions";
import { saveSelectedProduction } from "./state/ticketPurchaseState";

let selectedProductionId: string | null = null;
let initialTemplateState: HTMLElement | null = null;

type SafeProductionRow = {
  id: number | string | null;
  Name?: string | null;
  Short_Description?: string | null;
  Age_Description?: string | null;
  Main_Image?: string | null;
};

export const initializeProductionList = async (
  containerSelector: string
): Promise<Production[]> => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Production list container not found.");
    return [];
  }

  // Cache pristine template state
  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  // Reset container to clean template
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
    // -------------------------------------------------
    // 1) Normalize API data (NO undefined/null into setters)
    // -------------------------------------------------
    const rowData = rawData as unknown as SafeProductionRow;

    const safeName = rowData.Name ?? "";
    const safeDesc = rowData.Short_Description ?? "";
    const safeAges = rowData.Age_Description ?? "";
    const safeImg = rowData.Main_Image ?? "";

    // ID must exist (or row should not be selectable)
    const idNum = Number(rowData.id);
    const hasValidId = Number.isFinite(idNum) && idNum > 0;

    // -------------------------------------------------
    // 2) Grab DOM components
    // -------------------------------------------------
    const productionCard = new WFComponent(rowElement);

    const productionTitle =
      productionCard.getChildAsComponent("#cardProductionTitle");
    const productionDescription =
      productionCard.getChildAsComponent("#cardProductionDescription");
    const productionAges =
      productionCard.getChildAsComponent("#cardProductionAges");
    const productionImage =
      productionCard.getChildAsComponent("#cardProductionImage");
    const productionInput =
      productionCard.getChildAsComponent(".input_card_input");
    const productionLabel =
      productionCard.getChildAsComponent("label");

    // -------------------------------------------------
    // 3) Required structure only
    // -------------------------------------------------
    if (!productionTitle || !productionInput || !productionLabel) {
      console.error("Required production elements not found.");
      return;
    }

    // If id is invalid/null, hide the row (prevents crashes + bad selections)
    if (!hasValidId) {
      console.warn("[ProductionList] Skipping row with invalid id:", rowData);
      rowElement.setStyle({ display: "none" });
      return;
    }

    // -------------------------------------------------
    // 4) Input wiring (no .toString() on nullable values)
    // -------------------------------------------------
    const inputId = `productionInput-${index}`;
    productionInput.setAttribute("id", inputId);
    productionInput.setAttribute("value", String(idNum));
    productionLabel.setAttribute("for", inputId);

    // -------------------------------------------------
    // 5) Text fields (safe defaults)
    // -------------------------------------------------
    productionTitle.setText(safeName);
    productionDescription?.setText(safeDesc);
    productionAges?.setText(safeAges);

    // -------------------------------------------------
    // 6) Image (optional)
    // -------------------------------------------------
    if (productionImage) {
      if (safeImg) {
        productionImage.setAttribute("src", safeImg);
        productionImage.setAttribute("alt", safeName || "Production Image");
        productionImage.setStyle({ display: "" });
      } else {
        productionImage.setAttribute("src", "");
        productionImage.setStyle({ display: "none" });
      }
    }

    // -------------------------------------------------
    // 7) Selection handling
    // -------------------------------------------------
    productionInput.on("change", () => {
      selectedProductionId = (
        productionInput.getElement() as HTMLInputElement
      ).value;

      saveSelectedProduction({
        id: idNum,
        name: safeName,
        description: safeDesc,
        imageUrl: safeImg,
      });

      console.log("Selected Production ID:", selectedProductionId);
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  // -------------------------------------------------
  // 8) Data load
  // -------------------------------------------------
  try {
    list.changeLoadingStatus(true);

    const productions = await fetchProductions();
    console.log("Fetched productions:", productions);

    // Helpful debug: quickly spot null ids
    // console.table((productions as any[]).map(p => ({ id: p?.id, Name: p?.Name })));

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
