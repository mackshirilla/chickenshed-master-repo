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
  // workshop_details?: WorkshopDetails; // We won't use this anymore
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

    // Use only program details for the image
    const imageUrl = rowData.program_details.Main_Image;

    // Set the profile image
    const registrationImage = new WFImage(
      registrationCard.getChildAsComponent("#cardRegistrationImage").getElement()
    );
    if (imageUrl) {
      registrationImage.setImage(imageUrl);
    } else {
      registrationImage.setImage(
        "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
      );
    }

    // Set the program name from program_details
    const programNameComponent = registrationCard.getChildAsComponent(
      "#cardProgramName"
    );
    programNameComponent.setText(rowData.program_details.name);

    // Append the program parameter to the existing href
    const currentHref = registrationCard.getElement().getAttribute("href") || "#";
    const separator = currentHref.includes("?") ? "&" : "?";
    const newHref = `${currentHref}${separator}program=${rowData.program}`;
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

    // Filter unique subscriptions by numeric program ID
    const uniqueSubscriptionsMap = new Map<number, Subscription>();
    subscriptions.forEach((sub) => {
      // Only add the subscription if we haven't encountered this program ID yet
      if (!uniqueSubscriptionsMap.has(sub.program)) {
        uniqueSubscriptionsMap.set(sub.program, sub);
      }
    });

    const uniqueSubscriptions = Array.from(uniqueSubscriptionsMap.values());

    // Sort subscriptions alphabetically by program_details.name
    uniqueSubscriptions.sort((a, b) =>
      a.program_details.name.localeCompare(b.program_details.name)
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
