// src/pages/dashboard.ts

import { initializeDynamicStudentList } from "./listStudents";
import { initializeDynamicAdditionalStudentList } from "./listAdditionalStudents";
import { initializeDynamicCaregiverList } from "./listCaregivers";
import { initializeDynamicSubscriptionList } from "./listRegistration";
import { initializeDynamicTicketOrderList } from "./listTicketOrders";
import { initializeDynamicDonationList } from "./listDonations";
import { initializeCaregiverNotifications } from "./listCaregiverNotifications";
import { initializeDynamicFileList } from "./listFiles";
import { WFComponent } from "@xatom/core";
import { userAuth } from "../../auth/authConfig";

// ⬇️ NEW: add-on registrations
import { initializeDynamicAddOnRegistrationList } from "./listAddOnRegistrations";

export const dashboard = async () => {
  const firstNameText = new WFComponent("#firstNameText");
  firstNameText.setText(userAuth.getUser().profile.first_name);

  try {
    await initializeDynamicStudentList("#listStudentProfiles");
    await initializeDynamicAdditionalStudentList("#listAdditionalStudentProfiles");
    await initializeDynamicFileList("#filesList");
    await initializeDynamicCaregiverList("#caregiversList");

    // Subscriptions (existing)
    initializeDynamicSubscriptionList("#listRegistration");

    // ⬇️ Add-on session registrations (new)
    initializeDynamicAddOnRegistrationList("#listAddOnRegistration");

    await initializeDynamicTicketOrderList("#listTickets");
    await initializeDynamicDonationList("#listDonations");
    initializeCaregiverNotifications("caregiverNotificationList");

    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    // Handle error if needed
    console.error("Dashboard init error:", error);
  }
};

const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};
