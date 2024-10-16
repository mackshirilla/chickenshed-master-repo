import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchPerformances, Performance } from "../../api/performances";
import {
  saveSelectedPerformance,
  getSelectedProduction,
} from "./state/ticketPurchaseState";
import { initializePerformanceFilter } from "./components/performanceFilter"; // Import the filtering initialization

let selectedPerformanceId: string | null = null;
let initialTemplateState: HTMLElement | null = null;

export const initializePerformanceList = async (
  containerSelector: string
): Promise<Performance[]> => {
  // Update return type to Promise<Performance[]>
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

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const performanceCard = new WFComponent(rowElement);
    const performanceDateWrapper = performanceCard.getChildAsComponent(
      ".production_date_wrapper"
    );
    const performanceDay =
      performanceDateWrapper?.getChildAsComponent(".u-text-h4");
    const performanceMonth = performanceDateWrapper?.getChildAsComponent(
      ".production_date_month"
    );
    const performanceTime = performanceDateWrapper?.getChildAsComponent(
      ".input_card_description"
    );

    const performanceWeekday = performanceCard.getChildAsComponent(
      "#cardProductionTitle" // Assuming this is the correct selector for the weekday element
    );

    const performanceTitle = performanceCard.getChildAsComponent(
      "#cardPerformanceTitle"
    );
    const performanceProductionTitle = performanceCard.getChildAsComponent(
      "#cardPerformanceProductionTitle"
    );
    const performanceDescription = performanceCard.getChildAsComponent(
      "#cardPerformanceDescription"
    );
    const performanceImage = performanceCard.getChildAsComponent("#cardImage");
    const performanceInput =
      performanceCard.getChildAsComponent(".input_card_input");
    const performanceLabel = performanceCard.getChildAsComponent("label");
    const performanceLocation = performanceCard.getChildAsComponent(
      "#cardPerformanceLocation" // Assuming this is the correct selector for location
    );

    if (
      !performanceDay ||
      !performanceMonth ||
      !performanceTime ||
      !performanceWeekday ||
      !performanceTitle ||
      !performanceProductionTitle ||
      !performanceDescription ||
      !performanceInput ||
      !performanceImage ||
      !performanceLabel ||
      !performanceLocation
    ) {
      console.error("Performance elements not found.");
      return;
    }

    if (rowData && rowData.fieldData) {
      const inputId = `performanceInput-${index}`;
      performanceInput.setAttribute("id", inputId);
      performanceInput.setAttribute("value", rowData.id);
      performanceLabel.setAttribute("for", inputId);

      const date = new Date(rowData.fieldData["date-time"]);

      performanceDay.setText(
        date.toLocaleString("en-US", {
          day: "numeric",
          timeZone: "America/New_York",
        })
      );
      performanceMonth.setText(
        date.toLocaleString("en-US", {
          month: "short",
          timeZone: "America/New_York",
        })
      );
      performanceTime.setText(
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/New_York",
        })
      );

      performanceWeekday.setText(
        date.toLocaleString("en-US", {
          weekday: "long",
          timeZone: "America/New_York",
        })
      );

      performanceTitle.setText(rowData.fieldData["displayed-name"]);

      // Get the selected production name from the state and set it in the card
      const selectedProduction = getSelectedProduction();
      performanceProductionTitle.setText(
        selectedProduction?.name || "Unknown Production"
      );

      performanceDescription.setText(rowData.fieldData["short-description"]);

      if (rowData.fieldData["main-image"]?.url) {
        performanceImage.setAttribute(
          "src",
          rowData.fieldData["main-image"].url
        );
        performanceImage.setAttribute(
          "alt",
          rowData.fieldData["main-image"].alt || "Performance Image"
        );
      } else {
        console.warn(
          `Performance ID ${rowData.id} does not have a main image.`
        );
      }

      performanceLocation.setText(rowData.location_name || "Unknown");

      performanceInput.on("change", () => {
        selectedPerformanceId = (
          performanceInput.getElement() as HTMLInputElement
        ).value;
        saveSelectedPerformance({
          id: rowData.id,
          name: rowData.fieldData["displayed-name"],
          dateTime: rowData.fieldData["date-time"],
          description: rowData.fieldData["short-description"], // Include description here
          imageUrl: rowData.fieldData["main-image"].url,
          location: rowData.location_name, // Include location here
        });
        console.log("Selected Performance ID:", selectedPerformanceId);
      });

      rowElement.setStyle({ display: "flex" });
    } else {
      console.error("Incomplete performance data:", rowData);
    }

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);

    // Get the selected production ID from the state
    const selectedProduction = getSelectedProduction();
    const selectedProductionId = selectedProduction?.id;

    if (!selectedProductionId) {
      console.error("No production selected, cannot fetch performances.");
      list.changeLoadingStatus(false);
      return [];
    }

    // Fetch performances based on the selected production ID
    let performances = await fetchPerformances(selectedProductionId);

    // Sort performances by date
    performances = performances.sort((a, b) => {
      const dateA = new Date(a.fieldData["date-time"]);
      const dateB = new Date(b.fieldData["date-time"]);
      return dateA.getTime() - dateB.getTime();
    });

    console.log("Fetched and sorted performances:", performances);

    if (performances && performances.length > 0) {
      list.setData(performances);

      // Initialize the performance filter after data is set
      initializePerformanceFilter();
    } else {
      list.setData([]); // Trigger the empty state
    }

    list.changeLoadingStatus(false);
    return performances; // Return the list of performances
  } catch (error) {
    console.error("Error loading performances:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
    return []; // Return an empty array in case of error
  }
};
