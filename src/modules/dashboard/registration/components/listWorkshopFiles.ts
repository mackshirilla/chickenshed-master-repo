// src/pages/listStudentFiles.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { apiClient } from "../../../../api/apiConfig";

// Define the FileItem interface based on the API response
interface FileItem {
  id: number;
  file_name: string;
  file_url: string;
  program_id?: string | null;
  workshop_id?: string | null;
  session_id?: string | null;
  user_id: number;
  created_at: number;
}

// Function to get the workshop_id from URL parameters
function getWorkshopIdFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("workshop");
}

// Function to get the subscription from URL parameters
function getSubscriptionFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("subscription");
}

// Function to fetch files for a specific workshop (+ optional subscription)
export async function fetchWorkshopFiles(
  workshopId: string,
  subscriptionId?: string
): Promise<FileItem[]> {
  try {
    const path = subscriptionId
      ? `/student_files/workshop/${workshopId}?subscription=${encodeURIComponent(subscriptionId)}`
      : `/student_files/workshop/${workshopId}`;

    const getFiles = apiClient.get<FileItem[]>(path);
    const response = await getFiles.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching files for workshop:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic file list for a workshop
export async function initializeDynamicWorkshopFileList(
  containerSelector: string
) {
  // Get the workshop ID from the URL
  const workshopId = getWorkshopIdFromUrl();
  if (!workshopId) {
    console.error("No workshop ID provided in URL");
    return;
  }
  // Get optional subscription ID
  const subscriptionId = getSubscriptionFromUrl();

  // Initialize a new instance of WFDynamicList for Files
  const list = new WFDynamicList<FileItem>(containerSelector, {
    rowSelector: "#fileCard",
    loaderSelector: "#filesloading",
    emptySelector: "#filesEmpty",
  });

  // Customize loader
  list.loaderRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });

  // Customize empty state
  list.emptyRenderer(el => {
    el.setStyle({ display: "flex" });
    return el;
  });

  // Customize each row
  list.rowRenderer(({ rowData, rowElement }) => {
    const fileCard = new WFComponent(rowElement);
    fileCard.setAttribute("href", rowData.file_url);
    fileCard.getChildAsComponent("#fileName").setText(rowData.file_name);
    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load & render
  try {
    list.changeLoadingStatus(true);
    const files = await fetchWorkshopFiles(workshopId, subscriptionId);
    files.sort((a, b) => a.file_name.localeCompare(b.file_name));
    list.setData(files);
  } catch (error) {
    console.error("Error loading files:", error);
    list.setData([]);
  } finally {
    list.changeLoadingStatus(false);
  }
}
