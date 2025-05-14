import { apiClient } from "./apiConfig";
import { Performance } from "./performances";

/**
 * Availability record for each ticket tier
 */
export interface TicketTierAvailability {
  id: number;
  Parent_Performance: number;
  Ticket_Tier: number;
  Quantity_Available: number;
  Reserved_Quantity: number;
  Sold_Quantity: number;
}

/**
 * Bundle structure as returned in nested arrays
 */
export interface BundleOfferedFlat {
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
  Short_Description: string;
  Product: number;

  /** full product details for pricing display */
  product_details: {
    id: number;
    Product_name: string;
    category?: string;
    Product_id?: string;
    Single_sale_price_id: string;
    Displayed_single_sale_price: string;
    Single_sale_price_amount: number;
  };
}

/**
 * Ticket tier structure as returned in nested arrays
 */
export interface TicketOfferedFlat {
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
  Short_Description: string;
  Requires_Bundle_Purchase: boolean;
  Product: number;

  /** full product details for pricing display */
  product_details: {
    id: number;
    Product_name: string;
    category?: string;
    Product_id?: string;
    Single_sale_price_id: string;
    Displayed_single_sale_price: string;
    Single_sale_price_amount: number;
  };
}

/**
 * Venue/location details
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
 * Bundle availability calculated by Xano
 */
export interface BundleAvailability {
  bundle_id: number;
  bundle_name: string;
  max_available: number;
}

/**
 * Full API response for ticket tiers step
 */
export interface TicketTiersApiResponse {
  tickets_available: TicketTierAvailability[];
  performance_details: Performance & {
    ticket_tiers_offered: TicketOfferedFlat[][];
    ticket_bundles_offered: BundleOfferedFlat[][];
    Custom_Question: string;
    Location: number;
  };
  location_details: LocationDetails;
  bundles_available: BundleAvailability[];  // <-- added this
}

/**
 * Fetch ticket tiers (and availability, bundles, bundles & location) for a performance
 */
export const fetchTicketTiers = async (
  selectedPerformanceId: string
): Promise<TicketTiersApiResponse> => {
  try {
    const response = await apiClient
      .post<TicketTiersApiResponse>("/tickets/ticket_tiers", {
        data: { selectedPerformanceId },
      })
      .fetch();
    return response;
  } catch (error) {
    console.error("Error fetching ticket tiers:", error);
    throw error;
  }
};
