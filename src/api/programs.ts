// api/programs.ts
import { apiClient } from "./apiConfig";

export interface Program {
  id: string;
  fieldData: {
    name: string;
    shortDescription: string;
    ageRange: string;
    mainImage: {
      url: string;
      alt: string | null;
    };
  };
  registered?: boolean;
}

interface ProgramApiResponse {
  programs: Program[];
}

// Function to fetch programs from the server
export const fetchPrograms = async (): Promise<Program[]> => {
  try {
    const response = await apiClient
      .get<ProgramApiResponse>("/registration/programs")
      .fetch();
    return response.programs;
  } catch (error) {
    console.error("Error fetching programs:", error);
    throw error;
  }
};

// Function to fetch program details by ID
export const fetchProgramById = async (
  programId: string
): Promise<Program | null> => {
  try {
    const programs = await fetchPrograms();
    return programs.find((program) => program.id === programId) || null;
  } catch (error) {
    console.error(`Error fetching program with ID ${programId}:`, error);
    return null;
  }
};
