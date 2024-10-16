// src/pages/list-student-profiles.ts

import { initializeDynamicStudentList } from "./listStudents";
import { initializeDynamicAdditionalStudentList } from "./listAdditionalStudents";
import { initializeDynamicCaregiverList } from "./listCaregivers";

export const listStudentProfilesPage = async () => {
  console.log("List Student Profiles Page loaded");

  try {
    console.log("Initializing student list");
    await initializeDynamicStudentList("#listStudentProfiles");
    await initializeDynamicAdditionalStudentList(
      "#listAdditionalStudentProfiles"
    );
    await initializeDynamicCaregiverList("#caregiversList");

    console.log("Dynamic student lists initialized successfully");
  } catch (error) {
    console.error("Error initializing dynamic student lists:", error);
  }
};
