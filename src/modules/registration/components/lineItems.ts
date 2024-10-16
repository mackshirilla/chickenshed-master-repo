import { WFComponent } from "@xatom/core";
import { LineItem } from "../checkoutPreview";

export const renderLineItems = (lineItems: LineItem[]) => {
  const lineItemList = new WFComponent("#lineItemList");
  lineItemList.removeAllChildren(); // Clear previous line items

  lineItems.forEach((item) => {
    const lineItemRow = document.createElement("tr");
    lineItemRow.className = "table_row";

    const productNameCell = document.createElement("td");
    productNameCell.className = "table_cell";
    productNameCell.textContent = item.product_name;
    lineItemRow.appendChild(productNameCell);

    const unitAmountCell = document.createElement("td");
    unitAmountCell.className = "table_cell";
    unitAmountCell.textContent = `$${item.unit_amount}`;
    lineItemRow.appendChild(unitAmountCell);

    const quantityCell = document.createElement("td");
    quantityCell.className = "table_cell";
    quantityCell.textContent = `${item.quantity}`;
    lineItemRow.appendChild(quantityCell);

    const totalAmountCell = document.createElement("td");
    totalAmountCell.className = "table_cell";
    totalAmountCell.textContent = `$${item.total_amount}`;
    lineItemRow.appendChild(totalAmountCell);

    lineItemList.getElement().appendChild(lineItemRow);
  });
};

export const getLineItemsForSelectedOption = (
  selectedPricingOption: string,
  lineItemsData: Record<string, LineItem[]>
): LineItem[] => {
  switch (selectedPricingOption) {
    case "Annual":
      return lineItemsData.annual_line_items;
    case "Monthly":
      return lineItemsData.monthly_line_items;
    case "Pay-Per-Semester":
      return lineItemsData.semester_line_items;
    case "Deposit":
      return lineItemsData.deposit_line_items;
    default:
      console.warn("Unknown pricing option:", selectedPricingOption);
      return [];
  }
};
