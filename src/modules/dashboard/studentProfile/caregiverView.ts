// src/modules/pages/studentProfile/caregiverView.ts

import { WFComponent, WFFormComponent } from "@xatom/core";

/**
 * Initializes the caregiver view by adjusting the DOM and form functionalities
 * based on the caregiver status of the current student.
 */
export const initializeCaregiverView = () => {
  // Retrieve the current student data from localStorage
  const studentData = localStorage.getItem("current_student");
  if (!studentData) {
    console.error("No student data found in localStorage.");
    return;
  }

  let student: any;
  try {
    student = JSON.parse(studentData);
  } catch (parseError) {
    console.error("Error parsing student data from localStorage:", parseError);
    return;
  }

  // Check if the current user is a caregiver
  if (student.caregiver === true) {
    // List of DOM selectors to remove for caregivers
    const selectorsToRemove = [
      "#openEditStudentDialog",
      "#openDeleteDialog",
      "#editEmergencySubmitButton",
      "#editStudentDialog",
      "#deleteStudentDialog",
    ];

    // Iterate over each selector and remove the corresponding element from the DOM
    selectorsToRemove.forEach((selector) => {
      try {
        const component = new WFComponent(selector);
        component.remove();
        console.log(`Removed element with selector: ${selector}`);
      } catch (error) {
        console.error(
          `Failed to remove element with selector ${selector}:`,
          error
        );
      }
    });

    // Disable the edit emergency contact form to prevent submission
    try {
      const editEmergencyForm = new WFFormComponent(
        "#editEmergencyContactForm"
      );
      editEmergencyForm.disableForm();
      console.log("Disabled #editEmergencyContactForm to prevent submissions.");
    } catch (error) {
      console.error("Failed to disable #editEmergencyContactForm:", error);
    }
  } else {
    console.log("Current user is not a caregiver. No changes applied.");
  }
};
