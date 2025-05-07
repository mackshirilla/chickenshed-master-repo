// src/manageSubscription/components/manageDepositLineItems.ts

import { WFComponent } from "@xatom/core";
import { RegistrationItem, ManageSubscriptionResponse } from "../types";

export interface DepositItemsConfig {
  containerSelector: string;      // e.g., "#deposit_line_items_container"
  listSelector: string;           // e.g., "#deposit_line_items_list"
  templateRowSelector: string;    // e.g., "#deposit_item_template"
  totalSelector: string;          // e.g., "#deposit_total"
}

interface DepositLine {
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

/**
 * Renders the deposit line items and total for items already paid.
 * Only shows if status === "Deposit Paid"; otherwise hides them entirely.
 */
export function initManageDepositItems(
  subscription: ManageSubscriptionResponse,
  registrationItems: RegistrationItem[],
  config: DepositItemsConfig
): void {
  const containerComp = new WFComponent(config.containerSelector);
  const containerEl = containerComp.getElement();
  const listEl = document.querySelector(config.listSelector) as HTMLElement;
  const templateRow = document.querySelector(
    config.templateRowSelector
  ) as HTMLElement;
  const totalComp = new WFComponent(config.totalSelector);

  // only show deposit items for Deposit Paid subscriptions
  if (subscription.status !== "Deposit Paid") {
    if (containerEl) containerEl.style.display = "none";
    return;
  }

  if (!containerEl || !listEl || !templateRow) {
    console.error("Deposit items: missing selectors");
    return;
  }

  // Gather deposit lines
  const raw: DepositLine[] = [];
  registrationItems.forEach(item => {
    const dp = item.session_details.deposit_product as any;
    const priceAmt = dp?.Single_sale_price_amount || 0;
    if (priceAmt > 0) {
      raw.push({
        productName: dp.Product_name || item.session_details.Name,
        unitPrice: priceAmt,
        quantity: 1,
        total: priceAmt,
      });
    }
  });

  // Group by productName
  const grouped = new Map<string, DepositLine>();
  raw.forEach(line => {
    if (grouped.has(line.productName)) {
      const existing = grouped.get(line.productName)!;
      existing.quantity += line.quantity;
      existing.total += line.total;
    } else {
      grouped.set(line.productName, { ...line });
    }
  });
  const depositLines = Array.from(grouped.values());

  // Clear old rows except template
  Array.from(listEl.children).forEach(child => {
    if (child === templateRow) return;
    listEl.removeChild(child);
  });

  // No deposits? hide
  const depositTotal = depositLines.reduce((sum, l) => sum + l.total, 0);
  if (depositTotal <= 0) {
    containerEl.style.display = "none";
    return;
  }
  containerEl.style.display = "flex";

  // Ensure template hidden
  templateRow.style.display = "none";

  // Render each deposit line
  depositLines.forEach(line => {
    const row = templateRow.cloneNode(true) as HTMLElement;
    row.removeAttribute("id");
    row.style.display = "flex";
    const prod = row.querySelector("#deposit_item_product");
    if (prod) prod.textContent = line.productName;
    const unitEl = row.querySelector("#deposit_item_unit_amount");
    if (unitEl) unitEl.textContent = `$${line.unitPrice.toFixed(2)}`;
    const qtyEl = row.querySelector("#deposit_item_quantity");
    if (qtyEl) qtyEl.textContent = String(line.quantity);
    const totalEl = row.querySelector("#deposit_item_total");
    if (totalEl) totalEl.textContent = `$${line.total.toFixed(2)}`;
    listEl.appendChild(row);
  });

  // Set total
  totalComp.setText(`$${depositTotal.toFixed(2)}`);
}
