// src/pages/workshopDetails.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { CancelRegistrationDialog } from "../registration/components/cancelRegistrationDialog";
import { initializeDynamicWorkshopFileList } from "./components/listWorkshopFiles";

// Define the Session interface based on the API response
interface Session {
  id: string;
  created_at: number; // Unix timestamp in milliseconds
  status: string; // e.g., 'Active'
  subscription_type: string; // e.g., 'Annual'
  program_name: string;
  workshop_name: string;
  weekday: string;
  location: string;
  time_block: string;
  session_id: string;
  price_id: string;
  user_id: number;
  subscription_id: number;
  workshop_id: string;
  student_profile_id: number;
  cancellation_reason?: string; // Optional, based on API response
}

// Define the Workshop interface based on the API response
interface Workshop {
  id: string;
  cmsLocaleId: string;
  lastPublished: string;
  lastUpdated: string;
  createdOn: string;
  isArchived: boolean;
  isDraft: boolean;
  fieldData: {
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
    "success-page-message"?: string; // Optional, based on API response
  };
  program_name?: string; // Optional if needed
}

// Define the Invoice interface based on the API response
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

// Define the Program interface based on the API response
interface Program {
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
}

// Define the Subscription interface based on the API response
interface Subscription {
  id: number;
  created_at: number;
  status: string;
  subscription_type: string;
  program_name: string;
  workshop_name: string;
  coupon?: string | null;
  deposit_amount: number;
  start_date: string;
  next_charge_date: string;
  next_charge_amount: number;
  stripe_subscription_id: string;
  user_id: number;
  contact_id: number;
  program_id: string;
  workshop_id: string;
  sale_id: number;
  cancellation_reason?: string; // Optional, based on API response
}

// Define the structure of the API response
interface WorkshopApiResponse {
  workshop: Workshop | null; // workshop can be null based on API response
  subscription: Subscription;
  sessions: Session[];
  invoices: Invoice[];
  program: { items: Program[] };
  caregiver: boolean; // Changed from Caregiver to boolean
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
  session_id?: string; // Optional
  session_weekday?: string; // Optional
  session_time_block?: string; // Optional
}

// Function to fetch workshop details from the API, including program and subscription params
export async function fetchWorkshopDetails(
  programId: string,
  subscriptionId: string,
  workshopId?: string // Made optional
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
      `/dashboard/registration/workshop/${workshopId || "none"}`, // Use "none" if no workshopId
      { data: requestData }
    );

    const response = await getWorkshopDetails.fetch();
    return response;
  } catch (error: any) {
    // Log the detailed error object for debugging
    console.error("Detailed Error Object:", error);

    // Initialize a default error message
    let errorMessage = "An unexpected error occurred. Please try again.";

    // Extract the specific error message from the API response if available
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      // Fallback to the generic error message
      errorMessage = error.message;
    }

    // Display the error message in an alert box
    alert(`Error: ${errorMessage}`);

    // Navigate back to the previous page with a fallback
    window.history.length > 1
      ? window.history.back()
      : (window.location.href = "/dashboard/registrations");

    // Log the error for debugging purposes
    console.error("Fetch Workshop Details Error:", error);

    // Optionally, return undefined to indicate failure
    return undefined;
  }
}

// Function to initialize and render the workshop details and sessions
export async function initializeWorkshopDetailsPage() {
  //initalize files list
  initializeDynamicWorkshopFileList("#filesList");

  // Utility function to parse URL parameters
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
    // Fetch workshop details with program and subscription params
    const apiResponse = await fetchWorkshopDetails(
      programId,
      subscriptionId,
      workshopId // Optional parameter
    );

    // If fetchWorkshopDetails encounters an error, it handles it and navigates back,
    // so the following code will not execute in that case.
    if (!apiResponse) {
      // In case fetchWorkshopDetails returns undefined due to an error
      return;
    }

    const { workshop, subscription, program, sessions, invoices, caregiver } =
      apiResponse;

    // Use program details if workshop details are not provided
    const programDetails = program.items.find(
      (p) => p.id === subscription.program_id
    );

    // Update workshop and program details on the page
    if (workshop) {
      updateWorkshopDetails(workshop, { items: program.items }, subscription);
    } else if (programDetails) {
      updateWorkshopDetailsFromProgram(programDetails, subscription);
    }

    // Always update program breadcrumb regardless of workshop availability
    if (programDetails) {
      updateProgramBreadcrumb(programDetails);
    }

    updateSubscriptionDetails(subscription);

    // Filter sessions to unique based on session_id
    const uniqueSessions = getUniqueSessions(sessions);

    // Initialize and render the sessions list using fetched data
    initializeDynamicSessionList(
      "#listRegistration",
      uniqueSessions,
      subscription,
      caregiver // Pass the caregiver flag
    );

    // Initialize and render the invoices list using fetched data
    initializePastInvoicesList(".table_body", invoices);

    // Handle Breadcrumbs based on caregiver flag
    handleBreadcrumbs(caregiver, subscription);

    // Handle Caregiver-specific UI adjustments
    if (caregiver) {
      // Remove the Cancel Registration button
      const cancelButton = document.querySelector("#openCancelDialog");
      if (cancelButton) {
        cancelButton.remove();
      }

      // Remove any existing Cancel Registration Dialog if present
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
      // Initialize Cancel Registration Dialog component
      new CancelRegistrationDialog({
        containerSelector: ".button_group",
        subscriptionId: subscription.id.toString(),
        onCancelSuccess: () => {
          // Redirect to registrations dashboard upon successful cancellation
          window.location.href = "/dashboard/registrations";
        },
      });
    }

    // Trigger the success_trigger element
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    // Since fetchWorkshopDetails already handles the error, this block can remain empty or be removed.
    // If you prefer, you can log the error here.
    console.error("initializeWorkshopDetailsPage Error:", error);
  }
}

// Function to handle Breadcrumbs based on caregiver flag
function handleBreadcrumbs(caregiver: boolean, subscription: Subscription) {
  const userBreadcrumbList = document.getElementById("userBreadcrumbList");
  const caregiverBreadcrumbList = document.getElementById(
    "caregiverBreadcrumbList"
  );

  if (caregiver) {
    if (userBreadcrumbList) {
      userBreadcrumbList.style.display = "none";
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.style.display = "flex";
    }

    // Fetch caregiver_breadcrumbs from localStorage
    const caregiverBreadcrumbs = localStorage.getItem("caregiver_breadcrumbs");
    if (caregiverBreadcrumbs) {
      try {
        const breadcrumbs = JSON.parse(
          caregiverBreadcrumbs
        ) as CaregiverBreadcrumbs;

        // Update studentBreadcrumb link
        const studentBreadcrumb = document.getElementById("studentBreadcrumb");
        if (studentBreadcrumb) {
          const studentBreadcrumbComponent = new WFComponent(studentBreadcrumb);
          studentBreadcrumbComponent.setText(breadcrumbs.student_name);

          // Append ?id={student_id} to the href
          const currentHref =
            studentBreadcrumb.getAttribute("href") ||
            "/dashboard/student/profile";
          const url = new URL(currentHref, window.location.origin);
          url.searchParams.set("id", breadcrumbs.student_id.toString());
          studentBreadcrumbComponent.setAttribute("href", url.toString());
        }

        // Update workshopBreadcrumbCaregiver text
        const workshopBreadcrumbCaregiver = document.getElementById(
          "workshopBreadcrumbCaregiver"
        );
        if (workshopBreadcrumbCaregiver) {
          const workshopBreadcrumbComponent = new WFComponent(
            workshopBreadcrumbCaregiver
          );
          const workshopName =
            breadcrumbs.workshop_name || breadcrumbs.program_name || "N/A";
          workshopBreadcrumbComponent.setText(workshopName);
        }
      } catch (parseError) {
        console.error(
          "Error parsing caregiver_breadcrumbs from localStorage:",
          parseError
        );
      }
    } else {
      console.warn("No caregiver_breadcrumbs found in localStorage.");
    }
  } else {
    if (userBreadcrumbList) {
      userBreadcrumbList.style.display = "flex";
    }
    if (caregiverBreadcrumbList) {
      caregiverBreadcrumbList.style.display = "none";
    }
  }
}

// Function to initialize and render the past invoices list using fetched data
async function initializePastInvoicesList(
  containerSelector: string,
  invoices: Invoice[]
) {
  // Initialize a new instance of WFDynamicList for Invoices
  const list = new WFDynamicList<Invoice>(containerSelector, {
    rowSelector: "#invoiceLine", // Using ID selector for table row template
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
    const invoiceDateComponent = invoiceRow.getChildAsComponent("#invoiceDate");
    if (invoiceDateComponent) {
      const invoiceDate = new WFComponent(invoiceDateComponent.getElement());
      const formattedDate = new Date(rowData.created_at).toLocaleDateString();
      invoiceDate.setText(formattedDate);
    }

    // Set the invoice amount
    const invoiceAmountComponent =
      invoiceRow.getChildAsComponent("#invoiceAmount");
    if (invoiceAmountComponent) {
      const invoiceAmount = new WFComponent(
        invoiceAmountComponent.getElement()
      );
      invoiceAmount.setText(`$${rowData.amount_total}`);
    }

    // Set the receipt link
    const receiptButtonComponent =
      invoiceRow.getChildAsComponent("#receiptButton");
    if (receiptButtonComponent) {
      const receiptButton = new WFComponent(
        receiptButtonComponent.getElement()
      );
      receiptButton.setAttribute("href", rowData.reciept_url);
    }

    // Show the list item
    rowElement.setStyle({
      display: "table-row",
    });

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
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}

// Function to update workshop and program details on the page using Workshop details
function updateWorkshopDetails(
  workshop: Workshop,
  programData: { items: Program[] },
  subscription: Subscription
) {
  // Update Workshop Image
  const workshopImageElement = document.getElementById("workshopImage");
  if (workshopImageElement) {
    const workshopImage = new WFImage(workshopImageElement);
    if (workshop.fieldData["main-image"].url) {
      workshopImage.setImage(workshop.fieldData["main-image"].url);
      const imgElement = workshopImage.getElement() as HTMLImageElement;
      imgElement.alt = workshop.fieldData["main-image"].alt || "Workshop Image";
    } else {
      workshopImage.setImage(
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
      );
      const imgElement = workshopImage.getElement() as HTMLImageElement;
      imgElement.alt = "Workshop Image";
    }
  }

  // Update Workshop Name
  const workshopNameElement = document.getElementById("workshopName");
  if (workshopNameElement) {
    const workshopName = new WFComponent(workshopNameElement);
    workshopName.setText(workshop.fieldData.name);
  }

  // Update workshop breadcrumb
  const workshopBreadcrumbElement =
    document.getElementById("workshopBreadcrumb");
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    workshopBreadcrumb.setText(workshop.fieldData.name);
  }

  // Update program breadcrumb
  updateProgramBreadcrumbFromItems(programData, subscription);

  // Update Program Name with safe access and debug statements
  const programNameElement = document.getElementById("programName");
  if (programNameElement) {
    const programName = new WFComponent(programNameElement);
    if (workshop.fieldData && workshop.fieldData.name) {
      programName.setText(workshop.fieldData.name);
    } else {
      programName.setText("Program Name Not Available");
    }
  }

  // Update Workshop Short Description
  const workshopShortDescriptionElement = document.getElementById(
    "workshopShortDescription"
  );
  if (workshopShortDescriptionElement) {
    const workshopShortDescription = new WFComponent(
      workshopShortDescriptionElement
    );
    workshopShortDescription.setText(workshop.fieldData["short-description"]);
  }
}

// Function to update workshop and program details using Program details
function updateWorkshopDetailsFromProgram(
  programDetails: Program,
  subscription: Subscription
) {
  // Update Program Image
  const programImageElement = document.getElementById("workshopImage");
  if (programImageElement) {
    const programImage = new WFImage(programImageElement);
    if (programDetails.fieldData["main-image"].url) {
      programImage.setImage(programDetails.fieldData["main-image"].url);
      const imgElement = programImage.getElement() as HTMLImageElement;
      imgElement.alt =
        programDetails.fieldData["main-image"].alt || "Program Image";
    } else {
      programImage.setImage(
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
      );
      const imgElement = programImage.getElement() as HTMLImageElement;
      imgElement.alt = "Program Image";
    }
  }

  // Update Workshop Name with the Program Name
  const workshopNameElement = document.getElementById("workshopName");
  if (workshopNameElement) {
    const workshopName = new WFComponent(workshopNameElement);
    workshopName.setText(programDetails.fieldData.name);
  }

  // Update Program Name with Program Subheading
  const programNameElement = document.getElementById("programName");
  if (programNameElement) {
    const programName = new WFComponent(programNameElement);
    programName.setText(programDetails.fieldData.subheading);
  }

  // Update workshop breadcrumb with the Program Name
  const workshopBreadcrumbElement =
    document.getElementById("workshopBreadcrumb");
  if (workshopBreadcrumbElement) {
    const workshopBreadcrumb = new WFComponent(workshopBreadcrumbElement);
    workshopBreadcrumb.setText(programDetails.fieldData.name);
  }
}

// Function to update the program breadcrumb element (ensure it's always set)
function updateProgramBreadcrumb(programDetails: Program) {
  const programBreadcrumbElement = document.getElementById("programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(programDetails.fieldData.name);

    // Update the href attribute to append the program param to the current link
    const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", programDetails.id);
    programBreadcrumb.setAttribute("href", url.toString());
  }
}

// Helper function to update program breadcrumb from program items
function updateProgramBreadcrumbFromItems(
  programData: { items: Program[] },
  subscription: Subscription
) {
  const programBreadcrumbElement = document.getElementById("programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    const matchedProgram = programData.items.find(
      (program) => program.id === subscription.program_id
    );
    if (matchedProgram) {
      // Set the breadcrumb text to the program name
      programBreadcrumb.setText(matchedProgram.fieldData.name);

      // Update the href attribute to append the program param to the current link
      const currentHref = programBreadcrumbElement.getAttribute("href") || "#";
      const url = new URL(currentHref, window.location.origin);
      url.searchParams.set("program", matchedProgram.id);
      programBreadcrumb.setAttribute("href", url.toString());
    }
  }
}

// Function to update subscription details on the page
function updateSubscriptionDetails(subscription: Subscription) {
  // Update Subscription Type
  const subscriptionTypeElement = document.getElementById("subscription_type");
  if (subscriptionTypeElement) {
    const subscriptionType = new WFComponent(subscriptionTypeElement);
    subscriptionType.setText(subscription.subscription_type);
  }

  // Update Next Invoice Date
  const nextInvoiceDateElement = document.getElementById("nextInvoiceDate");
  if (nextInvoiceDateElement) {
    const nextInvoiceDate = new WFComponent(nextInvoiceDateElement);

    const nextChargeDateStr = subscription.next_charge_date;

    if (nextChargeDateStr) {
      // Create a new Date object
      const date = new Date(nextChargeDateStr + "T00:00:00Z");
      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        const formattedDate = date.toLocaleDateString("en-US", {
          timeZone: "UTC",
        });
        nextInvoiceDate.setText(formattedDate);
      } else {
        nextInvoiceDate.setText("Upon Student Approval");
      }
    } else {
      nextInvoiceDate.setText("Upon Student Approval");
    }
  }

  // Update Next Invoice Amount
  const nextInvoiceAmountElement = document.getElementById("nextInvoiceAmount");
  if (nextInvoiceAmountElement) {
    const nextInvoiceAmount = new WFComponent(nextInvoiceAmountElement);
    const amount = subscription.next_charge_amount;

    if (amount === 0 || amount === null || amount === undefined) {
      // Hide the parent .bento_box.is-dashboard.is-payment-detail element
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

  // Update FinAid Coupon
  const couponElement = document.getElementById("finAidCoupon");
  if (couponElement) {
    const coupon = new WFComponent(couponElement);
    if (subscription.coupon && subscription.coupon !== "None") {
      // Remove 'FINAID' from the beginning and add '% discount Applied'
      const couponText =
        subscription.coupon.replace(/^FINAID/, "").trim() + "% Discount";
      coupon.setText(couponText);
    } else {
      coupon.setText("None");
    }
  }

  // Display or hide finAidDisclaimer based on coupon
  const finAidDisclaimer = document.getElementById("finAidDisclaimer");
  if (finAidDisclaimer) {
    if (subscription.coupon) {
      finAidDisclaimer.style.display = "block";
    } else {
      finAidDisclaimer.style.display = "none";
    }
  }
}

// Function to filter unique sessions based on session_id
function getUniqueSessions(sessions: Session[]): Session[] {
  const uniqueMap: { [key: string]: Session } = {};
  sessions.forEach((session) => {
    if (!uniqueMap[session.session_id]) {
      uniqueMap[session.session_id] = session;
    }
  });
  return Object.values(uniqueMap);
}

// Function to initialize and render the dynamic sessions list
async function initializeDynamicSessionList(
  containerSelector: string,
  sessions: Session[],
  subscription: Subscription, // Add subscription details as parameter
  caregiver: boolean // Add caregiver flag as parameter
) {
  // Initialize a new instance of WFDynamicList for Sessions
  const list = new WFDynamicList<Session>(containerSelector, {
    rowSelector: "#listRegistrationCard", // Using ID selector for template
    loaderSelector: "#listRegistrationloading", // Selector for the loader
    emptySelector: "#listRegistrationEmpty", // Selector for the empty state
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

  // Customize the rendering of list items (Session Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const sessionCard = new WFComponent(rowElement);

    // Set the session day
    const sessionDayComponent =
      sessionCard.getChildAsComponent("#cardSessionDay");
    if (sessionDayComponent) {
      const sessionDay = new WFComponent(sessionDayComponent.getElement());
      sessionDay.setText(rowData.weekday);
    }

    // Set the session time block
    const sessionTimeBlockComponent = sessionCard.getChildAsComponent(
      "#cardSessionTimeBlock"
    );
    if (sessionTimeBlockComponent) {
      const sessionTimeBlock = new WFComponent(
        sessionTimeBlockComponent.getElement()
      );
      sessionTimeBlock.setText(rowData.time_block);
    }

    // Set the session location
    const sessionLocationComponent = sessionCard.getChildAsComponent(
      "#cardSessionLocation"
    );
    if (sessionLocationComponent) {
      const sessionLocation = new WFComponent(
        sessionLocationComponent.getElement()
      );
      sessionLocation.setText(rowData.location);
    }

    // Set the link with program, workshop, and subscription parameters
    const sessionCardElement = sessionCard.getElement() as HTMLAnchorElement;
    const currentHref = sessionCardElement.getAttribute("href") || "#";

    // Parse existing URL to avoid malformed URLs
    const url = new URL(currentHref, window.location.origin);

    // Append or set query parameters using subscription and session details
    url.searchParams.set("program", subscription.program_id);
    url.searchParams.set("workshop", subscription.workshop_id);
    url.searchParams.set("session", rowData.session_id);
    url.searchParams.set("subscription", subscription.id.toString());

    // Update the href attribute with the correct parameters
    sessionCardElement.setAttribute("href", url.toString());

    // If the user is a caregiver, update the caregiver_breadcrumbs on session selection
    if (caregiver) {
      sessionCardElement.addEventListener("click", () => {
        const caregiverBreadcrumbs = localStorage.getItem(
          "caregiver_breadcrumbs"
        );
        if (caregiverBreadcrumbs) {
          try {
            const breadcrumbs = JSON.parse(
              caregiverBreadcrumbs
            ) as CaregiverBreadcrumbs;

            // Update with session details
            breadcrumbs.session_id = rowData.session_id;
            breadcrumbs.session_weekday = rowData.weekday;
            breadcrumbs.session_time_block = rowData.time_block;

            // Save back to localStorage
            localStorage.setItem(
              "caregiver_breadcrumbs",
              JSON.stringify(breadcrumbs)
            );
          } catch (e) {
            console.error("Error updating caregiver_breadcrumbs:", e);
          }
        } else {
          console.warn("No caregiver_breadcrumbs found in localStorage.");
        }
      });
    }

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display session data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    // Set the data to be displayed in the dynamic list
    list.setData(sessions);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error initializing dynamic session list:", error);
    list.setData([]);
    list.changeLoadingStatus(false);
  }
}

// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector: string) {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
}
