// src/modules/pages/accountDetails/deleteUser.ts

import { WFComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";

/**
 * Initializes the delete user functionality.
 */
export function initializeDeleteUser() {
  // Retrieve and initialize the "Open Delete Dialog" button
  const openDeleteDialogBtn = new WFComponent("#openDeleteDialog");

  // Retrieve the delete user dialog element
  const deleteUserDialogElement = document.getElementById(
    "deleteUserDialog"
  ) as HTMLDialogElement | null;

  // Retrieve and initialize the "Close Delete Dialog" button
  const closeDeleteDialogBtn = new WFComponent("#close-delete-dialog-btn");

  // Retrieve and initialize the "Final Delete" button
  const deleteUserFinalBtn = new WFComponent("#deleteUserFinal");

  // Retrieve and initialize the "Delete User Error" component
  const deleteUserError = new WFComponent("#deleteUserError");

  // Retrieve and initialize the "Page Main" component
  const pageMain = new WFComponent(".page_main");

  // Retrieve and initialize the loader animations
  const deleteRequestingAnimation = new WFComponent(
    "#deleteRequestingAnimation"
  );
  deleteRequestingAnimation.setStyle({ display: "none" });

  /**
   * Shows the delete confirmation dialog and updates the data-brand attribute.
   */
  const showDeleteDialog = () => {
    if (deleteUserDialogElement && pageMain) {
      deleteUserDialogElement.showModal(); // Display the dialog
      pageMain.setAttribute("data-brand", "6"); // Update data-brand to 6
    }
  };

  /**
   * Hides the delete confirmation dialog and reverts the data-brand attribute.
   */
  const hideDeleteDialog = () => {
    if (deleteUserDialogElement && pageMain && deleteUserError) {
      deleteUserDialogElement.close(); // Close the dialog
      pageMain.setAttribute("data-brand", "2"); // Revert data-brand to 2
      deleteUserError.setStyle({ display: "none" }); // Hide any previous error messages
    }
  };

  /**
   * Handles the deletion of the user account.
   */
  const handleDeleteUser = async () => {
    try {
      // Hide previous error messages
      deleteUserError.setStyle({ display: "none" });

      // Show the loader animation and disable the delete button
      deleteRequestingAnimation.setStyle({ display: "flex" });
      deleteUserFinalBtn.setAttribute("disabled", "true");

      // Send the DELETE request to the API
      const response = await apiClient.delete(`/profiles`).fetch();

      // Hide the loader animation and re-enable the delete button
      deleteRequestingAnimation.setStyle({ display: "none" });
      deleteUserFinalBtn.removeAttribute("disabled");

      if (response && response.status === 200) {
        // Redirect to the homepage or login page
        window.location.href = "/login"; // Adjust the URL as needed
      } else {
        // Handle unexpected successful responses
        throw new Error("Unexpected response from the server.");
      }
    } catch (error: any) {
      console.error("Error deleting user account:", error);

      // Hide the loader animation and re-enable the delete button
      deleteRequestingAnimation.setStyle({ display: "none" });
      deleteUserFinalBtn.removeAttribute("disabled");

      // Display the error message
      deleteUserError.setStyle({ display: "flex" });
      deleteUserError
        .getChildAsComponent(".error-text")
        .setText(
          error.response?.data?.message ||
            "An unexpected error occurred while deleting your account."
        );
    }
  };

  // Event listener to open the delete dialog
  openDeleteDialogBtn.on("click", showDeleteDialog);

  // Event listener to close the delete dialog
  closeDeleteDialogBtn.on("click", hideDeleteDialog);

  // Event listener for the final delete action
  deleteUserFinalBtn.on("click", handleDeleteUser);
}
