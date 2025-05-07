// src/manageSubscription/components/managePendingStudentsAlert.ts

import { WFComponent } from "@xatom/core";
import { ManageSubscriptionResponse } from "../types";

/**
 * Shows or hides the "order under review" alert box when a
 * subscription is Deposit Paid and student profiles are pending.
 */
export function updatePendingStudentsAlert(
  subscription: ManageSubscriptionResponse
): void {
  const alertEl = new WFComponent("#alertBox").getElement();

  // Debugging
  console.log(
    "[updatePendingStudentsAlert] status=", subscription.status,
    "pending_students=", subscription.pending_students
  );
  console.log("[updatePendingStudentsAlert] alertEl=", alertEl);

  if (
    subscription.status === "Deposit Paid" &&
    subscription.pending_students
  ) {
    // Reveal by removing inline override (or letting CSS handle default)
    alertEl.style.display = "flex";

  }else{
    alertEl.style.display = "none";
  
  }
}
