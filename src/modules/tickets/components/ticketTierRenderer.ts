import { WFComponent, WFDynamicList } from "@xatom/core";
import {
  TicketOfferedFlat,
  TicketTierAvailability,
} from "../../../api/ticketTiersAPI";
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
  const cards = document.querySelectorAll(
    "[data-requires-bundle='true']"
  );
  cards.forEach((card) => {
    const maxAlert = new WFComponent(card.querySelector(".maximum_alert"));
    const qtyInput = new WFComponent(
      card.querySelector("#ticketTierQuantityInput")
    );
    const selectedBundles = getSelectedBundles();
    const totalBundles = selectedBundles.reduce(
      (sum, b) => sum + safeNumber(b.quantity),
      0
    );
    if (totalBundles <= 0) {
      (qtyInput.getElement() as HTMLInputElement).value = "0";
      maxAlert.setText(
        "This item requires a ticket bundle purchase. Please add a ticket bundle from the options above."
      );
      (maxAlert.getElement() as HTMLElement).style.display = "block";
    } else {
      (maxAlert.getElement() as HTMLElement).style.display = "none";
    }
  });
};

export const renderTicketTiers = (
  tickets: TicketOfferedFlat[],
  availabilities: TicketTierAvailability[],
  containerSelector: string
) => {
  // Build availability lookup
  const availabilityMap = new Map<number, number>();
  availabilities.forEach((rec) => {
    availabilityMap.set(rec.Ticket_Tier, rec.Quantity_Available);
  });

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

  const list = new WFDynamicList<TicketOfferedFlat>(containerSelector, {
    rowSelector: "#ticketTierCard",
    loaderSelector: "#ticketTierListLoading",
    emptySelector: "#ticketTierListEmpty",
  });

  list.loaderRenderer((loader) => {
    (loader.getElement() as HTMLElement).style.display = "flex";
    return loader;
  });
  list.emptyRenderer((empty) => {
    (empty.getElement() as HTMLElement).style.display = "flex";
    return empty;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);
    const requiresBundle = rowData.Requires_Bundle_Purchase;
    rowElement.setAttribute(
      "data-requires-bundle",
      requiresBundle ? "true" : "false"
    );

    const nameEl = card.getChildAsComponent("#ticketTierName");
    const priceEl = card.getChildAsComponent("#ticketTierPrice");
    const soldOutEl = card.getChildAsComponent("#ticketTierSoldOut");
    const descEl = card.getChildAsComponent("#ticketTierDescription");
    const qtyInput = card.getChildAsComponent("#ticketTierQuantityInput");
    const incBtn = card.getChildAsComponent("#ticketTierQuantityIncrease");
    const decBtn = card.getChildAsComponent("#ticketTierQuantityDecrease");
    const maxAlert = card.getChildAsComponent(".maximum_alert");
    const wrapper = card.getChildAsComponent(".number_input_wrapper");

    if (
      !nameEl ||
      !priceEl ||
      !soldOutEl ||
      !descEl ||
      !qtyInput ||
      !incBtn ||
      !decBtn ||
      !maxAlert ||
      !wrapper
    ) {
      console.error("Ticket tier elements not found.");
      return;
    }

    // Availability for this tier
    const available = availabilityMap.get(rowData.id) ?? 0;

    // Populate UI
    nameEl.setText(rowData.Displayed_Name);
    // show the formatted price from product_details
    priceEl.setText(rowData.product_details.Displayed_single_sale_price);
    descEl.setText(rowData.Short_Description);

    // enforce stock limit in the quantity input
    qtyInput.setAttribute("max", String(available));
    qtyInput.setAttribute("value", "0");

    if (available <= 0) {
      soldOutEl.setText("Sold out");
      (soldOutEl.getElement() as HTMLElement).style.display = "block";
      wrapper.addCssClass("is-disabled");
    } else {
      (soldOutEl.getElement() as HTMLElement).style.display = "none";
      wrapper.removeCssClass("is-disabled");
    }

    const updateAlertVisibility = (message: string) => {
      maxAlert.setText(message);
      (maxAlert.getElement() as HTMLElement).style.display = "block";
    };

    // Increment handler
    incBtn.on("click", () => {
      const inputEl = qtyInput.getElement() as HTMLInputElement;
      let current = Number(inputEl.value);

      // bundle-required guard
      if (requiresBundle) {
        const totalBundles = getSelectedBundles().reduce(
          (sum, b) => sum + safeNumber(b.quantity),
          0
        );
        if (totalBundles <= 0) {
          updateAlertVisibility(
            "This item requires a ticket bundle purchase. Please add a ticket bundle from the options above."
          );
          return;
        }
      }

      if (current < available) {
        current++;
        inputEl.value = String(current);
        saveSelectedTicket(rowData.id.toString(), current, requiresBundle);
        clearNoTicketsError();
        revalidateTicketTierQuantities();
      } else {
        updateAlertVisibility(
          "You have reached the maximum available quantity."
        );
      }
    });

    // Decrement handler
    decBtn.on("click", () => {
      const inputEl = qtyInput.getElement() as HTMLInputElement;
      let current = Number(inputEl.value);
      if (current > 0) {
        current--;
        inputEl.value = String(current);
        if (current > 0) {
          saveSelectedTicket(rowData.id.toString(), current, requiresBundle);
        } else {
          removeSelectedTicket(rowData.id.toString());
        }
        clearNoTicketsError();
        revalidateTicketTierQuantities();
      }
    });

    // Manual input handler
    qtyInput.on("input", () => {
      clearNoTicketsError();
      const inputEl = qtyInput.getElement() as HTMLInputElement;
      let val = Number(inputEl.value);
      if (val > available) {
        inputEl.value = String(available);
        updateAlertVisibility(
          "You have reached the maximum available quantity."
        );
      }
      revalidateTicketTierQuantities();
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  list.setData(tickets);
};
