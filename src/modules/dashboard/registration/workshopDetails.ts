// src/pages/workshopDetails.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { initializeDynamicWorkshopFileList } from "./components/listWorkshopFiles";

// -------------------- INTERFACES -------------------- //

interface Workshop {
  id: number;
  Name: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
  Slug: string;
  Age_range: string;
  Price_Description: string;
  Schedule_Description: string;
  Financial_Aid_Description: string;
  Accessibility_Description: string;
  Workshop_Overview_Description: string;
  Success_Page_Message: string;
  Color_Theme: number;
  Parent_Program: number;
}

interface Subscription {
  id: number;
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  pending_students: boolean;
  coupon: string;
  deposit_amount: number;
  start_date: number | null;
  next_charge_date: number | null;
  next_charge_amount: number;
  next_invoice_id: string | null;
  stripe_subscription_id: string;
  user_id: number;
  contact_id: number;
  sale_id: number;
  cancellation_reason: string;
  created_at: number;
}

interface Session {
  id: number;
  status: string;
  subscription_type: string;
  program: number;
  workshop: number;
  session: number;
  subscription_id: number;
  price_id: string;
  user_id: number;
  student_profile_id: number;
  cancellation_reason: string;
  created_at: number;
  session_details?: {
    id: number;
    Name: string;
    Weekday: string;
    Time_block: string;
    Start_Date: string | null;
    End_Date: string | null;
    Location: number;
    location_details?: {
      id: number;
      Name: string;
      Address_line_1: string;
      City_state_zip: string;
    };
  };
}

interface Program {
  id: number;
  name: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
  "1st_Semester_Start_Date"?: number;
  "2nd_Semester_Charge_Date"?: number;
  "Subscription_Pause_Date"?: number;
}

interface WorkshopApiResponse {
  program: Program;
  workshop: Workshop | null;
  subscription: Subscription;
  sessions: Session[];
  caregiver: boolean;
}

// -------------------- API FETCH -------------------- //

export async function fetchWorkshopDetails(
  programId: string,
  workshopId?: string,
  subscriptionId?: string
): Promise<WorkshopApiResponse | undefined> {
  try {
    const params: Record<string, string> = { program: programId };
    if (workshopId)     params.workshop_id     = workshopId;
    if (subscriptionId) params.subscription_id = subscriptionId;

    return await apiClient
      .get<WorkshopApiResponse>(
        `/dashboard/registration/workshop/${workshopId || "none"}`,
        { data: params }
      )
      .fetch();
  } catch (error: any) {
    console.error("Fetch Workshop Details Error:", error);
    alert(
      error?.response?.data?.message || error.message || "Unexpected error"
    );
    window.history.back();
    return undefined;
  }
}

// -------------------- PAGE INIT -------------------- //

export async function initializeWorkshopDetailsPage() {
  const params         = new URLSearchParams(window.location.search);
  const programId      = params.get("program");
  const workshopId     = params.get("workshop") || undefined;
  const subscriptionId = params.get("subscription") || undefined;

  if (!programId) {
    alert("Invalid access. Missing program parameter.");
    window.history.back();
    return;
  }

  initializeDynamicWorkshopFileList("#filesList");

  const apiResponse = await fetchWorkshopDetails(
    programId,
    workshopId,
    subscriptionId
  );
  if (!apiResponse) return;

  const { workshop, subscription, program, sessions, caregiver } = apiResponse;

  // Update details
  if (workshop) updateWorkshopDetails(workshop, program);
  else         updateWorkshopDetailsFallback(program);

  updateProgramBreadcrumb(program);

  // Sessions
  const uniqueSessions = getUniqueSessions(sessions);
  initializeDynamicSessionList(
    "#listRegistration",
    uniqueSessions,
    subscription
  );

  // Caregiver breadcrumbs
  handleBreadcrumbs(caregiver, subscription);

  triggerSuccessEvent(".success_trigger");
}

// -------------------- UPDATERS -------------------- //

function updateWorkshopDetails(workshop: Workshop, program: Program) {
  const imgEl = document.getElementById("workshopImage");
  if (imgEl) {
    const img = new WFImage(imgEl);
    img.setImage(workshop.Main_Image || program.Main_Image);
    (img.getElement() as HTMLImageElement).alt = workshop.Name;
  }
  [
    ["workshopName", workshop.Name],
    ["workshopBreadcrumb", workshop.Name],
    ["programName", program.name],
    ["workshopShortDescription", workshop.Short_description],
  ].forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) new WFComponent(el).setText(text as string);
  });
}

function updateWorkshopDetailsFallback(program: Program) {
  const imgEl = document.getElementById("workshopImage");
  if (imgEl) new WFImage(imgEl).setImage(program.Main_Image);
  const nameEl = document.getElementById("workshopName");
  if (nameEl) new WFComponent(nameEl).setText(program.name);
  const progEl = document.getElementById("programName");
  if (progEl) new WFComponent(progEl).setText(program.Subheading || program.name);
  const bcEl = document.getElementById("workshopBreadcrumb");
  if (bcEl) new WFComponent(bcEl).setText(program.name);
  const descEl = document.getElementById("workshopShortDescription");
  if (descEl) new WFComponent(descEl).setText(program.Short_description);
}

function updateProgramBreadcrumb(program: Program) {
  const el = document.getElementById("programBreadcrumb");
  if (!el) return;
  const comp = new WFComponent(el);
  comp.setText(program.name);
  const url = new URL(el.getAttribute("href") || "#", window.location.origin);
  url.searchParams.set("program", program.id.toString());
  comp.setAttribute("href", url.toString());
}

// -------------------- SESSIONS LIST -------------------- //

function getUniqueSessions(sessions: Session[]): Session[] {
  const map: Record<number, Session> = {};
  sessions.forEach((s) => {
    if (!map[s.session]) map[s.session] = s;
  });
  return Object.values(map);
}

async function initializeDynamicSessionList(
  container: string,
  sessions: Session[],
  subscription: Subscription
) {
  const list = new WFDynamicList<Session>(container, {
    rowSelector:   "#listRegistrationCard",
    loaderSelector:"#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });
  list.loaderRenderer((loader) => {
    loader.setStyle({ display: "flex" });
    return loader;
  });
  list.emptyRenderer((empty) => {
    empty.setStyle({ display: "flex" });
    return empty;
  });
  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);
    const sd   = rowData.session_details;
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionDay")
      .setText(sd?.Weekday || `Session #${rowData.session}`);
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionTimeBlock")
      .setText(sd?.Time_block || "N/A");
    card
      .getChildAsComponent<HTMLDivElement>("#cardSessionLocation")
      .setText(sd?.location_details?.Name || "N/A");

    const anchor = card.getElement() as HTMLAnchorElement;
    const url = new URL("/dashboard/registration/session", window.location.origin);
    // include program, workshop & subscription IDs
    url.searchParams.set("program",      subscription.program.toString());
    url.searchParams.set("workshop",     subscription.workshop.toString());
    url.searchParams.set("subscription", subscription.id.toString());
    url.searchParams.set("session",      rowData.session.toString());
    anchor.setAttribute("href", url.toString());

    rowElement.setStyle({ display: "block" });
    return rowElement;
  });
  list.changeLoadingStatus(true);
  list.setData(sessions);
  list.changeLoadingStatus(false);
}

// -------------------- CAREGIVER BREADCRUMBS -------------------- //

interface CaregiverBreadcrumbs {
  student_id: number;
  student_name: string;
  workshop_name: string;
  workshop_id: string;
  program_name: string;
  program_id: string;
  subscription_id: number;
  session_id?: string;
  session_weekday?: string;
  session_time_block?: string;
}

function handleBreadcrumbs(caregiver: boolean, subscription: Subscription) {
  const userList = document.getElementById("userBreadcrumbList");
  const careList = document.getElementById("caregiverBreadcrumbList");
  if (caregiver) {
    userList?.setAttribute("style", "display:none");
    careList?.setAttribute("style", "display:flex");
    const bc = localStorage.getItem("caregiver_breadcrumbs");
    if (bc) {
      try {
        const obj = JSON.parse(bc) as CaregiverBreadcrumbs;
        const stud = document.getElementById("studentBreadcrumb");
        if (stud) {
          const comp = new WFComponent(stud);
          comp.setText(obj.student_name);
          const url = new URL(
            stud.getAttribute("href") || "/dashboard/student/profile",
            window.location.origin
          );
          url.searchParams.set("id", obj.student_id.toString());
          comp.setAttribute("href", url.toString());
        }
        const wbc = document.getElementById("workshopBreadcrumbCaregiver");
        if (wbc) new WFComponent(wbc).setText(obj.workshop_name || obj.program_name);
      } catch {}
    }
  } else {
    userList?.setAttribute("style", "display:flex");
    careList?.setAttribute("style", "display:none");
  }
}

// -------------------- SUCCESS TRIGGER -------------------- //

function triggerSuccessEvent(selector: string) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}
