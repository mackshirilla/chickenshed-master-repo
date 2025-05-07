// src/pages/listSubscriptions.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// Define the shape of the program_details object
interface ProgramDetails {
  name: string;
  Main_Image: string;
}

// Define the updated Subscription interface based on the new API response
interface Subscription {
  id: number;
  status: string; // e.g., 'Deposit Paid'
  subscription_type: string; // e.g., 'Annual', 'Monthly', 'Pay-Per-Semester'
  program: number; // numeric program ID
  workshop: number; // numeric workshop ID (may be 0 if none)
  next_charge_date: string | null;
  next_charge_amount: number;
  stripe_subscription_id: string;
  user_id: number;
  contact_id: number;
  sale_id: number;
  created_at: number; // Unix timestamp in milliseconds
  program_details: ProgramDetails;
}

// Define the structure of the API response
interface SubscriptionApiResponse {
  subscriptions: Subscription[];
}

// Function to fetch subscriptions from the API
export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const getSubscriptions = apiClient.get<SubscriptionApiResponse>(
      "/subscriptions"
    );
    const response = await getSubscriptions.fetch();
    return response.subscriptions;
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic subscription list
export async function initializeDynamicSubscriptionList(
  containerSelector: string
) {
  // Grab and hide both buttons until we know list state
  const addBtn = document.getElementById("add-registration-button");
  const manageBtn = document.getElementById("manage-registration-button");
  if (addBtn) addBtn.style.display = "none";
  if (manageBtn) manageBtn.style.display = "none";

  // Initialize a new instance of WFDynamicList for Subscriptions
  const list = new WFDynamicList<Subscription>(containerSelector, {
    rowSelector: "#listRegistrationCard",       // Template for each card
    loaderSelector: "#listRegistrationloading", // Loader spinner
    emptySelector: "#listRegistrationEmpty",    // Empty state container
  });

  // Loader renderer
  list.loaderRenderer(loaderEl => {
    loaderEl.setStyle({ display: "flex" });
    return loaderEl;
  });

  // Empty state renderer
  list.emptyRenderer(emptyEl => {
    emptyEl.setStyle({ display: "flex" });
    return emptyEl;
  });

  // Card renderer
  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // 1) Program image
    const imgComp = card.getChildAsComponent<HTMLImageElement>(
      "#cardRegistrationImage"
    );
    if (imgComp) {
      const img = new WFImage(imgComp.getElement());
      img.setImage(
        rowData.program_details.Main_Image ||
          "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
      );
    }

    // 2) Program name
    card
      .getChildAsComponent<HTMLDivElement>("#cardProgramName")
      ?.setText(rowData.program_details.name);

    // 3) Update card href with program & subscription params
    const anchor = card.getElement() as HTMLAnchorElement;
    const url = new URL(anchor.getAttribute("href") || "#", window.location.origin);
    url.searchParams.set("program", String(rowData.program));
    url.searchParams.set("subscription", String(rowData.id));
    anchor.setAttribute("href", url.toString());

    // 4) Show the card
    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load and render data
  list.changeLoadingStatus(true);
  try {
    const subs = await fetchSubscriptions();

    // Dedupe: one subscription per program
    const uniqueByProgram = Array.from(
      subs.reduce<Map<number, Subscription>>((map, sub) => {
        if (!map.has(sub.program)) map.set(sub.program, sub);
        return map;
      }, new Map()).values()
    );

    // Sort alphabetically by program name
    uniqueByProgram.sort((a, b) =>
      a.program_details.name.localeCompare(b.program_details.name)
    );

    // Render into the list
    list.setData(uniqueByProgram);

    // Toggle buttons based on list length
    if (uniqueByProgram.length === 0) {
      if (addBtn) addBtn.style.display = "block";
      if (manageBtn) manageBtn.style.display = "none";
    } else {
      if (addBtn) addBtn.style.display = "none";
      if (manageBtn) manageBtn.style.display = "block";
    }
  } catch (error) {
    console.error("Error loading subscriptions:", error);
    list.setData([]);

    // On error, treat as empty list
    if (addBtn) addBtn.style.display = "block";
    if (manageBtn) manageBtn.style.display = "none";
  } finally {
    list.changeLoadingStatus(false);
  }
}
