import { WFComponent } from "@xatom/core";
import { StartRegistrationResponse, Session } from "../../../api/startRegistration";
import { saveState } from "../state/registrationState";
import { updateTotalAmount } from "./updateTotalAmount";

interface LineItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Retrieves a session by its ID.
 */
function getSessionById(sessions: Session[], sessionId: string): Session | undefined {
  const session = sessions.find(s => s.id.toString() === sessionId);
  console.log(`[DEBUG] getSessionById: Looking for session id ${sessionId}:`, session);
  return session;
}

/**
 * Groups line items by productName.
 */
function groupLineItems(items: LineItem[]): LineItem[] {
  const grouped = new Map<string, LineItem>();
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
  const finalItems = Array.from(grouped.values());
  console.log("[DEBUG] groupLineItems: Final grouped items:", finalItems);
  return finalItems;
}

/**
 * Updates the checkout line items UI for single-sale products.
 * - Builds and displays line items using Displayed_single_sale_price.
 * - Saves originalSubscriptionTotal for downstream totals/discount UI.
 * - No deposits, no pending students logic, no early alert.
 * - Does not depend on #subscription_type.
 */
export function updateCheckoutLineItems(apiData: StartRegistrationResponse): void {
  console.log("[DEBUG] updateCheckoutLineItems (SINGLE-SALE MODE): start");

  const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
  console.log("[DEBUG] updateCheckoutLineItems: Found", subscriptionRows.length, "confirmed rows.");
  const items: LineItem[] = [];

  subscriptionRows.forEach((row, index) => {
    const sessionId = row.getAttribute("data-session-id");
    console.log(`[DEBUG] updateCheckoutLineItems: Processing row ${index + 1}, session id:`, sessionId);
    if (!sessionId) return;

    const session = getSessionById(apiData.sessions, sessionId);
    if (!session) return;

    const priceStr = session.tuition_product.Displayed_single_sale_price || "";
    const unitPrice = parseFloat(priceStr.replace(/[^0-9\.]/g, "")) || 0;

    items.push({
      productName: session.Name,
      quantity: 1,
      unitPrice,
      total: unitPrice
    });
  });

  console.log("[DEBUG] updateCheckoutLineItems: Items before grouping:", items);
  const finalItems = groupLineItems(items);

  // Build HTML (no suffix for single-sale)
  let html = "";
  finalItems.forEach((item, idx) => {
    html += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="subscription_item_product" class="text-weight-bold line_item_product">${item.productName}</div>
        <div id="subscription_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="subscription_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="subscription_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)}</div>
      </div>
    `;
    console.log(`[DEBUG] updateCheckoutLineItems: Built line item ${idx + 1}:`, item);
  });
  new WFComponent("#subscription_line_items_list").setHTML(html);

  // Empty state / wrapper visibility
  const itemsWrapper = new WFComponent("#subscription_line_items_wrap");
  const emptyState = new WFComponent("#subscription_line_items_empty");
  if (finalItems.length > 0) {
    itemsWrapper.getElement().style.display = "flex";
    emptyState.getElement().style.display = "none";
  } else {
    itemsWrapper.getElement().style.display = "none";
    emptyState.getElement().style.display = "block";
  }

  // Totals
  const subtotal = finalItems.reduce((acc, item) => acc + item.total, 0);
  console.log("[DEBUG] updateCheckoutLineItems: Subtotal (single-sale) =", subtotal);

  // save originalSubscriptionTotal so updateTotalAmount can apply any discount logic elsewhere
  saveState({ originalSubscriptionTotal: subtotal });

  // No deposits, no alerts. Directly update overall total.
  // Pass subscriptionType as undefined and depositTotal as 0.
  updateTotalAmount(false, undefined, 0);

  // Ensure deposit container & early alert are hidden if present in DOM.
  const depositContainer = document.getElementById("deposit_line_items_container");
  if (depositContainer) depositContainer.style.display = "none";

  const earlyAlert = document.getElementById("alertBoxEarly");
  if (earlyAlert) earlyAlert.style.display = "none";

  console.log("[DEBUG] updateCheckoutLineItems (SINGLE-SALE MODE): done");
}
