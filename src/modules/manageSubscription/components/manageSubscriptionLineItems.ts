// src/manageSubscription/components/manageSubscriptionLineItems.ts

import { WFComponent } from "@xatom/core";
import { ManageSubscriptionResponse, RegistrationItem } from "../types";

export interface LineItemsConfig {
  listSelector: string;         // e.g., "#subscription_line_items_list"
  wrapSelector: string;         // e.g., "#subscription_line_items_wrap"
  emptySelector: string;        // e.g., "#subscription_line_items_empty"
  templateSelector: string;     // e.g., "#subscription_line_item"
}

interface LineItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

/**
 * Renders subscription line items for the management page.
 * Groups and sums quantities, then displays items or shows empty state.
 */
export function initManageLineItems(
  apiData: ManageSubscriptionResponse,
  registrationItems: RegistrationItem[],
  subscriptionType: string,
  config: LineItemsConfig
): void {
  // Determine suffix and price field
  const suffix = subscriptionType === "year"
    ? "/year"
    : subscriptionType === "month"
      ? "/month"
      : "/semester";

  // Build raw items
  const rawItems: LineItem[] = registrationItems.map(item => {
    const session = item.session_details;
    const tuition = session.tuition_product as any;
    const priceStr = subscriptionType === "year"
      ? tuition.Displayed_annual_price
      : subscriptionType === "month"
        ? tuition.Displayed_monthly_price
        : tuition.Displayed_semester_price;
    // parse "$600 Per Semester" → 600
    const unit = parseFloat((priceStr || "").replace(/[^0-9\.]/g, "")) || 0;
    return {
      productName: session.Name,
      unitPrice: unit,
      quantity: 1,
      total: unit
    };
  });

  // Group by productName
  const groupedMap = new Map<string, LineItem>();
  rawItems.forEach(item => {
    const key = item.productName;
    if (groupedMap.has(key)) {
      const existing = groupedMap.get(key)!;
      existing.quantity += item.quantity;
      existing.total += item.total;
    } else {
      groupedMap.set(key, { ...item });
    }
  });
  const finalItems = Array.from(groupedMap.values());

  // Grab DOM elements
  const wrapComp = new WFComponent(config.wrapSelector);
  const wrapEl = wrapComp.getElement();
  const emptyEl = document.querySelector(config.emptySelector) as HTMLElement;
  const template = document.querySelector(config.templateSelector) as HTMLElement;
  const listComp = new WFComponent(config.listSelector);
  const listEl = listComp.getElement();

  if (!template) {
    console.error("Line-item template not found:", config.templateSelector);
    return;
  }

  // Clear previous items
  Array.from(listEl.children).forEach(child => {
    if ((child as HTMLElement).id !== template.id) {
      listEl.removeChild(child);
    }
  });

  // Handle empty state
  if (finalItems.length === 0) {
    wrapEl.style.display = "none";
    if (emptyEl) emptyEl.style.display = "flex";
    return;
  }
  wrapEl.style.display = "flex";
  if (emptyEl) emptyEl.style.display = "none";

  // Render each line item
  finalItems.forEach(item => {
    const row = template.cloneNode(true) as HTMLElement;
    row.removeAttribute("id");
    row.style.display = "flex";
    // fill fields
    const prod = row.querySelector("#subscription_item_product");
    if (prod) prod.textContent = item.productName;
    const unitEl = row.querySelector("#subscription_item_unit_amount");
    if (unitEl) unitEl.textContent = `$${item.unitPrice.toFixed(2)}`;
    const qtyEl = row.querySelector("#subscription_item_quantity");
    if (qtyEl) qtyEl.textContent = String(item.quantity);
    const totalEl = row.querySelector("#subscription_item_total");
    if (totalEl) totalEl.textContent = `$${item.total.toFixed(2)} ${suffix}`;

    listEl.appendChild(row);
  });
}
