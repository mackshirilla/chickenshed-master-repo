import { apiClient } from "./apiConfig";
import { Performance } from "./performances"; // Import Performance interface

export interface TicketTier {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    "sold-quantity": number;
    quantity: number;
    "reserved-quantity": number;
    name: string;
    slug: string;
    "ticket-tier": string;
    "parent-performance": string;
  };
}

export interface BundleTicket {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    quantity: number;
    name: string;
    slug: string;
    "parent-bundle": string;
    "parent-ticket-tier": string;
  };
  amount_available: number;
}

export interface BundleOffered {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    "short-description": string;
    name: string;
    slug: string;
    product: string;
    "parent-performances": string[];
    "displayed-name": string;
  };
  bundle_tickets: BundleTicket[];
  quantity: number;
  price: string;
}

export interface TicketOffered {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
    "displayed-name": string;
    name: string;
    slug: string;
    "parent-performances": string[];
    product: string;
    "short-description": string;
    "requires-bundle-purchase": boolean;
  };
  quantity: number;
  price: string;
}

interface TicketTiersApiResponse {
  tickets_available: TicketTier[];
  bundles_offered: BundleOffered[];
  tickets_offered: TicketOffered[];
  performance_details: Performance; // Use the imported Performance interface
  location_details: {
    id: string;
    cmsLocaleId: string;
    lastPublished: string;
    lastUpdated: string;
    createdOn: string;
    isArchived: boolean;
    isDraft: boolean;
    fieldData: {
      "address-line-1": string;
      "city-state-zip": string;
      "map-embed": string;
      name: string;
      slug: string;
    };
  };
}

// Fetch ticket tiers from the server
export const fetchTicketTiers = async (selectedPerformanceId: string) => {
  try {
    const response = await apiClient
      .post<TicketTiersApiResponse>("/tickets/ticket_tiers", {
        data: { selectedPerformanceId }, // Send selectedPerformanceId in the body
      })
      .fetch();
    return response;
  } catch (error) {
    console.error("Error fetching ticket tiers:", error);
    throw error;
  }
};
