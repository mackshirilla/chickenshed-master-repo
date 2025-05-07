import { WFComponent } from "@xatom/core";
import { StartRegistrationResponse, Session } from "../../../api/startRegistration";
import { saveState, loadState } from "../state/registrationState";
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
 * Updates the deposit line items using the deposit product’s single sale price.
 */
function updateDepositLineItems(apiData: StartRegistrationResponse, subscriptionType: string): number {
  console.log("[DEBUG] updateDepositLineItems: Starting deposit update...");
  const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
  console.log("[DEBUG] updateDepositLineItems: Found", subscriptionRows.length, "confirmed subscription rows.");
  const depositItems: LineItem[] = [];
  subscriptionRows.forEach((row, index) => {
    const sessionId = row.getAttribute("data-session-id");
    console.log(`[DEBUG] updateDepositLineItems: Processing row ${index + 1}, session id:`, sessionId);
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session || !session.deposit_product) {
      console.log(`[DEBUG] updateDepositLineItems: No session or deposit product found for session id ${sessionId}`);
      return;
    }
    // Use the deposit product’s single sale price.
    const depositPriceStr = session.deposit_product.Displayed_single_sale_price;
    const depositUnitPrice = parseFloat(depositPriceStr.replace(/[^0-9\.]/g, "")) || 0;
    console.log(`[DEBUG] updateDepositLineItems: Deposit price string: "${depositPriceStr}", parsed unit price: ${depositUnitPrice}`);
    depositItems.push({
      productName: session.Name,
      quantity: 1,
      unitPrice: depositUnitPrice,
      total: depositUnitPrice
    });
  });
  console.log("[DEBUG] updateDepositLineItems: Deposit Items Array before grouping:", depositItems);
  const finalDepositItems = groupLineItems(depositItems);
  let depositHTML = "";
  finalDepositItems.forEach((item, index) => {
    depositHTML += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="deposit_item_product" class="text-weight-bold">${item.productName}</div>
        <div id="deposit_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="deposit_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="deposit_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)}</div>
      </div>
    `;
    console.log(`[DEBUG] updateDepositLineItems: Built deposit line item ${index + 1}:`, item);
  });
  new WFComponent("#deposit_line_items_list").setHTML(depositHTML);
  const depositTotal = finalDepositItems.reduce((acc, item) => acc + item.total, 0);
  console.log("[DEBUG] updateDepositLineItems: Calculated deposit total:", depositTotal);
  new WFComponent("#deposit_total").setText(`$${depositTotal.toFixed(2)}`);
  
  // Toggle container display based on whether any deposit items exist.
  const depositContainer = new WFComponent("#deposit_line_items_container");
  const displayStyle = finalDepositItems.length > 0 ? "flex" : "none";
  depositContainer.getElement().style.display = displayStyle;
  console.log("[DEBUG] updateDepositLineItems: Deposit container display set to:", displayStyle);
  
  return depositTotal;
}

/**
 * Updates the checkout line items UI.
 * - Builds and displays subscription line items.
 * - Determines if deposit line items should be displayed:
 *     • Always if pending student profiles exist.
 *     • Otherwise, only for monthly subscriptions if the registration is early.
 * - Updates the overall total and early alert accordingly.
 */
export function updateCheckoutLineItems(apiData: StartRegistrationResponse): void {
  console.log("[DEBUG] updateCheckoutLineItems: Running updateCheckoutLineItems...");
  const subscriptionTypeSelect = document.getElementById("subscription_type") as HTMLSelectElement;
  if (!subscriptionTypeSelect) {
    console.warn("[DEBUG] updateCheckoutLineItems: Subscription type select not found.");
    return;
  }
  const subscriptionType = subscriptionTypeSelect.value; // "year", "month", or "semester"
  console.log("[DEBUG] updateCheckoutLineItems: Subscription type selected:", subscriptionType);

  const suffix = subscriptionType === "year" ? "/year"
                : subscriptionType === "month" ? "/month"
                : subscriptionType === "semester" ? "/semester"
                : "";

  // Process subscription items.
  const subscriptionRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
  console.log("[DEBUG] updateCheckoutLineItems: Found", subscriptionRows.length, "confirmed subscription rows.");
  const subscriptionItems: LineItem[] = [];
  subscriptionRows.forEach((row, index) => {
    const sessionId = row.getAttribute("data-session-id");
    console.log(`[DEBUG] updateCheckoutLineItems: Processing subscription row ${index + 1}, session id:`, sessionId);
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session) return;
    let priceStr = "";
    if (subscriptionType === "year") {
      priceStr = session.tuition_product.Displayed_annual_price;
    } else if (subscriptionType === "month") {
      priceStr = session.tuition_product.Displayed_monthly_price;
    } else if (subscriptionType === "semester") {
      priceStr = session.tuition_product.Displayed_semester_price;
    }
    console.log(`[DEBUG] updateCheckoutLineItems: Price string for session ${sessionId}:`, priceStr);
    const unitPrice = parseFloat(priceStr.replace(/[^0-9\.]/g, "")) || 0;
    console.log(`[DEBUG] updateCheckoutLineItems: Parsed unit price for session ${sessionId}:`, unitPrice);
    subscriptionItems.push({
      productName: session.Name,
      quantity: 1,
      unitPrice: unitPrice,
      total: unitPrice
    });
  });
  console.log("[DEBUG] updateCheckoutLineItems: Subscription Items Array before grouping:", subscriptionItems);
  const finalSubscriptionItems = groupLineItems(subscriptionItems);

  let subscriptionHTML = "";
  finalSubscriptionItems.forEach((item, index) => {
    subscriptionHTML += `
      <div class="line_item u-hflex-left-center u-text-small">
        <div id="subscription_item_product" class="text-weight-bold line_item_product">${item.productName}</div>
        <div id="subscription_item_unit_amount" class="line_item_unit_amount">$${item.unitPrice.toFixed(2)}</div>
        <div>x</div>
        <div id="subscription_item_quantity" class="line_item_quantity">${item.quantity}</div>
        <div id="subscription_item_total" class="line_item_total text-weight-bold">$${item.total.toFixed(2)} ${suffix}</div>
      </div>
    `;
    console.log(`[DEBUG] updateCheckoutLineItems: Built subscription line item ${index + 1}:`, item);
  });
  new WFComponent("#subscription_line_items_list").setHTML(subscriptionHTML);

  const subscriptionItemsWrapper = new WFComponent("#subscription_line_items_wrap");
  const subscriptionEmptyState = new WFComponent("#subscription_line_items_empty");
  if (finalSubscriptionItems.length > 0) {
    subscriptionItemsWrapper.getElement().style.display = "flex";
    subscriptionEmptyState.getElement().style.display = "none";
  } else {
    subscriptionItemsWrapper.getElement().style.display = "none";
    subscriptionEmptyState.getElement().style.display = "block";
  }

  const subscriptionTotal = finalSubscriptionItems.reduce((acc, item) => acc + item.total, 0);
  console.log("[DEBUG] updateCheckoutLineItems: Subscription Total:", subscriptionTotal);
  saveState({ originalSubscriptionTotal: subscriptionTotal });
  console.log("[DEBUG] updateCheckoutLineItems: Updated originalSubscriptionTotal:", subscriptionTotal);

  // Determine early registration for monthly subscriptions.
  let earlyRegistration = false;
  let earliestStartDate: number | null = null;
  if (subscriptionType === "month") {
    subscriptionRows.forEach(row => {
      const sessionId = row.getAttribute("data-session-id");
      if (!sessionId) return;
      const session = getSessionById(apiData.sessions, sessionId);
      if (!session) return;
      const startDate = session.program["1st_Semester_Start_Date"];
      if (startDate && startDate > Date.now()) {
        earlyRegistration = true;
        if (earliestStartDate === null || startDate < earliestStartDate) {
          earliestStartDate = startDate;
        }
      }
    });
  }

  // Check for pending student profiles.
  const pendingStudents = apiData.student_profiles
    ? apiData.student_profiles.filter((profile: any) =>
        profile.Status && profile.Status.toLowerCase() === "pending"
      )
    : [];

  // Determine if deposit line items should display:
  // • Always if pending students exist.
  // • Otherwise, only if subscriptionType is "month" and earlyRegistration is true.
  let depositShouldDisplay = false;
  if (pendingStudents.length > 0) {
    depositShouldDisplay = true;
  } else if (subscriptionType === "month" && earlyRegistration) {
    depositShouldDisplay = true;
  }

  let depositTotal = 0;
  if (depositShouldDisplay) {
    console.log("[DEBUG] updateCheckoutLineItems: Pending students or early registration detected.");
    depositTotal = updateDepositLineItems(apiData, subscriptionType);
    console.log("[DEBUG] updateCheckoutLineItems: Deposit total computed:", depositTotal);
  } else {
    // Hide deposit container if not applicable.
    new WFComponent("#deposit_line_items_container").getElement().style.display = "none";
    console.log("[DEBUG] updateCheckoutLineItems: Deposit container hidden.");
  }

  // Update overall total amount due.
  updateTotalAmount(false, subscriptionType, depositTotal);

  // Update early registration alert.
  updateEarlyAlert(apiData, subscriptionType);
}

/**
 * If the subscription is monthly, checks confirmed rows for the earliest upcoming start date.
 * If found, displays the early alert with that date; otherwise, hides the alert.
 */
function updateEarlyAlert(apiData: StartRegistrationResponse, subscriptionType: string): void {
  if (subscriptionType !== "month") {
    new WFComponent("#alertBoxEarly").getElement().style.display = "none";
    return;
  }
  const confirmedRows = document.querySelectorAll("#subscription_items_list tr.confirmed");
  let earliestStartDate: number | null = null;
  confirmedRows.forEach(row => {
    const sessionId = row.getAttribute("data-session-id");
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session) return;
    const startDate = session.program["1st_Semester_Start_Date"];
    if (startDate && startDate > Date.now()) {
      if (earliestStartDate === null || startDate < earliestStartDate) {
        earliestStartDate = startDate;
      }
    }
  });
  const alertBox = new WFComponent("#alertBoxEarly");
  const startDateSpan = new WFComponent("#subscription_start_date");
  if (earliestStartDate) {
    const formattedDate = new Date(earliestStartDate).toLocaleDateString();
    startDateSpan.setText(formattedDate);
    alertBox.getElement().style.display = "block";
    console.log("[DEBUG] updateEarlyAlert: Displaying early alert with start date:", formattedDate);
  } else {
    alertBox.getElement().style.display = "none";
    console.log("[DEBUG] updateEarlyAlert: No upcoming start dates found, hiding early alert.");
  }
}
