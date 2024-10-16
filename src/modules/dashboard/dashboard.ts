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

export const dashboard = async () => {
  const firstNameText = new WFComponent("#firstNameText");
  firstNameText.setText(userAuth.getUser().profile.first_name);

  try {
    await initializeDynamicStudentList("#listStudentProfiles");
    await initializeDynamicAdditionalStudentList(
      "#listAdditionalStudentProfiles"
    );
    await initializeDynamicFileList("#filesList"); // Corrected selector here
    await initializeDynamicCaregiverList("#caregiversList");
    initializeDynamicSubscriptionList("#listRegistration");
    await initializeDynamicTicketOrderList("#listTickets");
    await initializeDynamicDonationList("#listDonations");
    initializeCaregiverNotifications("caregiverNotificationList");
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    // Handle error if needed
  }
};

const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};
