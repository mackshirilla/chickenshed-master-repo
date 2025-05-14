// src/success_page/donation_success.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

interface SupportCampaign {
  id: number;
  Name: string;
  Main_Image: string;
  Success_Page_Message: string;
}

interface DonationSubscription {
  id: number;
  created_at: number;
  status: string;
  name: string;
  contact_id: number;
  user_id: number;
  amount: number;
  subscription_type: string; // "year" or "month"
  stripe_subscription_id: string;
}

interface DonationData {
  id: number;
  uuid: string;
  amount: number;
  keep_anonymous: boolean;
  in_name_of: string;
  created_at: number;
  campaign_name: string;
  support_campaign_id: number;
  support_campaign: SupportCampaign;
  donation_subscription?: DonationSubscription;
  customer_first_name?: string;
}

export async function handleDonationSuccess() {
  const params = new URLSearchParams(window.location.search);
  const donationId = params.get("donation");

  if (!donationId) {
    alert("Missing donation identifier in URL.");
    return;
  }

  try {
    const req = apiClient.get<{ data: DonationData }>(
      `/success_page/donation/${donationId}`
    );
    const data = await new Promise<DonationData>((resolve, reject) => {
      req.onData((res) => resolve(res.data));
      req.onError(reject);
      req.fetch();
    });

    const trigger = document.querySelector<HTMLElement>(".success_trigger");
    trigger?.click();

    const card = new WFComponent("#donationCard");
    const image = new WFImage(
      card.getChildAsComponent("#cardCampaignImage").getElement()
    );
    const campaignName = card.getChildAsComponent("#cardCampaignName");
    const subtitle = card.getChildAsComponent("#cardCampaignSubtitle");
    const amount = card.getChildAsComponent("#cardDonationAmount");
    const subscriptionType = card.getChildAsComponent("#cardDonationType");
    const message = document.getElementById("successMessage");
    const anchor = card.getElement() as HTMLAnchorElement;

    image.setImage(data.support_campaign.Main_Image);
    (image.getElement() as HTMLImageElement).alt = `${data.campaign_name} - Campaign Image`;

    campaignName.setText(data.campaign_name);
    subtitle.setText(
      data.keep_anonymous
        ? "Anonymous Donation"
        : `Thank you${data.customer_first_name ? ", " + data.customer_first_name : ""}!`
    );
    amount.setText(`$${data.amount.toFixed(2)}`);

    if (subscriptionType) {
      const subType = data.donation_subscription?.subscription_type?.toLowerCase();
      let label = "One-Time";
      if (subType === "year") label = "Annually";
      else if (subType === "month") label = "Monthly";
      subscriptionType.setText(label);
    }

    if (message) {
      message.innerHTML = data.support_campaign.Success_Page_Message;
      message.style.display = "block";
    }

    // Always set the link (no auth_config check)
    const url = new URL(anchor.getAttribute("href") || "#", window.location.origin);
    url.searchParams.set("donation", data.uuid);
    anchor.setAttribute("href", url.toString());

    card.getElement().style.display = "block";
  } catch (err) {
    console.error("Error loading donation success data:", err);
    alert("We couldn’t load your donation confirmation. Please contact support.");
  }
}

document.addEventListener("DOMContentLoaded", handleDonationSuccess);
