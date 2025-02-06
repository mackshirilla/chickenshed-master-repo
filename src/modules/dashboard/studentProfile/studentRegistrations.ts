// src/modules/pages/studentProfile/studentRegistrations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";

// ----- NEW INTERFACES BASED ON UPDATED RESPONSE -----

interface ProgramDetails {
  id: number;
  name: string;
  Main_Image: string;
}

interface WorkshopDetails {
  id: number;
  Name: string;
}

// The shape of each registration item in the new array
interface Registration {
  id: number;
  status: string;
  subscription_type: string;
  program: number;          // Program ID
  workshop: number;         // Workshop ID (could be 0 if no workshop)
  session: number;
  subscription_id: number;
  price_id: string;
  user_id: number;
  student_profile_id: number;
  cancellation_reason: string;
  created_at: number;

  // Nested objects for program/workshop details
  program_details: ProgramDetails;
  workshop_details?: WorkshopDetails; // Optional if missing

  // Additional fields if needed
}

// ----- FETCHING FUNCTION -----

/**
 * Fetch registrations for a student from the new endpoint/response.
 */
export async function fetchStudentRegistrations(
  studentId: number
): Promise<Registration[]> {
  try {
    const response = await apiClient
      .get(`/dashboard/profiles/student/${studentId}/registrations`)
      .fetch();

    // The API directly returns an array of Registration objects
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

// ----- INITIALIZER FOR THE DYNAMIC LIST -----

/**
 * Initializes the dynamic list of registrations for a given student.
 * @param studentId - The ID of the student.
 */
export async function initializeStudentRegistrations(studentId: number) {
  // 1) Create the dynamic list
  const list = new WFDynamicList<Registration>("#listRegistration", {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  // 2) Customize the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  // 3) Customize the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  // 4) Customize how each row (registration card) is rendered
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

    // Build the link
    // rowData.program is the numeric Program ID
    // rowData.subscription_id is the numeric subscription
    // rowData.workshop might be 0 if no workshop
    let href = `/dashboard/registration/subscription/workshop?program=${encodeURIComponent(
      String(rowData.program)
    )}&subscription=${encodeURIComponent(String(rowData.subscription_id))}`;

    // If workshop > 0, add workshop param
    if (rowData.workshop && rowData.workshop !== 0) {
      href += `&workshop=${encodeURIComponent(String(rowData.workshop))}`;
    }

    // Set this link on the card element
    registrationCard.setAttribute("href", href);

    // Add the 'registration-link' class for possible event delegation
    registrationCard.addCssClass("registration-link");

    // ----- Breadcrumb Data Attributes -----
    registrationCard.setAttribute("data-student-id", String(rowData.student_profile_id));
    registrationCard.setAttribute("data-student-name", studentName);

    // The new data has `program_details` and possibly `workshop_details`
    const programNameStr = rowData.program_details.name || "";
    const workshopNameStr = rowData.workshop_details?.Name || "";

    registrationCard.setAttribute("data-program-name", programNameStr);
    registrationCard.setAttribute("data-program-id", String(rowData.program));

    // If there's a real workshop, store it
    if (rowData.workshop && rowData.workshop !== 0) {
      registrationCard.setAttribute("data-workshop-name", workshopNameStr);
      registrationCard.setAttribute("data-workshop-id", String(rowData.workshop));
    } else {
      // No workshop
      registrationCard.setAttribute("data-workshop-name", "");
      registrationCard.setAttribute("data-workshop-id", "");
    }

    registrationCard.setAttribute(
      "data-subscription-id",
      String(rowData.subscription_id)
    );

    // ----- Update UI Elements in the Card -----

    // #cardProgramName => from rowData.program_details.name
    const programNameCmp = registrationCard.getChildAsComponent("#cardProgramName");
    if (programNameCmp) {
      programNameCmp.setText(programNameStr || "N/A");
    } else {
      console.warn("#cardProgramName not found in registrationCard.");
    }

    // #cardWorkshopName => from rowData.workshop_details?.Name
    const workshopNameCmp = registrationCard.getChildAsComponent("#cardWorkshopName");
    if (workshopNameCmp) {
      workshopNameCmp.setText(workshopNameStr || "");
    } else {
      console.warn("#cardWorkshopName not found in registrationCard.");
    }

    // #cardRegistrationImage => from rowData.program_details.Main_Image
    // (The new response does not include a direct image_url for each registration,
    //  so we'll assume the program image is the fallback.)
    const registrationImageElement = registrationCard.getChildAsComponent(
      "#cardRegistrationImage"
    );
    if (registrationImageElement) {
      const registrationImage = new WFImage(registrationImageElement.getElement());
      if (rowData.program_details?.Main_Image) {
        registrationImage.setImage(rowData.program_details.Main_Image);
      } else {
        registrationImage.setImage(
          "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
        );
      }
    } else {
      console.warn("#cardRegistrationImage not found in registrationCard.");
    }

    // ----- Status Pills (#cardActivePill, #cardDepositPill, etc.) -----
    const activePill = registrationCard.getChildAsComponent("#cardActivePill");
    const depositPill = registrationCard.getChildAsComponent("#cardDepositPill");
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

    // Finally, ensure the card is displayed
    rowElement.setStyle({ display: "block" });

    // Return rowElement to WFDynamicList
    return rowElement;
  });

  // 5) Fetch and load the registrations
  try {
    list.changeLoadingStatus(true);

    const registrations = await fetchStudentRegistrations(studentId);
    // Optionally sort descending by created_at
    registrations.sort((a, b) => b.created_at - a.created_at);

    list.setData(registrations);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing student registrations:", error);
    list.setData([]); // Empty state
    list.changeLoadingStatus(false);
  }
}
