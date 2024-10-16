// src/modules/pages/studentProfile/listAdditionalStudents.ts

import { WFDynamicList, WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../../api/apiConfig";

interface AdditionalStudent {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_pic: {
    url: string;
  } | null;
  parent_name: string;
}

interface AdditionalStudentApiResponse {
  additional_students: AdditionalStudent[];
}

let additionalStudentList: WFDynamicList<AdditionalStudent> | null = null;

export async function fetchAdditionalStudentProfiles(): Promise<
  AdditionalStudent[]
> {
  try {
    const getAdditionalStudents = apiClient.get<AdditionalStudentApiResponse>(
      "/profiles/additional_students"
    );
    const response = await getAdditionalStudents.fetch();
    return response.additional_students;
  } catch (error) {
    console.error("Error fetching additional student profiles:", error);
    throw error;
  }
}

export async function initializeDynamicAdditionalStudentList(
  containerSelector: string
) {
  // Initialize a new instance of WFDynamicList if not already initialized
  if (!additionalStudentList) {
    additionalStudentList = new WFDynamicList<AdditionalStudent>(
      containerSelector,
      {
        rowSelector: "#listAdditionalStudentCard",
        loaderSelector: "#listAdditionalStudentProfilesloading",
        emptySelector: "#listAdditionalStudentProfilesEmpty",
      }
    );

    // Customize the rendering of the loader
    additionalStudentList.loaderRenderer((loaderElement) => {
      loaderElement.setStyle({
        display: "flex",
      });
      return loaderElement;
    });

    // Customize the rendering of the empty state
    additionalStudentList.emptyRenderer((emptyElement) => {
      emptyElement.setStyle({
        display: "flex",
      });
      return emptyElement;
    });

    // Customize the rendering of list items
    additionalStudentList.rowRenderer(({ rowData, rowElement }) => {
      const studentCard = new WFComponent(rowElement);

      // Get the existing href attribute or set a default
      const existingHref = studentCard.getAttribute("href") || "#";

      // Initialize the updatedHref variable
      let updatedHref: string;

      try {
        // If the existingHref is a relative URL, provide a base URL
        const baseUrl = window.location.origin;
        const url = new URL(existingHref, baseUrl);

        // Set or update the 'id' query parameter with the additional student's ID
        url.searchParams.set("id", rowData.id.toString());

        // Convert the URL object back to a relative URL string
        updatedHref = url.pathname + url.search + url.hash;
      } catch (error) {
        // If there's an error parsing the URL, default to adding ?id={additional_student_id} directly
        console.error("Error parsing URL:", error);
        updatedHref = `${existingHref}?id=${rowData.id}`;
      }

      // Set the updated href back to the student card
      studentCard.setAttribute("href", updatedHref);

      // Update the student image
      const studentImage = new WFImage(
        studentCard
          .getChildAsComponent("#listAdditionalStudentCardImage")
          .getElement()
      );

      if (rowData.profile_pic && rowData.profile_pic.url) {
        studentImage.setImage(rowData.profile_pic.url);
      } else {
        studentImage.setImage(
          "https://cdn.prod.website-files.com/66102236c16b61185de61fe3/66102236c16b61185de6204e_placeholder.svg"
        );
      }

      // Update the student name
      const studentName = studentCard.getChildAsComponent(
        "#additionalStudentName"
      );
      studentName.setText(`${rowData.first_name} ${rowData.last_name}`);

      // Update the parent name
      const parentName = studentCard.getChildAsComponent("#parentName");
      parentName.setText(rowData.parent_name);

      // Show the list item
      rowElement.setStyle({
        display: "flex",
      });

      return rowElement;
    });

    // Load and display additional student profiles
    try {
      // Enable the loading state
      additionalStudentList.changeLoadingStatus(true);

      const additionalStudents = await fetchAdditionalStudentProfiles();

      // Sort additional students alphabetically by last name
      additionalStudents.sort((a, b) => a.last_name.localeCompare(b.last_name));

      // Set the data to be displayed in the dynamic list
      additionalStudentList.setData(additionalStudents);

      // Disable the loading state
      additionalStudentList.changeLoadingStatus(false);
    } catch (error) {
      console.error("Error loading additional student profiles:", error);

      // If there's an error, set an empty array to trigger the empty state
      additionalStudentList.setData([]);

      // Disable the loading state
      additionalStudentList.changeLoadingStatus(false);
    }
  }
}

export async function reloadAdditionalStudentList() {
  if (!additionalStudentList) {
    console.error("Additional student list is not initialized.");
    return;
  }

  try {
    additionalStudentList.changeLoadingStatus(true);

    const additionalStudents = await fetchAdditionalStudentProfiles();

    // Sort additional students alphabetically by last name
    additionalStudents.sort((a, b) => a.last_name.localeCompare(b.last_name));

    // Update the data in the dynamic list
    additionalStudentList.setData(additionalStudents);

    additionalStudentList.changeLoadingStatus(false);
  } catch (error) {
    console.error("Error reloading additional student profiles:", error);
    additionalStudentList.setData([]);
    additionalStudentList.changeLoadingStatus(false);
  }
}
