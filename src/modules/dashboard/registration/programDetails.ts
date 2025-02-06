// src/pages/programDetails.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { initializeDynamicProgramFileList } from "./components/listProgramFiles";

// Define the Subscription interface based on the NEW API response,
// marking image_url and workshop_name as optional.
interface Subscription {
  id: number;
  status: string; // e.g., "Active", "Deposit Paid", etc.
  subscription_type: string; // e.g., "Annual", "Monthly", "Pay-Per-Semester"
  program: number; // Program ID
  workshop: number; // Workshop ID
  next_charge_date: string | null;
  next_charge_amount: number;
  stripe_subscription_id: string;
  user_id: number;
  contact_id: number;
  created_at: number; // Unix timestamp in milliseconds

  // Optional fields, since not all responses contain them
  image_url?: string;
  workshop_name?: string;
}

// Define the Program interface based on the NEW API response
interface Program {
  id: number;
  name: string;
  slug: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
}

// Define the structure of the NEW API response
interface ProgramApiResponse {
  subscriptions: Subscription[];
  program: Program;
}

// Function to fetch program details and subscriptions from the API
export async function fetchProgramDetails(
  programId: string
): Promise<ProgramApiResponse> {
  try {
    const getProgramDetails = apiClient.get<ProgramApiResponse>(
      `/dashboard/registration/program/${programId}`
    );
    const response = await getProgramDetails.fetch();
    return response;
  } catch (error) {
    throw error;
  }
}

// Function to initialize and render the program details and subscriptions
export async function initializeProgramDetailsPage() {
  // Initialize the dynamic program files list
  await initializeDynamicProgramFileList("#filesList");

  // Utility function to parse URL parameters
  const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const programId = params.get("program");
    return { programId };
  };

  const { programId } = getUrlParams();

  if (!programId) {
    displayError("Invalid access. Program ID is missing.");
    return;
  }

  try {
    // Fetch program details and subscriptions
    const apiResponse = await fetchProgramDetails(programId);
    const { subscriptions, program } = apiResponse;

    // Update program details on the page
    updateProgramDetails(program);

    // Initialize and render the subscriptions list using fetched data
    await initializeDynamicSubscriptionList(
      "#listRegistration",
      subscriptions,
      program
    );

    // Trigger the success_trigger element
    triggerSuccessEvent(".success_trigger");
  } catch (error) {
    displayError("An error occurred while loading the program details.");
  }
}

// Function to update program details on the page
function updateProgramDetails(program: Program) {
  // Update Program Image
  const programImageElement = document.getElementById("programImage");
  if (programImageElement) {
    const programImage = new WFImage(programImageElement);

    if (program.Main_Image) {
      programImage.setImage(program.Main_Image);
      const imgElement = programImage.getElement() as HTMLImageElement;
      imgElement.alt = "Program Image";
    } else {
      programImage.setImage(
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
      );
      const imgElement = programImage.getElement() as HTMLImageElement;
      imgElement.alt = "Program Image";
    }
  }

  // Update Program Name
  const programNameElement = document.getElementById("programName");
  if (programNameElement) {
    const programName = new WFComponent(programNameElement);
    programName.setText(program.name);
  }

  // Update program breadcrumb
  const programBreadcrumbElement = document.getElementById("programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(program.name);
  }

  // Update Program Subheading
  const programSubheadingElement = document.getElementById("programSubheading");
  if (programSubheadingElement) {
    const programSubheading = new WFComponent(programSubheadingElement);
    programSubheading.setText(program.Subheading);
  }

  // Update Program Short Description
  const programShortDescriptionElement = document.getElementById(
    "programShortDescription"
  );
  if (programShortDescriptionElement) {
    const programShortDescription = new WFComponent(
      programShortDescriptionElement
    );
    programShortDescription.setText(program.Short_description);
  }
}

// Function to display an error message on the page
function displayError(message: string) {
  const errorElement = document.getElementById("listRegistrationEmpty");
  if (errorElement) {
    errorElement.innerHTML = `<div>${message}</div>`;
    errorElement.style.display = "flex";
  }
}

// Function to initialize and render the dynamic subscription list
async function initializeDynamicSubscriptionList(
  containerSelector: string,
  subscriptions: Subscription[],
  program: Program
) {
  const list = new WFDynamicList<Subscription>(containerSelector, {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "flex",
    });
    return emptyElement;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const registrationCard = new WFComponent(rowElement);

    // 1) Create a fallback for the program's image if missing
    const programImageFallback = program.Main_Image
      ? program.Main_Image
      : "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg";

    // 2) Grab the card image element
    const registrationImageComponent =
      registrationCard.getChildAsComponent<HTMLImageElement>(
        "#cardRegistrationImage"
      );
    if (registrationImageComponent) {
      const registrationImage = new WFImage(
        registrationImageComponent.getElement()
      );

      // Use the subscription's image, otherwise fall back to the program's.
      if (rowData.image_url && rowData.image_url.trim() !== "") {
        registrationImage.setImage(rowData.image_url);
      } else {
        registrationImage.setImage(programImageFallback);
      }
    }

    // 3) Set the program name (from the top-level `program` object)
    const programNameComponent =
      registrationCard.getChildAsComponent("#cardProgramName");
    if (programNameComponent) {
      programNameComponent.setText(program.name);
    }

    // 4) Set the workshop name if present
    const workshopNameComponent =
      registrationCard.getChildAsComponent("#cardWorkshopName");
    if (workshopNameComponent) {
      workshopNameComponent.setText(rowData.workshop_name || "");
    }

    // 5) Build the link with subscription and workshop parameters
    const subscriptionCardElement =
      registrationCard.getElement() as HTMLAnchorElement;
    const currentHref = subscriptionCardElement.getAttribute("href") || "#";

    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", rowData.program.toString());
    url.searchParams.set("workshop", rowData.workshop.toString());
    url.searchParams.set("subscription", rowData.id.toString());

    subscriptionCardElement.setAttribute("href", url.toString());

    // 6) Handle status pills (#cardActivePill and #cardDepositPill)
    const cardActivePill =
      registrationCard.getChildAsComponent("#cardActivePill");
    const cardDepositPill =
      registrationCard.getChildAsComponent("#cardDepositPill");

    // Hide both by default
    cardActivePill.setStyle({ display: "none" });
    cardDepositPill.setStyle({ display: "none" });

    // Show relevant pill by status
    if (rowData.status === "Active") {
      cardActivePill.setStyle({ display: "block" });
    } else if (rowData.status === "Deposit Paid") {
      cardDepositPill.setStyle({ display: "block" });
    }

    // Ensure the row is visible
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  try {
    list.setData(subscriptions);
  } catch (error) {
    list.setData([]);
  }
}

// Function to trigger a click on the success_trigger element
function triggerSuccessEvent(selector: string) {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
}
