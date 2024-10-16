// src/modules/pages/accountDetails/index.ts

import { getUserDetails } from "./getUserDetails";
import { initializeEditUserDialog } from "./edituserDialog";
import { initializeDeleteUser } from "./deleteUser";

export const initializeAccountDetailsPage = async () => {
  // Fetch and display user details
  await getUserDetails();

  // Initialize the edit user dialog
  initializeEditUserDialog();

  // Initialize the delete user functionality
  initializeDeleteUser();

  // Add an event listener to remove current_user from localStorage when navigating away
  window.addEventListener("beforeunload", () => {
    localStorage.removeItem("current_user");
  });
};
