// api/workshops.ts
import { apiClient } from "./apiConfig";

/**
 * Workshop Interface
 * Defines the structure of a Workshop object as returned by the fetchWorkshops API.
 */
export interface Workshop {
  id: string;
  fieldData: {
    name: string;
    shortDescription: string; // Must match the API response
    ageRange: string;         // Must match the API response
    mainImage: {
      url: string;
      alt?: string | null;     // Optional property, can be null as per API response
    };
  };
  registered?: boolean;        // Made optional to align with API definition
}


interface WorkshopApiResponse {
  workshops: Workshop[];
}

// Function to fetch workshops for a given program from the server
export const fetchWorkshops = async (
  programId: string
): Promise<Workshop[]> => {
  try {
    const response = await apiClient
      .get<WorkshopApiResponse>(
        `/registration/workshops?program_id=${programId}`
      )
      .fetch();
    return response.workshops;
  } catch (error) {
    console.error("Error fetching workshops:", error);
    throw error;
  }
};

// Function to fetch workshop details by ID
export const fetchWorkshopById = async (
  workshopId: string
): Promise<Workshop | null> => {
  try {
    // Assuming there's a similar endpoint to fetch a single workshop by ID
    const response = await apiClient
      .get<{ workshop: Workshop }>(`/registration/workshops/${workshopId}`)
      .fetch();
    return response.workshop || null;
  } catch (error) {
    console.error(`Error fetching workshop with ID ${workshopId}:`, error);
    return null;
  }
};