import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// ———————————————————————————————————————
// COMPONENT INSTANCES
// ———————————————————————————————————————
const successTriggerComp = new WFComponent(
  document.querySelector<HTMLElement>(".success_trigger")!
);

const ticketCardComp = new WFComponent(
  document.getElementById("ticketOrderCard")!
);

const cardImageComp = new WFImage(
  ticketCardComp
    .getChildAsComponent("#cardPerformanceImage")
    .getElement() as HTMLImageElement
);

const productionNameComp = ticketCardComp.getChildAsComponent(
  "#cardProductionName"
)!;

const performanceNameComp = ticketCardComp.getChildAsComponent(
  "#cardPerformanceName"
)!;

const performanceDateComp = ticketCardComp.getChildAsComponent(
  "#cardPerformanceDate"
)!;

const quantityComp = ticketCardComp.getChildAsComponent("#quantity")!;

const successMessageComp = new WFComponent(
  document.getElementById("successMessage")!
);

// ———————————————————————————————————————
// TICKET DATA INTERFACES
// ———————————————————————————————————————
interface PerformanceDetails {
  id: number;
  Displayed_Name: string;
  Date_Time: number;
  Main_Image: string;
  Success_Page_Message: string;
}

interface ProductionDetails {
  id: number;
  Name: string;
}

interface TicketData {
  id: number;
  order_uuid: string;
  status: string;
  production_id: number;
  performance_id: number;
  quantity: number;
  performance_details: PerformanceDetails;
  production_details: ProductionDetails;
}

// ———————————————————————————————————————
// POPULATOR FUNCTION
// ———————————————————————————————————————
export async function populateTicketSuccess() {
  // 0) grab orderUuid from URL
  const params = new URLSearchParams(window.location.search);
  const orderUuid = params.get("order");
  if (!orderUuid) {
    console.error("Missing 'order' parameter in URL.");
    alert("Missing order identifier in URL.");
    return;
  }

  // 1) Fetch the ticket data
  const req = apiClient.get<{ data: TicketData }>(
    `/success_page/tickets/${orderUuid}`
  );

  try {
    const { performance_details, production_details, quantity, order_uuid } =
      await new Promise<TicketData>((resolve, reject) => {
        req.onData((res) => resolve(res.data));
        req.onError((err) => reject(err));
        req.fetch();
      });

    // 2) Trigger your Webflow success animation
    successTriggerComp.getElement().click();

    // 3) Populate all WFComponents
    // Image
    cardImageComp.setImage(performance_details.Main_Image);
    (cardImageComp.getElement() as HTMLImageElement).alt =
      `${production_details.Name} — ${performance_details.Displayed_Name}`;

    // Text fields
    productionNameComp.setText(production_details.Name);
    performanceNameComp.setText(performance_details.Displayed_Name);

    // Always format the date+time in New York
    performanceDateComp.setText(
      new Date(performance_details.Date_Time).toLocaleString("en-US", {
        timeZone: "America/New_York",
        month:   "numeric",
        day:     "numeric",
        year:    "numeric",
        hour:    "numeric",
        minute:  "2-digit",
        hour12:  true
      })
    );

    quantityComp.setText(String(quantity));
    successMessageComp.setText(
      performance_details.Success_Page_Message
    );

    // 4) Update the ticket-order link with performance & order params
    const anchor = ticketCardComp.getElement() as HTMLAnchorElement;
    try {
      const url = new URL(anchor.getAttribute("href")!, window.location.origin);
      url.searchParams.set("performance", String(performance_details.id));
      url.searchParams.set("order", order_uuid);
      anchor.setAttribute("href", url.toString());
    } catch {
      anchor.setAttribute(
        "href",
        `/ticket-order?uuid=${encodeURIComponent(order_uuid)}`
      );
    }

    // 5) Show the card
    (ticketCardComp.getElement() as HTMLElement).style.display = "block";
  } catch (err) {
    console.error("Ticket success load error:", err);
    alert(
      "We ran into a problem loading your ticket confirmation. Please reach out to support."
    );
  }
}
