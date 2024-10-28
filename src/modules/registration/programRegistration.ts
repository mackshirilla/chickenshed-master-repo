// programRegistration.ts
import { initializeProgramList } from "./programList";
import { initializeWorkshopList } from "./workshopList";
import {
  initializeSessionList,
  validateAndSubmitSessions,
} from "./sessionsList";
import { initializeCheckoutPreview } from "./checkoutPreview";
import { loadSelectedProgram } from "./state/selectedProgram";
import { loadSelectedWorkshop } from "./state/selectedWorkshop";
import { WFComponent } from "@xatom/core";
import { WFSlider } from "@xatom/slider";
import {
  initializeSidebarIndicators,
  setActiveStep,
  markStepAsCompleted,
  unmarkStepAsCompleted,
  unsetActiveStep,
} from "./components/sidebarIndicators";
import { resetSelectedWorkshop } from "./state/selectedWorkshop";
import { checkForStudents } from "./components/dialogHandler";
import { initializeStateFromUrlParams } from "./components/urlParamNavigator";
import { loadState } from "./state/registrationState"; // Import the registration state
import { apiClient } from "../../api/apiConfig"; // Import API client for submission

interface BeginCheckout {
  checkout_url: string;
  setup_url: string;
}

export const programRegistration = async () => {
  // Clear local storage
  window.onload = function () {
    // Clear the value of registrationState from local storage
    localStorage.removeItem("registrationState");
  };
  // Initialize the first step of the registration form (Program Selection)
  initializeSidebarIndicators();
  setActiveStep(1);
  await initializeProgramList();
  await checkForStudents();

  // Initialize the slider component
  const slider = new WFSlider(".multi-step_form_slider");
  setupNavigationHandlers(slider);
  await initializeStateFromUrlParams(slider);
};

// Setup event listeners for navigation buttons using the slider
const setupNavigationHandlers = (slider: WFSlider) => {
  const submitStepOne = new WFComponent("#submitStepOne");
  const submitStepOneError = new WFComponent("#submitStepOneError");
  const stepOneRequestingAnimation = new WFComponent(
    "#stepOneRequestingAnimation"
  );

  submitStepOne.on("click", async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    // Validate the selected program
    const selectedProgram = loadSelectedProgram();
    if (!selectedProgram.id) {
      submitStepOneError.setText("Please select a program before proceeding.");
      submitStepOneError.setStyle({ display: "block" });
      return;
    }

    // Hide the error message if any
    submitStepOneError.setStyle({ display: "none" });

    // Show the loading animation
    stepOneRequestingAnimation.setStyle({ display: "block" });

    try {
      // Proceed to the next step: Workshop Selection
      await initializeWorkshopList(selectedProgram.id);

      // Check if the workshop list is empty or not
      const workshopListContainer = document.querySelector("#selectWorkshopList");
      const workshopItems =
        workshopListContainer?.querySelectorAll("#cardSelectWorkshop") || [];
      const isWorkshopListEmpty = workshopItems.length === 0;

      if (isWorkshopListEmpty) {
        // No workshops available, skip to Step 3
        resetSelectedWorkshop();

        // Initialize the session list with undefined workshopId
        await initializeSessionList(undefined, selectedProgram.id);

        // Move to Step 3
        slider.goNext(); // From Step 1 to Step 2
        markStepAsCompleted(1);
        setActiveStep(2);

        slider.goNext(); // From Step 2 to Step 3
        markStepAsCompleted(2);
        setActiveStep(3);
      } else {
        // Workshops are available, proceed to Step 2 as usual
        slider.goNext();
        markStepAsCompleted(1);
        setActiveStep(2);
        resetSelectedWorkshop();
      }
    } catch (error) {
      console.error("Error loading workshops:", error);
    } finally {
      // Hide the loading animation
      stepOneRequestingAnimation.setStyle({ display: "none" });
    }
  });

  const backStepTwo = new WFComponent("#backStepTwo");
  backStepTwo.on("click", () => {
    // Move back to the first step
    slider.goPrevious();
    unmarkStepAsCompleted(1);
    unsetActiveStep(2);
    resetSelectedWorkshop();
  });

  const submitStepTwo = new WFComponent("#submitStepTwo");
  const stepTwoRequestingAnimation = new WFComponent(
    "#stepTwoRequestingAnimation"
  );
  const submitStepTwoError = new WFComponent("#submitStepTwoError");

  submitStepTwo.on("click", async (event) => {
    event.preventDefault();

    // Get the selected workshop and program from the state
    const selectedWorkshop = loadSelectedWorkshop();
    const selectedProgram = loadSelectedProgram();

    // Check if the workshop list is empty or not
    const workshopListContainer = document.querySelector("#selectWorkshopList");
    const workshopItems =
      workshopListContainer?.querySelectorAll("#cardSelectWorkshop") || [];
    const isWorkshopListEmpty = workshopItems.length === 0;

    if (!isWorkshopListEmpty && !selectedWorkshop.id) {
      submitStepTwoError.setText("Please select a workshop before proceeding.");
      submitStepTwoError.setStyle({ display: "block" });
      return;
    }

    // Hide the error message if any
    submitStepTwoError.setStyle({ display: "none" });

    // Show the loading animation
    stepTwoRequestingAnimation.setStyle({ display: "block" });

    try {
      // Initialize the session list
      await initializeSessionList(selectedWorkshop.id, selectedProgram.id);

      // Move to the next slide
      slider.goNext();
      markStepAsCompleted(2);
      setActiveStep(3);
    } catch (error) {
      console.error("Error loading sessions:", error);
    } finally {
      // Hide the loading animation
      stepTwoRequestingAnimation.setStyle({ display: "none" });
    }
  });

  const backStepThree = new WFComponent("#backStepThree");
  backStepThree.on("click", () => {
    // Move back to the workshop selection step
    slider.goPrevious();
    unmarkStepAsCompleted(2);
    unsetActiveStep(3);
  });

  const submitStepThree = new WFComponent("#submitStepThree");
  const stepThreeRequestingAnimation = new WFComponent(
    "#stepThreeRequestingAnimation"
  );
  const submitStepThreeError = new WFComponent("#submitStepThreeError");

  submitStepThree.on("click", async (event) => {
    event.preventDefault();

    // Show the loading animation
    stepThreeRequestingAnimation.setStyle({ display: "block" });

    try {
      // Validate and submit sessions
      const success = await validateAndSubmitSessions();
      if (success) {
        // Initialize checkout preview and move to the next slide
        await initializeCheckoutPreview();
        slider.goNext();
        markStepAsCompleted(3);
        setActiveStep(4);
      } else {
        submitStepThreeError.setText(
          "Please select sessions and students before proceeding."
        );
        submitStepThreeError.setStyle({ display: "block" });
      }
    } catch (error) {
      console.error("Error during session submission:", error);
      submitStepThreeError.setText("An error occurred. Please try again.");
      submitStepThreeError.setStyle({ display: "block" });
    } finally {
      // Hide the loading animation
      stepThreeRequestingAnimation.setStyle({ display: "none" });
    }
  });

  const backStepFour = new WFComponent("#backStepFour");
  backStepFour.on("click", () => {
    // Move back to the session selection step
    slider.goPrevious();
    unmarkStepAsCompleted(3);
    unsetActiveStep(4);
  });

  const submitStepFour = new WFComponent("#submitStepFour");
  const stepFourRequestingAnimation = new WFComponent(
    "#stepFourRequestingAnimation"
  );
  const submitStepFourError = new WFComponent("#submitStepFourError");

  submitStepFour.on("click", async (event) => {
    event.preventDefault();

    // Show the loading animation
    stepFourRequestingAnimation.setStyle({ display: "block" });

    try {
      // Load the current registration state
      const registrationState = loadState();

      // Submit the registration state to the /session_registrations/begin_checkout endpoint
      const response = await apiClient
        .post<BeginCheckout>("/session_registrations/begin_checkout", {
          data: registrationState,
        })
        .fetch();

      // Handle the response (e.g., redirect to the payment page or show a success message)
      console.log("Registration checkout response:", response);

      // Mark Step 4 as completed
      markStepAsCompleted(4);

      // Redirect based on the response: prioritize `setup_url` if it exists, otherwise use `checkout_url`
      if (response.setup_url) {
        window.location.href = response.setup_url;
      } else {
        window.location.href = response.checkout_url;
      }
    } catch (error) {
      console.error("Error during registration checkout:", error);
      submitStepFourError.setText(
        "An error occurred during registration checkout. Please try again."
      );
      submitStepFourError.setStyle({ display: "block" });
    } finally {
      // Hide the loading animation
      stepFourRequestingAnimation.setStyle({ display: "none" });
    }
  });
};