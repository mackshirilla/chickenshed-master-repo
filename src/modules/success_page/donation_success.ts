// src/success_page/donation_success.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";
import { navigate } from "@xatom/core"; // Ensure navigate is imported for potential redirection

// Define the structure of the donation response
interface DonationResponse {
  data: {
    id: number;
    created_at: number;
    user_id: number;
    contact_id: number;
    campaign_id: string;
    campaign_name: string;
    status: string; // e.g., 'completed'
    amount: number;
    keep_anonymous: boolean;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    sale_id: number;
    image_url: string;
    "success-page-message": string;
  };
}

// Define a DonationCard component to manage the donation card DOM
class DonationCard {
  private card: WFComponent;
  private image: WFImage;
  private campaignName: WFComponent;
  private campaignSubtitle: WFComponent;
  private donationAmount: WFComponent;
  private campaignId: string; // Track campaign ID
  private donationId: number; // Track donation ID

  constructor(cardId: string) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) {
      throw new Error(`Element with id '${cardId}' not found.`);
    }

    // Initialize card and its child elements
    this.card = new WFComponent(cardElement);
    this.image = new WFImage(
      this.card.getChildAsComponent("#cardCampaignImage").getElement()
    );
    this.campaignName = this.card.getChildAsComponent("#cardCampaignName");
    this.campaignSubtitle = this.card.getChildAsComponent(
      "#cardCampaignSubtitle"
    );
    this.donationAmount = this.card.getChildAsComponent("#cardDonationAmount");

    // Initialize campaignId and donationId to empty values
    this.campaignId = "";
    this.donationId = 0;

    // Log warnings if any essential child elements are missing
    if (!this.campaignName) {
      console.warn(
        "Element with id 'cardCampaignName' not found within the donation card."
      );
    }
    if (!this.campaignSubtitle) {
      console.warn(
        "Element with id 'cardCampaignSubtitle' not found within the donation card."
      );
    }
    if (!this.donationAmount) {
      console.warn(
        "Element with id 'cardDonationAmount' not found within the donation card."
      );
    }
    if (!this.image) {
      console.warn(
        "Element with id 'cardCampaignImage' not found within the donation card."
      );
    }
  }

  // Method to populate the donation card with data
  populate(data: DonationResponse["data"]) {
    console.log("Populating donation card with data.");

    // Set Campaign ID
    this.campaignId = data.campaign_id;
    console.log("Campaign ID set to:", this.campaignId);

    // Set Donation ID
    this.donationId = data.id;
    console.log("Donation ID set to:", this.donationId);

    // Set Campaign Name
    if (this.campaignName) {
      this.campaignName.setText(data.campaign_name);
      console.log("Set campaignName:", data.campaign_name);
    }

    // Set Campaign Subtitle (e.g., "Thank You for Donating")
    if (this.campaignSubtitle) {
      const subtitle = data.keep_anonymous
        ? "Anonymous Donation"
        : `Thank you, ${data.customer_first_name}!`;
      this.campaignSubtitle.setText(subtitle);
      console.log("Set campaignSubtitle:", subtitle);
    }

    // Set Donation Amount
    if (this.donationAmount) {
      this.donationAmount.setText(`$${data.amount.toFixed(2)}`);
      console.log("Set donationAmount:", `$${data.amount.toFixed(2)}`);
    }

    // Set Campaign Image
    if (data.image_url && this.image) {
      this.image.setImage(data.image_url);
      const imgElement = this.image.getElement() as HTMLImageElement;
      imgElement.alt = `${data.campaign_name} - Campaign Image`;
      console.log("Set campaign image URL and alt text.");
    }

    // Set Success Message
    const successMessageElement = document.querySelector("#successMessage");
    if (successMessageElement && successMessageElement instanceof HTMLElement) {
      successMessageElement.innerHTML = data["success-page-message"];
      successMessageElement.style.display = "block";
      console.log("Set and displayed success message.");
    }

    // Add the `campaign` and `donation` parameters to the donation card link
    this.updateDonationCardLink();
  }

  // Method to update the donation card link with the campaign and donation parameters
  private updateDonationCardLink() {
    // Since #donationCard is the link element, manipulate its href directly
    const donationCardLinkElement = this.card.getElement() as HTMLAnchorElement;

    if (!donationCardLinkElement) {
      console.warn("donationCard element is not an anchor element.");
      return;
    }

    const currentHref = donationCardLinkElement.getAttribute("href") || "#";
    console.log("Current href before update:", currentHref);

    try {
      if (localStorage.getItem("auth_config")) {
        // User is authenticated, proceed with adding campaign and donation parameters
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("campaign", this.campaignId);
        url.searchParams.set("donation", this.donationId.toString());
        donationCardLinkElement.setAttribute("href", url.toString());
        console.log(
          "Updated donation card link with campaign and donation parameters:",
          url.toString()
        );
      } else {
        // User is not authenticated, disable the link and make it non-interactive
        donationCardLinkElement.setAttribute("href", "#"); // Remove or set to a dummy link
        donationCardLinkElement.style.pointerEvents = "none"; // Disable pointer events
        //donationCardLinkElement.style.opacity = "0.5"; // Visually indicate disabled state
        donationCardLinkElement.style.cursor = "not-allowed"; // Change cursor to indicate non-interactivity
        console.log(
          "Auth_config not found. Donation card link disabled and made non-interactive."
        );
      }
    } catch (error) {
      console.error("Invalid URL in donationCard href:", currentHref, error);
      alert("An error occurred while updating the donation card link.");
    }
  }

  // Method to display the donation card
  show() {
    const cardElement = this.card.getElement();
    if (cardElement instanceof HTMLElement) {
      cardElement.style.display = "block";
      console.log("Displayed donation card.");
    }
  }
}

// Utility function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const isDonationSuccessful = params.has("donation_successful");
  const donationId = params.get("donation");
  return { isDonationSuccessful, donationId };
};

// Main function to handle donation success
export const handleDonationSuccess = async () => {
  console.log("Handling donation success");
  const { isDonationSuccessful, donationId } = getUrlParams();

  if (isDonationSuccessful && donationId) {
    try {
      console.log("Fetching donation data...");
      // Make the GET request to fetch donation data
      const request = apiClient.get<DonationResponse>(
        `/success_page/donation/${donationId}`
      );

      // Wrap the event-based response in a Promise for easier handling
      const donationData: DonationResponse["data"] = await new Promise(
        (resolve, reject) => {
          request.onData((response) => {
            console.log("Donation data received:", response.data);
            resolve(response.data);
          });

          request.onError((error) => {
            console.error("API Error:", error);
            reject(error);
          });

          // Initiate the request
          request.fetch();
        }
      );

      // Trigger the success_trigger element (assuming it has an event listener)
      const successTrigger = document.querySelector(".success_trigger");
      if (successTrigger && successTrigger instanceof HTMLElement) {
        console.log("Triggering success_trigger element.");
        successTrigger.click();
      }

      // Initialize and populate the donation card
      const donationCard = new DonationCard("donationCard");
      donationCard.populate(donationData);
      donationCard.show();
    } catch (error) {
      console.error("Error fetching donation data:", error);
      alert(
        "An error occurred while processing your donation. Please contact us for assistance."
      );
    }
  } else {
    console.log("Donation parameters not found in URL.");
    alert(
      "Donation parameters not found in the URL. Please check your link and try again."
    );
  }
};
