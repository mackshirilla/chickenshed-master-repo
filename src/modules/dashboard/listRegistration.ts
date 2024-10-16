// src/pages/listSubscriptions.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// Define the Subscription interface based on the API response
interface Subscription {
  id: number;
  created_at: number; // Unix timestamp in milliseconds
  status: string; // e.g., 'Active', 'Inactive', 'Deposit Paid'
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

// Define the structure of the API response
interface SubscriptionApiResponse {
  subscriptions: Subscription[];
}

// Function to fetch subscriptions from the API
export async function fetchSubscriptions(): Promise<Subscription[]> {
  try {
    const getSubscriptions = apiClient.get<SubscriptionApiResponse>(
      "/subscriptions" // Ensure this endpoint is correct
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
  // Initialize a new instance of WFDynamicList for Subscriptions
  const list = new WFDynamicList<Subscription>(containerSelector, {
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

  // Customize the rendering of list items (Subscription Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const registrationCard = new WFComponent(rowElement);

    // Set the profile image
    const registrationImage = new WFImage(
      registrationCard
        .getChildAsComponent("#cardRegistrationImage") // Using ID selector
        .getElement()
    );
    if (rowData.image_url) {
      registrationImage.setImage(rowData.image_url);
    } else {
      registrationImage.setImage(
        "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
      );
    }

    // Set the program name
    const programName =
      registrationCard.getChildAsComponent("#cardProgramName"); // Using ID selector
    programName.setText(rowData.program_name);

    // Append the subscription parameter to the existing href
    const currentHref =
      registrationCard.getElement().getAttribute("href") || "#";
    const separator = currentHref.includes("?") ? "&" : "?";
    const newHref = `${currentHref}${separator}program=${rowData.program_id}`;
    registrationCard.getElement().setAttribute("href", newHref);

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display subscription data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const subscriptions = await fetchSubscriptions();

    // Filter unique subscriptions by program_id
    const uniqueSubscriptionsMap = new Map<string, Subscription>();
    subscriptions.forEach((sub) => {
      if (!uniqueSubscriptionsMap.has(sub.program_id)) {
        uniqueSubscriptionsMap.set(sub.program_id, sub);
      }
    });
    const uniqueSubscriptions = Array.from(uniqueSubscriptionsMap.values());

    // Sort subscriptions alphabetically by program name
    uniqueSubscriptions.sort((a, b) =>
      a.program_name.localeCompare(b.program_name)
    );

    // Set the data to be displayed in the dynamic list
    list.setData(uniqueSubscriptions);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading subscriptions:", error);

    // If there's an error, set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
