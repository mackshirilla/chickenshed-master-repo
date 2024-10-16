// src/modules/pages/studentProfile/listStudents.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_pic: {
    url: string;
  } | null;
}

interface StudentApiResponse {
  students: Student[];
}

export async function fetchStudentProfiles(): Promise<Student[]> {
  try {
    const getStudents = apiClient.get<StudentApiResponse>(
      "/profiles/student_profiles"
    );
    const response = await getStudents.fetch();
    return response.students;
  } catch (error) {
    console.error("Error fetching student profiles:", error);
    throw error;
  }
}

export async function initializeDynamicStudentList(containerSelector: string) {
  // Initialize a new instance of WFDynamicList
  const list = new WFDynamicList<Student>(containerSelector, {
    rowSelector: "#listStudentCard",
    loaderSelector: "#listStudentProfilesloading",
    emptySelector: "#listStudentProfilesEmpty",
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

  // Customize the rendering of list items
  list.rowRenderer(({ rowData, rowElement }) => {
    const studentCard = new WFComponent(rowElement);

    // Get the existing href attribute
    const existingHref = studentCard.getAttribute("href") || "#";

    // Create a URL object to manipulate the URL and query parameters
    let updatedHref: string;

    try {
      // If the existingHref is a relative URL, we need to provide a base URL
      const baseUrl = window.location.origin;
      const url = new URL(existingHref, baseUrl);

      // Set or update the 'id' query parameter
      url.searchParams.set("id", rowData.id.toString());

      // Convert the URL object back to a string, relative to the base URL
      updatedHref = url.pathname + url.search + url.hash;
    } catch (error) {
      // If there's an error parsing the URL, default to adding ?id={student_id} directly
      console.error("Error parsing URL:", error);
      updatedHref = `${existingHref}?id=${rowData.id}`;
    }

    // Set the updated href back to the student card
    studentCard.setAttribute("href", updatedHref);

    // Set up the rest of the card components
    const studentImage = new WFImage(
      studentCard.getChildAsComponent("#listStudentCardImage").getElement()
    );
    const studentName = studentCard.getChildAsComponent("#studentName");

    if (rowData.profile_pic && rowData.profile_pic.url) {
      studentImage.setImage(rowData.profile_pic.url);
    } else {
      studentImage.setImage(
        "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
      );
    }
    studentName.setText(`${rowData.first_name} ${rowData.last_name}`);

    // Show the list item
    rowElement.setStyle({
      display: "block",
    });

    return rowElement;
  });

  // Load and display student profiles
  try {
    // Enable the loading state
    list.changeLoadingStatus(true);

    const students = await fetchStudentProfiles();

    // Sort students alphabetically by last name
    students.sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Set the data to be displayed in the dynamic list
    list.setData(students);

    // Disable the loading state
    list.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error loading student profiles:", error);

    // If there's an error, set an empty array to trigger the empty state
    list.setData([]);

    // Disable the loading state
    list.changeLoadingStatus(false);
  }
}
