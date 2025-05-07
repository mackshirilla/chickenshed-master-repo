import { WFComponent } from "@xatom/core";
import { StartRegistrationResponse } from "../../../api/startRegistration";

export function updatePendingStudentsAlert(apiData: StartRegistrationResponse): void {
  const alertBox = new WFComponent("#alertBox");
  const alertPendingStudentList = new WFComponent("#alertPendingStudentList");

  // Check if student_profiles exists in the API response
  if (apiData.student_profiles && Array.isArray(apiData.student_profiles)) {
    // Filter for pending profiles (case-insensitive)
    const pendingStudents = apiData.student_profiles.filter(profile => 
      profile.Status && profile.Status.toLowerCase() === "pending"
    );
    
    if (pendingStudents.length > 0) {
      // Create a comma-separated list of full names
      const names = pendingStudents.map(profile => profile.full_name).join(", ");
      alertPendingStudentList.setText(names);
      alertBox.getElement().style.display = "flex";
      return;
    }
  }
  
  // If no pending students, hide the alert box.
  alertBox.getElement().style.display = "none";
}
