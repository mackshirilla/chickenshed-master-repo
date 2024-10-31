// src/pages/ticketOrderNoLogin.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";
import { navigate } from "@xatom/core"; // Ensure navigate is imported for potential redirection

// Define the Ticket interface based on the API response
interface Ticket {
  id: number;
  status: string;
  production_name: string;
  performance_name: string;
  performance_date_time: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  ticket_tier_name: string;
  seating_assignment: string;
  checked_in: boolean;
  checked_in_time?: string | null;
  ticket_order_id: number;
  user_id: number;
  contact_id: number;
  ticket_tier_id: string;
  performance_id: string;
  tickets_available_id: string;
  created_at: number;
  quantity: number;
  qr_code: {
    url: string;
  };
}

// Define the Ticket Order interface
interface TicketOrder {
  id: number;
  status: string;
  production_name: string;
  performance_name: string;
  location: string;
  performance_date_time: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  custom_question_answer: string;
  assistance_required: boolean;
  assistance_message: string;
  checked_in: boolean;
  checked_in_time?: string | null;
  user_id: number;
  contact_id: number;
  performance_id: string;
  created_at: number;
  sale_id: number;
  image_url: string;
}

// Define the Sale interface
interface Sale {
  id: number;
  created_at: number;
  contact_id: number;
  user_id: number;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  amount_total: number;
  reciept_url: string;
}

// Define the Performance interface
interface Performance {
  performance: {
    response: {
      result: {
        fieldData: {
          "short-description": string;
        };
      };
    };
  };
  production: {
    response: {
      result: {
        fieldData: {
          name: string;
          "short-description": string;
        };
      };
    };
  };
  location: {
    response: {
      result: {
        fieldData: {
          "map-embed": string;
        };
      };
    };
  };
}

// Function to fetch ticket details from the API using uuid
export async function fetchTickets(uuid: string): Promise<{
  tickets: Ticket[];
  order: TicketOrder;
  sale: Sale;
  performance: Performance;
} | null> {
  try {
    const getTickets = apiClient.get<{
      tickets: Ticket[];
      order: TicketOrder;
      sale: Sale;
      performance: Performance;
    }>(`/tickets/get_tickets/${encodeURIComponent(uuid)}`);
    const response = await getTickets.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }
}

// Define the TicketOrderCard component to manage the ticket card DOM
class TicketCard {
  private card: WFComponent;
  private image: WFImage;
  private productionName: WFComponent;
  private performanceName: WFComponent;
  private performanceDate: WFComponent;
  private performanceId: string; // Track performance ID
  private quantity: WFComponent; // Track ticket quantity
  private orderUuid: string; // Track order UUID

  constructor(cardId: string, orderUuid: string) {
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

    // Initialize performanceId and orderUuid to an empty string
    this.performanceId = "";
    this.orderUuid = orderUuid;

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
  populate(data: Ticket) {
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
      const formattedDate = new Date(data.performance_date_time).toLocaleString([], {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
      this.performanceDate.setText(formattedDate);
      console.log("Set performanceDate:", formattedDate);
    }

    // Set Ticket Quantity
    if (this.quantity) {
      this.quantity.setText(data.quantity.toString());
      console.log("Set ticket quantity:", data.quantity);
    }

    // Set Performance Image (QR Code)
    if (data.qr_code.url && this.image) {
      this.image.setImage(data.qr_code.url);
      const imgElement = this.image.getElement() as HTMLImageElement;
      imgElement.alt = `${data.production_name} - QR Code`;
      console.log("Set performance QR code URL and alt text.");
    }

    // Add the `performance` or `uuid` parameter to the ticket order link
    this.updateTicketOrderLink();
  }

  // Method to update the ticket order link with the appropriate parameters
  private updateTicketOrderLink() {
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
        url.searchParams.set("order", this.orderUuid);
        ticketOrderLinkElement.setAttribute("href", url.toString());
        console.log(
          "Updated ticket order link with performance and order parameters:",
          url.toString()
        );
      } else {
        // User is not authenticated, set href to /ticket-order?uuid={uuid}
        const newHref = `/ticket-order?uuid=${encodeURIComponent(this.orderUuid)}`;
        ticketOrderLinkElement.setAttribute("href", newHref);
        console.log(
          "Updated ticket order link to /ticket-order with uuid:",
          newHref
        );

        // Additionally, disable the link and make it non-interactive
        ticketOrderLinkElement.style.pointerEvents = "none"; // Disable pointer events
        ticketOrderLinkElement.style.opacity = "0.5"; // Visually indicate disabled state
        ticketOrderLinkElement.style.cursor = "not-allowed"; // Change cursor to indicate non-interactivity
        ticketOrderLinkElement.title = "Please log in to proceed."; // Add tooltip
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
  const uuid = params.get("uuid");
  return { uuid };
};

// Function to trigger success event
const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};

// Main function to handle ticket order page for users without login
export async function initializeTicketOrderNoLoginPage() {
  // Extract the uuid from the URL parameters
  const { uuid } = getUrlParams();
  if (!uuid) {
    console.error("Invalid or missing uuid in URL");
    alert("Invalid or missing order UUID. Please check your link and try again.");
    return;
  }

  try {
    // Fetch ticket details
    const response = await fetchTickets(uuid);

    if (!response) {
      console.error("Failed to fetch ticket details");
      alert("Failed to retrieve ticket details. Please try again later.");
      return;
    }

    triggerSuccessEvent(".success_trigger");

    const { tickets, order, sale, performance } = response;

    // Set the production and performance details
    const productionName = new WFComponent("#productionName");
    productionName.setText(order.production_name);

    const performanceName = new WFComponent("#performanceName");
    performanceName.setText(order.performance_name);

    const performanceLocation = new WFComponent("#performanceLocation");
    performanceLocation.setText(order.location);

    // Set the performance time and date separately
    const performanceDate = new WFComponent("#performanceDate");
    const date = new Date(order.performance_date_time);
    performanceDate.setText(
      date.toLocaleDateString([], {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    );

    const performanceTime = new WFComponent("#performanceTime");
    performanceTime.setText(
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );

    // Set the location map
    const performanceLocationMap = new WFComponent("#performanceLocationMap");
    performanceLocationMap.getElement().innerHTML =
      performance.location.response.result.fieldData["map-embed"];

    // Apply styling to make sure the map and its container fill properly
    const figureElement = document.querySelector(
      "#performanceLocationMap figure"
    ) as HTMLElement;
    const iframeElement = document.querySelector(
      "#performanceLocationMap iframe"
    ) as HTMLElement;
    const firstChildDiv = document.querySelector(
      "#performanceLocationMap figure > div"
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

    // Set the description
    const performanceShortDescription = new WFComponent(
      "#performanceShortDescription"
    );
    performanceShortDescription.setText(
      performance.performance.response.result.fieldData["short-description"] ||
        "Description not available."
    );

    // Set assistance requested status
    const assistanceRequestedTrue = new WFComponent("#assistanceRequestedTrue");
    const assistanceRequestedFalse = new WFComponent(
      "#assistanceRequestedFalse"
    );
    if (order.assistance_required) {
      assistanceRequestedTrue.setStyle({ display: "block" });
      assistanceRequestedFalse.setStyle({ display: "none" });
    } else {
      assistanceRequestedTrue.setStyle({ display: "none" });
      assistanceRequestedFalse.setStyle({ display: "block" });
    }

    const assistanceMessage = new WFComponent("#assistanceMessage");
    assistanceMessage.setText(order.assistance_message || "N/A");

    // Set the billing information
    const invoiceDate = new WFComponent("#invoiceDate");
    const saleDateFormatted = new Date(sale.created_at);
    invoiceDate.setText(
      saleDateFormatted.toLocaleDateString([], {
        month: "2-digit",
        day: "2-digit",
        year: "2-digit",
      })
    );

    const invoiceAmount = new WFComponent("#invoiceAmount");
    invoiceAmount.setText(`$${sale.amount_total.toFixed(2)}`);

    const receiptButton = new WFComponent("#receiptButton");
    receiptButton.getElement().setAttribute("href", sale.reciept_url);

    // Initialize and render the list of tickets
    const ticketList = new WFDynamicList<Ticket>("#ticketList", {
      rowSelector: "#ticketItem",
    });

    // Sort tickets by ID
    tickets.sort((a, b) => a.id - b.id);

    // Customize the rendering of list items (Ticket Cards)
    ticketList.rowRenderer(({ rowData, rowElement }) => {
      const ticketCard = new WFComponent(rowElement);

      // Set the QR code image
      const qrCodeImage = new WFImage(
        ticketCard.getChildAsComponent(".ticket_qr").getElement()
      );
      qrCodeImage.setImage(rowData.qr_code.url);

      // Set the production name
      const ticketProductionName = ticketCard.getChildAsComponent(
        "#ticketProductionName"
      );
      ticketProductionName.setText(rowData.production_name);

      // Set the performance name
      const ticketPerformanceName = ticketCard.getChildAsComponent(
        "#ticketPerformanceName"
      );
      ticketPerformanceName.setText(rowData.performance_name);

      // Set the performance date
      const ticketPerformanceDate = ticketCard.getChildAsComponent(
        "#ticketPerformanceDate"
      );
      const ticketDate = new Date(rowData.performance_date_time);
      ticketPerformanceDate.setText(
        `${ticketDate.toLocaleDateString([], {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })} at ${ticketDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );

      // Set the ticket tier
      const ticketTier = ticketCard.getChildAsComponent("#ticketTicketTier");
      ticketTier.setText(rowData.ticket_tier_name);

      // Set the seating assignment
      const seatingAssignment = ticketCard.getChildAsComponent(
        "#ticketSeatingAssignment"
      );
      seatingAssignment.setText(rowData.seating_assignment);

      return rowElement;
    });

    // Set the tickets data to the dynamic list
    ticketList.setData(tickets);

    // Add event listener for printing tickets
    const printTicketsButton = new WFComponent("#printTickets");
    printTicketsButton.on("click", () => {
      const ticketListElement = document.querySelector(
        "#ticketList"
      ) as HTMLElement;

      if (ticketListElement) {
        // Open a new window with specified size for printing
        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (printWindow) {
          // Get all stylesheets from the current document
          const styleSheets = Array.from(document.styleSheets)
            .map((styleSheet) => {
              try {
                return styleSheet.href
                  ? `<link rel="stylesheet" href="${styleSheet.href}">`
                  : "";
              } catch (e) {
                console.error("Error accessing stylesheet:", e);
                return "";
              }
            })
            .join("");

          // Extract production name, performance name, and performance date/time for hero section
          const productionName =
            (document.querySelector("#productionName") as HTMLElement)
              ?.innerText || "Production Name";
          const performanceName =
            (document.querySelector("#performanceName") as HTMLElement)
              ?.innerText || "Performance Name";
          const performanceDate =
            (document.querySelector("#performanceDate") as HTMLElement)
              ?.innerText || "Performance Date";
          const performanceTime =
            (document.querySelector("#performanceTime") as HTMLElement)
              ?.innerText || "Performance Time";

          // Create a printable HTML with styles included
          printWindow.document.write(`
            <html>
              <head>
                <title>Print Tickets</title>
                ${styleSheets}
                <style>
                  /* Additional print-specific styling to handle layout and formatting */
                  body {
                    background-color: var(--theme--background);
                    font-family: var(--text-main--font-family);
                    color: #121331;
                    font-size: var(--text-main--font-size);
                    line-height: var(--text-main--line-height);
                    letter-spacing: var(--text-main--letter-spacing);
                    overscroll-behavior: none;
                    font-weight: var(--text--font-weight);
                    text-transform: var(--text--text-transform);
                    padding: 1rem 3rem; 
                  }
                  
                  #ticketList {
                    display: grid; /* Set display to grid */
                    grid-template-columns: repeat(3, 1fr); /* Create 3 columns */
                    gap: 20px; /* Add some spacing between the grid items */
                    color: black; /* Set color to black for ticket list */
                  }

                  .ticket_wrap {
                    page-break-inside: avoid; /* Avoid breaking ticket content across pages */
                  }

                  * {
                    box-sizing: border-box;
                  }

                  .hero-section {
                    text-align: center;
                    margin-bottom: 2rem;
                  }

                  .hero-section h1 {
                    margin: 0;
                    font-size: 2rem;
                    font-weight: bold;
                  }

                  .hero-section p {
                    margin: 0.5rem 0;
                    font-size: 1.25rem;
                  }
                </style>
              </head>
              <body>
                <div class="hero-section">
                  <h1>${productionName}</h1>
                  <p><strong>${performanceName}</strong></p>
                  <p>${performanceDate} at ${performanceTime}</p>
                </div>
                ${ticketListElement.outerHTML}
              </body>
            </html>
          `);

          printWindow.document.close();
          printWindow.print();
        }
      }
    });
  } catch (error) {
    console.error("Error initializing ticket order page:", error);
    alert("An error occurred while loading your ticket order. Please try again later.");
  }
}
