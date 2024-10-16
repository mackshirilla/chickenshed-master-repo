// src/modules/pages/accountDetails/getUserDetails.ts

import { apiClient } from "../../../api/apiConfig";
import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";

export const getUserDetails = async () => {
  // Show loading spinner
  const loadingSpinner = new WFComponent(".dashboard_loading_wall");
  loadingSpinner.setStyle({ display: "flex" });

  try {
    const response = await apiClient.get("/dashboard/account").fetch();

    if (response) {
      const user = response as any; // Replace 'any' with a proper interface for better type safety

      // Hide the loading spinner
      triggerSuccessEvent(".success_trigger");

      // Set user full name
      const userFullName = new WFComponent("#userFullName");
      userFullName.setText(`${user.first_name} ${user.last_name}`);

      // Set profile picture
      const userProfilePicture = new WFImage("#userProfilePicture");
      if (user.profile_pic && user.profile_pic.url) {
        userProfilePicture.setImage(user.profile_pic.url);
      } else {
        userProfilePicture.setImage(
          "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
        );
      }

      // Set email
      const userEmail = new WFComponent("#userEmail");
      userEmail.setText(user.email || "N/A");

      // Set phone
      const userPhone = new WFComponent("#userPhone");
      userPhone.setText(user.phone || "N/A");

      // Set address line 1
      const userAddressLineOne = new WFComponent("#userAddressLineOne");
      userAddressLineOne.setText(user.address_line_1 || "N/A");

      // Set address line 2
      const userAddressLineTwo = new WFComponent("#userAddressLineTwo");
      userAddressLineTwo.setText(user.address_line_2 || "N/A");

      // Set city
      const userCity = new WFComponent("#userCity");
      userCity.setText(user.city || "N/A");

      // Set state
      const userState = new WFComponent("#userState");
      userState.setText(user.state || "N/A");

      // Set zip
      const userZip = new WFComponent("#userZip");
      userZip.setText(user.zip || "N/A");

      // Set receive texts preference
      const userTextTrue = new WFComponent("#userTextTrue");
      const userTextFalse = new WFComponent("#userTextFalse");
      if (user.send_texts) {
        userTextTrue.setStyle({ display: "block" });
        userTextFalse.setStyle({ display: "none" });
      } else {
        userTextTrue.setStyle({ display: "none" });
        userTextFalse.setStyle({ display: "block" });
      }

      // Set YMCA member status
      const userYTrue = new WFComponent("#userYTrue");
      const userYFalse = new WFComponent("#userYFalse");
      if (user.is_y_member) {
        userYTrue.setStyle({ display: "block" });
        userYFalse.setStyle({ display: "none" });
      } else {
        userYTrue.setStyle({ display: "none" });
        userYFalse.setStyle({ display: "block" });
      }

      // Set YMCA membership number
      const userYMembershipNumber = new WFComponent("#userYMembershipNumber");
      userYMembershipNumber.setText(user.y_membership_id || "N/A");

      // Save user data for later use (e.g., in edit forms)
      localStorage.setItem("current_user", JSON.stringify(user));
    } else {
      alert("Error: Received null response from the server.");
      console.error("Received null response from the server.");

      // Navigate back to the previous page or handle the error appropriately
      window.history.back();
    }
  } catch (error: any) {
    console.error("Error fetching user details:", error);
    alert(`Error fetching user details: ${error.message || error}`);

    // Navigate back to the previous page or handle the error appropriately
    window.history.back();
  } finally {
    // Hide loading spinner in all cases
    loadingSpinner.setStyle({ display: "none" });
  }
};

const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};
