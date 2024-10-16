import { WFComponent, WFDynamicList } from "@xatom/core";
import { TicketOffered } from "../../../api/ticketTiersAPI";
import {
  saveSelectedTicket,
  removeSelectedTicket,
  getSelectedBundles,
} from "../state/ticketPurchaseState";
import { toggleError } from "../../../utils/formUtils";

const safeNumber = (value: unknown): number =>
  typeof value === "number" ? value : 0;

const clearNoTicketsError = () => {
  const noTicketsError = new WFComponent("#noTicketsError");
  toggleError(noTicketsError, "", false);
};

let initialTicketTierTemplate: HTMLElement | null = null;

export const revalidateTicketTierQuantities = () => {
  const ticketTierCards = document.querySelectorAll(
    "[data-requires-bundle='true']"
  );
  ticketTierCards.forEach((card) => {
    const ticketTierMaxAlert = new WFComponent(
      card.querySelector(".maximum_alert")
    );
    const ticketTierQuantityInput = new WFComponent(
      card.querySelector("#ticketTierQuantityInput")
    );

    const selectedBundles = getSelectedBundles();
    const totalBundlesSelected = selectedBundles.reduce(
      (sum, bundle) => sum + safeNumber(bundle.quantity),
      0
    );

    if (totalBundlesSelected <= 0) {
      (ticketTierQuantityInput.getElement() as HTMLInputElement).value = "0";
      ticketTierMaxAlert.setText(
        "This item requires a ticket bundle purchase. Please add a ticket bundle from the options above."
      );
      (ticketTierMaxAlert.getElement() as HTMLElement).style.display = "block";
    } else {
      (ticketTierMaxAlert.getElement() as HTMLElement).style.display = "none";
    }
  });
};

export const renderTicketTiers = (
  tickets: TicketOffered[],
  containerSelector: string
) => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Ticket tier list container not found.");
    return;
  }

  if (!initialTicketTierTemplate) {
    initialTicketTierTemplate = container.cloneNode(true) as HTMLElement;
  }

  container.innerHTML = "";
  container.appendChild(initialTicketTierTemplate.cloneNode(true));

  const list = new WFDynamicList<TicketOffered>(containerSelector, {
    rowSelector: "#ticketTierCard",
    loaderSelector: "#ticketTierListLoading",
    emptySelector: "#ticketTierListEmpty",
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
    const ticketTierCard = new WFComponent(rowElement);
    if (rowData.fieldData["requires-bundle-purchase"] === true) {
      rowElement.setAttribute("data-requires-bundle", "true");
    } else {
      rowElement.setAttribute("data-requires-bundle", "false");
    }

    const ticketTierName =
      ticketTierCard.getChildAsComponent("#ticketTierName");
    const ticketTierPrice =
      ticketTierCard.getChildAsComponent("#ticketTierPrice");
    const ticketTierSoldOut =
      ticketTierCard.getChildAsComponent("#ticketTierSoldOut");
    const ticketTierDescription = ticketTierCard.getChildAsComponent(
      "#ticketTierDescription"
    );
    const ticketTierQuantityInput = ticketTierCard.getChildAsComponent(
      "#ticketTierQuantityInput"
    );
    const ticketTierIncrementButton = ticketTierCard.getChildAsComponent(
      "#ticketTierQuantityIncrease"
    );
    const ticketTierDecrementButton = ticketTierCard.getChildAsComponent(
      "#ticketTierQuantityDecrease"
    );
    const ticketTierMaxAlert =
      ticketTierCard.getChildAsComponent(".maximum_alert");
    const numberInputWrapper = ticketTierCard.getChildAsComponent(
      ".number_input_wrapper"
    );

    if (
      !ticketTierName ||
      !ticketTierPrice ||
      !ticketTierSoldOut ||
      !ticketTierDescription ||
      !ticketTierQuantityInput ||
      !ticketTierIncrementButton ||
      !ticketTierDecrementButton ||
      !ticketTierMaxAlert ||
      !numberInputWrapper
    ) {
      console.error("Ticket tier elements not found.");
      return;
    }

    const displayedName =
      rowData.fieldData["displayed-name"] || "Unknown Ticket Tier";
    const price = rowData.price ? `${rowData.price.toString()}` : "N/A";
    const description = rowData.fieldData["short-description"] || "";

    ticketTierName.setText(displayedName);
    ticketTierPrice.setText(price);
    ticketTierDescription.setText(description);
    ticketTierQuantityInput.setAttribute("max", String(rowData.quantity || 0));
    ticketTierQuantityInput.setAttribute("value", "0");

    const updateAlertVisibility = (message: string) => {
      ticketTierMaxAlert.setText(message);
      (ticketTierMaxAlert.getElement() as HTMLElement).style.display = "block";
    };

    ticketTierIncrementButton.on("click", () => {
      const inputElement =
        ticketTierQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);

      (ticketTierMaxAlert.getElement() as HTMLElement).style.display = "none";

      if (rowData.fieldData["requires-bundle-purchase"]) {
        const selectedBundles = getSelectedBundles();
        const totalBundlesSelected = selectedBundles.reduce(
          (sum, bundle) => sum + safeNumber(bundle.quantity),
          0
        );

        if (totalBundlesSelected <= 0) {
          updateAlertVisibility(
            "This item requires a ticket bundle purchase. Please add a ticket bundle from the options above."
          );
          return;
        }
      }

      if (currentQuantity < rowData.quantity) {
        currentQuantity++;
        inputElement.value = String(currentQuantity);
        saveSelectedTicket(
          rowData.id,
          currentQuantity,
          rowData.fieldData["requires-bundle-purchase"]
        );
        revalidateTicketTierQuantities();
        clearNoTicketsError();
      } else {
        updateAlertVisibility(
          "You have reached the maximum available quantity."
        );
      }
    });

    ticketTierDecrementButton.on("click", () => {
      const inputElement =
        ticketTierQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);

      if (currentQuantity > 0) {
        currentQuantity--;
        inputElement.value = String(currentQuantity);

        if (currentQuantity > 0) {
          saveSelectedTicket(
            rowData.id,
            currentQuantity,
            rowData.fieldData["requires-bundle-purchase"]
          );
          clearNoTicketsError();
        } else {
          removeSelectedTicket(rowData.id);
        }

        revalidateTicketTierQuantities();
      }
    });

    ticketTierQuantityInput.on("input", () => {
      const inputElement =
        ticketTierQuantityInput.getElement() as HTMLInputElement;
      let currentQuantity = Number(inputElement.value);
      if (currentQuantity > rowData.quantity) {
        inputElement.value = String(rowData.quantity);
        updateAlertVisibility(
          "You have reached the maximum available quantity."
        );
      } else if (
        rowData.fieldData["requires-bundle-purchase"] &&
        currentQuantity > 0
      ) {
        const selectedBundles = getSelectedBundles();
        const totalBundlesSelected = selectedBundles.reduce(
          (sum, bundle) => sum + safeNumber(bundle.quantity),
          0
        );

        if (totalBundlesSelected <= 0) {
          inputElement.value = "0";
          updateAlertVisibility(
            "This item requires a ticket bundle purchase. Please add a ticket bundle from the options above."
          );
        } else {
          (ticketTierMaxAlert.getElement() as HTMLElement).style.display =
            "none";
        }
      } else {
        (ticketTierMaxAlert.getElement() as HTMLElement).style.display = "none";
      }
      clearNoTicketsError();
    });

    if (rowData.quantity <= 0) {
      (ticketTierSoldOut.getElement() as HTMLElement).style.display = "block";
      (ticketTierPrice.getElement() as HTMLElement).style.display = "none";
      numberInputWrapper.addCssClass("is-disabled");
    } else {
      (ticketTierSoldOut.getElement() as HTMLElement).style.display = "none";
      (ticketTierPrice.getElement() as HTMLElement).style.display = "block";
      numberInputWrapper.removeCssClass("is-disabled");
    }

    rowElement.setStyle({ display: "flex" });

    return rowElement;
  });

  list.setData(tickets);
};
