// src/modules/pages/studentProfile/studentRegistrations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";

// Define the interface for the registration data
interface Registration {
  id: number;
  created_at: number;
  status: string;
  subscription_type: string;
  program_name: string;
  workshop_name?: string; // Marked as optional
  weekday: string;
  location: string;
  time_block: string;
  session_id: string;
  price_id: string;
  user_id: number;
  subscription_id: number;
  student_profile_id: number;
  cancellation_reason: string;
  image_url: string;
  program_id: string;
  workshop_id?: string; // Marked as optional
  // Additional fields if needed
  // first_name?: string;
  // last_name?: string;
}

/**
 * Function to fetch registrations for a student.
 * @param studentId - The ID of the student.
 * @returns A promise that resolves to an array of Registration objects.
 */
export async function fetchStudentRegistrations(
  studentId: number
): Promise<Registration[]> {
  try {
    const response = await apiClient
      .get(`/dashboard/profiles/student/${studentId}/registrations`)
      .fetch();

    if (response) {
      const registrations = response as Registration[];
      return registrations;
    } else {
      console.error("No registrations found for the student.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching student registrations:", error);
    return [];
  }
}

/**
 * Function to initialize the dynamic list of registrations.
 * @param studentId - The ID of the student.
 */
export async function initializeStudentRegistrations(studentId: number) {
  // Initialize the dynamic list
  const list = new WFDynamicList<Registration>("#listRegistration", {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  // Customize the rendering of the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  // Customize the rendering of the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "flex",
    });
    return emptyElement;
  });

  /**
   * Customize the rendering of each registration card.
   * This includes adding necessary classes and data attributes for breadcrumb tracking.
   */
  list.rowRenderer(({ rowData, rowElement }) => {
    const registrationCard = new WFComponent(rowElement);

    // Retrieve the student's name from localStorage
    const currentStudent = localStorage.getItem("current_student");
    let studentName = "N/A";
    if (currentStudent) {
      try {
        const student = JSON.parse(currentStudent);
        studentName =
          `${student.first_name || ""} ${student.last_name || ""}`.trim() ||
          "N/A";
      } catch (parseError) {
        console.error(
          "Error parsing current_student from localStorage:",
          parseError
        );
      }
    } else {
      console.warn("current_student not found in localStorage.");
    }

    // Build the base URL with required parameters
    let href = `/dashboard/registration/subscription/workshop?program=${encodeURIComponent(
      rowData.program_id
    )}&subscription=${encodeURIComponent(rowData.subscription_id)}`;

    // Conditionally add the workshop parameter if workshop_id is present and not empty
    if (rowData.workshop_id && rowData.workshop_id.trim() !== "") {
      href += `&workshop=${encodeURIComponent(rowData.workshop_id)}`;
    }

    // Set the href attribute
    registrationCard.setAttribute("href", href);

    // Add the 'registration-link' class for event delegation
    registrationCard.addCssClass("registration-link");

    /**
     * Set data attributes required for breadcrumb tracking.
     * These attributes are essential for the registrationBreadcrumbs.ts module to function correctly.
     */
    registrationCard.setAttribute(
      "data-student-id",
      String(rowData.student_profile_id)
    );
    registrationCard.setAttribute("data-student-name", studentName);
    registrationCard.setAttribute(
      "data-workshop-name",
      rowData.workshop_name || ""
    );
    registrationCard.setAttribute(
      "data-workshop-id",
      rowData.workshop_id || ""
    );
    registrationCard.setAttribute(
      "data-program-name",
      rowData.program_name || ""
    );
    registrationCard.setAttribute("data-program-id", rowData.program_id || "");
    registrationCard.setAttribute(
      "data-subscription-id",
      String(rowData.subscription_id)
    );

    // Update the program name
    const programName =
      registrationCard.getChildAsComponent("#cardProgramName");
    if (programName) {
      programName.setText(rowData.program_name || "N/A");
    } else {
      console.warn("#cardProgramName not found in registrationCard.");
    }

    // Update the workshop name, if available
    const workshopName =
      registrationCard.getChildAsComponent("#cardWorkshopName");
    if (workshopName) {
      workshopName.setText(rowData.workshop_name || " ");
    } else {
      console.warn("#cardWorkshopName not found in registrationCard.");
    }

    // Update the registration image
    const registrationImageElement = registrationCard.getChildAsComponent(
      "#cardRegistrationImage"
    );
    if (registrationImageElement) {
      const registrationImage = new WFImage(
        registrationImageElement.getElement()
      );
      if (rowData.image_url) {
        registrationImage.setImage(rowData.image_url);
      } else {
        registrationImage.setImage(
          "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
        );
      }
    } else {
      console.warn("#cardRegistrationImage not found in registrationCard.");
    }

    // Update the status pills
    const activePill = registrationCard.getChildAsComponent("#cardActivePill");
    const depositPill =
      registrationCard.getChildAsComponent("#cardDepositPill");

    if (activePill && depositPill) {
      if (rowData.status === "Active") {
        activePill.setStyle({ display: "block" });
        depositPill.setStyle({ display: "none" });
      } else if (rowData.status === "Deposit Paid") {
        activePill.setStyle({ display: "none" });
        depositPill.setStyle({ display: "block" });
      } else {
        // Handle other statuses if needed
        activePill.setStyle({ display: "none" });
        depositPill.setStyle({ display: "none" });
      }
    } else {
      console.warn(
        "Status pills (#cardActivePill or #cardDepositPill) not found in registrationCard."
      );
    }

    // Show the registration card
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display the student's registrations
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const registrations = await fetchStudentRegistrations(studentId);

    // Sort registrations by created_at date (optional)
    registrations.sort((a, b) => b.created_at - a.created_at);

    // Set the data for the dynamic list
    list.setData(registrations);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing student registrations:", error);

    // Set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
