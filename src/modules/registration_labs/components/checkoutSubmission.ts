import { WFComponent } from "@xatom/core";
import { loadState } from "../state/registrationState";
import { toggleError } from "../../../utils/formUtils";
import { apiClient } from "../../../api/apiConfig";

interface CheckoutPayload {
  registration_items: { program_id: string | null; session_id: string | null; student_id: string | null }[];
  subscription_line_items: { price: string; quantity: number }[];
  deposit_line_items: null; // labs: always null
  financial_aid: {
    requested: boolean;
    selected_discount?: string;
    data?: any;
  };
  subscription_type: string | undefined; // labs: can be undefined
  early_registration: boolean;           // labs: always false
  earliest_start_date: number | null;    // labs: always null
  subscription_subtotal: number;
  subscription_amount_discount: number;
  subscription_total: number;
  total_due: number;
  students_pending: boolean;             // labs: always false
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
  const state = loadState();
  if (!state.apiData) {
    console.error("No API data found in state.");
    displayCheckoutError("No API data found in state.");
    return;
  }
  const apiData = state.apiData;

  // Build registration items from confirmed rows
  const confirmedRows = Array.from(document.querySelectorAll("#subscription_items_list tr.confirmed"));
  const registrationItems = confirmedRows.map(row => ({
    program_id: row.getAttribute("data-program-id"),
    session_id: row.getAttribute("data-session-id"),
    student_id: row.getAttribute("data-student-id")
  }));

  // Build single-sale line items
  const subscriptionLineItemsMap = new Map<string, number>();
  confirmedRows.forEach(row => {
    const sessionId = row.getAttribute("data-session-id");
    if (!sessionId) return;
    const session = getSessionById(apiData.sessions, sessionId);
    if (!session) return;

    const priceId = session.tuition_product.Single_sale_price_id;
    if (!priceId) return;

    const currentQty = subscriptionLineItemsMap.get(priceId) || 0;
    subscriptionLineItemsMap.set(priceId, currentQty + 1);
  });
  const subscriptionLineItems = Array.from(subscriptionLineItemsMap.entries()).map(
    ([price, quantity]) => ({ price, quantity })
  );
  console.log("[DEBUG] submitCheckout: Subscription (single-sale) line items", subscriptionLineItems);

  // Get the total amount due from the DOM
  const totalDueText = new WFComponent("#total_amount_due").getElement().textContent || "";
  const totalDue = parseFloat(totalDueText.replace(/[^0-9\.]/g, "")) || 0;

  // Compute subscription totals
  const subscriptionSubtotal = state.originalSubscriptionTotal || 0;
  const discountPercent = state.selected_discount ? parseFloat(state.selected_discount) : 0;
  const subscriptionAmountDiscount = subscriptionSubtotal * (discountPercent / 100);
  const subscriptionTotal = subscriptionSubtotal - subscriptionAmountDiscount;

  // Pull financial aid info from state (labs: can be false/undefined)
  const financialAid = {
    requested: state.fin_aid_requested,
    selected_discount: state.selected_discount,
    data: state.financialAidData
  };

  // Assemble payload
  const checkoutPayload: CheckoutPayload = {
    registration_items: registrationItems,
    subscription_line_items: subscriptionLineItems,
    deposit_line_items: null, // no deposits for labs
    financial_aid: financialAid,
    subscription_type: undefined, // labs don’t use sub types
    early_registration: false,
    earliest_start_date: null,
    subscription_subtotal: subscriptionSubtotal,
    subscription_amount_discount: subscriptionAmountDiscount,
    subscription_total: subscriptionTotal,
    total_due: totalDue,
    students_pending: false,
    base_url: window.location.origin
  };

  console.log("[DEBUG] submitCheckout: Payload", checkoutPayload);

  // Send to API
  try {
    const response = await apiClient
      .post<CheckoutResponse>("/registration/checkout_labs", { data: checkoutPayload })
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
