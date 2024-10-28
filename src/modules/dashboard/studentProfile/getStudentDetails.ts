// src/modules/pages/studentProfile/getStudentDetails.ts

import { apiClient } from "../../../api/apiConfig";
import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";

export const getStudentDetails = async (studentId: number) => {
  // Show loading spinner
  const loadingSpinner = new WFComponent(".dashboard_loading_wall");
  console.log("Displaying loading spinner");
  loadingSpinner.setStyle({ display: "flex" });

  try {
    const response = await apiClient
      .get(`/dashboard/profiles/student/${studentId}`)
      .fetch();

    if (response) {
      const student = response as any; // Define an interface for better type safety

      // Hide the loading spinner
      triggerSuccessEvent(".success_trigger");

      // Update the breadcrumb with the student's name
      const studentBreadcrumb = new WFComponent("#studentBreadcrumb");
      studentBreadcrumb.setText(`${student.first_name} ${student.last_name}`);

      // Set student name
      const studentFullName = new WFComponent("#studentFullName");
      studentFullName.setText(`${student.first_name} ${student.last_name}`);

      // Set profile picture
      const studentProfilePicture = new WFImage("#studentProfilePicture");
      if (student.profile_pic && student.profile_pic.url) {
        studentProfilePicture.setImage(student.profile_pic.url);
      } else {
        console.log("No profile picture available");
        studentProfilePicture.setImage(
          "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
        );
      }

      // Set email
      const studentEmail = new WFComponent("#studentEmail");
      studentEmail.setText(student.email || "N/A");

      // Set phone
      const studentPhone = new WFComponent("#studentPhone");
      studentPhone.setText(student.phone || "N/A");

      // Set date of birth
      const studentDob = new WFComponent("#studentDob");
      studentDob.setText(student.dob || "N/A");

      // Set gender
      const studentGender = new WFComponent("#studentGender");
      studentGender.setText(student.gender || "N/A");

      // Set school
      const studentSchool = new WFComponent("#studentSchool");
      studentSchool.setText(student.school || "N/A");

      // Set grade
      const studentGrade = new WFComponent("#studentGrade");
      studentGrade.setText(student.grade || "N/A");

      // Set ethnicity (if available)
      const studentEthnicity = new WFComponent("#studentEthnicity");
      studentEthnicity.setText(student.ethnicity || "N/A");

      // Set health information
      const studentHealth = new WFComponent("#studentHealth");
      studentHealth.setText(student.health || "N/A");

      // Set dismissal names
      const studentDismissal = new WFComponent("#studentDismissal");
      studentDismissal.setText(student.dismissal_names || "N/A");

      // Set send texts preference
      const studentTextTrue = new WFComponent("#studentTextTrue");
      const studentTextFalse = new WFComponent("#studentTextFalse");
      if (student.send_texts) {
        studentTextTrue.setStyle({ display: "block" });
        studentTextFalse.setStyle({ display: "none" });
      } else {
        studentTextTrue.setStyle({ display: "none" });
        studentTextFalse.setStyle({ display: "block" });
      }

      // Set independent travel
      const studentTravelTrue = new WFComponent("#studentTravelTrue");
      const studentTravelFalse = new WFComponent("#studentTravelFalse");
      if (student.independent_travel) {
        studentTravelTrue.setStyle({ display: "block" });
        studentTravelFalse.setStyle({ display: "none" });
      } else {
        studentTravelTrue.setStyle({ display: "none" });
        studentTravelFalse.setStyle({ display: "block" });
      }

      // Set photo release
      const studentPhotoTrue = new WFComponent("#studentPhotoTrue");
      const studentPhotoFalse = new WFComponent("#studentPhotoFalse");
      if (student.photo_release) {
        studentPhotoTrue.setStyle({ display: "block" });
        studentPhotoFalse.setStyle({ display: "none" });
      } else {
        studentPhotoTrue.setStyle({ display: "none" });
        studentPhotoFalse.setStyle({ display: "block" });
      }

      // Set status pills
      const studentApprovedPill = new WFComponent("#studentApprovedPill");
      const studentPendingPill = new WFComponent("#studentPendingPill");
      if (student.Status === "Approved") {
        studentApprovedPill.setStyle({ display: "block" });
        studentPendingPill.setStyle({ display: "none" });
      } else {
        studentApprovedPill.setStyle({ display: "none" });
        studentPendingPill.setStyle({ display: "block" });
      }

      // Save student data for later use (e.g., in edit forms)
      localStorage.setItem("current_student", JSON.stringify(student));
    } else {
      // If response is null, display an alert and navigate back
      alert("Error: Received null response from the server.");
      console.error("Received null response from the server.");

      // Navigate back to the previous page
      window.history.back();
    }
  } catch (error: any) {
    console.error("Error fetching student details:", error);
    // Display the error message in an alert box
    alert(`Error fetching student details: ${error.message || error}`);

    // Navigate back to the previous page
    window.history.back();
  } finally {
    // Hide loading spinner in all cases
    loadingSpinner.setStyle({ display: "none" });
  }
};

const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};
