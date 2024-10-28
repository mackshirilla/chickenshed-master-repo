// src/pages/donationDetails.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";

// Define the Donation, Sale, and Campaign interfaces based on the API response
interface Donation {
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
  in_name_of: string; // Added field for "In Someone Else's Name" donations
  sale_id: number;
  campaign_image_url: string;
}

interface Sale {
  id: number;
  created_at: number;
  contact_id: number;
  user_id: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  amount_total: number;
  reciept_url: string;
}

interface Campaign {
  id: string;
  fieldData: {
    subheading: string;
    "short-description": string;
    name: string;
    "main-image": {
      url: string;
      alt?: string | null;
    };
  };
}

// Function to fetch donation details from the API
export async function fetchDonationDetails(donationId: number): Promise<{
  donation: Donation;
  sale: Sale;
  campaign: Campaign;
} | null> {
  try {
    const getDonation = apiClient.get<{
      donation: Donation;
      sale: Sale;
      campaign: Campaign;
    }>(`/dashboard/donations/${donationId}`);
    const response = await getDonation.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching donation details:", error);
    return null;
  }
}

// Function to trigger a success event
const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};

// Function to initialize and render the donation details page
export async function initializeDonationDetailsPage() {
  // Extract the donation ID from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const donationId = parseInt(urlParams.get("donation") || "0", 10);
  if (!donationId) {
    console.error("Invalid donation ID");
    return;
  }

  try {
    // Fetch donation details
    const response = await fetchDonationDetails(donationId);

    if (!response) {
      console.error("Failed to fetch donation details");
      return;
    }

    const { donation, sale, campaign } = response;

    // Set campaign image using WFImage
    const campaignImageComponent = new WFImage("#campaignImage");
    campaignImageComponent.setImage(campaign.fieldData["main-image"].url);
    campaignImageComponent
      .getElement()
      .setAttribute(
        "alt",
        campaign.fieldData["main-image"].alt ||
          `${campaign.fieldData.name} - Campaign Image`
      );

    // Set campaign name
    const campaignName = new WFComponent("#campaignName");
    campaignName.setText(campaign.fieldData.name);

    // Set campaign subheading
    const campaignSubheading = new WFComponent("#campaignSubheading");
    campaignSubheading.setText(campaign.fieldData.subheading);

    // Set the breadcrumb text to include campaign name and donation date
    const campaignBreadcrumb = new WFComponent("#campaignBreadcrumb");
    const donationDate = new Date(donation.created_at).toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
    campaignBreadcrumb.setText(`${campaign.fieldData.name} - ${donationDate}`);

    // Set campaign description using the short description from the campaign object
    const campaignShortDescription = new WFComponent(
      "#campaignShortDescription"
    );
    campaignShortDescription.setText(campaign.fieldData["short-description"]);

    // Set the anonymous donation status
    const anonymousTrue = new WFComponent("#anonymousTrue");
    const anonymousFalse = new WFComponent("#anonymousFalse");
    if (donation.keep_anonymous) {
      anonymousTrue.setStyle({ display: "block" });
      anonymousFalse.setStyle({ display: "none" });
    } else {
      anonymousTrue.setStyle({ display: "none" });
      anonymousFalse.setStyle({ display: "block" });
    }

    // Set the billing information
    const invoiceDate = new WFComponent("#invoiceDate");
    const saleDateFormatted = new Date(sale.created_at).toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
    invoiceDate.setText(saleDateFormatted);

    const invoiceAmount = new WFComponent("#invoiceAmount");
    invoiceAmount.setText(`$${sale.amount_total.toFixed(2)}`);

    const receiptButton = new WFComponent("#receiptButton");
    receiptButton.getElement().setAttribute("href", sale.reciept_url);

    // Handle "Made In The Name Of" field
    const inNameOfHeader = new WFComponent("#inNameOfHeader");
    const inNameOfCell = new WFComponent("#inNameOfCell");

    if (donation.in_name_of && donation.in_name_of.trim() !== "") {
      // If in_name_of has a value, display the header and cell
      inNameOfHeader.setStyle({ display: "table-cell" });
      inNameOfCell.setStyle({ display: "table-cell" });
      inNameOfCell.setText(donation.in_name_of);
    } else {
      // If in_name_of is blank, hide the header and cell
      inNameOfHeader.setStyle({ display: "none" });
      inNameOfCell.setStyle({ display: "none" });
    }

    // Trigger the success event
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    console.error("Error initializing donation details page:", error);
  }
}
