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

// Function to get the student_id from URL parameters
function getSessionIdFromUrl(): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("session");
}

// Function to fetch files for a specific student
export async function fetchSessionFiles(
  sessionId: string
): Promise<FileItem[]> {
  try {
    const getFiles = apiClient.get<FileItem[]>(
      `/student_files/session/${sessionId}`
    );
    const response = await getFiles.fetch();
    return response;
  } catch (error) {
    console.error("Error fetching files for student:", error);
    throw error;
  }
}

// Function to initialize and render the dynamic file list for a student
export async function initializeDynamicSessionFileList(
  containerSelector: string
) {
  // Get the student ID from the URL
  const sessionId = getSessionIdFromUrl();
  if (!sessionId) {
    console.error("No student ID provided in URL");
    return;
  }

  // Initialize a new instance of WFDynamicList for Files
  const list = new WFDynamicList<FileItem>(containerSelector, {
    rowSelector: "#fileCard", // Using ID selector for template
    loaderSelector: "#filesloading", // Selector for the loader
    emptySelector: "#filesEmpty", // Selector for the empty state
  });

  // Customize the rendering of the loader
  list.loaderRenderer((loaderElement) => {
    loaderElement.setStyle({
      display: "flex",
    });
    return loaderElement;
  });

  // Customize the rendering of the empty state
  list.emptyRenderer((emptyElement) => {
    emptyElement.setStyle({
      display: "flex",
    });
    return emptyElement;
  });

  // Customize the rendering of list items (File Cards)
  list.rowRenderer(({ rowData, rowElement }) => {
    const fileCard = new WFComponent(rowElement);

    // Set the fileCard's href to file_url
    fileCard.setAttribute("href", rowData.file_url);

    // Set the fileName to file_name
    const fileName = fileCard.getChildAsComponent("#fileName");
    fileName.setText(rowData.file_name);

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display file data
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const files = await fetchSessionFiles(sessionId);

    // Sort files alphabetically by file_name
    files.sort((a, b) => a.file_name.localeCompare(b.file_name));

    // Set the data to be displayed in the dynamic list
    list.setData(files);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading files:", error);

    // If there's an error, set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
