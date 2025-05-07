// src/modules/pages/studentProfile/studentRegistrations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";

// ----- UPDATED INTERFACES BASED ON YOUR RESPONSE -----

interface SessionDetails {
  Name: string;
  location_details?: {
    Name: string;
  };
}

interface Registration {
  id: number;
  status: string;
  student_id: number;
  program_id: number;
  workshop_id: number | null;
  session_id: number;
  subscription_id: number;
  created_at: number;

  program_name: string;
  workshop_name: string;
  weekday: string;
  time_block: string;
  location: string; // top‐level location string (may be empty)

  session_details: SessionDetails;
}

// ----- FETCHING FUNCTION -----

export async function fetchStudentRegistrations(
  studentId: number
): Promise<Registration[]> {
  try {
    return (
      (await apiClient
        .get<Registration[]>(
          `/dashboard/profiles/student/${studentId}/registrations`
        )
        .fetch()) || []
    );
  } catch (error) {
    console.error("Error fetching student registrations:", error);
    return [];
  }
}

// ----- INITIALIZER FOR THE DYNAMIC LIST -----

export async function initializeStudentRegistrations(studentId: number) {
  const list = new WFDynamicList<Registration>("#listRegistration", {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  // Loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  // Empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  // Each card
  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // Build link to session details
    const url = new URL("/dashboard/registration/session", window.location.origin);
    url.searchParams.set("program",      String(rowData.program_id));
    url.searchParams.set("subscription", String(rowData.subscription_id));
    if (rowData.workshop_id !== null) {
      url.searchParams.set("workshop", String(rowData.workshop_id));
    }
    url.searchParams.set("session",      String(rowData.session_id));
    card.setAttribute("href", url.toString());
    card.addCssClass("registration-link");

    // Title: session name, fallback to workshop or program
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionTitle")
      ?.setText(
        rowData.session_details.Name ||
        rowData.workshop_name ||
        rowData.program_name
      );

    // Day & time
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionDay")
      ?.setText(rowData.weekday);
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionTimeBlock")
      ?.setText(rowData.time_block);

    // Location: try nested, then top‐level
    const nestedLoc = rowData.session_details.location_details?.Name;
    const loc = nestedLoc && nestedLoc !== "" ? nestedLoc : rowData.location;
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionLocation")
      ?.setText(loc);

    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load data
  list.changeLoadingStatus(true);
  const regs = await fetchStudentRegistrations(studentId);
  regs.sort((a, b) => b.created_at - a.created_at);
  list.setData(regs);
  list.changeLoadingStatus(false);
}
