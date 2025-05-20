// src/pages/sessionDetails.ts

import { WFComponent, WFDynamicList } from "@xatom/core";
import { apiClient } from "../../../api/apiConfig";
import { initializeDynamicSessionFileList } from "./components/listSessionFiles";

// -------------------- INTERFACES --------------------

interface Workshop {
  id: number;
  Name: string;
  Slug: string;
  Main_Image: string;
  Main_Video: string;
  Subheading: string;
  Short_description: string;
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

interface Student {
  registration_id: number;
  status: string;
  student_id: number;
  full_name: string;
  email: string;
  phone: string;
  grade: string;
  dob: string;
  profile_pic: string | null;
}

interface Program {
  id: number | string;
  name: string;
  slug: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
  "1st_Semester_Start_Date"?: number;
  "2nd_Semester_Charge_Date"?: number;
  "Subscription_Pause_Date"?: number;
}

interface Location {
  id: number;
  Name: string;
  Slug: string;
  Address_line_1: string;
  City_state_zip: string;
  Map_embed: string;
  Location_Description?: string;
}

interface SessionObj {
  id: number;
  Name: string;
  Slug: string;
  Weekday: string;
  Time_block: string;
  Start_Date: string | null;
  End_Date: string | null;
  Location: number;
  Parent_workshop: number | null;
  Parent_program: number;
  Tuition_product: number;
  Deposit_product: number;
  location_details?: Location;
}

interface SessionDetailsResponse {
  program: Program;
  workshop: Workshop | null;
  session: SessionObj;
  students: Student[];
  caregiver: boolean;
}

// -------------------- HELPERS --------------------

function triggerSuccessEvent(selector: string) {
  const el = document.querySelector(selector);
  if (el instanceof HTMLElement) el.click();
}

function displayError(message: string) {
  const errEl = document.querySelector("#listStudentProfilesEmpty");
  if (errEl) {
    errEl.innerHTML = `<div>${message}</div>`;
    errEl.setAttribute("style", "display: flex;");
  }
  alert(`Error: ${message}`);
}

// -------------------- API CALL --------------------

async function fetchSessionDetails(
  workshopId: string,
  programId: string,
  sessionId: string,
  subscriptionId?: string
): Promise<SessionDetailsResponse | undefined> {
  try {
    const data: Record<string, string> = {
      workshop_id: workshopId,
      program_id: programId,
      session_id: sessionId,
    };
    if (subscriptionId) data.subscription_id = subscriptionId;

    return await apiClient
      .get<SessionDetailsResponse>(
        `/dashboard/registration/session/${sessionId}`,
        { data }
      )
      .fetch();
  } catch (error: any) {
    const msg =
      error?.response?.data?.message || error.message || "Unexpected error";
    alert(`Error: ${msg}`);
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/dashboard/registrations";
    return undefined;
  }
}

// -------------------- MAIN INITIALIZER --------------------

export async function initializeSessionDetails() {
  initializeDynamicSessionFileList("#filesList");

  const params = new URLSearchParams(window.location.search);
  const workshopId     = params.get("workshop") || "none";
  const programId      = params.get("program");
  const sessionId      = params.get("session");
  const subscriptionId = params.get("subscription") || undefined;

  if (!programId || !sessionId) {
    displayError("Invalid access. Missing parameters.");
    return;
  }

  const data = await fetchSessionDetails(
    workshopId,
    programId,
    sessionId,
    subscriptionId
  );
  if (!data) return;

  const { program, workshop, session, students, caregiver } = data;
  const location = session.location_details;

  if (workshop) {
    populateWorkshopDetails(workshop);
  } else {
    populateProgramDetailsAsWorkshop(program);
  }

  populateSessionDetails(session, location);
  initializeStudentList(students);
  updateBreadcrumbs(program, workshop, session, subscriptionId, caregiver);
  triggerSuccessEvent(".success_trigger");
}

// -------------------- POPULATE UI --------------------

function populateWorkshopDetails(workshop: Workshop) {
  new WFComponent("#workshopName").setText(workshop.Name);
  new WFComponent("#workshopShortDescription").setText(
    workshop.Short_description
  );
}

function populateProgramDetailsAsWorkshop(program: Program) {
  new WFComponent("#workshopName").setText(program.name);
  new WFComponent("#workshopShortDescription").setText(
    program.Short_description
  );
}

function populateSessionDetails(
  session: SessionObj,
  location?: Location
) {
  new WFComponent("#sessionWeekday").setText(session.Weekday);
  new WFComponent("#sessionTime").setText(session.Time_block);
  new WFComponent("#sessionLocation").setText(location?.Name ?? "");

  const container = document.getElementById("sessionLocationMap");
  if (container && location?.Map_embed) {
    container.style.display = "";
    container.innerHTML = location.Map_embed;
    container
      .querySelectorAll("figure, iframe, figure > div")
      .forEach((el) => {
        (el as HTMLElement).style.cssText =
          "width:100%;height:100%;margin:0;padding:0;border:0;";
      });
  } else if (container) {
    container.style.display = "none";
  }
}

// -------------------- STUDENTS LIST --------------------

function initializeStudentList(students: Student[]) {
  const list = new WFDynamicList<Student>("#listStudentProfiles", {
    rowSelector: "#listStudentCard",
    loaderSelector: "#listStudentProfilesloading",
    emptySelector: "#listStudentProfilesEmpty",
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const comp = new WFComponent(rowElement);
    new WFComponent(
      comp.getChildAsComponent("#studentName")!.getElement()
    ).setText(rowData.full_name);
    comp
      .getChildAsComponent("img#listStudentCardImage")
      ?.setAttribute(
        "src",
        rowData.profile_pic || "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/682bd6f6403a5cb7582db055_Profile_avatar_placeholder_large.png"
      );

    const linkComp = comp.getChildAsComponent<HTMLAnchorElement>("#studentLink");
    if (linkComp) {
      const href = linkComp.getAttribute("href") || "#";
      const url = new URL(href, window.location.origin);
      url.searchParams.set("id", rowData.student_id.toString());
      linkComp.setAttribute("href", url.toString());
    }

    return rowElement;
  });

  list.setData(students);
}

// -------------------- BREADCRUMBS --------------------

function updateBreadcrumbs(
  program: Program,
  workshop: Workshop | null,
  session: SessionObj,
  subscriptionId: string | undefined,
  caregiver: boolean
) {
  // Program crumb
  const progEl = document.querySelector<HTMLAnchorElement>("#programBreadcrumb");
  if (progEl) {
    new WFComponent(progEl).setText(program.name);
    const u = new URL(progEl.href, window.location.origin);
    u.searchParams.set("program", program.id.toString());
    if (subscriptionId) u.searchParams.set("subscription", subscriptionId);
    progEl.href = u.toString();
  }

  // Workshop crumb + chevron
  const workEl = document.querySelector<HTMLAnchorElement>("#workshopBreadcrumb");
  const icon   = workEl?.previousElementSibling as HTMLElement | null;
  if (workEl) {
    if (workshop) {
      workEl.style.display = "";
      icon && (icon.style.display = "");
      new WFComponent(workEl).setText(workshop.Name);
      const u = new URL(workEl.href, window.location.origin);
      u.searchParams.set("program", program.id.toString());
      u.searchParams.set("workshop", workshop.id.toString());
      if (subscriptionId) u.searchParams.set("subscription", subscriptionId);
      workEl.href = u.toString();
    } else {
      workEl.style.display = "none";
      icon && (icon.style.display = "none");
    }
  }

  // Session crumb
  const sessEl = document.querySelector<HTMLElement>("#sessionBreadcrumb");
  if (sessEl) {
    new WFComponent(sessEl).setText(
      `${session.Weekday}, ${session.Time_block}`
    );
  }

  // If this is a caregiver view, hide all normal breadcrumbs
  const userList = document.querySelector("#userBreadcumbList");
  if (caregiver) {
    userList?.setAttribute("style", "display: none;");
  } else {
    userList?.setAttribute("style", "display: flex;");
  }
}
