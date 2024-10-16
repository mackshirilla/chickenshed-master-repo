import { WFDynamicList, WFComponent } from "@xatom/core";
import { BundleOffered } from "../../../api/ticketTiersAPI";
import {
  saveSelectedBundle,
  removeSelectedBundle,
} from "../state/ticketPurchaseState";
import {
  resetTicketQuantitiesIfNeeded,
  updateTicketTierButtons, // Correct import source
} from "../state/bundleStateUpdater";
import { revalidateTicketTierQuantities } from "./ticketTierRenderer";
import { toggleError } from "../../../utils/formUtils";

let initialBundleTemplate: HTMLElement | null = null; // Store the initial template

export const renderBundles = (
  bundles: BundleOffered[],
  containerSelector: string
) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Bundle list container not found.");
    return;
  }

  // Save the initial template state if not already saved
  if (!initialBundleTemplate) {
    initialBundleTemplate = container.cloneNode(true) as HTMLElement;
  }

  // Clear the container and restore the initial template
  container.innerHTML = "";
  container.appendChild(initialBundleTemplate.cloneNode(true));

  const clearNoTicketsError = () => {
    const noTicketsError = new WFComponent("#noTicketsError");
    toggleError(noTicketsError, "", false);
  };

  const list = new WFDynamicList<BundleOffered>(containerSelector, {
    rowSelector: "#bundleCard",
    loaderSelector: "#bundleListLoading",
    emptySelector: "#bundleListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    (loaderElement.getElement() as HTMLElement).style.display = "flex";
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    (emptyElement.getElement() as HTMLElement).style.display = "flex";
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const bundleCard = new WFComponent(rowElement);
    const bundleName = bundleCard.getChildAsComponent("#bundleName");
    const bundlePrice = bundleCard.getChildAsComponent("#bundlePrice");
    const bundleSoldOut = bundleCard.getChildAsComponent("#bundleSoldOut");
    const bundleDescription =
      bundleCard.getChildAsComponent("#bundleDescription");
    const bundleQuantityInput = bundleCard.getChildAsComponent(
      "#bundleQuantityInput"
    );
    const bundleIncrementButton = bundleCard.getChildAsComponent(
      "#bundleQuantityIncrease"
    );
    const bundleDecrementButton = bundleCard.getChildAsComponent(
      "#bundleQuantityDecrease"
    );
    const bundleMaxAlert = bundleCard.getChildAsComponent(".maximum_alert");
    const numberInputWrapper = bundleCard.getChildAsComponent(
      ".number_input_wrapper"
    );

    if (
      !bundleName ||
      !bundlePrice ||
      !bundleSoldOut ||
      !bundleDescription ||
      !bundleQuantityInput ||
      !bundleIncrementButton ||
      !bundleDecrementButton ||
      !bundleMaxAlert ||
      !numberInputWrapper
    ) {
      console.error("Bundle elements not found.");
      return;
    }

    bundleName.setText(rowData.fieldData["displayed-name"]);
    bundlePrice.setText(`${rowData.price}`);
    bundleDescription.setText(rowData.fieldData["short-description"]);
    bundleQuantityInput.setAttribute("max", String(rowData.quantity));
    bundleQuantityInput.setAttribute("value", "0");

    const updateAlertVisibility = () => {
      const currentQuantity = Number(
        (bundleQuantityInput.getElement() as HTMLInputElement).value
      );
      const maxAlertElement = bundleMaxAlert.getElement() as HTMLElement;
      if (currentQuantity >= rowData.quantity) {
        bundleMaxAlert.setText(
          "You have reached the maximum available quantity."
        );
        maxAlertElement.style.display = "block";
      } else {
        maxAlertElement.style.display = "none";
      }
    };

    bundleIncrementButton.on("click", () => {
      const inputElement = bundleQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);

      if (currentQuantity < rowData.quantity) {
        currentQuantity++;
        inputElement.value = String(currentQuantity);
        saveSelectedBundle(rowData.id, currentQuantity);
        updateTicketTierButtons(); // Enable ticket tier buttons if needed
        clearNoTicketsError(); // Clear no tickets error
      }

      updateAlertVisibility();
      revalidateTicketTierQuantities(); // Revalidate after increment
    });

    bundleDecrementButton.on("click", () => {
      const inputElement = bundleQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);

      if (currentQuantity > 0) {
        currentQuantity--;
        inputElement.value = String(currentQuantity);

        if (currentQuantity > 0) {
          saveSelectedBundle(rowData.id, currentQuantity);
          clearNoTicketsError(); // Clear no tickets error
        } else {
          removeSelectedBundle(rowData.id);
        }

        updateTicketTierButtons(); // Disable ticket tier buttons if needed
      }

      updateAlertVisibility();
      resetTicketQuantitiesIfNeeded(); // Reset ticket quantities if bundles are insufficient
      revalidateTicketTierQuantities(); // Revalidate after decrement
    });

    bundleQuantityInput.on("input", () => {
      const inputElement = bundleQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);
      if (currentQuantity > rowData.quantity) {
        inputElement.value = String(rowData.quantity);
        updateAlertVisibility();
      }
      revalidateTicketTierQuantities(); // Revalidate on manual input
      clearNoTicketsError(); // Clear no tickets error on manual input
    });

    if (rowData.quantity <= 0) {
      (bundleSoldOut.getElement() as HTMLElement).style.display = "block";
      (bundlePrice.getElement() as HTMLElement).style.display = "none";
      numberInputWrapper.addCssClass("is-disabled");
    } else {
      (bundleSoldOut.getElement() as HTMLElement).style.display = "none";
      (bundlePrice.getElement() as HTMLElement).style.display = "block";
      numberInputWrapper.removeCssClass("is-disabled");
    }

    rowElement.setStyle({ display: "flex" });

    return rowElement;
  });

  list.setData(bundles);
};
