import { apiClient } from "./apiConfig";
import { saveState } from "../modules/registration/state/registrationState";

export interface StudentProfile {
  id: number;
  first_name: string;
  last_name: string;
  Status: string;
}

interface StudentProfileApiResponse {
  students: StudentProfile[];
}

interface FetchStudentProfilesResult {
  students: StudentProfile[];
  showDialog: boolean;
}

// Function to fetch student profiles from the server
export const fetchStudentProfiles =
  async (): Promise<FetchStudentProfilesResult> => {
    try {
      const response = await apiClient
        .get<StudentProfileApiResponse>("/profiles/student_profiles")
        .fetch();
      if (response.students) {
        // Filter students with status "Pending"
        const pendingStudents = response.students.filter(
          (student) => student.Status === "Pending"
        );
        const pendingStudentNames = pendingStudents.map(
          (student) => `${student.first_name} ${student.last_name}`
        );

        // Log names of pending students (for debugging purposes)
        console.log("Pending Students:", pendingStudentNames);

        // Update registrationState with pending students
        saveState({ pendingStudents: pendingStudentNames });

        // Check if there are no students and indicate that the dialog should be shown
        return {
          students: response.students,
          showDialog: response.students.length === 0,
        };
      } else {
        console.error("No students property in response");
        return { students: [], showDialog: true };
      }
    } catch (error) {
      console.error("Error fetching student profiles:", error);
      return { students: [], showDialog: true };
    }
  };
