import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchProducts, Product } from "../../api/campaignProducts";
import { saveSelectedProduct, getSelectedProduct } from "./state/donationState";

let selectedProductId: string | null = null;

// Store the initial template state of the container
let initialTemplateState: HTMLElement | null = null;

export const initializeDynamicProductList = async (
  containerSelector: string,
  campaignId: string
) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Product list container not found.");
    return;
  }

  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  container.innerHTML = "";
  container.appendChild(initialTemplateState.cloneNode(true));

  const list = new WFDynamicList<Product>(containerSelector, {
    rowSelector: "#cardSelectProduct",
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
    const productCard = new WFComponent(rowElement);
    const productTitle = productCard.getChildAsComponent("#cardProductTitle");
    const productInput = productCard.getChildAsComponent(".input_card_input");

    if (!productTitle || !productInput) {
      console.error("One or more elements not found in the product card");
      return;
    }

    const inputId = `productInput-${index}`;
    productInput.setAttribute("id", inputId);
    productInput.setAttribute("value", rowData.id);

    const label = productCard.getChildAsComponent("label");
    if (label) {
      label.setAttribute("for", inputId);
    }

    productTitle.setText(rowData.fieldData["product-name"]);

    productInput.on("change", () => {
      selectedProductId = (productInput.getElement() as HTMLInputElement).value;
      saveSelectedProduct({
        id: rowData.id,
        name: rowData.fieldData["product-name"],
        amount: rowData.fieldData.price,
      });
      console.log("Selected Product ID:", selectedProductId);
    });

    rowElement.setStyle({ display: "flex" });

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const products = await fetchProducts(campaignId);
    console.log("Fetched products:", products);

    if (products.length > 0) {
      list.setData(products);
    } else {
      list.setData([]); // Set empty array to trigger the empty state
    }

    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading products:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
};
