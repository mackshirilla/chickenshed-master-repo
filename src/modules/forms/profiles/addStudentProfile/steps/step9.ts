import { WFComponent } from "@xatom/core";
import { WFSlider } from "@xatom/slider";

export const initializeStepNine = (slider: WFSlider) => {
  // Initialize the form components for Step 9
  const submitStepNine = new WFComponent("#submitStepNine");
  

  // Event listener for submitting step nine
  submitStepNine.on("click", async (event) => {
    event.preventDefault(); // Prevent the default behavior

    try {
      // Placeholder for any step 9 submission logic
      console.log("Step 9: Submit action or add another student");

      // Proceed to the next slide without triggering any sidebar changes
      slider.goNext();
    } catch (error) {
      console.error("Error during Step 9 submission: ", error);
    }
  });

};
