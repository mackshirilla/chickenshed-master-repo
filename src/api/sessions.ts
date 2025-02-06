// api/sessions.ts
import { apiClient } from "./apiConfig";

/**
 * Session Interface
 * Defines the structure of a Session object as used in the frontend.
 */
export interface Session {
  id: string;
  fieldData: {
    weekday: string;
    timeBlock: string;
    location: string;
    displayedAnnualPrice: string;
    displayedMonthlyPrice: string;
    displayedSemesterPrice: string;
    displayedDepositPrice: string;
  };
}

/**
 * ApiSession Interface
 * Represents the structure of each session object as returned by the API.
 */
interface ApiSession {
  id: number;
  Name: string;
  Slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string | null;
  Updated_On: string | null;
  Published_On: string | null;
  Weekday: string;
  Time_block: string;
  Start_Date: string | null;
  End_Date: string | null;
  Location: number;
  Parent_workshop: number;
  Parent_program: number;
  Tuition_product: number;
  Deposit_product: number;
  Location_details: LocationDetails;
  Tuition_product_details: ProductDetails;
  Deposit_product_details: ProductDetails;
}

/**
 * LocationDetails Interface
 * Represents the structure of the Location_details object within a session.
 */
interface LocationDetails {
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
 * ProductDetails Interface
 * Represents the structure of the Tuition_product_details and Deposit_product_details objects.
 */
interface ProductDetails {
  id: number;
  Product_name: string;
  Product_id: string | null;
  created_at: number;
  Annual_price_id: string | null;
  Monthly_price_id: string | null;
  Semester_price_id: string | null;
  Single_sale_price_id: string | null;
  Displayed_annual_price: string | null;
  Displayed_monthly_price: string | null;
  Displayed_semester_price: string | null;
  Displayed_single_sale_price: string | null;
  Annual_price_amount: number;
  Monthly_price_amount: number;
  Semester_price_amount: number;
  Single_sale_price_amount: number;
}

/**
 * SessionApiResponse Interface
 * Represents the overall API response structure.
 */
interface SessionApiResponse {
  sessions: ApiSession[];
}

/**
 * Mapping function to transform ApiSession to Session
 * @param apiSession - The session object received from the API
 * @returns - Transformed Session object for frontend usage
 */
const mapApiSessionToSession = (apiSession: ApiSession): Session => ({
  id: apiSession.id.toString(),
  fieldData: {
    weekday: apiSession.Weekday,
    timeBlock: apiSession.Time_block,
    location: apiSession.Location_details.Name,
    displayedAnnualPrice:
      apiSession.Tuition_product_details.Displayed_annual_price || "",
    displayedMonthlyPrice:
      apiSession.Tuition_product_details.Displayed_monthly_price || "",
    displayedSemesterPrice:
      apiSession.Tuition_product_details.Displayed_semester_price || "",
    displayedDepositPrice:
      apiSession.Deposit_product_details.Displayed_semester_price || "",
  },
});

/**
 * Function to fetch sessions from the server
 * @param workshopId - The ID of the workshop for which to fetch sessions
 * @param programId - The ID of the program
 * @returns - An array of Session objects
 */
export const fetchSessions = async (
  workshopId: string,
  programId: string
): Promise<Session[]> => {
  try {
    const response = await apiClient
      .get<SessionApiResponse>(
        `/registration/sessions_new?workshop_id=${workshopId}&program_id=${programId}`
      )
      .fetch();

    // Ensure sessions is always an array and map each ApiSession to Session
    const sessionArray = Array.isArray(response.sessions)
      ? response.sessions.map(mapApiSessionToSession)
      : [];

    return sessionArray;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};
