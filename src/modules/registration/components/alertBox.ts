// components/registration/initializeAlertBox.ts

import { getPendingStudents } from "../state/registrationState";

/**
 * Initializes the alert box, showing it if there are pending students.
 */
export const initializeAlertBox = () => {
  const alertBox = document.querySelector("#alertBox") as HTMLElement;
  const alertPendingStudentList = document.querySelector(
    "#alertPendingStudentList"
  ) as HTMLElement;

  if (!alertBox || !alertPendingStudentList) {
    console.error("Alert box elements not found");
    return;
  }

  const pendingStudents = getPendingStudents();

  if (pendingStudents.length > 0) {
    alertBox.style.display = "flex";
    alertPendingStudentList.innerHTML = pendingStudents
      .map((student) => `<li>${student}</li>`)
      .join("");
  } else {
    alertBox.style.display = "none";
  }
};
