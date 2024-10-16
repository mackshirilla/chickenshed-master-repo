// api/sessions.ts
import { apiClient } from "./apiConfig";

export interface Session {
  id: string;
  fieldData: {
    weekday: string;
    "time-block": string;
    location: string;
    "displayed-annual-price": string;
    "displayed-monthly-price": string;
    "displayed-one-off-price": string;
    "displayed-deposit-price": string;
  };
}

interface SessionApiResponse {
  sessions: Session[];
}

// Function to fetch sessions from the server
export const fetchSessions = async (
  workshopId: string,
  programId: string
): Promise<Session[]> => {
  try {
    const response = await apiClient
      .get<SessionApiResponse>(
        `/registration/sessions?workshop_id=${workshopId}&program_id=${programId}`
      )
      .fetch();
    return response.sessions || [];
  } catch (error) {
    console.error("Error fetching sessions:", error);
    throw error;
  }
};
