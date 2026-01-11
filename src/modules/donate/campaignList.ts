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

type SafeCampaignRow = {
  id: number | string | null;
  Name?: string | null;
  Subheading?: string | null;
  Short_Description?: string | null;
  Main_Image?: string | null;
};

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
    const row = rowData as unknown as SafeCampaignRow;

    // Normalize strings (no undefined/null into setters)
    const safeName = row.Name ?? "";
    const safeSubheading = row.Subheading ?? "";
    const safeDesc = row.Short_Description ?? "";
    const safeImg = row.Main_Image ?? "";

    // ID must exist (or we can't select it)
    const idNum = Number(row.id);
    const hasValidId = Number.isFinite(idNum) && idNum > 0;

    const campaignCard = new WFComponent(rowElement);
    const campaignTitle = campaignCard.getChildAsComponent("#cardCampaignTitle");
    const campaignSubheading =
      campaignCard.getChildAsComponent("#cardCampaignSubheading");
    const campaignDescription =
      campaignCard.getChildAsComponent("#cardCampaignDescription");
    const campaignImage = campaignCard.getChildAsComponent("#cardCampaignImage");
    const campaignInput = campaignCard.getChildAsComponent(".input_card_input");
    const campaignLabel = campaignCard.getChildAsComponent("label");

    // Required DOM only
    if (!campaignTitle || !campaignInput || !campaignLabel) {
      console.error("Required campaign elements not found.");
      return;
    }

    // If optional elements are missing, that's OK (we'll just skip setting them)
    // But if ID is invalid/null, hide the row to avoid crashes / bad selections
    if (!hasValidId) {
      console.warn("[CampaignList] Skipping row with invalid id:", row);
      rowElement.setStyle({ display: "none" });
      return;
    }

    const inputId = `campaignInput-${index}`;
    campaignInput.setAttribute("id", inputId);
    campaignInput.setAttribute("value", String(idNum));
    campaignLabel.setAttribute("for", inputId);

    campaignTitle.setText(safeName);
    campaignSubheading?.setText(safeSubheading);
    campaignDescription?.setText(safeDesc);

    if (campaignImage) {
      if (safeImg) {
        campaignImage.setAttribute("src", safeImg);
        campaignImage.setAttribute("alt", safeName || "Campaign Image");
        campaignImage.setStyle({ display: "" });
      } else {
        // Hide image if missing
        campaignImage.setAttribute("src", "");
        campaignImage.setStyle({ display: "none" });
        console.warn(`Campaign ID ${idNum} does not have a main image.`);
      }
    }

    campaignInput.on("change", () => {
      selectedCampaignId = String(idNum);

      saveSelectedCampaign({
        id: String(idNum),
        name: safeName,
        imageUrl: safeImg,
        description: safeDesc,
        subheading: safeSubheading,
      });

      logState();
      console.log("Selected Campaign ID:", selectedCampaignId);
    });

    rowElement.setStyle({ display: "flex" });

    // NOTE: pushing here duplicates data across renders; keep it if you *need*
    // it for debugging, otherwise it can grow unexpectedly on re-init.
    // campaigns.push(rowData);

    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);

    campaigns = await fetchCampaigns();
    console.log("Fetched campaigns:", campaigns);

    list.setData(Array.isArray(campaigns) ? campaigns : []);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading campaigns:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
    campaigns = [];
  }

  return campaigns;
};
