// src/pages/listTicketOrders.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// Define the TicketOrder interface based on the API response
interface TicketOrder {
  id: number;
  status: string; // e.g., 'sold'
  production_name: string;
  performance_name: string;
  location: string;
  performance_date_time: number; // Unix timestamp in milliseconds
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  custom_question_answer?: string | null;
  assistance_required: boolean;
  assistance_message?: string | null;
  checked_in: boolean;
  checked_in_time?: string | null;
  user_id: number;
  contact_id: number;
  performance_id: string;
  created_at: number;
  sale_id: number;
  image_url: string;
  quantity: number; // Added quantity field
}

// Function to fetch ticket orders from the API
export async function fetchTicketOrders(): Promise<TicketOrder[]> {
  try {
    const getTicketOrders = apiClient.get<TicketOrder[]>(
      "/dashboard/ticket_orders" // Ensure this endpoint is correct
    );
    const response = await getTicketOrders.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching ticket orders:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic ticket order list
export async function initializeDynamicTicketOrderList(
  containerSelector: string
) {
  // Initialize a new instance of WFDynamicList for Ticket Orders
  const list = new WFDynamicList<TicketOrder>(containerSelector, {
    rowSelector: "#listTicketsCard", // Using ID selector for template
    loaderSelector: "#listTicketsloading", // Selector for the loader
    emptySelector: "#listTicketsEmpty", // Selector for the empty state
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

  // Customize the rendering of list items (Ticket Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const ticketCard = new WFComponent(rowElement);

    // Set the performance image
    const performanceImageComponent = ticketCard.getChildAsComponent(
      "#cardPerformanceImage"
    );
    if (performanceImageComponent) {
      const performanceImage = new WFImage(
        performanceImageComponent.getElement()
      );
      if (rowData.image_url) {
        performanceImage.setImage(rowData.image_url);
      } else {
        performanceImage.setImage(
          "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
        );
      }
    }

    // Set the production name
    const productionName = ticketCard.getChildAsComponent(
      "#cardProductionName"
    );
    if (productionName) {
      productionName.setText(rowData.production_name);
    }

    // Set the performance name
    const performanceName = ticketCard.getChildAsComponent(
      "#cardPerformanceName"
    );
    if (performanceName) {
      performanceName.setText(rowData.performance_name);
    }

    // Set the performance date
    const performanceDate = ticketCard.getChildAsComponent(
      "#cardPerformanceDate"
    );
    if (performanceDate) {
      const date = new Date(rowData.performance_date_time);
      performanceDate.setText(date.toLocaleString());
    }

    // Set the ticket quantity using the quantity value from the response
    const ticketQuantity = ticketCard.getChildAsComponent("#quantity");
    if (ticketQuantity) {
      ticketQuantity.setText(rowData.quantity.toString());
    }

    // Append the performance parameter to the existing href
    const ticketCardElement = ticketCard.getElement() as HTMLAnchorElement;
    const currentHref = ticketCardElement.getAttribute("href") || "#";
    const url = new URL(currentHref, window.location.origin);
    url.searchParams.set("performance", rowData.performance_id);
    url.searchParams.set("order", rowData.id.toString());
    ticketCardElement.setAttribute("href", url.toString());

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display ticket order data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const ticketOrders = await fetchTicketOrders();

    // Filter unique ticket orders by performance_id
    const uniqueTicketOrdersMap = new Map<string, TicketOrder>();
    ticketOrders.forEach((order) => {
      if (!uniqueTicketOrdersMap.has(order.performance_id)) {
        uniqueTicketOrdersMap.set(order.performance_id, order);
      }
    });
    const uniqueTicketOrders = Array.from(uniqueTicketOrdersMap.values());

    // Sort ticket orders by performance date and time in ascending order
    uniqueTicketOrders.sort(
      (a, b) => a.performance_date_time - b.performance_date_time
    );

    // Set the data to be displayed in the dynamic list
    list.setData(uniqueTicketOrders);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading ticket orders:", error);

    // If there's an error, set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
