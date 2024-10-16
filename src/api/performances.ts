import { apiClient } from "./apiConfig";

export interface Performance {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    "date-time": string;
    "short-description": string;
    name: string;
    slug: string;
    "parent-production": string;
    location: string;
    "main-image": {
      fileId: string;
      url: string;
      alt: string | null;
    };
    "custom-question": string;
    "displayed-name": string;
  };
  location_name: string;
}

interface PerformanceApiResponse {
  performances: Performance[];
}

// Fetch performances from the server
export const fetchPerformances = async (productionId: string) => {
  try {
    const response = await apiClient
      .post<PerformanceApiResponse>("/tickets/performances", {
        data: { production_id: productionId }, // Send production_id in the body
      })
      .fetch();
    return response.performances;
  } catch (error) {
    console.error("Error fetching performances:", error);
    throw error;
  }
};
