export const initializePerformanceFilter = () => {
  const locationSelectElement = document.getElementById("locationFilter");
  const monthSelectElement = document.getElementById("monthFilter");

  if (locationSelectElement) {
    locationSelectElement.addEventListener("change", () => {
      applyFilters();
    });
  }

  if (monthSelectElement) {
    monthSelectElement.addEventListener("change", () => {
      applyFilters();
    });
  }
};

const applyFilters = () => {
  const locationSelectElement = document.getElementById(
    "locationFilter"
  ) as HTMLSelectElement;
  const monthSelectElement = document.getElementById(
    "monthFilter"
  ) as HTMLSelectElement;

  const selectedLocation = locationSelectElement?.value || "N/A";
  const selectedMonth = monthSelectElement?.value || "N/A";

  filterPerformances(selectedLocation, selectedMonth);
};

const filterPerformances = (location: string, month: string) => {
  const performanceCards = document.querySelectorAll(".input_card_wrap");
  let hasVisibleItems = false;

  performanceCards.forEach((performanceCard) => {
    const performanceLocationElement = performanceCard.querySelector(
      "#cardPerformanceLocation"
    ) as HTMLElement;
    const performanceLocation = performanceLocationElement?.textContent || "";

    const performanceMonthElement = performanceCard.querySelector(
      ".production_date_month"
    ) as HTMLElement;
    const performanceMonth = performanceMonthElement?.textContent || "";

    const matchesLocation =
      location === "N/A" || performanceLocation === location;
    const matchesMonth =
      month === "N/A" || performanceMonth.toUpperCase() === month;

    if (matchesLocation && matchesMonth) {
      (performanceCard as HTMLElement).style.display = "flex";
      hasVisibleItems = true;
    } else {
      (performanceCard as HTMLElement).style.display = "none";
    }
  });

  // Handle empty state display
  const emptyStateElement = document.getElementById("filterListEmpty");
  if (emptyStateElement) {
    emptyStateElement.style.display = hasVisibleItems ? "none" : "flex";
  }
};
