// src/pages/sessionDetails.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { RemoveStudentDialog } from "./components/removeStudent";
import { initializeDynamicSessionFileList } from "./components/listSessionFiles";

interface SessionDetailsResponse {
  workshop?: {
    fieldData: {
      name: string;
      "short-description": string;
      "parent-program": string;
    };
  };
  subscription: {
    id: string; // Add subscription ID here for type-safety
  };
  students: Array<{
    student_name: string;
    image_url: string;
    student_profile_id: number;
    id: number; // This represents the subscription item ID linked to each student
  }>;
  program: {
    id: string;
    cmsLocaleId: string;
    lastPublished: string;
    lastUpdated: string;
    createdOn: string;
    isArchived: boolean;
    isDraft: boolean;
    fieldData: {
      subheading: string;
      "short-description": string;
      "age-range": string;
      name: string;
      slug: string;
      "parent-program": string;
      "main-image": {
        fileId: string;
        url: string;
        alt: string | null;
      };
      "2nd-semester-charge-date"?: string; // Optional, based on API response
      "subscription-pause-date"?: string; // Optional, based on API response
    };
  };
  location: {
    fieldData: {
      name: string;
      "map-embed": string;
    };
  };
  session: {
    fieldData: {
      weekday: string;
      "time-block": string;
      name: string;
    };
  };
  caregiver: boolean; // Indicates if the user is a caregiver
}

// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector: string) {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
}

// Define the CaregiverBreadcrumbs interface
interface CaregiverBreadcrumbs {
  student_id: number;
  student_name: string;
  workshop_name: string;
  workshop_id: string;
  program_name: string;
  program_id: string;
  subscription_id: number;
  session_id?: string; // Optional
  session_weekday?: string; // Optional
  session_time_block?: string; // Optional
}

// Function to fetch session details from the API
async function fetchSessionDetails(
  workshopId: string,
  programId: string,
  sessionId: string,
  subscriptionId: string
): Promise<SessionDetailsResponse | undefined> {
  try {
    // Make the API request
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
    // Extract and display the error message
    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Display the error message in an alert box
    alert(`Error: ${errorMessage}`);

    // Navigate back to the previous page with a fallback
    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "/dashboard/registrations");

    // Log the error for debugging purposes
    console.error("Fetch Session Details Error:", error);

    // Return undefined to indicate failure
    return undefined;
  }
}

// Main function to initialize session details
export async function initializeSessionDetails() {
  // initialize files
  initializeDynamicSessionFileList("#filesList");
  const params = new URLSearchParams(window.location.search);
  const workshopId = params.get("workshop") || "none"; // Use "none" if workshopId is not provided
  const programId = params.get("program");
  const sessionId = params.get("session");
  const subscriptionId = params.get("subscription");

  if (!programId || !sessionId || !subscriptionId) {
    displayError(
      "Invalid access. Program ID, Session ID, or Subscription ID is missing."
    );
    return;
  }

  // Fetch session details with program and subscription params
  const sessionDetails = await fetchSessionDetails(
    workshopId,
    programId,
    sessionId,
    subscriptionId
  );

  // If fetchSessionDetails encounters an error, it handles it and navigates back,
  // so the following code will not execute in that case.
  if (!sessionDetails) {
    // In case fetchSessionDetails returns undefined due to an error
    return;
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

  if (sessionDetails && location && students && session) {
    // Populate UI Elements
    if (workshop) {
      populateWorkshopDetails(workshop);
    } else {
      populateProgramDetailsAsWorkshop(program);
    }
    populateSessionDetails(session, location);
    initializeStudentList(students);
    updateBreadcrumbs(
      program,
      workshop,
      session,
      subscriptionId,
      workshopId,
      caregiver
    );

    // Initialize RemoveStudentDialog with relevant data
    initializeRemoveStudentDialog(
      subscription.id,
      sessionId,
      students,
      caregiver
    );

    // Trigger the success_trigger element
    triggerSuccessEvent(".success_trigger");
  } else {
    displayError("Failed to fetch session details. Incomplete data.");
  }
}

// Function to populate workshop details (if workshop is available)
function populateWorkshopDetails(workshop: SessionDetailsResponse["workshop"]) {
  const workshopName = new WFComponent("#workshopName"); // Changed to class selector
  workshopName.setText(workshop.fieldData.name);

  const workshopShortDescription = new WFComponent("#workshopShortDescription"); // Changed to class selector
  workshopShortDescription.setText(workshop.fieldData["short-description"]);
}

// Function to populate program details as workshop details (fallback if workshop is unavailable)
function populateProgramDetailsAsWorkshop(
  program: SessionDetailsResponse["program"]
) {
  const workshopName = new WFComponent("#workshopName"); // Changed to class selector
  workshopName.setText(program.fieldData.name);

  const workshopShortDescription = new WFComponent("#workshopShortDescription"); // Changed to class selector
  workshopShortDescription.setText(program.fieldData["short-description"]);
}

// Function to populate session details, including location and time
function populateSessionDetails(
  session: SessionDetailsResponse["session"],
  location: SessionDetailsResponse["location"]
) {
  const sessionWeekday = new WFComponent("#sessionWeekday"); // Changed to class selector
  sessionWeekday.setText(session.fieldData.weekday);

  const sessionTime = new WFComponent("#sessionTime"); // Changed to class selector
  sessionTime.setText(session.fieldData["time-block"]);

  const sessionLocation = new WFComponent("#sessionLocation"); // Changed to class selector
  sessionLocation.setText(location.fieldData.name);

  const sessionLocationMap = new WFComponent("#sessionLocationMap"); // Changed to class selector
  sessionLocationMap.setHTML(location.fieldData["map-embed"]);

  // Apply styling to make sure the map and its container fill properly
  const figureElement = document.querySelector(
    "#sessionLocationMap figure" // Changed to class selector
  ) as HTMLElement;
  const iframeElement = document.querySelector(
    "#sessionLocationMap iframe" // Changed to class selector
  ) as HTMLElement;
  const firstChildDiv = document.querySelector(
    "#sessionLocationMap figure > div" // Changed to class selector
  ) as HTMLElement;

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

// Function to initialize student list
function initializeStudentList(students: SessionDetailsResponse["students"]) {
  const list = new WFDynamicList<any>("#listStudentProfiles", {
    // Changed selector to class
    rowSelector: "#listStudentCard", // Changed to class selector
    loaderSelector: "#listStudentProfilesloading", // Changed to class selector
    emptySelector: "#listStudentProfilesEmpty", // Changed to class selector
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const studentCard = new WFComponent(rowElement);
    const studentNameComponent =
      studentCard.getChildAsComponent("#studentName"); // Changed to class selector
    const studentImageComponent = studentCard.getChildAsComponent(
      "#listStudentCardImage" // Changed to class selector
    );
    const studentLinkComponent =
      studentCard.getChildAsComponent("#studentLink"); // Changed to class selector
    const removeButtonComponent =
      studentCard.getChildAsComponent(".remove_button"); // Select by class

    studentNameComponent?.setText(rowData.student_name);
    studentImageComponent?.setAttribute("src", rowData.image_url);

    // Append ?id={student_id} to the link
    const studentId = rowData.student_profile_id;
    const existingHref = studentLinkComponent?.getAttribute("href") || "#";
    const url = new URL(existingHref, window.location.origin);
    url.searchParams.set("id", studentId.toString());
    studentLinkComponent?.setAttribute("href", url.toString());

    // **Set data attributes on remove button**
    removeButtonComponent?.setAttribute(
      "data-student-id",
      studentId.toString()
    );
    removeButtonComponent?.setAttribute(
      "data-subscription-item-id",
      rowData.id.toString()
    );

    // **Set data-student-id on the row element for easy removal later**
    rowElement.setAttribute("data-student-id", studentId.toString());

    return rowElement;
  });

  // Set data to be displayed in the list
  list.setData(students);
}

// Function to update breadcrumbs with program, workshop, and session details
function updateBreadcrumbs(
  program: SessionDetailsResponse["program"],
  workshop: SessionDetailsResponse["workshop"] | null,
  session: SessionDetailsResponse["session"],
  subscriptionId: string,
  workshopId: string,
  caregiver: boolean
) {
  // Update program breadcrumb
  const programBreadcrumbElement = document.querySelector("#programBreadcrumb"); // Changed to class selector
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(program.fieldData.name);
    // Update href attribute with program parameter
    const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", program.id);
    programBreadcrumb.setAttribute("href", url.toString());
  }

  // Update workshop breadcrumb if workshop exists, otherwise fallback to program name
  const workshopBreadcrumbElement = document.querySelector(
    "#workshopBreadcrumb"
  ); // Changed to class selector
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    if (workshop) {
      workshopBreadcrumb.setText(workshop.fieldData.name);
    } else {
      workshopBreadcrumb.setText(program.fieldData.name);
    }

    // Update href attribute with program, subscription, and optionally workshop parameters
    const currentHref = workshopBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", program.id);
    url.searchParams.set("subscription", subscriptionId);

    if (workshop && workshopId !== "none") {
      url.searchParams.set("workshop", workshopId);
    }

    workshopBreadcrumb.setAttribute("href", url.toString());
  }

  // Update session breadcrumb
  const sessionBreadcrumbElement = document.querySelector("#sessionBreadcrumb"); // Changed to class selector
  if (sessionBreadcrumbElement) {
    const sessionBreadcrumb = new WFComponent(sessionBreadcrumbElement);
    // Set the text to the combination of the session weekday and time block
    const sessionText = `${session.fieldData.weekday}, ${session.fieldData["time-block"]}`;
    sessionBreadcrumb.setText(sessionText);
  }

  // Handle Breadcrumbs based on caregiver flag
  handleBreadcrumbs(
    caregiver,
    program,
    workshop,
    session,
    subscriptionId,
    workshopId
  );
}

// Function to handle Breadcrumbs based on caregiver flag
function handleBreadcrumbs(
  caregiver: boolean,
  program: SessionDetailsResponse["program"],
  workshop: SessionDetailsResponse["workshop"] | null,
  session: SessionDetailsResponse["session"],
  subscriptionId: string,
  workshopId: string
) {
  if (caregiver) {
    // Remove all .remove_button_wrap elements from the DOM
    const removeButtons = document.querySelectorAll(".remove_button_wrap");
    removeButtons.forEach((btn) => btn.remove());

    // Hide userBreadcrumbList and show caregiverBreadcrumbList
    const userBreadcrumbList = document.querySelector("#userBreadcumbList"); // Changed to class selector
    const caregiverBreadcrumbList = document.querySelector(
      "#caregiverBreadcrumbList" // Changed to class selector
    );

    if (userBreadcrumbList) {
      userBreadcrumbList.setAttribute("style", "display: none;");
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.setAttribute("style", "display: flex;");
    }

    // Fetch caregiver_breadcrumbs from localStorage
    const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
    if (caregiverBreadcrumbs) {
      try {
        const breadcrumbs = JSON.parse(
          caregiverBreadcrumbs
        ) as CaregiverBreadcrumbs;

        // Update studentBreadcrumb link
        const studentBreadcrumb = document.querySelector("#studentBreadcrumb"); // Changed to class selector
        if (studentBreadcrumb) {
          const studentBreadcrumbComponent = new WFComponent(studentBreadcrumb);
          studentBreadcrumbComponent.setText(breadcrumbs.student_name);

          // Update href with ?id={student_id}
          const currentHref =
            studentBreadcrumb.getAttribute("href") ||
            "/dashboard/student/profile";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("id", breadcrumbs.student_id.toString());
          studentBreadcrumbComponent.setAttribute("href", url.toString());
        }

        // Update caregiverWorkshopBreadcrumb text
        const caregiverWorkshopBreadcrumb = document.querySelector(
          "#caregiverWorkshopBreadcrumb" // Changed to class selector
        );
        if (caregiverWorkshopBreadcrumb) {
          const workshopBreadcrumbComponent = new WFComponent(
            caregiverWorkshopBreadcrumb
          );

          // Use workshop_name if present, otherwise use program_name
          const workshopName = breadcrumbs.workshop_name
            ? breadcrumbs.workshop_name
            : breadcrumbs.program_name;
          workshopBreadcrumbComponent.setText(workshopName);

          // Update href with program, subscription, and optionally workshop parameters
          const currentHref =
            caregiverWorkshopBreadcrumb.getAttribute("href") || "#";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("program", breadcrumbs.program_id);
          url.searchParams.set(
            "subscription",
            breadcrumbs.subscription_id.toString()
          );

          if (breadcrumbs.workshop_id && breadcrumbs.workshop_id !== "none") {
            url.searchParams.set("workshop", breadcrumbs.workshop_id);
          }

          caregiverWorkshopBreadcrumb.setAttribute("href", url.toString());
        }

        // Update caregiverSessionBreadcrumb with session details
        const caregiverSessionBreadcrumb = document.querySelector(
          "#caregiverSessionBreadcrumb" // Changed to class selector
        );
        if (caregiverSessionBreadcrumb) {
          const sessionBreadcrumbComponent = new WFComponent(
            caregiverSessionBreadcrumb
          );
          const sessionText = `${breadcrumbs.session_weekday}, ${breadcrumbs.session_time_block}`;
          sessionBreadcrumbComponent.setText(sessionText);
        }
      } catch (parseError) {
        console.error(
          "Error parsing caregiver_breadcrumbs from localStorage:",
          parseError
        );
        alert("Failed to load caregiver breadcrumbs. Please try again.");
      }
    } else {
      console.warn("No caregiver_breadcrumbs found in localStorage.");
      alert("Caregiver breadcrumbs data is missing.");
    }
  } else {
    // If not a caregiver, ensure userBreadcrumbList is visible and caregiverBreadcrumbList is hidden
    const userBreadcrumbList = document.querySelector("#userBreadcumbList"); // Changed to class selector
    const caregiverBreadcrumbList = document.querySelector(
      "#caregiverBreadcrumbList" // Changed to class selector
    );

    if (userBreadcrumbList) {
      userBreadcrumbList.setAttribute("style", "display: flex;");
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.setAttribute("style", "display: none;");
    }
  }
}

// Function to initialize RemoveStudentDialog
function initializeRemoveStudentDialog(
  subscriptionId: string,
  sessionId: string,
  students: SessionDetailsResponse["students"],
  caregiver: boolean
) {
  if (caregiver) {
    // If caregiver, you might want to handle dialogs differently or disable certain actions
    // For now, we'll assume caregivers don't need the RemoveStudentDialog
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

// Function to display an error message on the page and in an alert box
function displayError(message: string) {
  const errorElement = document.querySelector("#listRegistrationEmpty"); // Changed to class selector
  if (errorElement) {
    errorElement.innerHTML = `<div>${message}</div>`;
    errorElement.setAttribute("style", "display: flex;");
  }
  // Also display the error in an alert box
  alert(`Error: ${message}`);
}

// Function to initialize and render the past invoices list using fetched data
async function initializePastInvoicesList(
  containerSelector: string,
  invoices: any[]
) {
  // Initialize a new instance of WFDynamicList for Invoices
  const list = new WFDynamicList<any>(containerSelector, {
    rowSelector: "#invoiceLine", // Changed to class selector
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

  // Customize the rendering of list items (Invoice Rows)
  list.rowRenderer(({ rowData, rowElement }) => {
    const invoiceRow = new WFComponent(rowElement);

    // Set the invoice date
    const invoiceDateComponent = invoiceRow.getChildAsComponent("#invoiceDate"); // Changed to class selector
    if (invoiceDateComponent) {
      const invoiceDate = new WFComponent(invoiceDateComponent.getElement());
      const formattedDate = new Date(rowData.created_at).toLocaleDateString();
      invoiceDate.setText(formattedDate);
    }

    // Set the invoice amount
    const invoiceAmountComponent =
      invoiceRow.getChildAsComponent("#invoiceAmount"); // Changed to class selector
    if (invoiceAmountComponent) {
      const invoiceAmount = new WFComponent(
        invoiceAmountComponent.getElement()
      );
      invoiceAmount.setText(`$${rowData.amount_total}`);
    }

    // Set the receipt link
    const receiptButtonComponent =
      invoiceRow.getChildAsComponent("#receiptButton"); // Changed to class selector
    if (receiptButtonComponent) {
      const receiptButton = new WFComponent(
        receiptButtonComponent.getElement()
      );
      receiptButton.setAttribute("href", rowData.reciept_url);
    }

    // Show the list item
    rowElement.setAttribute("style", "display: table-row;");

    return rowElement;
  });

  // Load and display invoice data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    // Set the data to be displayed in the dynamic list
    list.setData(invoices);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing past invoices list:", error);
    alert("Failed to load past invoices. Please try again.");
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}
