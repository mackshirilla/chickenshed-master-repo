import { apiClient } from "./apiConfig";

export interface Campaign {
  id: string;
  fieldData: {
    name: string;
    subheading: string;
    shortDescription: string;
  };
}

interface CampaignApiResponse {
  campaigns: Campaign[];
}

// Fetch campaigns from the server
export const fetchCampaigns = async (): Promise<Campaign[]> => {
  try {
    const response = await apiClient
      .get<CampaignApiResponse>("/donate/campaigns")
      .fetch();
    return response.campaigns;
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    throw error;
  }
};
