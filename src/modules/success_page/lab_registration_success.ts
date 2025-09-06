// src/success_page/lab_registration_success.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

// ---------- Types ----------
interface ProgramDetails {
  id: number;
  name: string;
  Main_Image?: string | null;
}
interface WorkshopDetails {
  id: number;
  Name: string;
  Main_Image?: string | null;
}
interface SessionDetails {
  id: number;
  Name: string;
  Start_Date: number | null;
}
export interface LabRegistrationItem {
  id: number;
  status: string;
  program_name: string;
  workshop_name: string;
  session_id: number;
  workshop_id: number; // present in API; used for grouping
  checkout_session_id: string;
  program_details?: ProgramDetails | null;
  workshop_details?: WorkshopDetails | null;
  session_details?: SessionDetails | null;
}
interface ApiResponse {
  data: LabRegistrationItem[];
}

// ---------- Helpers ----------
const getSessionIdFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  // Your success URLs use ?order={CHECKOUT_SESSION_ID}; fall back to ?session_id
  return params.get("order") || params.get("session_id");
};

const chooseImage = (item: LabRegistrationItem): string | null =>
  item.workshop_details?.Main_Image || item.program_details?.Main_Image || null;

/** Group items by workshop (workshop_id or workshop_details.id).
 *  For each group, pick a representative row (earliest Start_Date if available).
 */
const groupByWorkshop = (items: LabRegistrationItem[]): LabRegistrationItem[] => {
  const groups = new Map<number, LabRegistrationItem[]>();

  for (const it of items) {
    const key =
      it.workshop_id ??
      it.workshop_details?.id ??
      // very defensive fallback (unlikely needed)
      Math.abs((it.workshop_name || "").toLowerCase().split("").reduce((a, c) => a + c.charCodeAt(0), 0));
    const arr = groups.get(key) ?? [];
    arr.push(it);
    groups.set(key, arr);
  }

  // choose one representative per workshop (earliest session start if available)
  const reps: LabRegistrationItem[] = [];
  for (const arr of groups.values()) {
    const best = arr
      .slice()
      .sort((a, b) => {
        const da = a.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
        const db = b.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
        return da - db;
      })[0];
    reps.push(best);
  }

  // order cards by earliest start date (then name)
  reps.sort((a, b) => {
    const da = a.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
    const db = b.session_details?.Start_Date ?? Number.MAX_SAFE_INTEGER;
    if (da !== db) return da - db;
    return (a.workshop_name || "").localeCompare(b.workshop_name || "");
  });

  return reps;
};

/** Add a stable hook class and strip id so cloned rows don't duplicate IDs. */
const hookAndStrip = (root: HTMLElement, idOrClass: string, hookClass: string): HTMLElement | null => {
  // Accept either an element with that id, or one already using our hookClass
  const el = root.querySelector<HTMLElement>(`#${idOrClass}, .${hookClass}`);
  if (!el) return null;
  if (!el.classList.contains(hookClass)) el.classList.add(hookClass);
  if (el.id === idOrClass) el.removeAttribute("id");
  return el;
};
// ---------- Master: always renders a (grouped-by-workshop) list ----------
export async function handleLabRegistrationSuccess() {
    const urlSessionId = getSessionIdFromUrl();
    if (!urlSessionId) {
      console.error("Missing order/session_id param in URL");
      return;
    }
  
    const req = apiClient.get<ApiResponse>(
      `/success_page/lab_registration/${encodeURIComponent(urlSessionId)}`
    );
  
    try {
      const { data } = await new Promise<ApiResponse>((resolve, reject) => {
        req.onData((res) => resolve(res));
        req.onError(reject);
        req.fetch();
      });
  
      const rawItems = Array.isArray(data) ? data : [];
      if (!rawItems.length) {
        console.warn("No lab registrations returned.");
      }
  
      // 1) Group by workshop
      const grouped = groupByWorkshop(rawItems);
  
      // 2) Build the dynamic list using your Webflow structure
      const list = new WFDynamicList<LabRegistrationItem>("#labList", {
        rowSelector: "#labRegistrationCard",
      });
  
      list.rowRenderer(({ rowData, rowElement }) => {
        const rowRoot = rowElement.getElement() as HTMLElement;
  
        rowRoot.classList.add("js-labRegistrationCard");
        if (rowRoot.id === "labRegistrationCard") rowRoot.removeAttribute("id");
  
        const imgEl   = hookAndStrip(rowRoot, "labCardImage",   "js-labCardImage");
        const progEl  = hookAndStrip(rowRoot, "labCardProgram", "js-labCardProgram");
        const workEl  = hookAndStrip(rowRoot, "labCardWorkshop","js-labCardWorkshop");
  
        // Image
        if (imgEl instanceof HTMLImageElement) {
          const wfImg = new WFImage(imgEl);
          const src = chooseImage(rowData);
          if (src) wfImg.setImage(src);
          (wfImg.getElement() as HTMLImageElement).alt =
            `${rowData.program_name} — ${rowData.workshop_name}`;
        }
  
        if (progEl) new WFComponent(progEl).setText(rowData.program_name || "");
        if (workEl) new WFComponent(workEl).setText(rowData.workshop_name || "");
  
        // Preserve ?order param, plus append program + subscription=none
        try {
          const anchor = rowRoot as HTMLAnchorElement;
          const href = anchor.getAttribute("href") || "#";
          const u = new URL(href, window.location.origin);
          u.searchParams.set("order", rowData.checkout_session_id || urlSessionId);
          u.searchParams.set("program", String(rowData.program_details?.id ?? ""));
          u.searchParams.set("subscription", "none");
          anchor.setAttribute("href", u.toString());
        } catch {
          /* noop */
        }
  
        rowRoot.style.display = "block";
        return rowElement;
      });
  
      list.setData(grouped);
  
      const container = document.getElementById("labList");
      if (container) container.style.display = "block";
      document.querySelector<HTMLElement>(".success_trigger")?.click();
    } catch (err) {
      console.error("Error loading lab registration list:", err);
    }
  }
  

// Auto-init on DOM ready
document.addEventListener("DOMContentLoaded", handleLabRegistrationSuccess);
