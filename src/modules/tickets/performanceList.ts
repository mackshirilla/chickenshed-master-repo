// src/modules/tickets/performanceList.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchPerformances, Performance } from "../../api/performances";
import {
  saveSelectedPerformance,
  getSelectedProduction,
} from "./state/ticketPurchaseState";
import { initializePerformanceFilter } from "./components/performanceFilter";

let initialTemplateState: HTMLElement | null = null;

export const initializePerformanceList = async (
  containerSelector: string
): Promise<Performance[]> => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Performance list container not found.");
    return [];
  }

  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  container.innerHTML = "";
  container.appendChild(initialTemplateState.cloneNode(true));

  const list = new WFDynamicList<Performance>(containerSelector, {
    rowSelector: "#cardSelectPerformance",
    loaderSelector: "#performanceListLoading",
    emptySelector: "#performanceListEmpty",
  });

  list.loaderRenderer((loader) => {
    loader.setStyle({ display: "flex" });
    return loader;
  });
  list.emptyRenderer((empty) => {
    empty.setStyle({ display: "flex" });
    return empty;
  });

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const perf = rowData as Performance;
    const card = new WFComponent(rowElement);

    const dateWrapper = card.getChildAsComponent(".production_date_wrapper");
    const dayEl = dateWrapper?.getChildAsComponent(".u-text-h4");
    const monthEl = dateWrapper?.getChildAsComponent(".production_date_month");
    const timeEl = dateWrapper?.getChildAsComponent(".input_card_description");
    const weekdayEl = card.getChildAsComponent("#cardPerformanceWeekday");

    const titleEl = card.getChildAsComponent("#cardPerformanceTitle");
    const prodTitleEl = card.getChildAsComponent(
      "#cardPerformanceProductionTitle"
    );
    const descEl = card.getChildAsComponent("#cardPerformanceDescription");
    const imageEl = card.getChildAsComponent("#cardImage");
    const inputEl = card.getChildAsComponent(".input_card_input");
    const labelEl = card.getChildAsComponent("label");
    const locEl = card.getChildAsComponent("#cardPerformanceLocation");
    const soldOutEl = card.getChildAsComponent("#performanceSoldOut");

if (perf.Sold_Out) {
  // Show the sold-out banner/label
  soldOutEl?.setStyle({ display: "flex" });

  // Disable interaction on the row
  rowElement.setStyle({
    pointerEvents: "none",
    opacity: "0.6", // optional: to give visual feedback
  });

  // Optionally, also disable the radio input
  inputEl.setAttribute("disabled", "true");
} else {
  // Ensure it's hidden if not sold out
  soldOutEl?.setStyle({ display: "none" });
}


    if (
      !dayEl ||
      !monthEl ||
      !timeEl ||
      !weekdayEl ||
      !titleEl ||
      !prodTitleEl ||
      !descEl ||
      !imageEl ||
      !inputEl ||
      !labelEl ||
      !locEl ||
      !soldOutEl 
    ) {
      console.error("Performance elements not found.");
      return;
    }

    // Wire up the radio button
    const inputId = `performanceInput-${index}`;
    inputEl.setAttribute("id", inputId);
    inputEl.setAttribute("value", perf.id.toString());
    labelEl.setAttribute("for", inputId);

    // --- timezone‐aware formatting in New York ---
    const ts = Number(perf.Date_Time);
    const date = new Date(ts);

    // Day of month
    dayEl.setText(
      date.toLocaleString("en-US", {
        day: "numeric",
        timeZone: "America/New_York",
      })
    );
    // Month abbreviation
    monthEl.setText(
      date.toLocaleString("en-US", {
        month: "short",
        timeZone: "America/New_York",
      })
    );
    // Weekday name
    weekdayEl.setText(
      date.toLocaleString("en-US", {
        weekday: "long",
        timeZone: "America/New_York",
      })
    );
    // Time (H:MM AM/PM)
    timeEl.setText(
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "America/New_York",
      })
    );
    // --- end timezone‐aware block ---

    // Fill in the rest
    titleEl.setText(perf.Displayed_Name || perf.Name);
    const selectedProd = getSelectedProduction();
    prodTitleEl.setText(selectedProd?.name || "Unknown Production");
    descEl.setText(perf.Short_Description);

    if (perf.Main_Image) {
      imageEl.setAttribute("src", perf.Main_Image);
      imageEl.setAttribute("alt", perf.Displayed_Name || perf.Name);
    }

    // Show human-readable venue name
    locEl.setText(perf.location_details?.Name || "Unknown venue");

    inputEl.on("change", () => {
      saveSelectedPerformance({
        id: perf.id.toString(),
        name: perf.Displayed_Name,
        dateTime: perf.Date_Time.toString(),
        description: perf.Short_Description,
        imageUrl: perf.Main_Image,
        location: perf.location_details?.Name || "",
      });
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const prod = getSelectedProduction();
    if (!prod?.id) throw new Error("No production selected");

    const performances = await fetchPerformances(prod.id.toString());
    performances.sort((a, b) => a.Date_Time - b.Date_Time);

    list.setData(performances);
    if (performances.length) initializePerformanceFilter();
    list.changeLoadingStatus(false);
    return performances;
  } catch (err) {
    console.error("Error loading performances:", err);
    list.setData([]);
    list.changeLoadingStatus(false);
    return [];
  }
};
