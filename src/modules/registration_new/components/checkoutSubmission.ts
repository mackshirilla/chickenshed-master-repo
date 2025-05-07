import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { toggleError } from "../../../utils/formUtils";
import { apiClient } from "../../../api/apiConfig";

interface CheckoutPayload {
  registration_items: { program_id: string | null; session_id: string | null; student_id: string | null }[];
  subscription_line_items: { price: string; quantity: number }[];
  deposit_line_items: { price: string; quantity: number }[] | null;
  financial_aid: {
    requested: boolean;
    selected_discount?: string;
    data?: any;
  };
  subscription_type: string;
  early_registration: boolean;
  earliest_start_date: number | null;
  subscription_subtotal: number;         // Original subscription total (no discounts).
  subscription_amount_discount: number;    // Total discount amount for subscription pricing.
  subscription_total: number;              // Subscription total after discount.
  total_due: number;
  students_pending: boolean;
  base_url: string;
}

interface CheckoutResponse {
  url: string;
  [key: string]: any;
}

/**
 * Utility: Given an array of sessions and a sessionId (as string),
 * returns the matching session object.
 */
function getSessionById(sessions: any[], sessionId: string): any {
  const session = sessions.find(s => s.id.toString() === sessionId);
  console.log(`[DEBUG] checkoutSubmission - getSessionById: Looking for session id ${sessionId}:`, session);
  return session;
}

/**
 * Gathers all registration data and sends it to the checkout endpoint.
 */
export async function submitCheckout() {
  // 1. Load state (which should include apiData, financial aid info, subscription type, etc.)
  const state = loadState();
  if (!state.apiData) {
    console.error("No API data found in state.");
    displayCheckoutError("No API data found in state.");
    return;
  }
  const apiData = state.apiData;

  // 2. Build registration items from confirmed subscription rows.
  const confirmedRows = Array.from(document.querySelectorAll("#subscription_items_list tr.confirmed"));
  const registrationItems = confirmedRows.map(row => ({
    program_id: row.getAttribute("data-program-id"),
    session_id: row.getAttribute("data-session-id"),
    student_id: row.getAttribute("data-student-id")
  }));

  // 3. Build subscription line items.
  const subscriptionLineItemsMap = new Map<string, number>();
  confirmedRows.forEach(row => {
    const sessionId = row.getAttribute("data-session-id");
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session) return;
    let priceId = "";
    if (state.subscriptionType === "year") {
      priceId = session.tuition_product.Annual_price_id;
    } else if (state.subscriptionType === "month") {
      priceId = session.tuition_product.Monthly_price_id;
    } else if (state.subscriptionType === "semester") {
      priceId = session.tuition_product.Semester_price_id;
    }
    if (!priceId) return;
    const currentQty = subscriptionLineItemsMap.get(priceId) || 0;
    subscriptionLineItemsMap.set(priceId, currentQty + 1);
  });
  const subscriptionLineItems = Array.from(subscriptionLineItemsMap.entries()).map(
    ([price, quantity]) => ({ price, quantity })
  );
  console.log("[DEBUG] submitCheckout: Subscription line items", subscriptionLineItems);

  // 4. Determine early registration for monthly subscriptions.
  let earlyRegistration = false;
  let earliestStartDate: number | null = null;
  if (state.subscriptionType === "month") {
    confirmedRows.forEach(row => {
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
  console.log("[DEBUG] submitCheckout: Early registration =", earlyRegistration, "Earliest start date =", earliestStartDate);

  // 5. Check for pending student profiles.
  const pendingStudents = apiData.student_profiles
    ? apiData.student_profiles.filter((profile: any) =>
        profile.Status && profile.Status.toLowerCase() === "pending"
      )
    : [];
  console.log("[DEBUG] submitCheckout: Pending students", pendingStudents);

  // 6. Build deposit line items if applicable.
  let depositLineItems: { price: string; quantity: number }[] | null = null;
  if (pendingStudents.length > 0 || (state.subscriptionType === "month" && earlyRegistration)) {
    const depositLineItemsMap = new Map<string, number>();
    const savedItems = state.registrationItems || [];
    savedItems.forEach(item => {
      const sessionId = item.session_id;
      if (!sessionId) return;
      const session = getSessionById(apiData.sessions, sessionId);
      if (!session || !session.deposit_product) return;
      const depositPriceId = session.deposit_product.Single_sale_price_id;
      if (!depositPriceId) return;
      const currentQty = depositLineItemsMap.get(depositPriceId) || 0;
      depositLineItemsMap.set(depositPriceId, currentQty + 1);
    });
    depositLineItems = depositLineItemsMap.size > 0
      ? Array.from(depositLineItemsMap.entries()).map(([price, quantity]) => ({ price, quantity }))
      : null;
  }
  console.log("[DEBUG] submitCheckout: Deposit line items", depositLineItems);

  // 7. Get the total amount due from the DOM.
  const totalDueText = new WFComponent("#total_amount_due").getElement().textContent || "";
  const totalDue = parseFloat(totalDueText.replace(/[^0-9\.]/g, "")) || 0;

  // 8. Compute subscription pricing details.
  const subscriptionSubtotal = state.originalSubscriptionTotal || 0; // Amount with no discounts.
  const discountPercent = state.selected_discount ? parseFloat(state.selected_discount) : 0;
  const subscriptionAmountDiscount = subscriptionSubtotal * (discountPercent / 100);
  const subscriptionTotal = subscriptionSubtotal - subscriptionAmountDiscount;

  // 9. Pull financial aid info from state.
  const financialAid = {
    requested: state.fin_aid_requested,
    selected_discount: state.selected_discount,
    data: state.financialAidData
  };

  // 10. Assemble the payload object with new subscription pricing keys.
  const checkoutPayload: CheckoutPayload = {
    registration_items: registrationItems,
    subscription_line_items: subscriptionLineItems,
    deposit_line_items: depositLineItems,
    financial_aid: financialAid,
    subscription_type: state.subscriptionType,
    early_registration: earlyRegistration,
    earliest_start_date: earliestStartDate,
    subscription_subtotal: subscriptionSubtotal,
    subscription_amount_discount: subscriptionAmountDiscount,
    subscription_total: subscriptionTotal,
    total_due: totalDue,
    students_pending: pendingStudents.length > 0,
    base_url: window.location.origin
  };

  console.log("[DEBUG] submitCheckout: Payload", checkoutPayload);

  // 11. Send the payload using your Axios-based apiClient with .fetch() and a wrapped data property.
  try {
    const response = await apiClient
      .post<CheckoutResponse>("/registration/checkout", { data: checkoutPayload })
      .fetch();
    const data = response;
    console.log("[DEBUG] submitCheckout: Response", data);
    if (data.url) {
      hideCheckoutError();
      window.location.href = data.url;
    } else {
      throw new Error("No checkout URL returned");
    }
  } catch (error: any) {
    console.error("Error submitting checkout", error);
    displayCheckoutError(error.message || "An error occurred during checkout.");
  }
}

/**
 * Displays an error message in the checkout error element using toggleError.
 * @param message The error message to display.
 */
function displayCheckoutError(message: string): void {
  const errorComp = new WFComponent("#registration_checkout_error");
  toggleError(errorComp, message, true);
}

/**
 * Hides the checkout error element.
 */
function hideCheckoutError(): void {
  const errorComp = new WFComponent("#registration_checkout_error");
  toggleError(errorComp, "", false);
}
