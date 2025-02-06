// api/workshops.ts
import { apiClient } from "./apiConfig";

/**
 * Workshop Interface
 * Defines the structure of a Workshop object as used in the frontend.
 */
export interface Workshop {
  id: string;
  fieldData: {
    name: string;
    shortDescription: string; 
    ageRange: string;
    mainImage: {
      url: string;
      alt?: string | null;
    };
    // Include these if you want them in your frontend:
    slug?: string;
    mainVideo?: string;
    subheading?: string;
    priceDescription?: string;
    scheduleDescription?: string;
    financialAidDescription?: string;
    accessibilityDescription?: string;
    workshopOverviewDescription?: string;
    successPageMessage?: string;
    colorTheme?: number;
    parentProgram?: number;
  };
  registered?: boolean; // Optional in case not provided by the API
}

/**
 * ApiWorkshop Interface
 * Represents the structure of each workshop object as returned by the API.
 */
interface ApiWorkshop {
  id: number;
  Name: string;
  Slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string | null;
  Updated_On: string | null;
  Published_On: string | null;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Workshop_Overview_Description: string;
  Success_Page_Message: string;
  Color_Theme: number;
  Parent_Program: number;
  registered?: boolean; // Now optional since not all objects have it
}

/**
 * WorkshopApiResponse Interface
 * Represents the overall API response structure.
 */
interface WorkshopApiResponse {
  workshops: ApiWorkshop[];
}

/**
 * Mapping function to transform ApiWorkshop to Workshop
 * @param apiWorkshop - The workshop object received from the API
 * @returns - Transformed Workshop object for frontend usage
 */
const mapApiWorkshopToWorkshop = (apiWorkshop: ApiWorkshop): Workshop => ({
  id: apiWorkshop.id.toString(),
  fieldData: {
    name: apiWorkshop.Name,
    shortDescription: apiWorkshop.Short_description,
    ageRange: apiWorkshop.Age_range,
    mainImage: {
      url: apiWorkshop.Main_Image,
      alt: null, // Update if alt text is available or if your API provides it
    },
    // Include any additional fields you need on the frontend:
    slug: apiWorkshop.Slug,
    mainVideo: apiWorkshop.Main_Video,
    subheading: apiWorkshop.Subheading,
    priceDescription: apiWorkshop.Price_Description,
    scheduleDescription: apiWorkshop.Schedule_Description,
    financialAidDescription: apiWorkshop.Financial_Aid_Description,
    accessibilityDescription: apiWorkshop.Accessibility_Description,
    workshopOverviewDescription: apiWorkshop.Workshop_Overview_Description,
    successPageMessage: apiWorkshop.Success_Page_Message,
    colorTheme: apiWorkshop.Color_Theme,
    parentProgram: apiWorkshop.Parent_Program,
  },
  // If 'registered' is present in the API, use it; otherwise default to false
  registered: apiWorkshop.registered ?? false,
});

/**
 * Function to fetch workshops for a given program from the server
 * @param programId - The ID of the program for which to fetch workshops
 * @returns - An array of Workshop objects
 */
export const fetchWorkshops = async (
  programId: string
): Promise<Workshop[]> => {
  try {
    const response = await apiClient
      .get<WorkshopApiResponse>(
        `/registration/workshops_new?program_id=${programId}`
      )
      .fetch();
    
    // Ensure workshops is always an array and map each ApiWorkshop to Workshop
    const workshopArray = Array.isArray(response.workshops)
      ? response.workshops.map(mapApiWorkshopToWorkshop)
      : [];

    return workshopArray;
  } catch (error) {
    console.error("Error fetching workshops:", error);
    throw error;
  }
};

/**
 * Function to fetch workshop details by ID
 * @param workshopId - The ID of the workshop to fetch
 * @returns - A Workshop object or null if not found
 */
export const fetchWorkshopById = async (
  workshopId: string
): Promise<Workshop | null> => {
  try {
    // Assuming there's an endpoint to fetch a single workshop by ID
    const response = await apiClient
      .get<{ workshop: ApiWorkshop }>(`/registration/workshops/${workshopId}`)
      .fetch();
    
    if (response.workshop) {
      return mapApiWorkshopToWorkshop(response.workshop);
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error fetching workshop with ID ${workshopId}:`, error);
    return null;
  }
};
