// src/pages/listDonations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

interface SupportCampaign {
  id: number;
  Name: string;
  Main_Image: string;
  Subheading: string;
  Short_Description: string;
}

interface Donation {
  id: number;
  uuid: string;
  created_at: number;
  user_id: number;
  support_campaign_id: number;
  campaign_name: string;
  status: string;
  amount: number;
  keep_anonymous: boolean;
  customer_first_name?: string;
  support_campaign: SupportCampaign;
  donation_subscription?: {
    id: number;
    subscription_type: string;
  };
}

export async function fetchDonations(): Promise<Donation[]> {
  try {
    const getDonations = apiClient.get<Donation[]>("/dashboard/donations");
    const response = await getDonations.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching donations:", error);
    throw error;
  }
}

export async function initializeDynamicDonationList(containerSelector: string) {
  const list = new WFDynamicList<Donation>(containerSelector, {
    rowSelector: "#listDonationCard",
    loaderSelector: "#listDonationloading",
    emptySelector: "#listDonationEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const donationCard = new WFComponent(rowElement);

    const campaignImage = new WFImage(
      donationCard.getChildAsComponent("#cardCampaignImage").getElement()
    );
    if (rowData.support_campaign?.Main_Image) {
      campaignImage.setImage(rowData.support_campaign.Main_Image);
    } else {
      campaignImage.setImage(
        "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
      );
    }

    const campaignName = donationCard.getChildAsComponent("#cardCampaignName");
    campaignName.setText(rowData.campaign_name);

    const campaignSubtitle = donationCard.getChildAsComponent("#cardCampaignSubtitle");
    campaignSubtitle.setText(rowData.support_campaign?.Subheading || "");

    const donationDate = donationCard.getChildAsComponent("#cardDonationDate");
    const date = new Date(rowData.created_at);
    donationDate.setText(date.toLocaleDateString());

    const donationAmount = donationCard.getChildAsComponent("#cardDonationAmount");
    donationAmount.setText(`$${rowData.amount.toFixed(2)}`);

    const currentHref = donationCard.getElement().getAttribute("href") || "#";
    const separator = currentHref.includes("?") ? "&" : "?";
    const newHref = `${currentHref}${separator}donation=${rowData.uuid}`;
    donationCard.getElement().setAttribute("href", newHref);

    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    const donations = await fetchDonations();
    donations.sort((a, b) => b.created_at - a.created_at);
    list.setData(donations);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading donations:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}
