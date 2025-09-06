// src/pages/listAddOnRegistrations.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// ---------- Types ----------
interface ProgramDetails {
  id: number;
  name: string;
  slug?: string;
  Main_Image?: string | null;
}

interface SessionRegistration {
  id: number;
  status: string;              // "Active", etc.
  update_status: string;
  student_id: number;
  program_name: string;        // e.g. "Labs"
  workshop_name: string;       // e.g. "Dance Lab"
  weekday: string | null;
  time_block: string | null;
  location: string | null;
  parent_user_id: number;
  subscription_id: number;     // 0 for add-ons
  program_id: number;          // <— used for grouping
  workshop_id: number;
  session_id: number;
  location_id: number;
  created_at: number;          // ms
  move_to: number;
  product_id: number;
  update_product_id: number;
  cancellation_reason: string;
  cancelled_at: number | null;
  checkout_session_id: string;
  program_details?: ProgramDetails;
}

type SessionRegistrationsApi =
  | SessionRegistration[]
  | { data: SessionRegistration[] }; // handle both shapes defensively

// ---------- API ----------
export async function fetchAddOnRegistrations(): Promise<SessionRegistration[]> {
  const req = apiClient.get<SessionRegistrationsApi>("/session_registrations");
  const res = await req.fetch();

  // Normalize to a plain array either way
  const arr = Array.isArray(res) ? res : res?.data;
  return Array.isArray(arr) ? arr : [];
}

// ---------- List Init ----------
/**
 * Initialize the Add-On Registrations list.
 * HTML structure expected:
 *
 * div#listAddOnRegistration
 *   ├─ a#listAddOnRegistrationCard (template row)
 *   ├─ div#listAddOnRegistrationloading
 *   └─ div#listAddOnRegistrationEmpty
 */
export async function initializeDynamicAddOnRegistrationList(
  containerSelector: string = "#listAddOnRegistration"
) {
  const list = new WFDynamicList<SessionRegistration>(containerSelector, {
    rowSelector: "#listAddOnRegistrationCard",
    loaderSelector: "#listAddOnRegistrationloading",
    emptySelector: "#listAddOnRegistrationEmpty",
  });

  // Loader / Empty renderers
  list.loaderRenderer((el) => {
    el.setStyle({ display: "flex" });
    return el;
  });
  list.emptyRenderer((el) => {
    el.setStyle({ display: "flex" });
    return el;
  });

  // Card renderer
  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // Image
    const imgComp = card.getChildAsComponent<HTMLImageElement>("#cardAddOnRegistrationImage");
    if (imgComp) {
      const wfImg = new WFImage(imgComp.getElement());
      const src =
        rowData.program_details?.Main_Image ||
        "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg";
      wfImg.setImage(src);
      (wfImg.getElement() as HTMLImageElement).alt =
        rowData.program_details?.name || rowData.program_name || "Program";
    }

    // Program name
    card
      .getChildAsComponent("#cardAddOnProgramName")
      ?.setText(rowData.program_details?.name || rowData.program_name || "");

    // Link → /dashboard/registration/program?program={program_id}&subscription=none
    const anchor = card.getElement() as HTMLAnchorElement;
    const url = new URL(anchor.getAttribute("href") || "/dashboard/registration/program", window.location.origin);
    url.searchParams.set("program", String(rowData.program_id));
    url.searchParams.set("subscription", "none");
    anchor.setAttribute("href", url.toString());

    // Display the card
    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load + render
  list.changeLoadingStatus(true);
  try {
    const regs = await fetchAddOnRegistrations();

    // Deduplicate to one card per program_id (same idea as subscriptions)
    const uniqueByProgram = Array.from(
      regs.reduce<Map<number, SessionRegistration>>((map, reg) => {
        if (!map.has(reg.program_id)) map.set(reg.program_id, reg);
        return map;
      }, new Map()).values()
    );

    // Sort by program name (fallback to program_name)
    uniqueByProgram.sort((a, b) => {
      const an = a.program_details?.name || a.program_name || "";
      const bn = b.program_details?.name || b.program_name || "";
      return an.localeCompare(bn);
    });

    list.setData(uniqueByProgram);
  } catch (err) {
    console.error("Error loading add-on registrations:", err);
    list.setData([]);
  } finally {
    list.changeLoadingStatus(false);
  }
}

// Optional: auto-init on DOM ready for the provided HTML block
document.addEventListener("DOMContentLoaded", () => {
  // Only init if the container exists on this page
  if (document.querySelector("#listAddOnRegistration")) {
    initializeDynamicAddOnRegistrationList("#listAddOnRegistration");
  }
});
