import { WFComponent } from "@xatom/core";
import { StartRegistrationResponse, Session } from "../../../api/startRegistration";

interface DepositLineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

function getSessionById(sessions: Session[], sessionId: string): Session | undefined {
  return sessions.find(s => s.id.toString() === sessionId);
}

function groupDepositLineItems(items: DepositLineItem[]): DepositLineItem[] {
  const grouped = new Map<string, DepositLineItem>();
  items.forEach(item => {
    const key = item.productName;
    if (grouped.has(key)) {
      const existing = grouped.get(key)!;
      existing.quantity += item.quantity;
      existing.total += item.total;
      grouped.set(key, existing);
    } else {
      grouped.set(key, { ...item });
    }
  });
  return Array.from(grouped.values());
}

export function updateDepositLineItems(apiData: StartRegistrationResponse, subscriptionType: string | undefined): number {
  // Find all confirmed subscription registration rows.
  const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
  const depositItems: DepositLineItem[] = [];
  subscriptionRows.forEach(row => {
    const sessionId = row.getAttribute("data-session-id");
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session || !session.deposit_product) return;
    // Use the single sale deposit price.
    const priceStr = session.deposit_product.Displayed_single_sale_price;
    const unitPrice = parseFloat(priceStr.replace(/[^0-9\.]/g, "")) || 0;
    depositItems.push({
      productName: session.Name,
      quantity: 1,
      unitPrice: unitPrice,
      total: unitPrice
    });
  });
  const finalDepositItems = groupDepositLineItems(depositItems);
  let depositHTML = "";
  finalDepositItems.forEach(item => {
    depositHTML += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="deposit_item_product" class="text-weight-bold">${item.productName}</div>
        <div id="deposit_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="deposit_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="deposit_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)}</div>
      </div>
    `;
  });
  new WFComponent("#deposit_line_items_list").setHTML(depositHTML);
  const depositTotal = finalDepositItems.reduce((acc, item) => acc + item.total, 0);
  new WFComponent("#deposit_total").setText(`$${depositTotal.toFixed(2)}`);
  
  // Toggle container display based on whether any deposit items exist.
  const depositContainer = new WFComponent("#deposit_line_items_container");
  depositContainer.getElement().style.display = finalDepositItems.length > 0 ? "flex" : "none";
  
  return depositTotal;
}
