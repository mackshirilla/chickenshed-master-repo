// src/pages/workshopDetails.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { CancelRegistrationDialog } from "../registration/components/cancelRegistrationDialog";
import { initializeDynamicWorkshopFileList } from "./components/listWorkshopFiles";

// -------------------- UPDATED INTERFACES -------------------- //

// Workshop now has top-level keys like Name, Main_Image, etc.
interface Workshop {
  id: number;
  Name: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
}

// Subscription references fields like `program` and `workshop` IDs
interface Subscription {
  id: number;
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  pending_students: boolean;
  coupon: string;
  deposit_amount: number;

  // Now numeric timestamps:
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

// Session includes `session_details` for advanced info (weekday, time_block, location, etc.)
interface Session {
  id: number;
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  session: number; // The numeric session ID
  subscription_id: number;
  price_id: string;
  user_id: number;
  student_profile_id: number;
  cancellation_reason: string;
  created_at: number;

  // New, optional session_details object
  session_details?: {
    id: number;
    Name: string;
    Weekday: string;
    Time_block: string;
    Start_Date: string | null;
    End_Date: string | null;
    Location: number;
    location_details?: {
      id: number;
      Name: string;
      Address_line_1: string;
      City_state_zip: string;
    };
  };
}

// Invoice remains mostly the same
interface Invoice {
  id: number;
  created_at: number;
  contact_id: number;
  user_id: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_stripe_id: string;
  checkout_session_id: string;
  subscription_id: number;
  stripe_invoice_id: string;
  stripe_subscription_id: string;
  amount_subtotal: number;
  amount_total: number;
  amount_discount: number;
  category: string;
  is_subscription: boolean;
  reciept_url: string;
}

// Program is a single object, not an array
interface Program {
  id: number;
  name: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
  "1st_Semester_Start_Date"?: number;
  "2nd_Semester_Charge_Date"?: number;
  "Subscription_Pause_Date"?: number;
}

// The API now returns a single program, plus workshop, subscription, sessions, invoices
interface WorkshopApiResponse {
  workshop: Workshop | null;
  subscription: Subscription;
  sessions: Session[];
  invoices: Invoice[];
  program: Program;
  caregiver: boolean;
}

// Define the structure of the error response
interface ApiErrorResponse {
  traceId: string;
  code: string;
  message: string;
  payload: string;
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
  session_id?: string;
  session_weekday?: string;
  session_time_block?: string;
}

// ------------------------------------------------------------- //

// Fetch workshop details from the API
export async function fetchWorkshopDetails(
  programId: string,
  subscriptionId: string,
  workshopId?: string
): Promise<WorkshopApiResponse | undefined> {
  try {
    // Construct request data conditionally
    const requestData: Record<string, string> = {
      program: programId,
      subscription: subscriptionId,
    };
    if (workshopId) {
      requestData.workshop_id = workshopId;
    }

    // Make the API request
    const getWorkshopDetails = apiClient.get<WorkshopApiResponse>(
      `/dashboard/registration/workshop/${workshopId || "none"}`,
      { data: requestData }
    );
    const response = await getWorkshopDetails.fetch();
    return response;
  } catch (error: any) {
    console.error("Detailed Error Object:", error);

    let errorMessage = "An unexpected error occurred. Please try again.";

    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    alert(`Error: ${errorMessage}`);

    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "/dashboard/registrations");

    console.error("Fetch Workshop Details Error:", error);
    return undefined;
  }
}

// Main function to initialize the page
export async function initializeWorkshopDetailsPage() {
  // Initialize the dynamic workshop files list
  initializeDynamicWorkshopFileList("#filesList");

  // Parse URL parameters
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const workshopId = params.get("workshop");
    const programId = params.get("program");
    const subscriptionId = params.get("subscription");
    return { workshopId, programId, subscriptionId };
  };

  const { workshopId, programId, subscriptionId } = getUrlParams();

  if (!programId || !subscriptionId) {
    alert("Invalid access. Program ID or Subscription ID is missing.");
    window.history.back();
    return;
  }

  try {
    const apiResponse = await fetchWorkshopDetails(programId, subscriptionId, workshopId);

    if (!apiResponse) {
      // If fetchWorkshopDetails returns undefined due to an error
      return;
    }

    const { workshop, subscription, program, sessions, invoices, caregiver } = apiResponse;

    // Update the Workshop UI if present, otherwise fallback to Program data
    if (workshop) {
      updateWorkshopDetails(workshop, program);
    } else {
      updateWorkshopDetailsFallback(program);
    }

    // Always update Program breadcrumb
    updateProgramBreadcrumb(program);

    // Update subscription details
    updateSubscriptionDetails(subscription);

    // Filter sessions for uniqueness by `session` (optional logic)
    const uniqueSessions = getUniqueSessions(sessions);

    // Initialize and render the sessions list
    initializeDynamicSessionList("#listRegistration", uniqueSessions, subscription, caregiver);

    // Initialize and render the invoices list
    initializePastInvoicesList(".table_body", invoices);

    // Handle caregiver breadcrumb logic and UI differences
    handleBreadcrumbs(caregiver, subscription);

    if (caregiver) {
      // Remove the Cancel Registration button
      const cancelButton = document.querySelector("#openCancelDialog");
      if (cancelButton) {
        cancelButton.remove();
      }
      // Remove the Cancel Registration Dialog
      const cancelDialog = document.getElementById("cancelRegistrationDialog");
      if (cancelDialog) {
        cancelDialog.remove();
      }
      // Remove the Payment Details section
      const paymentDetails = document.querySelector(".payment_details_wrap");
      if (paymentDetails) {
        paymentDetails.remove();
      }
    } else {
      // Initialize the Cancel Registration Dialog for non-caregivers
      new CancelRegistrationDialog({
        containerSelector: ".button_group",
        subscriptionId: subscription.id.toString(),
        onCancelSuccess: () => {
          window.location.href = "/dashboard/registrations";
        },
      });
    }

    // Trigger any success handlers
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    console.error("initializeWorkshopDetailsPage Error:", error);
  }
}

// -------------------- WORKSHOP / PROGRAM UPDATERS -------------------- //

// Update page details from the Workshop object
function updateWorkshopDetails(workshop: Workshop, program: Program) {
  // Workshop Image
  const workshopImageElement = document.getElementById("workshopImage");
  if (workshopImageElement) {
    const workshopImage = new WFImage(workshopImageElement);
    if (workshop.Main_Image) {
      workshopImage.setImage(workshop.Main_Image);
      (workshopImage.getElement() as HTMLImageElement).alt = "Workshop Image";
    } else {
      workshopImage.setImage(
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
      );
      (workshopImage.getElement() as HTMLImageElement).alt = "Workshop Image";
    }
  }

  // Workshop Name
  const workshopNameElement = document.getElementById("workshopName");
  if (workshopNameElement) {
    const workshopName = new WFComponent(workshopNameElement);
    workshopName.setText(workshop.Name);
  }

  // Workshop Breadcrumb
  const workshopBreadcrumbElement = document.getElementById("workshopBreadcrumb");
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    workshopBreadcrumb.setText(workshop.Name);
  }

  // Program Name (below the workshop name or as a subtitle if desired)
  const programNameElement = document.getElementById("programName");
  if (programNameElement) {
    const programName = new WFComponent(programNameElement);
    programName.setText(program.name);
  }

  // Workshop Short Description
  const workshopShortDescriptionElement = document.getElementById(
    "workshopShortDescription"
  );
  if (workshopShortDescriptionElement) {
    const shortDescComponent = new WFComponent(workshopShortDescriptionElement);
    shortDescComponent.setText(workshop.Short_description);
  }
}

// Fallback if no workshop object is provided (use Program data)
function updateWorkshopDetailsFallback(program: Program) {
  // Program Image
  const programImageElement = document.getElementById("workshopImage");
  if (programImageElement) {
    const programImage = new WFImage(programImageElement);
    if (program.Main_Image) {
      programImage.setImage(program.Main_Image);
      (programImage.getElement() as HTMLImageElement).alt = "Program Image";
    } else {
      programImage.setImage(
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
      );
      (programImage.getElement() as HTMLImageElement).alt = "Program Image";
    }
  }

  // Workshop Name
  const workshopNameElement = document.getElementById("workshopName");
  if (workshopNameElement) {
    const workshopName = new WFComponent(workshopNameElement);
    workshopName.setText(program.name);
  }

  // Program Name
  const programNameElement = document.getElementById("programName");
  if (programNameElement) {
    const programName = new WFComponent(programNameElement);
    programName.setText(program.Subheading || program.name);
  }

  // Workshop Breadcrumb
  const workshopBreadcrumbElement = document.getElementById("workshopBreadcrumb");
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    workshopBreadcrumb.setText(program.name);
  }

  // Short Description
  const workshopShortDescriptionElement = document.getElementById(
    "workshopShortDescription"
  );
  if (workshopShortDescriptionElement) {
    const shortDescComponent = new WFComponent(workshopShortDescriptionElement);
    shortDescComponent.setText(program.Short_description);
  }
}

// Always update the program breadcrumb
function updateProgramBreadcrumb(program: Program) {
  const programBreadcrumbElement = document.getElementById("programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(program.name);

    // Optionally update the link to include the program param
    const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", program.id.toString());
    programBreadcrumb.setAttribute("href", url.toString());
  }
}

// -------------------- SUBSCRIPTION UPDATER -------------------- //

function updateSubscriptionDetails(subscription: Subscription) {
  // Subscription Type
  const subscriptionTypeElement = document.getElementById("subscription_type");
  if (subscriptionTypeElement) {
    const subscriptionType = new WFComponent(subscriptionTypeElement);
    subscriptionType.setText(subscription.subscription_type);
  }

  // Next Invoice Date
  const nextInvoiceDateElement = document.getElementById("nextInvoiceDate");
  if (nextInvoiceDateElement) {
    const nextInvoiceDate = new WFComponent(nextInvoiceDateElement);
    if (subscription.next_charge_date) {
      // Here, next_charge_date is a numeric timestamp (e.g. 1743638400000), not a string
      const date = new Date(subscription.next_charge_date);
      if (!isNaN(date.getTime())) {
        nextInvoiceDate.setText(
          date.toLocaleDateString("en-US", { timeZone: "UTC" })
        );
      } else {
        nextInvoiceDate.setText("Upon Student Approval");
      }
    } else {
      nextInvoiceDate.setText("Upon Student Approval");
    }
  }

  // Next Invoice Amount
  const nextInvoiceAmountElement = document.getElementById("nextInvoiceAmount");
  if (nextInvoiceAmountElement) {
    const nextInvoiceAmount = new WFComponent(nextInvoiceAmountElement);
    const amount = subscription.next_charge_amount;
    if (!amount || amount === 0) {
      // Hide the parent .bento_box if no future charge
      const parentElement = nextInvoiceAmountElement.closest(
        ".bento_box.is-dashboard.is-payment-detail"
      );
      if (parentElement instanceof HTMLElement) {
        parentElement.style.display = "none";
      }
    } else {
      nextInvoiceAmount.setText(`$${amount}`);
    }
  }

  // FinAid Coupon
  const couponElement = document.getElementById("finAidCoupon");
  if (couponElement) {
    const coupon = new WFComponent(couponElement);
    if (subscription.coupon) {
      // If there's a FIN AID coupon, format it accordingly
      const couponText = subscription.coupon.replace(/^FINAID/, "").trim();
      coupon.setText(couponText ? `${couponText}% Discount` : "None");
    } else {
      coupon.setText("None");
    }
  }

  // Hide or show finAidDisclaimer
  const finAidDisclaimer = document.getElementById("finAidDisclaimer");
  if (finAidDisclaimer) {
    finAidDisclaimer.style.display = subscription.coupon ? "block" : "none";
  }
}

// -------------------- DYNAMIC LISTS (Sessions & Invoices) -------------------- //

// Unique sessions if you want to deduplicate by `session`
function getUniqueSessions(sessions: Session[]): Session[] {
  const uniqueMap: Record<number, Session> = {};
  sessions.forEach((sess) => {
    if (!uniqueMap[sess.session]) {
      uniqueMap[sess.session] = sess;
    }
  });
  return Object.values(uniqueMap);
}

// Initialize the sessions list
async function initializeDynamicSessionList(
  containerSelector: string,
  sessions: Session[],
  subscription: Subscription,
  caregiver: boolean
) {
  const list = new WFDynamicList<Session>(containerSelector, {
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

  // Row renderer
  list.rowRenderer(({ rowData, rowElement }) => {
    const sessionCard = new WFComponent(rowElement);
    const sessionDetails = rowData.session_details;

    // #cardSessionDay
    const sessionDayComponent = sessionCard.getChildAsComponent("#cardSessionDay");
    if (sessionDayComponent) {
      sessionDayComponent.setText(
        sessionDetails?.Weekday || `Session #${rowData.session}`
      );
    }

    // #cardSessionTimeBlock
    const sessionTimeBlockComponent = sessionCard.getChildAsComponent(
      "#cardSessionTimeBlock"
    );
    if (sessionTimeBlockComponent) {
      sessionTimeBlockComponent.setText(sessionDetails?.Time_block || "N/A");
    }

    // #cardSessionLocation
    const sessionLocationComponent = sessionCard.getChildAsComponent(
      "#cardSessionLocation"
    );
    if (sessionLocationComponent) {
      const locationName = sessionDetails?.location_details?.Name || "N/A";
      sessionLocationComponent.setText(locationName);
    }

    // Build the link
    const sessionCardElement = sessionCard.getElement() as HTMLAnchorElement;
    const currentHref = sessionCardElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);

    // Use subscription fields
    url.searchParams.set("program", subscription.program.toString());
    url.searchParams.set("workshop", subscription.workshop.toString());
    url.searchParams.set("session", rowData.session.toString());
    url.searchParams.set("subscription", subscription.id.toString());

    sessionCardElement.setAttribute("href", url.toString());

    // If caregiver, update localStorage on click
    if (caregiver) {
      sessionCardElement.addEventListener("click", () => {
        const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
        if (caregiverBreadcrumbs) {
          try {
            const breadcrumbs = JSON.parse(caregiverBreadcrumbs) as CaregiverBreadcrumbs;
            // Update session details
            breadcrumbs.session_id = rowData.session.toString();
            breadcrumbs.session_weekday = sessionDetails?.Weekday || "";
            breadcrumbs.session_time_block = sessionDetails?.Time_block || "";
            // Save
            localStorage.setItem("caregiver_breadcrumbs", JSON.stringify(breadcrumbs));
          } catch (e) {
            console.error("Error updating caregiver_breadcrumbs:", e);
          }
        }
      });
    }

    // Show this row
    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load data
  try {
    list.changeLoadingStatus(true);
    list.setData(sessions);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing dynamic session list:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}

// Initialize the past invoices list
async function initializePastInvoicesList(containerSelector: string, invoices: Invoice[]) {
  const list = new WFDynamicList<Invoice>(containerSelector, {
    rowSelector: "#invoiceLine",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const invoiceRow = new WFComponent(rowElement);

    // Date
    const invoiceDateComponent = invoiceRow.getChildAsComponent("#invoiceDate");
    if (invoiceDateComponent) {
      const dateComp = new WFComponent(invoiceDateComponent.getElement());
      const formattedDate = new Date(rowData.created_at).toLocaleDateString();
      dateComp.setText(formattedDate);
    }

    // Amount
    const invoiceAmountComponent = invoiceRow.getChildAsComponent("#invoiceAmount");
    if (invoiceAmountComponent) {
      const amountComp = new WFComponent(invoiceAmountComponent.getElement());
      amountComp.setText(`$${rowData.amount_total}`);
    }

    // Receipt link
    const receiptButtonComponent = invoiceRow.getChildAsComponent("#receiptButton");
    if (receiptButtonComponent) {
      receiptButtonComponent.setAttribute("href", rowData.reciept_url);
    }

    // Show the invoice row
    rowElement.setStyle({ display: "table-row" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);
    list.setData(invoices);
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing past invoices list:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}

// -------------------- CAREGIVER BREADCRUMB HANDLING -------------------- //

function handleBreadcrumbs(caregiver: boolean, subscription: Subscription) {
  const userBreadcrumbList = document.getElementById("userBreadcrumbList");
  const caregiverBreadcrumbList = document.getElementById("caregiverBreadcrumbList");

  if (caregiver) {
    if (userBreadcrumbList) userBreadcrumbList.style.display = "none";
    if (caregiverBreadcrumbList) caregiverBreadcrumbList.style.display = "flex";

    // Load caregiver breadcrumbs
    const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
    if (caregiverBreadcrumbs) {
      try {
        const breadcrumbs = JSON.parse(caregiverBreadcrumbs) as CaregiverBreadcrumbs;
        // Update the Student breadcrumb
        const studentBreadcrumb = document.getElementById("studentBreadcrumb");
        if (studentBreadcrumb) {
          const studentComp = new WFComponent(studentBreadcrumb);
          studentComp.setText(breadcrumbs.student_name);
          const currentHref =
            studentBreadcrumb.getAttribute("href") || "/dashboard/student/profile";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("id", breadcrumbs.student_id.toString());
          studentComp.setAttribute("href", url.toString());
        }

        // Update the workshopBreadcrumbCaregiver
        const workshopBreadcrumbCaregiver = document.getElementById(
          "workshopBreadcrumbCaregiver"
        );
        if (workshopBreadcrumbCaregiver) {
          const wcComp = new WFComponent(workshopBreadcrumbCaregiver);
          const workshopName = breadcrumbs.workshop_name || breadcrumbs.program_name || "N/A";
          wcComp.setText(workshopName);
        }
      } catch (parseError) {
        console.error("Error parsing caregiver_breadcrumbs:", parseError);
      }
    } else {
      console.warn("No caregiver_breadcrumbs found in localStorage.");
    }
  } else {
    // Non-caregiver
    if (userBreadcrumbList) userBreadcrumbList.style.display = "flex";
    if (caregiverBreadcrumbList) caregiverBreadcrumbList.style.display = "none";
  }
}

// -------------------- SUCCESS TRIGGER -------------------- //

function triggerSuccessEvent(selector: string) {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
}
