// updateUI.js
import { loadSelectedProgram } from "../state/selectedProgram";
import { loadSelectedWorkshop } from "../state/selectedWorkshop";
import { WFComponent } from "@xatom/core";

export const updateSelectedItemUI = () => {
  const selectedProgram = loadSelectedProgram();
  const selectedWorkshop = loadSelectedWorkshop();

  // Original UI elements
  const selectedProgramTitle = new WFComponent("#selectedProgramTitle");
  const selectedWorkshopTitle = new WFComponent("#selectedWorkshopTitle");
  const selectedAgeRange = new WFComponent("#selectedAgeRange");
  const selectedImage = new WFComponent("#selectedImage");

  // Final UI elements
  const selectedProgramTitleFinal = new WFComponent(
    "#selectedProgramTitleFinal"
  );
  const selectedWorkshopTitleFinal = new WFComponent(
    "#selectedWorkshopTitleFinal"
  );
  const selectedAgeRangeFinal = new WFComponent("#selectedAgeRangeFinal");
  const selectedImageFinal = new WFComponent("#selectedImageFinal");

  // Function to set UI elements based on the selected data
  const setUIElements = (programTitle, workshopTitle, ageRange, image) => {
    programTitle.setText(selectedProgram.name);

    if (selectedWorkshop.id) {
      workshopTitle.setText(selectedWorkshop.name);
      workshopTitle.setStyle({ display: "block" });
      ageRange.setText(selectedWorkshop.ageRange);
      const imageUrl = selectedWorkshop.imageUrl || selectedProgram.imageUrl;
      image.setAttribute("src", imageUrl);
    } else {
      workshopTitle.setStyle({ display: "none" });
      ageRange.setText(selectedProgram.ageRange);
      image.setAttribute("src", selectedProgram.imageUrl);
    }
  };

  // Update original UI elements
  if (selectedProgram.id) {
    setUIElements(
      selectedProgramTitle,
      selectedWorkshopTitle,
      selectedAgeRange,
      selectedImage
    );
  }

  // Update final UI elements
  if (selectedProgram.id) {
    setUIElements(
      selectedProgramTitleFinal,
      selectedWorkshopTitleFinal,
      selectedAgeRangeFinal,
      selectedImageFinal
    );
  }
};
