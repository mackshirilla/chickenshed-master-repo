// src/modules/pages/studentProfile/index.ts

import { getStudentDetails } from "./getStudentDetails";
import { initializeEditStudentDialog } from "./editStudentDialog";
import { initializeEditEmergencyDialog } from "./editEmergencyDialog";
import { initializeStudentRegistrations } from "./studentRegistrations";
import { initializeDeleteStudent } from "./deleteStudent";
import { initializeCaregiverView } from "./caregiverView";
import { initializeRegistrationBreadcrumbs } from "./registrationBreadcrumbs";
import { initializeDynamicStudentFileList } from "./listStudentFiles";

export const initializeStudentProfilePage = async () => {
  // Get the student ID from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const studentIdParam = urlParams.get("id");
  if (!studentIdParam) {
    console.error("No student ID provided in the URL.");
    return;
  }

  const studentId = parseInt(studentIdParam, 10);

  // Fetch and display student details
  await getStudentDetails(studentId);

  // Initialize the caregiver view adjustments
  initializeCaregiverView();

  // Initialize the edit student dialog
  await initializeEditStudentDialog(studentId);

  // Initialize the edit emergency contact dialog
  await initializeEditEmergencyDialog(studentId);

  await initializeDynamicStudentFileList("#filesList"); // Initialize the student files list

  // Initialize the student registrations list
  initializeStudentRegistrations(studentId);

  // Initialize the delete student functionality
  initializeDeleteStudent(studentId);

  // Initialize registration breadcrumbs
  initializeRegistrationBreadcrumbs(); // Initialize the breadcrumbs

  // Add an event listener to remove current_student from localStorage when navigating away
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("current_student");
  });
};
