// src/pages/programDetails.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { initializeDynamicProgramFileList } from "./components/listProgramFiles";

// Define the Subscription interface based on the API response
interface Subscription {
  id: number;
  created_at: number; // Unix timestamp in milliseconds
  status: string; // e.g., 'Active', 'Cancelled', 'Deposit Paid', 'Pending'
  subscription_type: string; // e.g., 'Annual', 'Monthly'
  program_name: string;
  workshop_name: string;
  coupon?: string | null;
  deposit_amount: number;
  start_date: string; // ISO date string
  next_charge_date?: string | null;
  stripe_subscription_id?: string | null;
  user_id: number;
  program_id: string;
  workshop_id: string;
  sale_id: number;
  image_url: string;
}

// Define the Program interface based on the API response
interface Program {
  request: {
    url: string;
    method: string;
    headers: string[];
    params: any[];
  };
  response: {
    headers: string[];
    result: {
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
      };
    };
    status: number;
  };
}

// Define the structure of the API response
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
    if (program.response.result.fieldData["main-image"].url) {
      programImage.setImage(
        program.response.result.fieldData["main-image"].url
      );
      const imgElement = programImage.getElement() as HTMLImageElement;
      imgElement.alt =
        program.response.result.fieldData["main-image"].alt || "Program Image";
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
    programName.setText(program.response.result.fieldData.name);
  }

  // Update program breadcrumb
  const programBreadcrumbElement = document.getElementById("programBreadcrumb");
  if (programBreadcrumbElement) {
    const programBreadcrumb = new WFComponent(programBreadcrumbElement);
    programBreadcrumb.setText(program.response.result.fieldData.name);
  }

  // Update Program Subheading
  const programSubheadingElement = document.getElementById("programSubheading");
  if (programSubheadingElement) {
    const programSubheading = new WFComponent(programSubheadingElement);
    programSubheading.setText(program.response.result.fieldData.subheading);
  }

  // Update Program Short Description
  const programShortDescriptionElement = document.getElementById(
    "programShortDescription"
  );
  if (programShortDescriptionElement) {
    const programShortDescription = new WFComponent(
      programShortDescriptionElement
    );
    programShortDescription.setText(
      program.response.result.fieldData["short-description"]
    );
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

    // Set the program image using image_url or fallback to program image
    const registrationImageComponent =
      registrationCard.getChildAsComponent<HTMLImageElement>(
        "#cardRegistrationImage"
      );
    if (registrationImageComponent) {
      const registrationImage = new WFImage(
        registrationImageComponent.getElement()
      );

      if (rowData.image_url) {
        registrationImage.setImage(rowData.image_url);
      } else if (program.response.result.fieldData["main-image"].url) {
        registrationImage.setImage(
          program.response.result.fieldData["main-image"].url
        );
      } else {
        registrationImage.setImage(
          "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
        );
      }
    }

    // Set the program name
    const programNameComponent =
      registrationCard.getChildAsComponent("#cardProgramName");
    if (programNameComponent) {
      programNameComponent.setText(rowData.program_name);
    }

    // Set the workshop name
    const workshopNameComponent =
      registrationCard.getChildAsComponent("#cardWorkshopName");
    if (workshopNameComponent) {
      workshopNameComponent.setText(rowData.workshop_name);
    }

    // Set the link with subscription and workshop parameters
    const subscriptionCardElement =
      registrationCard.getElement() as HTMLAnchorElement;
    const currentHref = subscriptionCardElement.getAttribute("href") || "#";

    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("program", rowData.program_id);
    url.searchParams.set("workshop", rowData.workshop_id);
    url.searchParams.set("subscription", rowData.id.toString());

    subscriptionCardElement.setAttribute("href", url.toString());

    // Get the #cardActivePill and #cardDepositPill elements
    const cardActivePill =
      registrationCard.getChildAsComponent("#cardActivePill");
    const cardDepositPill =
      registrationCard.getChildAsComponent("#cardDepositPill");

    // Hide both pills by default
    cardActivePill.setStyle({ display: "none" });
    cardDepositPill.setStyle({ display: "none" });

    // Set display based on the status
    if (rowData.status === "Active") {
      cardActivePill.setStyle({ display: "block" });
    } else if (rowData.status === "Deposit Paid") {
      cardDepositPill.setStyle({ display: "block" });
    }

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
