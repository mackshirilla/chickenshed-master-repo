// src/modules/tickets/components/bundleRenderer.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { BundleOfferedFlat } from "../../../api/ticketTiersAPI";
import {
  saveSelectedBundle,
  removeSelectedBundle,
} from "../state/ticketPurchaseState";
import {
  resetTicketQuantitiesIfNeeded,
  updateTicketTierButtons,
} from "../state/bundleStateUpdater";
import { revalidateTicketTierQuantities } from "./ticketTierRenderer";
import { toggleError } from "../../../utils/formUtils";

// Availability info passed in from API
export interface BundleAvailability {
  bundle_id: number;
  bundle_name: string;
  max_available: number;
}

let initialBundleTemplate: HTMLElement | null = null;

/**
 * Renders bundle selection cards and enforces max purchase limits.
 */
export const renderBundles = (
  bundles: BundleOfferedFlat[],
  containerSelector: string,
  bundlesAvailable: BundleAvailability[] = []
) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Bundle list container not found.");
    return;
  }

  // Keep a pristine copy of the template
  if (!initialBundleTemplate) {
    initialBundleTemplate = container.cloneNode(true) as HTMLElement;
  }
  container.innerHTML = "";
  container.appendChild(initialBundleTemplate.cloneNode(true));

  const clearNoTicketsError = () => {
    const noTicketsError = new WFComponent("#noTicketsError");
    toggleError(noTicketsError, "", false);
  };

  const list = new WFDynamicList<BundleOfferedFlat>(containerSelector, {
    rowSelector: "#bundleCard",
    loaderSelector: "#bundleListLoading",
    emptySelector: "#bundleListEmpty",
  });

  list.loaderRenderer(loader => {
    loader.getElement().style.display = "flex";
    return loader;
  });

  list.emptyRenderer(empty => {
    empty.getElement().style.display = "flex";
    return empty;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const bundleCard = new WFComponent(rowElement);
    const bundlePrice = bundleCard.getChildAsComponent("#bundlePrice");
    const bundleName = bundleCard.getChildAsComponent("#bundleName");
    const bundleDescription = bundleCard.getChildAsComponent("#bundleDescription");
    const bundleQuantityInput = bundleCard.getChildAsComponent("#bundleQuantityInput");
    const bundleIncrementButton = bundleCard.getChildAsComponent("#bundleQuantityIncrease");
    const bundleDecrementButton = bundleCard.getChildAsComponent("#bundleQuantityDecrease");
    const bundleMaxAlert = bundleCard.getChildAsComponent(".maximum_alert");
    const bundleSoldOut = bundleCard.getChildAsComponent("#bundleSoldOut");
    const numberInputWrapper = bundleCard.getChildAsComponent(".number_input_wrapper");

    if (
      !bundlePrice ||
      !bundleName ||
      !bundleDescription ||
      !bundleQuantityInput ||
      !bundleIncrementButton ||
      !bundleDecrementButton ||
      !bundleMaxAlert ||
      !bundleSoldOut ||
      !numberInputWrapper
    ) {
      console.error("Bundle elements not found.");
      return;
    }

    // Display price
    bundlePrice.setText(rowData.product_details.Displayed_single_sale_price);
    // Populate text
    bundleName.setText(rowData.Displayed_Name);
    bundleDescription.setText(rowData.Short_Description);
    bundleQuantityInput.setAttribute("value", "0");

    // Lookup this bundle's max availability
const availability = bundlesAvailable.find(b => b.bundle_id === rowData.id);
const maxQty = availability ? availability.max_available : Infinity;

// If none available, show “Sold out” and disable input
if (maxQty <= 0) {
  bundleSoldOut.setText("Sold out");
  bundleSoldOut.getElement().style.display = "block";
  numberInputWrapper.addCssClass("is-disabled");
} else {
  bundleSoldOut.getElement().style.display = "none";
  numberInputWrapper.removeCssClass("is-disabled");
}

// Seed the input's max for native clamping
bundleQuantityInput.setAttribute("max", maxQty.toString());

    const hideAlert = () => bundleMaxAlert.getElement().style.display = "none";
    const showAlert = (msg: string) => {
      bundleMaxAlert.setText(msg);
      bundleMaxAlert.getElement().style.display = "block";
    };

    // Increment logic with max guard
    bundleIncrementButton.on("click", () => {
      const inputEl = bundleQuantityInput.getElement() as HTMLInputElement;
      let current = Number(inputEl.value);
      if (current < maxQty) {
        current += 1;
        inputEl.value = String(current);
        saveSelectedBundle(rowData.id.toString(), current);
        updateTicketTierButtons();
        clearNoTicketsError();
        hideAlert();
        resetTicketQuantitiesIfNeeded();
        revalidateTicketTierQuantities();
      } else {
        showAlert(`Only up to ${maxQty} bundles available.`);
      }
    });

    // Decrement logic
    bundleDecrementButton.on("click", () => {
      const inputEl = bundleQuantityInput.getElement() as HTMLInputElement;
      let current = Number(inputEl.value);
      if (current > 0) {
        current -= 1;
        inputEl.value = String(current);
        if (current > 0) {
          saveSelectedBundle(rowData.id.toString(), current);
        } else {
          removeSelectedBundle(rowData.id.toString());
        }
        updateTicketTierButtons();
        clearNoTicketsError();
        hideAlert();
        resetTicketQuantitiesIfNeeded();
        revalidateTicketTierQuantities();
      }
    });

    // Manual input guard
    bundleQuantityInput.on("input", () => {
      clearNoTicketsError();
      const inputEl = bundleQuantityInput.getElement() as HTMLInputElement;
      let val = Number(inputEl.value);
      if (val > maxQty) {
        inputEl.value = String(maxQty);
        showAlert(`Only up to ${maxQty} bundles available.`);
      } else {
        hideAlert();
      }
      resetTicketQuantitiesIfNeeded();
      revalidateTicketTierQuantities();
    });

    // Show the card
    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  // Render all
  list.setData(bundles);
};