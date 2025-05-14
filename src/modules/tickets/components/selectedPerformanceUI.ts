import { WFComponent } from "@xatom/core";
import {
  getSelectedPerformance,
  getSelectedProduction,
} from "../state/ticketPurchaseState";

export const updateSelectedPerformanceUI = () => {
  const selectedPerformance = getSelectedPerformance();
  const selectedProduction = getSelectedProduction();

  if (!selectedPerformance || !selectedPerformance.id) {
    console.error("No performance selected.");
    return;
  }

  // pick up your DOM nodes
  const selectedPerformanceDate = new WFComponent("#selectedPerformanceDate");
  const selectedPerformanceMonth = new WFComponent("#selectedPerformanceMonth");
  const selectedWeekday = new WFComponent("#selectedWeekday");
  const selectedTime = new WFComponent("#selectedTime");
  const selectedPerformanceTitle = new WFComponent("#selectedPerformanceTitle");
  const selectedPerformanceProductionTitle = new WFComponent(
    "#selectedPerformanceProductionTitle"
  );
  const selectedPerformanceDescription = new WFComponent(
    "#selectedPerformanceDescription"
  );
  const selectedImage = new WFComponent("#selectedImage");
  const selectedPerformanceLocation = new WFComponent(
    "#selectedPerformanceLocation"
  );

  // dateTime might be an ISO string or a millisecond‐timestamp string
  const raw = selectedPerformance.dateTime;
  let date: Date;
  if (/^\d+$/.test(raw)) {
    date = new Date(Number(raw));
  } else {
    date = new Date(raw);
  }

  // formatting options for New York
  const optionsCommon = { timeZone: "America/New_York" } as const;

  // render date parts in Eastern Time
  selectedPerformanceDate.setText(
    date.toLocaleString("en-US", { ...optionsCommon, day: "numeric" })
  );
  selectedPerformanceMonth.setText(
    date.toLocaleString("en-US", { ...optionsCommon, month: "short" })
  );
  selectedWeekday.setText(
    date.toLocaleString("en-US", { ...optionsCommon, weekday: "long" })
  );
  selectedTime.setText(
    date.toLocaleTimeString("en-US", {
      ...optionsCommon,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  );

  selectedPerformanceTitle.setText(selectedPerformance.name);
  selectedPerformanceProductionTitle.setText(selectedProduction.name);
  selectedPerformanceDescription.setText(selectedProduction.description);

  if (selectedPerformance.imageUrl) {
    selectedImage.setAttribute("src", selectedPerformance.imageUrl);
    selectedImage.setAttribute("alt", selectedPerformance.name);
  }

  // now display the human-readable venue name saved in state
  if (selectedPerformance.location) {
    selectedPerformanceLocation.setText(selectedPerformance.location);
  } else {
    selectedPerformanceLocation.setText("Location not specified");
  }
};
