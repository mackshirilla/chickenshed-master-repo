// src/modules/dashboard/listTicketOrders.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// ——————————————————————————————————————————————————
// TICKET ORDER & DETAILS INTERFACES
// ——————————————————————————————————————————————————
interface TicketRecord {
  id: number;
}

interface PerformanceDetails {
  id: number;
  Displayed_Name: string;
  Main_Image: string;
  Short_Description: string;
  Date_Time: number;
}

interface ProductionDetails {
  id: number;
  Name: string;
}

interface TicketOrder {
  id: number;
  order_uuid: string;
  status: string;
  performance_id: number;
  performance_date_time: number;
  ticket_records: TicketRecord[];
  performance_details: PerformanceDetails;
  production_details: ProductionDetails;
}

// ——————————————————————————————————————————————————
// FETCH FUNCTION
// ——————————————————————————————————————————————————
export async function fetchTicketOrders(): Promise<TicketOrder[]> {
  const req = apiClient.get<TicketOrder[]>("/dashboard/ticket_orders");
  return await req.fetch();
}

// ——————————————————————————————————————————————————
// DYNAMIC LIST INITIALIZER
// ——————————————————————————————————————————————————
export async function initializeDynamicTicketOrderList(
  containerSelector: string
) {
  const list = new WFDynamicList<TicketOrder>(containerSelector, {
    rowSelector: "#listTicketsCard",
    loaderSelector: "#listTicketsloading",
    emptySelector: "#listTicketsEmpty",
  });

  list.loaderRenderer((loaderEl) => {
    loaderEl.setStyle({ display: "flex" });
    return loaderEl;
  });

  list.emptyRenderer((emptyEl) => {
    emptyEl.setStyle({ display: "flex" });
    return emptyEl;
  });

  // — formatters for New York —
  const fmtDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      timeZone: "America/New_York",
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    });
  const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // Performance image
    const imgComp = card.getChildAsComponent("#cardPerformanceImage");
    if (imgComp) {
      const img = new WFImage(imgComp.getElement());
      img.setImage(rowData.performance_details.Main_Image);
    }

    // Production Name
    const prodComp = card.getChildAsComponent("#cardProductionName");
    prodComp?.setText(rowData.production_details.Name);

    // Performance Name
    const perfComp = card.getChildAsComponent("#cardPerformanceName");
    perfComp?.setText(rowData.performance_details.Displayed_Name);

    // Performance Date & Time in NYC
    const dateComp = card.getChildAsComponent("#cardPerformanceDate");
    if (dateComp) {
      const ts = rowData.performance_details.Date_Time;
      dateComp.setText(`${fmtDate(ts)} at ${fmtTime(ts)}`);
    }

    // Quantity = number of ticket_records
    const qtyComp = card.getChildAsComponent("#quantity");
    qtyComp?.setText(String(rowData.ticket_records.length));

    // Build link with order_uuid param only
    const anchor = card.getElement() as HTMLAnchorElement;
    const href = anchor.getAttribute("href") || "/";
    const url = new URL(href, window.location.origin);
    url.searchParams.set("order", rowData.order_uuid);
    anchor.setAttribute("href", url.toString());

    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  try {
    list.changeLoadingStatus(true);

    const orders = await fetchTicketOrders();
    orders.sort(
      (a, b) =>
        a.performance_details.Date_Time - b.performance_details.Date_Time
    );
    list.setData(orders);
  } catch (err) {
    console.error("Error loading ticket orders:", err);
    list.setData([]);
  } finally {
    list.changeLoadingStatus(false);
  }
}
