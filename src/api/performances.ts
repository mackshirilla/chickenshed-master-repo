// src/api/performances.ts
import { apiClient } from "./apiConfig";

/**
 * Details about the venue/location
 */
export interface LocationDetails {
  id: number;
  Name: string;
  Slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string | null;
  Updated_On: string | null;
  Published_On: string | null;
  Address_line_1: string;
  City_state_zip: string;
  Map_embed: string;
  Location_Description: string;
}

/**
 * A single performance as returned by `/tickets/performances`.
 */
export interface Performance {
  id: number;
  Name: string;
  Slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Archived: boolean;
  Draft: boolean;
  Created_On: string;
  Updated_On: string;
  Published_On: string;
  Displayed_Name: string;
  Main_Image: string;
  Short_Description: string;
  Sold_Out: boolean;
  /**
   * Unix‐millisecond timestamp
   */
  Date_Time: number;
  Custom_Question: string;
  Parent_Production: number;
  ticket_tiers_offered: number[];
  ticket_bundles_offered: number[];
  Location: number;
  location_details: LocationDetails;
}

interface PerformanceApiResponse {
  performances: Performance[];
}

/**
 * Fetch all performances for a given production.
 */
export const fetchPerformances = async (
  productionId: string
): Promise<Performance[]> => {
  try {
    const { performances } = await apiClient
      .post<PerformanceApiResponse>("/tickets/performances", {
        data: { production_id: productionId },
      })
      .fetch();
    return performances;
  } catch (error) {
    console.error("Error fetching performances:", error);
    throw error;
  }
};
