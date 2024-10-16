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

  const date = new Date(selectedPerformance.dateTime);

  selectedPerformanceDate.setText(date.getDate().toString());
  selectedPerformanceMonth.setText(
    date.toLocaleString("en-US", { month: "short" })
  );
  selectedWeekday.setText(date.toLocaleString("en-US", { weekday: "long" }));
  selectedTime.setText(
    date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  );

  selectedPerformanceTitle.setText(selectedPerformance.name);
  selectedPerformanceProductionTitle.setText(selectedProduction.name);
  selectedPerformanceDescription.setText(selectedProduction.description);

  if (selectedPerformance.imageUrl) {
    selectedImage.setAttribute("src", selectedPerformance.imageUrl);
    selectedImage.setAttribute("alt", selectedPerformance.name);
  }

  // Update the location UI element with the selected performance location
  if (selectedPerformance.location) {
    selectedPerformanceLocation.setText(selectedPerformance.location);
  } else {
    selectedPerformanceLocation.setText("Location not specified");
  }
};
