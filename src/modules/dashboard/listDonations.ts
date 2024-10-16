// src/pages/listDonations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// Define the Donation interface based on the API response
interface Donation {
  id: number;
  created_at: number; // Unix timestamp in milliseconds
  user_id: number;
  campaign_id: string;
  campaign_name: string;
  status: string; // e.g., 'completed'
  amount: number;
  keep_anonymous: boolean;
  customer_first_name: string;
  customer_last_name: string;
  campaign_image_url: string;
}

// Function to fetch donations from the API
export async function fetchDonations(): Promise<Donation[]> {
  try {
    const getDonations = apiClient.get<Donation[]>("/dashboard/donations"); // Ensure this endpoint is correct
    const response = await getDonations.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching donations:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic donation list
export async function initializeDynamicDonationList(containerSelector: string) {
  // Initialize a new instance of WFDynamicList for Donations
  const list = new WFDynamicList<Donation>(containerSelector, {
    rowSelector: "#listDonationCard", // Using ID selector for template
    loaderSelector: "#listDonationloading", // Selector for the loader
    emptySelector: "#listDonationEmpty", // Selector for the empty state
  });

  // Customize the rendering of the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  // Customize the rendering of the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "flex",
    });
    return emptyElement;
  });

  // Customize the rendering of list items (Donation Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const donationCard = new WFComponent(rowElement);

    // Set the campaign image
    const campaignImage = new WFImage(
      donationCard
        .getChildAsComponent("#cardCampaignImage") // Using ID selector
        .getElement()
    );
    if (rowData.campaign_image_url) {
      campaignImage.setImage(rowData.campaign_image_url);
    } else {
      campaignImage.setImage(
        "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
      );
    }

    // Set the campaign name
    const campaignName = donationCard.getChildAsComponent("#cardCampaignName");
    campaignName.setText(rowData.campaign_name);

    // Set the campaign subtitle
    const campaignSubtitle = donationCard.getChildAsComponent(
      "#cardCampaignSubtitle"
    );
    const subtitle = rowData.keep_anonymous
      ? "Anonymous Donation"
      : `Thank you, ${rowData.customer_first_name}!`;
    campaignSubtitle.setText(subtitle);

    // Set the donation date
    const donationDate = donationCard.getChildAsComponent("#cardDonationDate");
    const date = new Date(rowData.created_at);
    donationDate.setText(date.toLocaleDateString());

    // Set the donation amount
    const donationAmount = donationCard.getChildAsComponent(
      "#cardDonationAmount"
    );
    donationAmount.setText(`$${rowData.amount.toFixed(2)}`);

    // Append the campaign parameter to the existing href
    const currentHref = donationCard.getElement().getAttribute("href") || "#";
    const separator = currentHref.includes("?") ? "&" : "?";
    const newHref = `${currentHref}${separator}campaign=${rowData.campaign_id}&donation=${rowData.id}`;
    donationCard.getElement().setAttribute("href", newHref);

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display donation data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const donations = await fetchDonations();

    // Sort donations by the created_at timestamp, descending (newest first)
    donations.sort((a, b) => b.created_at - a.created_at);

    // Set the data to be displayed in the dynamic list
    list.setData(donations);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading donations:", error);

    // If there's an error, set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
