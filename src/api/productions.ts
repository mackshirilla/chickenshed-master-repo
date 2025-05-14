// src/api/productions.ts

import { apiClient } from "./apiConfig";

export interface Production {
  /** now a number */
  id: number;
  Name: string;
  Short_Description: string;
  Main_Image: string;
  Age_Description: string;
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
