// src/manageSubscription/components/manageTrialAlert.ts

import { WFComponent } from "@xatom/core";
import { ManageSubscriptionResponse } from "../types";

/**
 * Toggles the "trial scheduled" alert box and injects dynamic text
 * based on subscription status and trial end date.
 */
export function updateTrialAlert(
  subscription: ManageSubscriptionResponse
): void {
  const trialBoxEl = new WFComponent("#alertBoxTrial").getElement() as HTMLElement;
  const dateSpan = new WFComponent("#subscription_trial_end_date").getElement() as HTMLElement;

  const now = Date.now();
  const trialEnd = subscription.free_trial_end || 0;

  // Show if trialEnd is in the future or early registration is flagged
  if ((trialEnd && trialEnd > now) || subscription.early_registration) {
    // Format the trial end date
    const formatted = new Date(trialEnd).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    dateSpan.textContent = formatted;

    // Determine dynamic prefix and verb
    const whenApproved = subscription.status === "Deposit Paid"
      ? "When approved your"
      : "Your";
    const beginOrResume = subscription.status === "Deposit Paid"
      ? "begin"
      : "resume";

    // Update the alert-title HTML
    const titleEl = trialBoxEl.querySelector(".alert-title") as HTMLElement;
    titleEl.innerHTML =
      `${whenApproved} subscription is scheduled to ${beginOrResume} on ` +
      `<span id="subscription_trial_end_date">${formatted}</span>. ` +
      `If you've paid a deposit, your initial invoice will commence on the same date.`;

    // Reveal the alert box (removing any inline hide)
    trialBoxEl.style.display = "flex";
  } else {
    // Hide the alert box
    trialBoxEl.style.display = "none";
  }
}
