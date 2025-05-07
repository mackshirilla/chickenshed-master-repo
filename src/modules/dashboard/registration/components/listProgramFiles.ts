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

// Function to get the program_id from URL parameters
function getProgramIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("program");
}

// Function to get the subscription from URL parameters
function getSubscriptionFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("subscription");
}

// Function to fetch files for a specific program (+ optional subscription)
export async function fetchProgramFiles(
  programId: string,
  subscriptionId?: string
): Promise<FileItem[]> {
  try {
    // build path with optional subscription query
    const path = subscriptionId
      ? `/student_files/program/${programId}?subscription=${encodeURIComponent(subscriptionId)}`
      : `/student_files/program/${programId}`;

    const getFiles = apiClient.get<FileItem[]>(path);
    const response = await getFiles.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching files for program:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic file list for a program
export async function initializeDynamicProgramFileList(
  containerSelector: string
) {
  // Get the program ID from the URL
  const programId = getProgramIdFromUrl();
  if (!programId) {
    console.error("No program ID provided in URL");
    return;
  }
  // Get optional subscription ID
  const subscriptionId = getSubscriptionFromUrl();

  // Initialize a new instance of WFDynamicList for Files
  const list = new WFDynamicList<FileItem>(containerSelector, {
    rowSelector: "#fileCard", // Using ID selector for template
    loaderSelector: "#filesloading", // Selector for the loader
    emptySelector: "#filesEmpty", // Selector for the empty state
  });

  // Customize the rendering of the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({ display: "flex" });
    return loaderElement;
  });

  // Customize the rendering of the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({ display: "flex" });
    return emptyElement;
  });

  // Customize the rendering of list items (File Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const fileCard = new WFComponent(rowElement);
    fileCard.setAttribute("href", rowData.file_url);
    const fileName = fileCard.getChildAsComponent("#fileName");
    fileName.setText(rowData.file_name);
    rowElement.setStyle({ display: "block" });
    return rowElement;
  });

  // Load and display file data
  try {
    list.changeLoadingStatus(true);
    const files = await fetchProgramFiles(programId, subscriptionId);
    files.sort((a, b) => a.file_name.localeCompare(b.file_name));
    list.setData(files);
  } catch (error) {
    console.error("Error loading files:", error);
    list.setData([]);
  } finally {
    list.changeLoadingStatus(false);
  }
}
