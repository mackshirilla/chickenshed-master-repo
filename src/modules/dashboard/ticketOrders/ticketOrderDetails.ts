// src/pages/ticketOrder.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";

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

// Function to fetch ticket details from the API
export async function fetchTickets(orderId: number): Promise<{
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
    }>(`/dashboard/get_tickets/${orderId}`);
    const response = await getTickets.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }
}

// Function to initialize and render the ticket order page
export async function initializeTicketOrderPage() {
  // Extract the order ID from the URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = parseInt(urlParams.get("order")?.replace("?", "") || "0", 10);
  if (!orderId) {
    console.error("Invalid order ID");
    return;
  }

  try {
    // Fetch ticket details
    const response = await fetchTickets(orderId);

    if (!response) {
      console.error("Failed to fetch ticket details");
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

    // Set the performance name, date, and time to the breadcrumb
    const ticketOrderBreadcrumb = document.querySelector(
      "#ticketOrderBreadcrumb"
    );
    if (ticketOrderBreadcrumb) {
      const breadcrumbComponent = new WFComponent("#ticketOrderBreadcrumb");

      // Set the text to include performance name and date/time
      breadcrumbComponent.setText(
        `${order.performance_name} - ${date.toLocaleDateString([], {
          month: "2-digit",
          day: "2-digit",
          year: "2-digit",
        })} at ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
    }

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
    invoiceAmount.setText(`$${sale.amount_total}`);

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
                grid-template-columns: repeat(3, 1fr); /* Create 2 columns */
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
  }
}

const triggerSuccessEvent = (selector: string) => {
  const successTrigger = document.querySelector(selector);
  if (successTrigger instanceof HTMLElement) {
    successTrigger.click();
  }
};
