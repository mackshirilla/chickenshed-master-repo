// src/pages/ticketOrderNoLogin.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// ——————————————————————————————————————————————————
// DATA INTERFACES
// ——————————————————————————————————————————————————
interface Ticket {
  id: number;
  status: string;
  ticket_order_id: number;
  ticket_tier: { id: number; Displayed_Name: string }[];
  seating_assignment: string;
}

interface Order {
  id: number;
  order_uuid: string;
  status: string;
  production_details: { id: number; Name: string };
  performance_id: number;
  performance_date_time: number;
  assistance_required: boolean;
  assistance_message: string;
}

interface Performance {
  id: number;
  Displayed_Name: string;
  Main_Image: string;
  Short_Description: string;
  Date_Time: number;
  production_details: { id: number; Name: string };
  location_details: {
    id: number;
    Name: string;
    Address_line_1: string;
    City_state_zip: string;
    Map_embed: string;
  };
}

// ——————————————————————————————————————————————————
// FETCH FUNCTION (uses `order` param)
// ——————————————————————————————————————————————————
export async function fetchTickets(
  orderUuid: string
): Promise<{ tickets: Ticket[]; order: Order; performance: Performance } | null> {
  try {
    const req = apiClient.get<{
      tickets: Ticket[];
      order: Order;
      performance: Performance;
    }>(`/tickets/get_tickets/${orderUuid}`);
    return await req.fetch();
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }
}

// ——————————————————————————————————————————————————
// PAGE INITIALIZER
// ——————————————————————————————————————————————————
export async function initializeTicketOrderNoLoginPage() {
  const params = new URLSearchParams(window.location.search);
  const orderUuid = params.get("order");
  if (!orderUuid) {
    console.error("Missing order UUID");
    return;
  }

  const data = await fetchTickets(orderUuid);
  if (!data) {
    console.error("Failed to fetch ticket details");
    return;
  }
  const { tickets, order, performance } = data;

  // Trigger success if needed
  document.querySelector<HTMLElement>(".success_trigger")?.click();

  // — formatters for NYC —
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Order header
  new WFComponent("#productionName").setText(
    performance.production_details.Name
  );
  new WFComponent("#performanceName").setText(performance.Displayed_Name);
  new WFComponent("#performanceLocation").setText(
    performance.location_details.Name
  );
  new WFComponent("#performanceDate").setText(
    fmtDate(performance.Date_Time)
  );
  new WFComponent("#performanceTime").setText(
    fmtTime(performance.Date_Time)
  );

  // Map embed
  const mapComp = new WFComponent("#performanceLocationMap");
  mapComp.getElement().innerHTML = performance.location_details.Map_embed;
  const fig = mapComp.getElement().querySelector("figure") as HTMLElement;
  const div = mapComp.getElement().querySelector("figure > div") as HTMLElement;
  const ifr = mapComp.getElement().querySelector("iframe") as HTMLElement;
  if (fig) fig.style.cssText = "width:100%;height:100%;padding:0;margin:0;";
  if (div) div.style.cssText = "width:100%;height:100%;";
  if (ifr) ifr.style.cssText = "width:100%;height:100%;border:0;";

  // Assistance section
  if (order.assistance_required) {
    new WFComponent("#assistanceRequestedTrue").setStyle({ display: "block" });
    new WFComponent("#assistanceRequestedFalse").setStyle({ display: "none" });
  } else {
    new WFComponent("#assistanceRequestedTrue").setStyle({ display: "none" });
    new WFComponent("#assistanceRequestedFalse").setStyle({ display: "block" });
  }
  new WFComponent("#assistanceMessage").setText(
    order.assistance_message || "N/A"
  );

  // Short description
  new WFComponent("#performanceShortDescription").setText(
    performance.Short_Description || ""
  );

  // Ticket list
  const list = new WFDynamicList<Ticket>("#ticketList", {
    rowSelector: "#ticketItem",
  });
  tickets.sort((a, b) => a.id - b.id);
  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // QR code
    new WFImage(
      card.getChildAsComponent(".ticket_qr").getElement()
    ).setImage(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${rowData.id}`
    );

    // Production & performance
    card.getChildAsComponent("#ticketProductionName").setText(
      performance.production_details.Name
    );
    card.getChildAsComponent("#ticketPerformanceName").setText(
      performance.Displayed_Name
    );

    // Date & time
    card.getChildAsComponent("#ticketPerformanceDate").setText(
      `${fmtDate(performance.Date_Time)} at ${fmtTime(
        performance.Date_Time
      )}`
    );

    // Tier & seating
    card.getChildAsComponent("#ticketTicketTier").setText(
      rowData.ticket_tier[0].Displayed_Name
    );
    card.getChildAsComponent("#ticketSeatingAssignment").setText(
      rowData.seating_assignment
    );

    return rowElement;
  });
  list.setData(tickets);

  // Print tickets
  new WFComponent("#printTickets").on("click", () => {
    const container = document.querySelector("#ticketList") as HTMLElement;
    if (!container) return;
  
    const w = window.open("", "_blank", "width=800,height=600");
    if (!w) return;
  
    const styles = Array.from(document.styleSheets)
      .map((ss) => (ss.href ? `<link rel="stylesheet" href="${ss.href}">` : ""))
      .join("\n");
  
    const headerHTML = `
      <div class="hero-section">
        <h1>${performance.production_details.Name}</h1>
        <p>${fmtDate(performance.Date_Time)} at ${fmtTime(performance.Date_Time)}</p>
      </div>`;
  
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Tickets</title>
          ${styles}
          <style>
            body, #ticketList, .ticket_wrap, .hero-section, h1, p {
              color: black !important;
            }
            body { padding:1rem 3rem; }
            #ticketList { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
            .ticket_wrap { page-break-inside:avoid; }
            .hero-section { text-align:center; margin-bottom:2rem; }
            .hero-section h1 { margin:0; font-size:2rem; }
            .hero-section p { margin:.5rem 0; font-size:1.25rem; }
          </style>
        </head>
        <body>
          ${headerHTML}
          ${container.outerHTML}
        </body>
      </html>`;
  
    w.document.write(html);
    w.document.close();
  
    w.onload = () => {
      const images = w.document.images;
      let loaded = 0;
      const total = images.length;
  
      if (total === 0) {
        w.print();
        return;
      }
  
      Array.from(images).forEach((img) => {
        img.onload = img.onerror = () => {
          loaded++;
          if (loaded === total) {
            w.print();
          }
        };
      });
    };
  });
  
}
