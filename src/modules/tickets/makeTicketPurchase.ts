import { WFComponent, WFFormComponent } from "@xatom/core";
import { initializeProductionList } from "./productionList";
import { initializePerformanceList } from "./performanceList";
import { initializeTicketTiers } from "./ticketTiers";
import {
  getSelectedProduction,
  getSelectedPerformance,
  loadTicketPurchaseState,
  getSelectedBundles,
  getSelectedTickets,
  clearTicketPurchaseState,
  clearSelectedPerformance,
  clearSelectedBundles,
  clearSelectedTickets,
} from "./state/ticketPurchaseState";
import { WFSlider } from "@xatom/slider";
import {
  initializeTicketSidebarIndicators,
  setActiveTicketStep,
  markTicketStepAsCompleted,
  unsetActiveTicketStep,
  unmarkTicketStepAsCompleted,
} from "./components/sidebarIndicators";
import { validateNotEmpty, validateEmail } from "../../utils/validationUtils";
import { toggleError, createValidationFunction } from "../../utils/formUtils";
import { apiClient } from "../../api/apiConfig";
import { initializeStateFromUrlParams } from "./components/urlParamNavigator";

interface checkoutResponse {
  checkout_url: string;
}

// Initialize the ticket purchase process
export const makeTicketPurchase = async () => {
  const slider = new WFSlider(".multi-step_form_slider");

  // Initialize state from URL parameters
  await initializeStateFromUrlParams(slider);

  // Initialize sidebar indicators
  initializeTicketSidebarIndicators();

  // Step 1: Initialize production list
  await initializeProductionList("#selectProductionList");

  // Handle form submission for production selection
  const formStepOne = new WFFormComponent<{ production_id: string }>(
    "#formStepOne"
  );

  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    const selectedProduction = getSelectedProduction();
    const stepOneRequestingAnimation = new WFComponent(
      "#stepOneRequestingAnimation"
    );

    if (!selectedProduction || !selectedProduction.id) {
      console.error("No production selected.");
      const submitStepOneError = new WFComponent("#submitStepOneError");
      submitStepOneError.setText("Please select a production.");
      submitStepOneError.setStyle({ display: "block" });
      return;
    }

    console.log("Production selected:", selectedProduction);

    const submitStepOneError = new WFComponent("#submitStepOneError");
    submitStepOneError.setStyle({ display: "none" });

    // Show the loading animation
    stepOneRequestingAnimation.setStyle({ display: "block" });

    try {
      // Proceed to Step 2: Initialize performance list
      await initializePerformanceList("#selectPerformanceList");

      // Mark Step 1 as completed and move to Step 2
      markTicketStepAsCompleted(1);
      setActiveTicketStep(2);

      // Move to the next step
      slider.goNext();
    } catch (error) {
      console.error("Error during step 1 processing:", error);
    } finally {
      // Hide the loading animation
      stepOneRequestingAnimation.setStyle({ display: "none" });
    }
  });

  // Step 2: Handle form submission for performance selection
  const formStepTwo = new WFFormComponent<{ performance_id: string }>(
    "#formStepTwo"
  );

  formStepTwo.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    const selectedPerformance = getSelectedPerformance();
    const stepTwoRequestingAnimation = new WFComponent(
      "#stepTwoRequestingAnimation"
    );

    if (!selectedPerformance || !selectedPerformance.id) {
      console.error("No performance selected.");
      const submitStepTwoError = new WFComponent("#submitStepTwoError");
      submitStepTwoError.setText("Please select a performance.");
      submitStepTwoError.setStyle({ display: "block" });
      return;
    }

    console.log("Performance selected:", selectedPerformance);

    const submitStepTwoError = new WFComponent("#submitStepTwoError");
    submitStepTwoError.setStyle({ display: "none" });

    // Show the loading animation
    stepTwoRequestingAnimation.setStyle({ display: "block" });

    try {
      // Mark Step 2 as completed and move to Step 3
      markTicketStepAsCompleted(2);
      setActiveTicketStep(3);

      // Initialize ticket tiers (Step 3)
      await initializeTicketTiers("#bundleList", "#ticketTierList");

      // Move to the next step
      slider.goNext();
    } catch (error) {
      console.error("Error during step 2 processing:", error);
    } finally {
      // Hide the loading animation
      stepTwoRequestingAnimation.setStyle({ display: "none" });
    }
  });

  // Step 3: Handle form submission for final checkout
  const formStepThree = new WFFormComponent("#formStepThree");
  const emailWrap = new WFComponent("#emailWrap");
  const firstNameInput = new WFComponent("#firstNameInput");
  const lastNameInput = new WFComponent("#lastNameInput");
  const emailInput = new WFComponent("#emailInput");
  const customQuestionInput = new WFComponent("#customQuestionInput");
  const submitStepThreeError = new WFComponent("#submitStepThreeError");
  const noTicketsError = new WFComponent("#noTicketsError");

  // Function to clear errors on interaction
  const clearErrorOnInteraction = (
    inputComponent: WFComponent,
    errorComponent: WFComponent
  ) => {
    const clearError = () => toggleError(errorComponent, "", false);
    inputComponent.on("input", clearError);
    inputComponent.on("focus", clearError);
    inputComponent.on("change", clearError);
  };

  formStepThree.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    let formIsValid = true;

    // clear any existing submit errors
    submitStepThreeError.setStyle({ display: "none" });

    // Validate email wrap section if displayed
    if (emailWrap.getElement().style.display !== "none") {
      // Validate First Name
      const firstNameError = new WFComponent("#firstNameInputError");
      const firstNameValidation = createValidationFunction(
        firstNameInput,
        validateNotEmpty,
        "First name is required."
      );
      const firstNameValidationResult = firstNameValidation();
      toggleError(
        firstNameError,
        firstNameValidationResult,
        !!firstNameValidationResult
      );
      formIsValid = formIsValid && !firstNameValidationResult;
      clearErrorOnInteraction(firstNameInput, firstNameError);

      // Validate Last Name
      const lastNameError = new WFComponent("#lastNameInputError");
      const lastNameValidation = createValidationFunction(
        lastNameInput,
        validateNotEmpty,
        "Last name is required."
      );
      const lastNameValidationResult = lastNameValidation();
      toggleError(
        lastNameError,
        lastNameValidationResult,
        !!lastNameValidationResult
      );
      formIsValid = formIsValid && !lastNameValidationResult;
      clearErrorOnInteraction(lastNameInput, lastNameError);

      // Validate Email
      const emailError = new WFComponent("#emailInputError");
      const emailValidation = createValidationFunction(
        emailInput,
        validateEmail,
        "A valid email is required."
      );
      const emailValidationResult = emailValidation();
      toggleError(emailError, emailValidationResult, !!emailValidationResult);
      formIsValid = formIsValid && !emailValidationResult;
      clearErrorOnInteraction(emailInput, emailError);
    }

    // Validate Custom Question
    // Only validate the custom question if that entire section is shown
const customQuestionWrap = document.getElementById("customQuestionWrap")!;
if (customQuestionWrap.style.display !== "none") {
  const customQuestionError = new WFComponent("#customQuestionInputError");
  const customQuestionValidation = createValidationFunction(
    customQuestionInput,
    validateNotEmpty,
    "This field is required."
  );
  const customQuestionValidationResult = customQuestionValidation();
  toggleError(
    customQuestionError,
    customQuestionValidationResult,
    !!customQuestionValidationResult
  );
  formIsValid = formIsValid && !customQuestionValidationResult;
  clearErrorOnInteraction(customQuestionInput, customQuestionError);
}


    // Validate that at least one bundle or ticket is selected
    const selectedBundles = getSelectedBundles();
    const selectedTickets = getSelectedTickets();

    if (selectedBundles.length === 0 && selectedTickets.length === 0) {
      toggleError(
        noTicketsError,
        "Please select at least one bundle or ticket.",
        true
      );
      formIsValid = false;
    } else {
      toggleError(noTicketsError, "", false);
    }

    if (!formIsValid) {
      console.error("Form validation failed.");
      submitStepThreeError.setText("Please correct the highlighted errors.");
      submitStepThreeError.setStyle({ display: "block" });
      return;
    }

    console.log("Final form is valid, proceeding with submission...");

    const stepThreeRequestingAnimation = new WFComponent(
      "#stepThreeRequestingAnimation"
    );
    stepThreeRequestingAnimation.setStyle({ display: "block" });

    try {
      // Load the current state
      const ticketPurchaseState = loadTicketPurchaseState();

      // Extract only the required values from the state
      const {
        selectedBundles,
        selectedTickets,
        email,
        firstName,
        lastName,
        customQuestion,
        assistanceNeeded,
        assistanceMessage,
        selectedProductionId,
        selectedPerformanceId,
      } = ticketPurchaseState;

      // Construct the cancel_url
      const cancelUrl = `${window.location.origin}/purchase-tickets?production=${selectedProductionId}&performance=${selectedPerformanceId}`;

      // Create the payload with only the required values and the cancel_url
      const payload = {
        selectedBundles,
        selectedTickets,
        email,
        firstName,
        lastName,
        customQuestion,
        assistanceNeeded,
        assistanceMessage,
        selectedProductionId,
        selectedPerformanceId,
        cancel_url: cancelUrl,
      };

      // Submit the extracted state to the /tickets/begin_checkout endpoint
      const response = await apiClient
        .post<checkoutResponse>("/tickets/begin_checkout", {
          data: payload,
        })
        .fetch();

      // Handle the response (e.g., redirect to the payment page or show success message)
      console.log("Checkout response:", response);

      // Mark Step 3 as completed
      markTicketStepAsCompleted(3);

      // Redirect or show success (this depends on your application flow)
      window.location.href = response.checkout_url || "/payment";
    } catch (error) {
      console.error("Error during final step processing:", error);
      submitStepThreeError.setText(
        "An error occurred during checkout. Please try again."
      );
      submitStepThreeError.setStyle({ display: "block" });
    } finally {
      stepThreeRequestingAnimation.setStyle({ display: "none" });
    }
  });

  // Handle "Go Back" button for Step 3
  const backStepThree = new WFComponent("#backStepThree");
  backStepThree.on("click", () => {
    clearSelectedBundles();
    clearSelectedTickets();
    slider.goPrevious();
    unsetActiveTicketStep(3);
    unmarkTicketStepAsCompleted(2);
    setActiveTicketStep(2);
  });

  // Handle "Go Back" button for Step 2
  const backStepTwo = new WFComponent("#backStepTwo");
  backStepTwo.on("click", () => {
    clearSelectedPerformance();
    slider.goPrevious();
    unsetActiveTicketStep(2);
    unmarkTicketStepAsCompleted(1);
    setActiveTicketStep(1);
  });

  // Initialize sidebar indicators and set the first step as active
  setActiveTicketStep(1);
};
