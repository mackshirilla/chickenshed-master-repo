// src/pages/donationDetails.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { CancelDonationSubscriptionDialog } from "./components/CancelDonationSubscriptionDialog";

interface SupportCampaign {
  id: number;
  Name: string;
  Main_Image: string;
  Subheading: string;
  Short_Description: string;
}

interface DonationSubscription {
  id: number;
  subscription_type: string;
  status?: string;
}

interface Donation {
  id: number;
  uuid: string;
  created_at: number;
  amount: number;
  keep_anonymous: boolean;
  in_name_of: string;
  campaign_name: string;
  support_campaign?: SupportCampaign | null;
  donation_subscription?: DonationSubscription;
}

export async function initializeDonationDetailsPage() {
  if (window.location.pathname === "/donation-details") {
    const breadcrumbs = new WFComponent(".breadcrumbs_container");
    breadcrumbs.setStyle({ display: "none" });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const donationUuid = urlParams.get("donation");
  if (!donationUuid) {
    console.error("Missing donation UUID");
    return;
  }

  try {
    const request = apiClient.get<{ donation: Donation }>(`/dashboard/donations/${donationUuid}`);
    const response = await request.fetch();
    const { donation } = response;

    const campaign = donation.support_campaign;
    const campaignImage = new WFImage("#campaignImage");

    const fallbackImageUrl = "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg";

if (campaign && campaign.Main_Image) {
  campaignImage.setImage(campaign.Main_Image);
  campaignImage.getElement().setAttribute("alt", `${campaign.Name} - Campaign Image`);
} else {
  campaignImage.setImage(fallbackImageUrl);
  campaignImage.getElement().setAttribute("alt", "Default campaign image");
}

campaignImage.setStyle({ display: "block" }); // Always show it

    const campaignName = new WFComponent("#campaignName");
    const campaignSubheading = new WFComponent("#campaignSubheading");
    const campaignBreadcrumb = new WFComponent("#campaignBreadcrumb");
    const campaignShortDescription = new WFComponent("#campaignShortDescription");

    const donationDate = new Date(donation.created_at).toLocaleDateString([], {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });

    if (campaign) {
      campaignName.setText(campaign.Name);
      campaignSubheading.setText(campaign.Subheading);
      campaignShortDescription.setText(campaign.Short_Description);
      campaignBreadcrumb.setText(`${campaign.Name} - ${donationDate}`);
    } else {
      campaignName.setText(donation.campaign_name || "Support Campaign");
      campaignSubheading.setStyle({ display: "none" });
      campaignShortDescription.setStyle({ display: "none" });
      campaignBreadcrumb.setText(`${donation.campaign_name || "Donation"} - ${donationDate}`);
    }

    const anonymousTrue = new WFComponent("#anonymousTrue");
    const anonymousFalse = new WFComponent("#anonymousFalse");
    if (donation.keep_anonymous) {
      anonymousTrue.setStyle({ display: "block" });
      anonymousFalse.setStyle({ display: "none" });
    } else {
      anonymousTrue.setStyle({ display: "none" });
      anonymousFalse.setStyle({ display: "block" });
    }

    const donationAmount = new WFComponent("#invoiceAmount");
    donationAmount.setText(`$${donation.amount.toFixed(2)}`);

    const donationDateComp = new WFComponent("#invoiceDate");
    donationDateComp.setText(donationDate);

    const inNameOfHeader = new WFComponent("#inNameOfHeader");
    const inNameOfCell = new WFComponent("#inNameOfCell");
    if (donation.in_name_of?.trim()) {
      inNameOfHeader.setStyle({ display: "table-cell" });
      inNameOfCell.setStyle({ display: "table-cell" });
      inNameOfCell.setText(donation.in_name_of);
    } else {
      inNameOfHeader.setStyle({ display: "none" });
      inNameOfCell.setStyle({ display: "none" });
    }

    const subscriptionTypeComp = new WFComponent("#donationType");
    const subType = donation.donation_subscription?.subscription_type;
    subscriptionTypeComp.setText(
      subType === "month" ? "Monthly" : subType === "year" ? "Annually" : "One-Time"
    );

    const cancelWrap = new WFComponent("#cancelSubscriptionWrap");
    const cancelledText = new WFComponent("#subscriptionCancelledText");

    const isOneTime = !subType || (subType !== "month" && subType !== "year");
    const isCancelled = donation.donation_subscription?.status === "Cancelled";

    if (isOneTime || isCancelled) {
      cancelWrap.setStyle({ display: "none" });
    } else {
      new CancelDonationSubscriptionDialog({
        containerSelector: "#cancelSubscriptionWrap",
        subscriptionId: String(donation.donation_subscription.id),
        onCancelSuccess: () => {
          window.location.reload();
        },
      });
    }

    cancelledText.setStyle({ display: isCancelled ? "block" : "none" });

    const trigger = document.querySelector(".success_trigger");
    if (trigger instanceof HTMLElement) {
      trigger.click();
    }
  } catch (error) {
    console.error("Failed to initialize donation details page:", error);
  }
}
