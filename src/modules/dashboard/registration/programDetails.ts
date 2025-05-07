import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../../api/apiConfig";
import { initializeDynamicProgramFileList } from "./components/listProgramFiles";

// ---- Interfaces ----

interface Program {
  id: number;
  name: string;
  slug: string;
  Main_Image: string;
  Subheading: string;
  Short_description: string;
}

// Workshop items may represent either a true workshop or a session fallback
interface Workshop {
  id: number;
  name: string;
  Main_Image: string;
  weekday?: string;
  time_block?: string;
  location_name?: string;
}

interface ProgramApiResponse {
  program: Program;
  workshops: Workshop[];
}

// ---- API Fetch ----

/**
 * Fetch program details, including subscription context if provided.
 */
export async function fetchProgramDetails(
  programId: string,
  subscriptionId?: string
): Promise<ProgramApiResponse> {
  const params: Record<string, string> = { program: programId };
  if (subscriptionId) params.subscription = subscriptionId;

  const getProgramDetails = apiClient.get<ProgramApiResponse>(
    `/dashboard/registration/program/${programId}`,
    { data: params }
  );
  const response = await getProgramDetails.fetch();
  return response;
}

// ---- Page Init ----

export async function initializeProgramDetailsPage() {
  await initializeDynamicProgramFileList("#filesList");

  const params = new URLSearchParams(window.location.search);
  const programId = params.get("program");
  const subscriptionId = params.get("subscription") || undefined;

  if (!programId) {
    return displayError("Invalid access. Program ID is missing.");
  }

  try {
    const { program, workshops } = await fetchProgramDetails(programId, subscriptionId);

    updateProgramDetails(program);

    // Sort items alphabetically by name or by weekday+time
    const sortedItems = [...workshops].sort((a, b) => {
      if (a.weekday && b.weekday) {
        return `${a.weekday} ${a.time_block}`.localeCompare(
          `${b.weekday} ${b.time_block}`
        );
      }
      return a.name.localeCompare(b.name);
    });

    // Elements
    const workshopBox = document.getElementById("program-workshops");
    const sessionBox = document.getElementById("program-sessions");

    // Hide both by default
    if (workshopBox) workshopBox.style.display = "none";
    if (sessionBox) sessionBox.style.display = "none";

    // Determine which to show
    const hasWorkshops = sortedItems.length > 0 && sortedItems[0].weekday === undefined;

    if (hasWorkshops) {
      if (workshopBox) workshopBox.style.display = "flex";
      await initializeDynamicWorkshopList(
        "#program-workshops #listRegistration",
        sortedItems,
        program,
        subscriptionId
      );
    } else {
      if (sessionBox) sessionBox.style.display = "flex";
      await initializeDynamicSessionList(
        "#program-sessions #listRegistration",
        sortedItems,
        program.id,
        subscriptionId
      );
    }

    // trigger hidden success element for any downstream listeners
    const trigger = document.querySelector(".success_trigger");
    if (trigger instanceof HTMLElement) trigger.click();
  } catch {
    displayError("An error occurred while loading the program details.");
  }
}

// ---- DOM Updaters ----

function updateProgramDetails(program: Program) {
  const imgEl = document.getElementById("programImage");
  if (imgEl) {
    const img = new WFImage(imgEl);
    img.setImage(
      program.Main_Image ||
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg"
    );
    (img.getElement() as HTMLImageElement).alt = program.name;
  }

  const mappings: [string, string][] = [
    ["programName", program.name],
    ["programBreadcrumb", program.name],
    ["programSubheading", program.Subheading],
    ["programShortDescription", program.Short_description],
  ];
  mappings.forEach(([id, text]) => {
    const el = document.getElementById(id);
    if (el) new WFComponent(el).setText(text);
  });
}

function displayError(message: string) {
  const empty = document.getElementById("listRegistrationEmpty");
  if (empty) {
    empty.innerHTML = `<div>${message}</div>`;
    empty.style.display = "flex";
  }
}

// ---- Dynamic Workshop List ----

async function initializeDynamicWorkshopList(
  containerSelector: string,
  workshops: Workshop[],
  program: Program,
  subscriptionId?: string
) {
  const list = new WFDynamicList<Workshop>(containerSelector, {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  list.loaderRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });
  list.emptyRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    // Image
    const imgComp = card.getChildAsComponent<HTMLImageElement>("#cardRegistrationImage");
    if (imgComp) {
      const img = new WFImage(imgComp.getElement());
      img.setImage(rowData.Main_Image || program.Main_Image);
    }

    // Title
    card.getChildAsComponent("#cardProgramName")?.setText(rowData.name);
    card.getChildAsComponent("#cardWorkshopName")?.setText(program.name);

    // Link: program, workshop, subscription
    const anchor = card.getElement() as HTMLAnchorElement;
    const url = new URL("/dashboard/registration/workshop", window.location.origin);
    url.searchParams.set("program", String(program.id));
    url.searchParams.set("workshop", String(rowData.id));
    if (subscriptionId) url.searchParams.set("subscription", subscriptionId);
    anchor.setAttribute("href", url.toString());

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  try {
    list.setData(workshops);
  } catch {
    list.setData([]);
  }
}

// ---- Dynamic Session List ----

async function initializeDynamicSessionList(
  containerSelector: string,
  sessions: Workshop[],
  programId: number,
  subscriptionId?: string
) {
  const list = new WFDynamicList<Workshop>(containerSelector, {
    rowSelector: "#listRegistrationCard",
    loaderSelector: "#listRegistrationloading",
    emptySelector: "#listRegistrationEmpty",
  });

  list.loaderRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });
  list.emptyRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });

  list.rowRenderer(({ rowData, rowElement }) => {
    const card = new WFComponent(rowElement);

    card.getChildAsComponent("#cardSessionDay")?.setText(rowData.weekday || "");
    card.getChildAsComponent("#cardSessionTimeBlock")?.setText(rowData.time_block || "");
    card.getChildAsComponent("#cardSessionLocation")?.setText(rowData.location_name || "");

    // Link
    const anchor = card.getElement() as HTMLAnchorElement;
    const url = new URL("/dashboard/registration/session", window.location.origin);
    url.searchParams.set("program", String(programId));
    if (subscriptionId) url.searchParams.set("subscription", subscriptionId);
    url.searchParams.set("session", String(rowData.id));
    anchor.setAttribute("href", url.toString());

    rowElement.setStyle({ display: "flex" });
    return rowElement;
  });

  try {
    list.setData(sessions);
  } catch {
    list.setData([]);
  }
}
