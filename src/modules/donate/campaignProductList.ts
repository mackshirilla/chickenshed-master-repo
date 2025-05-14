import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchProducts, Product } from "../../api/campaignProducts";
import {
  saveSelectedProduct,
  getSelectedDonationType,
} from "./state/donationState";

let selectedProductId: string | null = null;
let initialTemplateState: HTMLElement | null = null;
let productCache: Product[] = [];
let productListRef: WFDynamicList<Product> | null = null;

// Filter + sort products based on current donation type
const filterProductsByDonationType = (products: Product[]): Product[] => {
  const donationType = getSelectedDonationType();

  const filtered = products.filter((product) => {
    switch (donationType) {
      case "one-time":
        return !!product.Single_sale_price_id;
      case "month":
        return !!product.Monthly_price_id;
      case "year":
        return !!product.Annual_price_id;
      default:
        return false;
    }
  });

  return filtered.sort((a, b) => {
    switch (donationType) {
      case "one-time":
        return a.Single_sale_price_amount - b.Single_sale_price_amount;
      case "month":
        return a.Monthly_price_amount - b.Monthly_price_amount;
      case "year":
        return a.Annual_price_amount - b.Annual_price_amount;
      default:
        return 0;
    }
  });
};


// Re-render product list based on new donation type
export const renderProductListForDonationType = () => {
  if (productListRef && productCache.length > 0) {
    const filtered = filterProductsByDonationType([...productCache]); // clone to avoid side effects
    productListRef.setData(filtered); // will now use freshly sorted data
  }
};

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

  productListRef = list;

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
    productInput.setAttribute("value", rowData.id.toString());

    const label = productCard.getChildAsComponent("label");
    if (label) {
      label.setAttribute("for", inputId);
    }

    productTitle.setText(rowData.Product_name);

    productInput.on("change", () => {
      const donationType = getSelectedDonationType();

      let valid = false;
      let amount = 0;

      switch (donationType) {
        case "one-time":
          valid = !!rowData.Single_sale_price_id;
          amount = rowData.Single_sale_price_amount;
          break;
        case "month":
          valid = !!rowData.Monthly_price_id;
          amount = rowData.Monthly_price_amount;
          break;
        case "year":
          valid = !!rowData.Annual_price_id;
          amount = rowData.Annual_price_amount;
          break;
      }

      if (!valid) {
        console.warn("Selected product is not valid for this donation type.");
        (productInput.getElement() as HTMLInputElement).checked = false;
        return;
      }

      selectedProductId = rowData.id.toString();
      saveSelectedProduct({
        id: rowData.id.toString(),
        name: rowData.Product_name,
        amount: rowData.Single_sale_price_amount,
        Single_sale_price_id: rowData.Single_sale_price_id,
        Monthly_price_id: rowData.Monthly_price_id,
        Annual_price_id: rowData.Annual_price_id,
      });

      console.log("Selected Product ID:", selectedProductId);
    });

    rowElement.setStyle({ display: "flex" });

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    productCache = await fetchProducts(campaignId);
    const filtered = filterProductsByDonationType(productCache);

    console.log("Filtered products:", filtered);

    list.setData(filtered.length > 0 ? filtered : []);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading products:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
};
