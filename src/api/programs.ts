// src/api/programs.ts

import { apiClient } from "./apiConfig";

// Updated Program interface to match the API response structure
export interface Program {
  id: number; // Changed from string to number
  name: string;
  slug: string;
  Collection_ID: string;
  Locale_ID: string;
  Item_ID: string;
  Created_On: string;
  Updated_On: string;
  Published_On: string;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Program_Overview_Description: string;
  Sort_Order: number;
  Color_Theme: number;
  Inquiry_Only: boolean;
  "1st_Semester_Start_Date": string | null;
  "2nd_Semester_Charge_Date": string | null;
  Subscription_Pause_Date: string | null;
  Success_Page_Message: string;
  registered?: boolean; // Optional property
}

// Interface for the API response
interface ProgramApiResponse {
  programs: Program[];
}

// Function to fetch programs from the server
export const fetchPrograms = async (): Promise<Program[]> => {
  try {
    const response = await apiClient
      .get<ProgramApiResponse>("/registration/programs_new")
      .fetch();
    return response.programs;
  } catch (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
};

// Function to fetch program details by ID
export const fetchProgramById = async (
  programId: number // Changed to number to match the ID type
): Promise<Program | null> => {
  try {
    const programs = await fetchPrograms();
    return programs.find((program) => program.id === programId) || null;
  } catch (error) {
    console.error(`Error fetching program with ID ${programId}:`, error);
    return null;
  }
};
