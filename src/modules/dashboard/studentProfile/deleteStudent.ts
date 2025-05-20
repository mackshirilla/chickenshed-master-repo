// src/modules/pages/studentProfile/deleteStudent.ts

import { WFComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { fetchStudentRegistrations } from "./studentRegistrations"; // Import the fetch function

/**
 * Initializes the delete student functionality.
 * @param studentId - The ID of the student to be deleted.
 */
export function initializeDeleteStudent(studentId: number) {
  // Attempt to retrieve and initialize the "Open Delete Dialog" button
  let openDeleteDialogBtn: WFComponent | null = null;
  try {
    openDeleteDialogBtn = new WFComponent("#openDeleteDialog");
  } catch (error) {
    console.warn(
      "Element #openDeleteDialog not found. Skipping initialization of delete dialog opener."
    );
  }

  // Attempt to retrieve the delete student dialog element
  const deleteStudentDialogElement = document.getElementById(
    "deleteStudentDialog"
  ) as HTMLDialogElement | null;
  // Allow backdrop click to close the dialog
if (deleteStudentDialogElement) {
  deleteStudentDialogElement.addEventListener("click", (event) => {
    if (event.target === deleteStudentDialogElement) {
      deleteStudentDialogElement.close();
      if (pageMain) pageMain.setAttribute("data-brand", "2");
      if (deleteStudentError) deleteStudentError.setStyle({ display: "none" });
    }
  });
}

  // Attempt to retrieve and initialize the "Close Delete Dialog" button
  let closeDeleteDialogBtn: WFComponent | null = null;
  try {
    closeDeleteDialogBtn = new WFComponent("#close-delete-dialog-btn");
  } catch (error) {
    console.warn(
      "Element #close-delete-dialog-btn not found. Skipping initialization of delete dialog closer."
    );
  }

  // Attempt to retrieve and initialize the "Final Delete" button
  let deleteStudentFinalBtn: WFComponent | null = null;
  try {
    deleteStudentFinalBtn = new WFComponent("#deleteStudentFinal");
  } catch (error) {
    console.warn(
      "Element #deleteStudentFinal not found. Skipping initialization of final delete button."
    );
  }

  // Attempt to retrieve and initialize the "Delete Student Error" component
  let deleteStudentError: WFComponent | null = null;
  try {
    deleteStudentError = new WFComponent("#deleteStudentError");
  } catch (error) {
    console.warn(
      "Element #deleteStudentError not found. Skipping initialization of delete student error display."
    );
  }

  // Attempt to retrieve and initialize the "Page Main" component
  let pageMain: WFComponent | null = null;
  try {
    pageMain = new WFComponent(".page_main");
  } catch (error) {
    console.warn(
      "Element with class .page_main not found. Skipping initialization of page main."
    );
  }

  // Attempt to retrieve and initialize the loader animations
  let requestingAnimation: WFComponent | null = null;
  let deleteRequestingAnimation: WFComponent | null = null;
  try {
    requestingAnimation = new WFComponent("#requestingAnimation");
    deleteRequestingAnimation = new WFComponent("#deleteRequestingAnimation");
    // Initially hide the loader animations
    requestingAnimation.setStyle({ display: "none" });
    deleteRequestingAnimation.setStyle({ display: "none" });
  } catch (error) {
    console.warn(
      "Loader animation elements not found. Skipping initialization of loader animations."
    );
  }

  /**
   * Shows the delete confirmation dialog and updates the data-brand attribute.
   */
  const showDeleteDialog = () => {
    if (deleteStudentDialogElement && pageMain) {
      deleteStudentDialogElement.showModal(); // Display the dialog
      pageMain.setAttribute("data-brand", "6"); // Update data-brand to 6
    } else {
      console.warn(
        "Cannot show delete dialog because either deleteStudentDialogElement or pageMain is not available."
      );
    }
  };

  /**
   * Hides the delete confirmation dialog and reverts the data-brand attribute.
   */
  const hideDeleteDialog = () => {
    if (deleteStudentDialogElement && pageMain && deleteStudentError) {
      deleteStudentDialogElement.close(); // Close the dialog
      pageMain.setAttribute("data-brand", "2"); // Revert data-brand to 2
      deleteStudentError.setStyle({ display: "none" }); // Hide any previous error messages
    } else {
      console.warn(
        "Cannot hide delete dialog because either deleteStudentDialogElement, pageMain, or deleteStudentError is not available."
      );
    }
  };

  /**
   * Handles the deletion of the student.
   */
  const handleDeleteStudent = async () => {
    try {
      // Fetch the current registrations for the student
      const registrations = await fetchStudentRegistrations(studentId);

      // Check if there are any current registrations
      if (registrations.length > 0) {
        alert(
          "You must remove this student from any current registrations before you may delete them."
        );
        return; // Exit the function early; do not proceed with deletion
      }

      // Hide previous error messages if available
      if (deleteStudentError) {
        deleteStudentError.setStyle({ display: "none" });
      }

      // Show the loader animation and disable the delete button if available
      if (deleteRequestingAnimation && deleteStudentFinalBtn) {
        deleteRequestingAnimation.setStyle({ display: "flex" });
        deleteStudentFinalBtn.setAttribute("disabled", "true");
      }

      // Send the DELETE request to the API
      const response = await apiClient
        .delete(`/profiles/student/${studentId}`)
        .fetch();

      // Hide the loader animation and re-enable the delete button if available
      if (deleteRequestingAnimation && deleteStudentFinalBtn) {
        deleteRequestingAnimation.setStyle({ display: "none" });
        deleteStudentFinalBtn.removeAttribute("disabled");
      }

      if (response && response.status === 200) {
        // Successfully deleted the student
        // Optionally, display a success message before redirecting
        alert("Student has been successfully deleted.");

        // Redirect to the students list page or another appropriate page
        window.location.href = "/dashboard"; // Adjust the URL as needed
      } else {
        // Handle unexpected successful responses
        throw new Error("Unexpected response from the server.");
      }
    } catch (error: any) {
      console.error("Error deleting student:", error);

      // Hide the loader animation and re-enable the delete button if available
      if (deleteRequestingAnimation && deleteStudentFinalBtn) {
        deleteRequestingAnimation.setStyle({ display: "none" });
        deleteStudentFinalBtn.removeAttribute("disabled");
      }

      // Display the error message if the error component exists
      if (deleteStudentError) {
        deleteStudentError.setStyle({ display: "flex" });
        try {
          deleteStudentError
            .getChildAsComponent(".error-text")
            .setText(
              error.message ||
                "An unexpected error occurred while deleting the student."
            );
        } catch (childError) {
          console.warn(
            "Could not set text for .error-text within #deleteStudentError:",
            childError
          );
        }
      }
    }
  };

  // Event listener to open the delete dialog if the open button and dialog exist
  if (openDeleteDialogBtn && deleteStudentDialogElement && pageMain) {
    openDeleteDialogBtn.on("click", showDeleteDialog);
  } else {
    console.warn(
      "Cannot attach click event to #openDeleteDialog because required elements are missing."
    );
  }

  // Event listener to close the delete dialog if the close button and dialog exist
  if (
    closeDeleteDialogBtn &&
    deleteStudentDialogElement &&
    pageMain &&
    deleteStudentError
  ) {
    closeDeleteDialogBtn.on("click", hideDeleteDialog);
  } else {
    console.warn(
      "Cannot attach click event to #close-delete-dialog-btn because required elements are missing."
    );
  }

  // Event listener for the final delete action if the delete button exists
  if (deleteStudentFinalBtn) {
    deleteStudentFinalBtn.on("click", handleDeleteStudent);
  } else {
    console.warn(
      "Cannot attach click event to #deleteStudentFinal because the element is missing."
    );
  }
}
