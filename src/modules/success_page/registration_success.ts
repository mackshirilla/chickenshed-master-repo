// src/success_page/registration_success_index.ts

import { WFComponent } from "@xatom/core";
import { apiClient } from "../../api/apiConfig";

// Utility functions for formatting values
const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const formatBoolean = (val: boolean) => capitalize(val.toString());
const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(val);

// Trigger the hidden success animation/trigger element (Webflow interaction)
const triggerSuccess = () => {
  const triggerEl = document.querySelector<HTMLElement>(".success_trigger");
  if (triggerEl) triggerEl.click();
};

// Shape of the registration data returned by the API
interface RegistrationData {
  id: number;
  subscription_name: string;
  status: string;
  subscription_type: string;
  update_subscription_type: string;
  user_id: number;
  contact_id: number;
  current_finaid_id: number;
  pending_students: boolean;
  early_registration: boolean;
  checkout_session_id: string;
  last_invoice_id: number | null;
  last_invoice_is_draft: boolean;
  stripe_subscription_id: string | null;
  coupon: string;
  deposit_amount: number;
  subscription_subtotal: number;
  subscription_total: number;
  subscription_amount_discount: number;
  created_at: number;
  cancellation_reason: string;
  invoice_history: any[];
  prorate_changes: boolean;
  charge_proration: string;
  free_trial_end: number | null;
}

// Set of field IDs that should display as currency
const currencyFields = new Set([
  "subtotal",
  "depositPaid",
  "AmountDiscount",
  "subscriptionTotal",
  "dueUponApproval",
]);

// Update a field component with given value or hide it
const updateField = (
  component: WFComponent,
  rawValue: string | number | boolean | null | undefined
) => {
  const el = component.getElement() as HTMLElement;
  // Reset display
  el.style.display = "";
  // Hide if null, empty, false, or zero-number
  if (
    rawValue == null ||
    rawValue === "" ||
    rawValue === false ||
    (typeof rawValue === "number" && rawValue === 0)
  ) {
    el.style.display = "none";
    return;
  }

  let display: string;
  if (typeof rawValue === "boolean") {
    display = formatBoolean(rawValue);
  } else if (typeof rawValue === "string") {
    display = capitalize(rawValue);
  } else {
    display = currencyFields.has(el.id)
      ? formatCurrency(rawValue as number)
      : rawValue.toString();
  }

  // Preserve label and bold the value
  const label = el.textContent?.split(":")[0] || "";
  el.innerHTML = `${label}: <strong>${display}</strong>`;
};

// Main handler for registration success
export const handleRegistrationSuccessIndex = async () => {
  try {
    const request = apiClient.get<{ data: RegistrationData }>(
      "/success_page/registration"
    );
    request.onData((res) => {
      const data = res.data;
      const dueUponApproval = data.subscription_total - data.deposit_amount;
      const aidPercent =
        data.subscription_subtotal > 0 && data.subscription_amount_discount > 0
          ? `${Math.round(
              (data.subscription_amount_discount / data.subscription_subtotal) * 100
            )}%`
          : null;

      const isActive = (data.status || "").toUpperCase() === "ACTIVE";

      // Handle hiding of dueUponApproval element entirely if active
      const dueEl = document.getElementById("dueUponApproval");
      if (dueEl) {
        dueEl.style.display = isActive ? "none" : "";
      }

      // Map xatom components to their data keys
      const fields: Array<{ id: string; value: any }> = [
        { id: "status", value: data.status },
        { id: "billingCycle", value: data.subscription_type },
        { id: "pendingStudents", value: data.pending_students },
        { id: "financialAidRequested", value: data.current_finaid_id > 0 },
        { id: "financialAidApplied", value: aidPercent },
        { id: "subtotal", value: data.subscription_subtotal },
        { id: "depositPaid", value: data.deposit_amount },
        { id: "AmountDiscount", value: data.subscription_amount_discount },
        { id: "subscriptionTotal", value: data.subscription_total },
        { id: "dueUponApproval", value: dueUponApproval },
      ];

      fields.forEach(({ id, value }) => {
        // Skip updating dueUponApproval if it's hidden
        if (id === "dueUponApproval" && isActive) return;
        const el = document.getElementById(id);
        if (!el) return;
        updateField(new WFComponent(el), value);
      });

      // After populating all fields, trigger Webflow interaction
      triggerSuccess();
    });
    request.onError((err) => console.error("API Error:", err));
    request.fetch();
  } catch (err) {
    console.error("Error loading registration success data:", err);
  }
};

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  handleRegistrationSuccessIndex();
});
