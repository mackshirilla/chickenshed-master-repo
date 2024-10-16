import { apiClient } from "./apiConfig";

export interface Production {
  id: string;
  fieldData: {
    name: string;
    slug: string;
    subheading: string;
    ageDescription: string;
    shortDescription: string;
    mainImage: {
      url: string;
      alt: string | null;
    };
  };
}

interface ProductionApiResponse {
  productions: Production[];
}

// Fetch productions from the server
export const fetchProductions = async (): Promise<Production[]> => {
  try {
    const response = await apiClient
      .get<ProductionApiResponse>("/tickets/productions")
      .fetch();
    return response.productions;
  } catch (error) {
    console.error("Error fetching productions:", error);
    throw error;
  }
};
