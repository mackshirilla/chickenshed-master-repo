import { WFComponent } from "@xatom/core";
import { getSelectedCampaign } from "../state/donationState";

// Function to update the selected campaign display
export const updateSelectedCampaignDisplay = () => {
  const selectedCampaign = getSelectedCampaign();

  if (!selectedCampaign) {
    console.error("No selected campaign found in the state.");
    return;
  }

  const { name, subheading, description, imageUrl } = selectedCampaign;

  // Ensure all necessary elements exist before updating them
  const selectedCampaignTitle = new WFComponent("#selectedCampaignTitle");
  const selectedCampaignSubtitle = new WFComponent("#selectedCampaignSubtitle");
  const selectedCampaignDescription = new WFComponent(
    "#selectedCampaignDescription"
  );
  const selectedImage = new WFComponent<HTMLImageElement>("#selectedImage");

  // Update the campaign details
  selectedCampaignTitle.setText(name || "N/A");
  selectedCampaignSubtitle.setText(subheading || "No subheading available.");
  selectedCampaignDescription.setText(
    description || "No description available."
  );

  if (imageUrl) {
    selectedImage.setAttribute("src", imageUrl);
  } else {
    selectedImage.setAttribute(
      "src",
      "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
    );
  }
};
