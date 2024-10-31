// src/success_page/tickets_success.ts

import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";
import { navigate } from "@xatom/core"; // Ensure navigate is imported for redirection

// Define the structure of the ticket response
interface TicketResponse {
  data: {
    id: number;
    status: string; // e.g., 'sold'
    production_name: string;
    performance_name: string;
    location: string;
    performance_date_time: number; // timestamp
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    custom_question_answer: string | number;
    assistance_required: boolean;
    assistance_message: string;
    checked_in: boolean;
    checked_in_time: string | null;
    user_id: number;
    contact_id: number;
    performance_id: string;
    created_at: number;
    sale_id: number;
    image_url: string;
    order_uuid: string;
    "success-page-message": string;
    quantity: number;
  };
}

// Define a TicketCard component to manage the ticket card DOM
class TicketCard {
  private card: WFComponent;
  private image: WFImage;
  private productionName: WFComponent;
  private performanceName: WFComponent;
  private performanceDate: WFComponent;
  private performanceId: string; // Track performance ID
  private quantity: WFComponent; // Track ticket quantity
  private orderId: string; // Track order UUID

  constructor(cardId: string, orderId: string) {
    const cardElement = document.getElementById(cardId);
    if (!cardElement) {
      throw new Error(`Element with id '${cardId}' not found.`);
    }

    // Initialize card and its child elements
    this.card = new WFComponent(cardElement);
    this.image = new WFImage(
      this.card.getChildAsComponent("#cardPerformanceImage").getElement()
    );
    this.productionName = this.card.getChildAsComponent("#cardProductionName");
    this.performanceName = this.card.getChildAsComponent(
      "#cardPerformanceName"
    );
    this.performanceDate = this.card.getChildAsComponent(
      "#cardPerformanceDate"
    );
    this.quantity = this.card.getChildAsComponent("#quantity");

    // Initialize performanceId and orderId to an empty string
    this.performanceId = "";
    this.orderId = orderId;

    // Log warnings if any essential child elements are missing
    if (!this.productionName) {
      console.warn(
        "Element with id 'cardProductionName' not found within the ticket card."
      );
    }
    if (!this.quantity) {
      console.warn(
        "Element with id 'quantity' not found within the ticket card."
      );
    }
    if (!this.performanceName) {
      console.warn(
        "Element with id 'cardPerformanceName' not found within the ticket card."
      );
    }
    if (!this.performanceDate) {
      console.warn(
        "Element with id 'cardPerformanceDate' not found within the ticket card."
      );
    }
    if (!this.image) {
      console.warn(
        "Element with id 'cardPerformanceImage' not found within the ticket card."
      );
    }
  }

  // Method to populate the ticket card with data
  populate(data: TicketResponse["data"]) {
    console.log("Populating ticket card with data.");

    // Set Performance ID
    this.performanceId = data.performance_id;
    console.log("Performance ID set to:", this.performanceId);

    // Set Production Name
    if (this.productionName) {
      this.productionName.setText(data.production_name);
      console.log("Set productionName:", data.production_name);
    }

    // Set Performance Name
    if (this.performanceName) {
      this.performanceName.setText(data.performance_name);
      console.log("Set performanceName:", data.performance_name);
    }

    // Set Performance Date
    if (this.performanceDate) {
      const formattedDate = new Date(data.performance_date_time).toLocaleString();
      this.performanceDate.setText(formattedDate);
      console.log("Set performanceDate:", formattedDate);
    }

    // Set Ticket Quantity
    if (this.quantity) {
      this.quantity.setText(data.quantity.toString());
      console.log("Set ticket quantity:", data.quantity);
    }

    // Set Performance Image
    if (data.image_url && this.image) {
      this.image.setImage(data.image_url);
      const imgElement = this.image.getElement() as HTMLImageElement;
      imgElement.alt = `${data.production_name} - Performance Image`;
      console.log("Set performance image URL and alt text.");
    }

    // Set Success Message
    const successMessageElement = document.querySelector("#successMessage");
    if (successMessageElement && successMessageElement instanceof HTMLElement) {
      successMessageElement.innerHTML = data["success-page-message"];
      successMessageElement.style.display = "block";
      console.log("Set and displayed success message.");
    }

    // Add the `performance` or `uuid` parameter to the ticket order link
    this.updateTicketOrderLink(data.order_uuid);
  }

  // Method to update the ticket order link with the appropriate parameters
  private updateTicketOrderLink(orderUuid: string) {
    // Since #ticketOrderCard is the link element, manipulate its href directly
    const ticketOrderLinkElement = this.card.getElement() as HTMLAnchorElement;

    if (!ticketOrderLinkElement) {
      console.warn("ticketOrderCard element is not an anchor element.");
      return;
    }

    const currentHref = ticketOrderLinkElement.getAttribute("href") || "#";
    console.log("Current href before update:", currentHref);

    try {
      if (localStorage.getItem("auth_config")) {
        // User is authenticated, proceed with adding performance and order parameters
        const url = new URL(currentHref, window.location.origin);
        url.searchParams.set("performance", this.performanceId);
        url.searchParams.set("order", this.orderId);
        ticketOrderLinkElement.setAttribute("href", url.toString());
        console.log(
          "Updated ticket order link with performance and order parameters:",
          url.toString()
        );
      } else {
        // User is not authenticated, set href to /ticket-order?uuid={order_uuid}
        const newHref = `/ticket-order?uuid=${encodeURIComponent(orderUuid)}`;
        ticketOrderLinkElement.setAttribute("href", newHref);
        console.log(
          "Updated ticket order link to /ticket-order with uuid:",
          newHref
        );
      }
    } catch (error) {
      console.error("Error updating ticket order link:", error);
      alert("An error occurred while updating the ticket order link.");
    }
  }

  // Method to display the ticket card
  show() {
    const cardElement = this.card.getElement();
    if (cardElement instanceof HTMLElement) {
      cardElement.style.display = "block";
      console.log("Displayed ticket card.");
    }
  }
}

// Utility function to parse URL parameters
const getUrlParams = () => {
  const params = new URLSearchParams(window.location.search);
  const isTicketPurchase = params.has("ticket_purchase");
  const orderId = params.get("order");
  return { isTicketPurchase, orderId };
};

// Main function to handle ticket success
export const handleTicketSuccess = async () => {
  console.log("Handling ticket success");
  const { isTicketPurchase, orderId } = getUrlParams();

  if (isTicketPurchase && orderId) {
    try {
      console.log("Fetching ticket order data...");
      // Make the GET request to fetch ticket order data
      const request = apiClient.get<TicketResponse>(
        `/success_page/tickets/${orderId}`
      );

      // Wrap the event-based response in a Promise for easier handling
      const ticketData: TicketResponse["data"] = await new Promise(
        (resolve, reject) => {
          request.onData((response) => {
            console.log("Ticket data received:", response.data);
            resolve(response.data);
          });

          request.onError((error) => {
            console.error("API Error:", error);
            reject(error);
          });

          // Initiate the request
          request.fetch();
        }
      );

      // Trigger the success_trigger element (assuming it has an event listener)
      const successTrigger = document.querySelector(".success_trigger");
      if (successTrigger && successTrigger instanceof HTMLElement) {
        console.log("Triggering success_trigger element.");
        successTrigger.click();
      }

      // Initialize and populate the ticket card
      const ticketCard = new TicketCard("ticketOrderCard", orderId);
      ticketCard.populate(ticketData);
      ticketCard.show();
    } catch (error) {
      console.error("Error fetching ticket data:", error);
      alert(
        "An error occurred while processing your ticket order. Please contact us for assistance."
      );
    }
  } else {
    console.log("Ticket purchase parameters not found in URL.");
    alert(
      "Ticket purchase parameters not found in the URL. Please check your link and try again."
    );
  }
};
