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

type SafeProductRow = {
  id: number | string | null;
  Product_name?: string | null;

  Single_sale_price_id?: string | null;
  Monthly_price_id?: string | null;
  Annual_price_id?: string | null;

  Single_sale_price_amount?: number | null;
  Monthly_price_amount?: number | null;
  Annual_price_amount?: number | null;
};

// Helpers for safe numeric comparisons/sorts
const n = (v: unknown): number => (typeof v === "number" && Number.isFinite(v) ? v : 0);

// Filter + sort products based on current donation type
const filterProductsByDonationType = (products: Product[]): Product[] => {
  const donationType = getSelectedDonationType();

  const filtered = products.filter((product: any) => {
    switch (donationType) {
      case "one-time":
        return Boolean(product?.Single_sale_price_id);
      case "month":
        return Boolean(product?.Monthly_price_id);
      case "year":
        return Boolean(product?.Annual_price_id);
      default:
        return false;
    }
  });

  return filtered.sort((a: any, b: any) => {
    switch (donationType) {
      case "one-time":
        return n(a?.Single_sale_price_amount) - n(b?.Single_sale_price_amount);
      case "month":
        return n(a?.Monthly_price_amount) - n(b?.Monthly_price_amount);
      case "year":
        return n(a?.Annual_price_amount) - n(b?.Annual_price_amount);
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

  // Cache pristine template state
  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  // Reset container to clean template
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
    const row = rowData as unknown as SafeProductRow;

    // Normalize strings (no undefined/null into setters)
    const safeName = row.Product_name ?? "";

    // ID must exist (or we can't select it)
    const idNum = Number(row.id);
    const hasValidId = Number.isFinite(idNum) && idNum > 0;

    const productCard = new WFComponent(rowElement);
    const productTitle = productCard.getChildAsComponent("#cardProductTitle");
    const productInput = productCard.getChildAsComponent(".input_card_input");
    const label = productCard.getChildAsComponent("label");

    // Required DOM only
    if (!productTitle || !productInput) {
      console.error("Required elements not found in the product card");
      return;
    }

    // If id is invalid/null, hide the row (prevents crashes)
    if (!hasValidId) {
      console.warn("[ProductList] Skipping row with invalid id:", row);
      rowElement.setStyle({ display: "none" });
      return;
    }

    const inputId = `productInput-${index}`;
    productInput.setAttribute("id", inputId);
    productInput.setAttribute("value", String(idNum));
    label?.setAttribute("for", inputId);

    productTitle.setText(safeName);

    productInput.on("change", () => {
      const donationType = getSelectedDonationType();

      let valid = false;
      let amount = 0;

      // Safely compute validity + amount for the *current donationType*
      switch (donationType) {
        case "one-time":
          valid = Boolean(row.Single_sale_price_id);
          amount = n(row.Single_sale_price_amount);
          break;
        case "month":
          valid = Boolean(row.Monthly_price_id);
          amount = n(row.Monthly_price_amount);
          break;
        case "year":
          valid = Boolean(row.Annual_price_id);
          amount = n(row.Annual_price_amount);
          break;
        default:
          valid = false;
          amount = 0;
      }

      if (!valid) {
        console.warn("Selected product is not valid for this donation type.");
        try {
          (productInput.getElement() as HTMLInputElement).checked = false;
        } catch {
          // no-op
        }
        return;
      }

      selectedProductId = String(idNum);

      saveSelectedProduct({
        id: String(idNum),
        name: safeName,

        // IMPORTANT: this should reflect the current donation type amount
        amount,

        Single_sale_price_id: row.Single_sale_price_id ?? "",
        Monthly_price_id: row.Monthly_price_id ?? "",
        Annual_price_id: row.Annual_price_id ?? "",
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
