import { WFComponent } from "@xatom/core";
import { fetchStudentProfiles } from "../../../api/students";
// Function to display the action required dialog and prevent closing
export const displayActionRequiredDialog = () => {
  const actionRequiredDialog = new WFComponent("#actionRequiredDialog");
  const alertDialogAnimationTrigger = new WFComponent(
    "#alertDialogAnimationTrigger"
  );
  const pageMainElement = document.querySelector(".page_main");

  // Show the dialog
  (actionRequiredDialog.getElement() as HTMLDialogElement).showModal();

  // Trigger any necessary animations
  alertDialogAnimationTrigger.getElement().click();

  // Set the data-brand attribute of .page_main to 5
  if (pageMainElement) {
    pageMainElement.setAttribute("data-brand", "5");
  }

  // Prevent closing the dialog
  actionRequiredDialog.getElement().addEventListener("cancel", (event) => {
    event.preventDefault();
  });

  actionRequiredDialog.getElement().addEventListener("close", (event) => {
    event.preventDefault();
  });

  // Prevent closing the dialog with the escape key
  const preventEscapeClose = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
    }
  };

  document.addEventListener("keydown", preventEscapeClose);
};

// Initialize the registration and check for student profiles
export const checkForStudents = async () => {
  try {
    const { students, showDialog } = await fetchStudentProfiles();

    if (showDialog) {
      displayActionRequiredDialog();
    }

    // Handle students data as needed
    // For example, save to state, display, etc.
  } catch (error) {
    console.error("Error during registration initialization:", error);
  }
};
