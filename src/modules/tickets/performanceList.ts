// src/modules/tickets/performanceList.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchPerformances, Performance } from "../../api/performances";
import {
  saveSelectedPerformance,
  getSelectedProduction,
} from "./state/ticketPurchaseState";
import { initializePerformanceFilter } from "./components/performanceFilter";

let initialTemplateState: HTMLElement | null = null;

type SafePerformanceRow = {
  id: number | string | null;
  Name?: string | null;
  Displayed_Name?: string | null;
  Short_Description?: string | null;
  Main_Image?: string | null;
  Date_Time?: number | string | null;
  Sold_Out?: boolean | null;
  location_details?: { Name?: string | null } | null;
};

export const initializePerformanceList = async (
  containerSelector: string
): Promise<Performance[]> => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Performance list container not found.");
    return [];
  }

  // Cache pristine template state
  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  // Reset container to clean template
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
    // -------------------------------------------------
    // 1) Normalize API data (no .toString() on nullable)
    // -------------------------------------------------
    const perf = rowData as unknown as SafePerformanceRow;

    const safeName = perf.Name ?? "";
    const safeDisplayed = perf.Displayed_Name ?? "";
    const safeTitle = safeDisplayed || safeName || "";
    const safeDesc = perf.Short_Description ?? "";
    const safeImg = perf.Main_Image ?? "";
    const safeVenue = perf.location_details?.Name ?? "";
    const soldOut = Boolean(perf.Sold_Out);

    const idNum = Number(perf.id);
    const hasValidId = Number.isFinite(idNum) && idNum > 0;

    // -------------------------------------------------
    // 2) Grab DOM components
    // -------------------------------------------------
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

    // -------------------------------------------------
    // 3) Required structure only
    // -------------------------------------------------
    if (!inputEl || !labelEl || !titleEl) {
      console.error("Required performance elements not found.");
      return;
    }

    // If id is invalid/null, hide the row (prevents crashes)
    if (!hasValidId) {
      console.warn("[PerformanceList] Skipping row with invalid id:", perf);
      rowElement.setStyle({ display: "none" });
      return;
    }

    // -------------------------------------------------
    // 4) Wire up the radio button (safe)
    // -------------------------------------------------
    const inputId = `performanceInput-${index}`;
    inputEl.setAttribute("id", inputId);
    inputEl.setAttribute("value", String(idNum));
    labelEl.setAttribute("for", inputId);

    // -------------------------------------------------
    // 5) Sold-out handling (safe ordering)
    // -------------------------------------------------
    if (soldOut) {
      soldOutEl?.setStyle({ display: "flex" });

      rowElement.setStyle({
        pointerEvents: "none",
        opacity: "0.6",
      });

      inputEl.setAttribute("disabled", "true");
    } else {
      soldOutEl?.setStyle({ display: "none" });

      // Attempt to ensure enabled when not sold out
      // WFComponent doesn't expose removeAttribute, so do it safely via DOM:
      try {
        (inputEl.getElement() as HTMLInputElement).disabled = false;
        (inputEl.getElement() as HTMLInputElement).removeAttribute("disabled");
      } catch {
        // no-op
      }
    }

    // -------------------------------------------------
    // 6) Timezone-aware formatting in New York (guarded)
    // -------------------------------------------------
    const ts = Number(perf.Date_Time);
    const date = Number.isFinite(ts) ? new Date(ts) : null;

    dayEl?.setText(
      date
        ? date.toLocaleString("en-US", {
            day: "numeric",
            timeZone: "America/New_York",
          })
        : ""
    );

    monthEl?.setText(
      date
        ? date.toLocaleString("en-US", {
            month: "short",
            timeZone: "America/New_York",
          })
        : ""
    );

    weekdayEl?.setText(
      date
        ? date.toLocaleString("en-US", {
            weekday: "long",
            timeZone: "America/New_York",
          })
        : ""
    );

    timeEl?.setText(
      date
        ? date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
            timeZone: "America/New_York",
          })
        : ""
    );

    // -------------------------------------------------
    // 7) Fill in the rest (safe defaults)
    // -------------------------------------------------
    titleEl.setText(safeTitle);

    const selectedProd = getSelectedProduction();
    prodTitleEl?.setText(selectedProd?.name || "Unknown Production");

    descEl?.setText(safeDesc);

    if (imageEl) {
      if (safeImg) {
        imageEl.setAttribute("src", safeImg);
        imageEl.setAttribute("alt", safeTitle || "Performance Image");
        imageEl.setStyle({ display: "" });
      } else {
        imageEl.setAttribute("src", "");
        imageEl.setStyle({ display: "none" });
      }
    }

    locEl?.setText(safeVenue || "Unknown venue");

    // -------------------------------------------------
    // 8) Selection handler (safe strings)
    // -------------------------------------------------
    inputEl.on("change", () => {
      saveSelectedPerformance({
        id: String(idNum),
        name: safeTitle,
        dateTime: String(perf.Date_Time ?? ""),
        description: safeDesc,
        imageUrl: safeImg,
        location: safeVenue || "",
      });
    });

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  // -------------------------------------------------
  // 9) Data load
  // -------------------------------------------------
  try {
    list.changeLoadingStatus(true);

    const prod = getSelectedProduction();
    if (!prod?.id) throw new Error("No production selected");

    const performances = await fetchPerformances(prod.id.toString());

    // Guard sort if Date_Time isn't strictly numeric
    performances.sort((a: any, b: any) => {
      const aTs = Number(a?.Date_Time);
      const bTs = Number(b?.Date_Time);
      if (!Number.isFinite(aTs) && !Number.isFinite(bTs)) return 0;
      if (!Number.isFinite(aTs)) return 1;
      if (!Number.isFinite(bTs)) return -1;
      return aTs - bTs;
    });

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
