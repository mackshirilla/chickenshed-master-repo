import { WFDynamicList, WFComponent } from "@xatom/core";
import { fetchCampaigns, Campaign } from "../../api/campaigns";
import { saveSelectedCampaign } from "./state/donationState";

let selectedCampaignId: string | null = null;

// Function to log the current state to localStorage
const logState = () => {
  const state = JSON.parse(localStorage.getItem("donationState") || "{}");
  state.selectedCampaignId = selectedCampaignId;
  console.log("Logging state to localStorage:", state);
  localStorage.setItem("donationState", JSON.stringify(state));
};

// Store the initial template state of the container
let initialTemplateState: HTMLElement | null = null;

export const initializeCampaignList = async (
  containerSelector: string
): Promise<Campaign[]> => {
  const container = document.querySelector(containerSelector);
  if (!container) {
    console.error("Campaign list container not found.");
    return [];
  }

  // Capture the initial template state if not already captured
  if (!initialTemplateState) {
    initialTemplateState = container.cloneNode(true) as HTMLElement;
  }

  // Clear the existing list by resetting the container to its initial state
  container.innerHTML = "";
  container.appendChild(initialTemplateState.cloneNode(true));

  const list = new WFDynamicList<Campaign>(containerSelector, {
    rowSelector: "#cardSelectProduction",
    loaderSelector: "#productionListLoading",
    emptySelector: "#productionListEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  let campaigns: Campaign[] = [];

  list.rowRenderer(({ rowData, rowElement, index }) => {
    const campaignCard = new WFComponent(rowElement);
    const campaignTitle = campaignCard.getChildAsComponent("#cardCampaignTitle");
    const campaignSubheading = campaignCard.getChildAsComponent("#cardCampaignSubheading");
    const campaignDescription = campaignCard.getChildAsComponent("#cardCampaignDescription");
    const campaignImage = campaignCard.getChildAsComponent("#cardCampaignImage");
    const campaignInput = campaignCard.getChildAsComponent(".input_card_input");
    const campaignLabel = campaignCard.getChildAsComponent("label");

    if (
      !campaignTitle ||
      !campaignSubheading ||
      !campaignDescription ||
      !campaignInput ||
      !campaignImage ||
      !campaignLabel
    ) {
      console.error("Campaign elements not found.");
      return;
    }

    const inputId = `campaignInput-${index}`;
    campaignInput.setAttribute("id", inputId);
    campaignInput.setAttribute("value", rowData.id.toString());
    campaignLabel.setAttribute("for", inputId);

    campaignTitle.setText(rowData.Name);
    campaignSubheading.setText(rowData.Subheading);
    campaignDescription.setText(rowData.Short_Description);

    if (rowData.Main_Image) {
      campaignImage.setAttribute("src", rowData.Main_Image);
    } else {
      console.warn(`Campaign ID ${rowData.id} does not have a main image.`);
    }

    campaignInput.on("change", () => {
      selectedCampaignId = rowData.id.toString();
      saveSelectedCampaign({
        id: rowData.id.toString(),
        name: rowData.Name,
        imageUrl: rowData.Main_Image,
        description: rowData.Short_Description,
        subheading: rowData.Subheading,
      });
      logState();
      console.log("Selected Campaign ID:", selectedCampaignId);
    });

    rowElement.setStyle({ display: "flex" });
    campaigns.push(rowData);

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    campaigns = await fetchCampaigns();
    console.log("Fetched campaigns:", campaigns);

    if (campaigns.length > 0) {
      list.setData(campaigns);
    } else {
      list.setData([]);
    }
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading campaigns:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }

  return campaigns;
};
