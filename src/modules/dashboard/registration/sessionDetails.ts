// src/pages/sessionDetails.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { RemoveStudentDialog } from "./components/removeStudent";
import { initializeDynamicSessionFileList } from "./components/listSessionFiles";

// -------------------- UPDATED INTERFACES -------------------- //

// Matches the new response for 'workshop'
interface Workshop {
  id: number;
  Name: string;
  Slug: string;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Workshop_Overview_Description: string;
  Success_Page_Message: string;
  Color_Theme: number;
  Parent_Program: number;
}

// Matches the new 'subscription' fields
interface Subscription {
  id: number | string;
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  pending_students: boolean;
  coupon: string;
  deposit_amount: number;
  // Updated here: switched from `string | null` to `number | null`
  start_date: number | null;
  next_charge_date: number | null;
  next_charge_amount: number;
  next_invoice_id: string;
  stripe_subscription_id: string;
  user_id: number;
  contact_id: number;
  sale_id: number;
  cancellation_reason: string;
  created_at: number;
}

// Each 'student' is really an enrolled subscription item (session-student link)
interface Student {
  id: number; // Subscription item ID
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  session: number;
  subscription_id: number;
  price_id: string;
  user_id: number;
  student_profile_id: number;
  cancellation_reason: string;
  created_at: number;
  student_name: string;
  image_url: string | null;
}

// Program object
interface Program {
  id: number | string;
  name: string;
  slug: string;
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
  Sort_Order?: number;
  Color_Theme?: number;
  Inquiry_Only?: boolean;
  "1st_Semester_Start_Date"?: number;
  "2nd_Semester_Charge_Date"?: number;
  "Subscription_Pause_Date"?: number;
  Success_Page_Message?: string;
  // Additional fields as needed
}

// Location object
interface Location {
  id: number;
  Name: string;
  Slug: string;
  Address_line_1: string;
  City_state_zip: string;
  Map_embed: string;
  Location_Description?: string;
}

// Session object
interface SessionObj {
  id: number;
  Name: string;
  Slug: string;
  Weekday: string;
  Time_block: string;
  Start_Date: string | null;
  End_Date: string | null;
  Location: number;
  Parent_workshop: number;
  Parent_program: number;
  Tuition_product: number;
  Deposit_product: number;
}

// The shape of the new response
interface SessionDetailsResponse {
  workshop?: Workshop;             // Possibly undefined
  subscription: Subscription;
  students: Student[];
  program: Program;
  location: Location;
  session: SessionObj;
  caregiver: boolean;
}

// For caregiver breadcrumb logic
interface CaregiverBreadcrumbs {
  student_id: number;
  student_name: string;
  workshop_name: string;
  workshop_id: string;
  program_name: string;
  program_id: string;
  subscription_id: number;
  session_id?: string;
  session_weekday?: string;
  session_time_block?: string;
}

// -------------------- UTILITY / HELPER FUNCTIONS -------------------- //

// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector: string) {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
}

// Function to display an error message on the page and in an alert box
function displayError(message: string) {
  const errorElement = document.querySelector("#listRegistrationEmpty");
  if (errorElement) {
    errorElement.innerHTML = `<div>${message}</div>`;
    errorElement.setAttribute("style", "display: flex;");
  }
  // Also display the error in an alert
  alert(`Error: ${message}`);
}

// -------------------- API CALL -------------------- //

// Function to fetch session details from the API
async function fetchSessionDetails(
  workshopId: string,
  programId: string,
  sessionId: string,
  subscriptionId: string
): Promise<SessionDetailsResponse | undefined> {
  try {
    const getSessionDetailsRequest = apiClient.get<SessionDetailsResponse>(
      `/dashboard/registration/session/${sessionId}`,
      {
        data: {
          workshop_id: workshopId,
          program_id: programId,
          session_id: sessionId,
          subscription: subscriptionId,
        },
      }
    );

    const response = await getSessionDetailsRequest.fetch();
    return response;
  } catch (error: any) {
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    alert(`Error: ${errorMessage}`);

    // Navigate back
    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "/dashboard/registrations");

    console.error("Fetch Session Details Error:", error);
    return undefined;
  }
}

// -------------------- MAIN INITIALIZER -------------------- //

export async function initializeSessionDetails() {
  // Initialize files
  initializeDynamicSessionFileList("#filesList");

  // Parse URL query params
  const params = new URLSearchParams(window.location.search);
  const workshopId = params.get("workshop") || "none"; 
  const programId = params.get("program");
  const sessionId = params.get("session");
  const subscriptionId = params.get("subscription");

  if (!programId || !sessionId || !subscriptionId) {
    displayError(
      "Invalid access. Program ID, Session ID, or Subscription ID is missing."
    );
    return;
  }

  // Fetch session details
  const sessionDetails = await fetchSessionDetails(
    workshopId,
    programId,
    sessionId,
    subscriptionId
  );
  if (!sessionDetails) {
    return; // Already handled error or navigation
  }

  const {
    workshop,
    subscription,
    program,
    students,
    location,
    session,
    caregiver,
  } = sessionDetails;

  // Check data completeness
  if (subscription && program && students && location && session) {
    // If we have workshop data, populate from it, else fallback to program
    if (workshop) {
      populateWorkshopDetails(workshop);
    } else {
      populateProgramDetailsAsWorkshop(program);
    }

    populateSessionDetails(session, location);
    initializeStudentList(students);
    updateBreadcrumbs(program, workshop, session, subscriptionId, workshopId, caregiver);

    // Initialize RemoveStudentDialog (unless caregiver)
    initializeRemoveStudentDialog(subscription.id.toString(), sessionId, students, caregiver);

    // Trigger success
    triggerSuccessEvent(".success_trigger");
  } else {
    displayError("Failed to fetch session details. Incomplete data.");
  }
}

// -------------------- POPULATE UI FUNCTIONS -------------------- //

// Workshop details
function populateWorkshopDetails(workshop: Workshop) {
  const workshopName = new WFComponent("#workshopName");
  workshopName.setText(workshop.Name);

  const workshopShortDescription = new WFComponent("#workshopShortDescription");
  workshopShortDescription.setText(workshop.Short_description);
}

// Fallback: use program details if workshop is unavailable
function populateProgramDetailsAsWorkshop(program: Program) {
  const workshopName = new WFComponent("#workshopName");
  workshopName.setText(program.name);

  const workshopShortDescription = new WFComponent("#workshopShortDescription");
  workshopShortDescription.setText(program.Short_description);
}

// Session + Location
function populateSessionDetails(session: SessionObj, location: Location) {
  const sessionWeekday = new WFComponent("#sessionWeekday");
  sessionWeekday.setText(session.Weekday);

  const sessionTime = new WFComponent("#sessionTime");
  sessionTime.setText(session.Time_block);

  const sessionLocation = new WFComponent("#sessionLocation");
  sessionLocation.setText(location.Name);

  const sessionLocationMap = new WFComponent("#sessionLocationMap");
  sessionLocationMap.setHTML(location.Map_embed);

  // Optional: Adjust styling for the embed
  const figureElement = document.querySelector("#sessionLocationMap figure") as HTMLElement;
  const iframeElement = document.querySelector("#sessionLocationMap iframe") as HTMLElement;
  const firstChildDiv = document.querySelector("#sessionLocationMap figure > div") as HTMLElement;

  if (figureElement) {
    figureElement.style.width = "100%";
    figureElement.style.height = "100%";
    figureElement.style.padding = "0";
    figureElement.style.margin = "0";
  }
  if (firstChildDiv) {
    firstChildDiv.style.height = "100%";
  }
  if (iframeElement) {
    iframeElement.style.width = "100%";
    iframeElement.style.height = "100%";
    iframeElement.style.border = "0";
  }
}

// -------------------- STUDENTS LIST -------------------- //

function initializeStudentList(students: Student[]) {
  const list = new WFDynamicList<Student>("#listStudentProfiles", {
    rowSelector: "#listStudentCard",
    loaderSelector: "#listStudentProfilesloading",
    emptySelector: "#listStudentProfilesEmpty",
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const studentCard = new WFComponent(rowElement);

    // Student name
    const studentNameComponent = studentCard.getChildAsComponent("#studentName");
    studentNameComponent?.setText(rowData.student_name);

    // Student image
    const studentImageComponent = studentCard.getChildAsComponent("#listStudentCardImage");
    // If `image_url` is null, you can provide a fallback
    const imageSrc = rowData.image_url || "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg";
    studentImageComponent?.setAttribute("src", imageSrc);

    // Student link
    const studentLinkComponent = studentCard.getChildAsComponent("#studentLink");
    const studentId = rowData.student_profile_id;
    const existingHref = studentLinkComponent?.getAttribute("href") || "#";
    const url = new URL(existingHref, window.location.origin);
    url.searchParams.set("id", studentId.toString());
    studentLinkComponent?.setAttribute("href", url.toString());

    // Remove button
    const removeButtonComponent = studentCard.getChildAsComponent(".remove_button");
    removeButtonComponent?.setAttribute("data-student-id", studentId.toString());
    removeButtonComponent?.setAttribute("data-subscription-item-id", rowData.id.toString());

    // Data attribute on the row itself
    rowElement.setAttribute("data-student-id", studentId.toString());

    return rowElement;
  });

  list.setData(students);
}

// -------------------- BREADCRUMBS -------------------- //

function updateBreadcrumbs(
  program: Program,
  workshop: Workshop | undefined,
  session: SessionObj,
  subscriptionId: string,
  workshopId: string,
  caregiver: boolean
) {
  // Program breadcrumb
  const programBreadcrumbElement = document.querySelector("#programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(program.name);

    const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", program.id.toString());
    programBreadcrumb.setAttribute("href", url.toString());
  }

  // Workshop breadcrumb
  const workshopBreadcrumbElement = document.querySelector("#workshopBreadcrumb");
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    if (workshop) {
      workshopBreadcrumb.setText(workshop.Name);
    } else {
      workshopBreadcrumb.setText(program.name);
    }

    const currentHref = workshopBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", program.id.toString());
    url.searchParams.set("subscription", subscriptionId);
    if (workshop && workshopId !== "none") {
      url.searchParams.set("workshop", workshopId);
    }
    workshopBreadcrumb.setAttribute("href", url.toString());
  }

  // Session breadcrumb
  const sessionBreadcrumbElement = document.querySelector("#sessionBreadcrumb");
  if (sessionBreadcrumbElement) {
    const sessionBreadcrumb = new WFComponent(sessionBreadcrumbElement);
    const sessionText = `${session.Weekday}, ${session.Time_block}`;
    sessionBreadcrumb.setText(sessionText);
  }

  // Handle caregiver
  handleBreadcrumbs(caregiver, program, workshop, session, subscriptionId, workshopId);
}

function handleBreadcrumbs(
  caregiver: boolean,
  program: Program,
  workshop: Workshop | undefined,
  session: SessionObj,
  subscriptionId: string,
  workshopId: string
) {
  if (caregiver) {
    // Remove .remove_button_wrap from DOM
    const removeButtons = document.querySelectorAll(".remove_button_wrap");
    removeButtons.forEach((btn) => btn.remove());

    // Hide userBreadcrumbList, show caregiverBreadcrumbList
    const userBreadcrumbList = document.querySelector("#userBreadcumbList");
    const caregiverBreadcrumbList = document.querySelector("#caregiverBreadcrumbList");
    if (userBreadcrumbList) {
      userBreadcrumbList.setAttribute("style", "display: none;");
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.setAttribute("style", "display: flex;");
    }

    // Load caregiver_breadcrumbs
    const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
    if (caregiverBreadcrumbs) {
      try {
        const breadcrumbs = JSON.parse(caregiverBreadcrumbs) as CaregiverBreadcrumbs;

        // Student breadcrumb
        const studentBreadcrumb = document.querySelector("#studentBreadcrumb");
        if (studentBreadcrumb) {
          const studentBreadcrumbComponent = new WFComponent(studentBreadcrumb);
          studentBreadcrumbComponent.setText(breadcrumbs.student_name);

          const currentHref = studentBreadcrumb.getAttribute("href") || "/dashboard/student/profile";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("id", breadcrumbs.student_id.toString());
          studentBreadcrumbComponent.setAttribute("href", url.toString());
        }

        // Caregiver workshop breadcrumb
        const caregiverWorkshopBreadcrumb = document.querySelector("#caregiverWorkshopBreadcrumb");
        if (caregiverWorkshopBreadcrumb) {
          const workshopBreadcrumbComponent = new WFComponent(caregiverWorkshopBreadcrumb);
          const wName = breadcrumbs.workshop_name || breadcrumbs.program_name || "N/A";
          workshopBreadcrumbComponent.setText(wName);

          const currentHref = caregiverWorkshopBreadcrumb.getAttribute("href") || "#";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("program", breadcrumbs.program_id);
          url.searchParams.set("subscription", breadcrumbs.subscription_id.toString());
          if (breadcrumbs.workshop_id && breadcrumbs.workshop_id !== "none") {
            url.searchParams.set("workshop", breadcrumbs.workshop_id);
          }
          caregiverWorkshopBreadcrumb.setAttribute("href", url.toString());
        }

        // Caregiver session breadcrumb
        const caregiverSessionBreadcrumb = document.querySelector("#caregiverSessionBreadcrumb");
        if (caregiverSessionBreadcrumb) {
          const sessionBreadcrumbComponent = new WFComponent(caregiverSessionBreadcrumb);
          const sessionText = `${breadcrumbs.session_weekday}, ${breadcrumbs.session_time_block}`;
          sessionBreadcrumbComponent.setText(sessionText);
        }
      } catch (parseError) {
        console.error("Error parsing caregiver_breadcrumbs:", parseError);
        alert("Failed to load caregiver breadcrumbs. Please try again.");
      }
    } else {
      console.warn("No caregiver_breadcrumbs found in localStorage.");
      alert("Caregiver breadcrumbs data is missing.");
    }
  } else {
    // Non-caregiver
    const userBreadcrumbList = document.querySelector("#userBreadcumbList");
    const caregiverBreadcrumbList = document.querySelector("#caregiverBreadcrumbList");
    if (userBreadcrumbList) {
      userBreadcrumbList.setAttribute("style", "display: flex;");
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.setAttribute("style", "display: none;");
    }
  }
}

// -------------------- REMOVE STUDENT DIALOG -------------------- //

function initializeRemoveStudentDialog(
  subscriptionId: string,
  sessionId: string,
  students: Student[],
  caregiver: boolean
) {
  if (caregiver) {
    // If caregiver, no remove dialog
    return;
  }

  // Create a new instance of RemoveStudentDialog
  new RemoveStudentDialog({
    subscriptionId,
    sessionId,
    students: students.map((student) => ({
      id: student.id,
      student_profile_id: student.student_profile_id,
      student_name: student.student_name,
    })),
  });
}
