// makeDonation.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { initializeCampaignList } from "./campaignList";
import { initializeDynamicProductList } from "./campaignProductList";
import {
  getSelectedCampaign,
  getSelectedProduct,
  clearDonationState,
  saveDonorDetails,
  loadDonationState,
} from "./state/donationState";
import { updateSelectedCampaignDisplay } from "./components/selectedCampaignDisplay";
import { WFSlider } from "@xatom/slider";
import { initializeUserContactDetails } from "./components/userContactDetails";
import { validateNotEmpty, validateEmail } from "../../utils/validationUtils";
import { apiClient } from "../../api/apiConfig";
import {
  initializeSidebarIndicators,
  setActiveStep,
  markStepAsCompleted,
  unmarkStepAsCompleted,
  unsetActiveStep,
} from "./components/sidebarIndicators";
import { initializeStateFromUrlParams } from "./components/urlParamNavigator";
import { userAuth } from "../../auth/authConfig";

// Initialize the donation process
export const makeDonation = async () => {
  // Clear selected campaign and product on load to ensure a fresh start
  clearDonationState();

  initializeSidebarIndicators(); // Initialize sidebar indicators
  setActiveStep(1);

  // Initialize the slider component
  const slider = new WFSlider(".multi-step_form_slider");

  initializeStateFromUrlParams(slider);

  // Initialize campaign list
  await initializeCampaignList("#selectCampaignList");
  // Initialize user contact details
  initializeUserContactDetails();

  // Handle form submission for campaign selection
  const formStepOne = new WFFormComponent<{ campaign_id: string }>(
    "#formStepOne"
  );

  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    const selectedCampaign = getSelectedCampaign();

    if (!selectedCampaign || !selectedCampaign.id) {
      console.error("No campaign selected.");
      const submitStepOneError = new WFComponent("#submitStepOneError");
      submitStepOneError.setText("Please select a campaign.");
      submitStepOneError.setStyle({ display: "block" });
      return;
    }

    console.log("Campaign selected:", selectedCampaign);

    // Show loading animation
    const stepOneRequestingAnimation = new WFComponent(
      "#stepOneRequestingAnimation"
    );
    stepOneRequestingAnimation.setStyle({ display: "block" });

    try {
      // Initialize product list based on the selected campaign
      await initializeDynamicProductList(
        "#selectProductList",
        selectedCampaign.id
      );

      // Update selected campaign display
      updateSelectedCampaignDisplay();

      // Hide loading animation
      stepOneRequestingAnimation.setStyle({ display: "none" });

      // Mark step one as completed and proceed to the next step
      markStepAsCompleted(1);
      setActiveStep(2);
      slider.goNext();
    } catch (error) {
      console.error("Error loading products:", error);

      // Hide loading animation and show error message
      stepOneRequestingAnimation.setStyle({ display: "none" });
      const submitStepOneError = new WFComponent("#submitStepOneError");
      submitStepOneError.setText("Error loading products. Please try again.");
      submitStepOneError.setStyle({ display: "block" });
    }
  });

  // Handle step 2 interactions
  const formStepTwo = new WFFormComponent<{ product_id: string }>(
    "#formStepTwo"
  );

  formStepTwo.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    const selectedProduct = getSelectedProduct();

    if (!selectedProduct || !selectedProduct.id) {
      console.error("No product selected.");
      const submitStepTwoError = new WFComponent("#submitStepTwoError");
      submitStepTwoError.setText("Please select a product.");
      submitStepTwoError.setStyle({ display: "block" });
      return;
    }

    // Get user email from authentication state if logged in
    const user = userAuth.getUser();
    const userEmail = user && user.email ? user.email : null;

    // Validate user contact details if emailWrap is displayed
    const emailWrap = document.getElementById("emailWrap");
    let hasErrors = false;
    let email = userEmail;

    // Initialize an object to hold all donor details
    let donorDetails: {
      email: string;
      firstName: string;
      lastName: string;
      isAnonymous: boolean;
      inNameOf?: string;
    } = {
      email: "",
      firstName: "",
      lastName: "",
      isAnonymous: false,
    };

    if (emailWrap && emailWrap.style.display !== "none") {
      const firstNameInput = document.getElementById(
        "firstNameInput"
      ) as HTMLInputElement;
      const lastNameInput = document.getElementById(
        "lastNameInput"
      ) as HTMLInputElement;
      const emailInput = document.getElementById(
        "emailInput"
      ) as HTMLInputElement;

      const firstNameError = !validateNotEmpty(firstNameInput.value);
      const lastNameError = !validateNotEmpty(lastNameInput.value);
      const emailError = !validateEmail(emailInput.value);

      if (firstNameError || lastNameError || emailError) {
        hasErrors = true;
        console.error("Invalid input in contact details.");

        if (firstNameError) {
          const firstNameInputError = new WFComponent("#firstNameInputError");
          firstNameInputError.setText("First name is required.");
          firstNameInputError.setStyle({ display: "block" });
        }

        if (lastNameError) {
          const lastNameInputError = new WFComponent("#lastNameInputError");
          lastNameInputError.setText("Last name is required.");
          lastNameInputError.setStyle({ display: "block" });
        }

        if (emailError) {
          const emailInputError = new WFComponent("#emailInputError");
          emailInputError.setText("A valid email address is required.");
          emailInputError.setStyle({ display: "block" });
        }

        // Display general error message
        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText("Please correct the errors above.");
        submitStepTwoError.setStyle({ display: "block" });

        return;
      }

      // If validation passes and the user is not logged in, save contact details
      if (!userEmail) {
        email = emailInput.value;
      }

      const isAnonymous = (
        document.getElementById("anonymousInput") as HTMLInputElement
      ).checked;

      // Populate donorDetails object
      donorDetails = {
        email: email,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        isAnonymous: isAnonymous,
      };
    } else {
      // Handle anonymous input and email when the user is logged in
      const isAnonymous = (
        document.getElementById("anonymousInput") as HTMLInputElement
      ).checked;
      donorDetails = {
        email: userEmail || "",
        firstName: user ? user.profile.first_name : "",
        lastName: user ? user.profile.last_name : "",
        isAnonymous: isAnonymous,
      };
    }

    // Handle "Make this donation in someone else's name"
    const inNameOfCheckbox = document.getElementById(
      "inNameOfBoolInput"
    ) as HTMLInputElement;
    const inNameOfInput = document.getElementById(
      "inNameOfInput"
    ) as HTMLInputElement;

    if (inNameOfCheckbox && inNameOfCheckbox.checked) {
      const inNameOfValue = inNameOfInput.value.trim();
      const inNameOfError = !validateNotEmpty(inNameOfValue);

      if (inNameOfError) {
        hasErrors = true;
        console.error(
          "Name input is required when making donation in someone else's name."
        );

        const inNameOfInputError = new WFComponent("#inNameOfInputError");
        inNameOfInputError.setText("Please enter the name.");
        inNameOfInputError.setStyle({ display: "block" });

        // Display general error message
        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText("Please correct the errors above.");
        submitStepTwoError.setStyle({ display: "block" });

        return;
      } else {
        // Add inNameOf to donorDetails
        donorDetails.inNameOf = inNameOfValue;
      }
    } else {
      // If checkbox is not checked, ensure inNameOf is cleared
      donorDetails.inNameOf = "";
    }

    if (!hasErrors) {
      console.log("Donor details:", donorDetails);
      console.log("Product selected:", selectedProduct);

      // Save all donor details at once
      saveDonorDetails(donorDetails);

      // Debug: Log the entire donation state before submission
      const currentDonationState = loadDonationState();
      console.log("Current Donation State:", currentDonationState);

      // Show loading animation
      const stepTwoRequestingAnimation = new WFComponent(
        "#stepTwoRequestingAnimation"
      );
      stepTwoRequestingAnimation.setStyle({ display: "block" });

      // Submit the donation state to the server
      try {
        const donationState = loadDonationState();
        const response = await apiClient
          .post<{ checkout_url: string }>("/donate/begin_checkout", {
            data: donationState,
          })
          .fetch();

        // Hide loading animation
        stepTwoRequestingAnimation.setStyle({ display: "none" });

        // Navigate to the checkout URL
        window.location.href = response.checkout_url;
      } catch (error) {
        console.error("Error during checkout:", error);

        // Hide loading animation
        stepTwoRequestingAnimation.setStyle({ display: "none" });

        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText(
          "An error occurred during checkout. Please try again."
        );
        submitStepTwoError.setStyle({ display: "block" });
      }
    }
  });

  // Initialize components for UI interactions
  const backStepTwoButton = new WFComponent("#backStepTwo");
  backStepTwoButton.on("click", () => {
    console.log("Navigating to the previous step.");
    unmarkStepAsCompleted(1); // Unmark the first step if going back
    setActiveStep(1); // Set the first step as active
    unsetActiveStep(2); // Unset the second step as active
    slider.goPrevious();
  });

  const submitStepTwoButton = new WFComponent("#submitStepTwo");
  submitStepTwoButton.on("click", () => {
    console.log("Submitting the second step.");
  });

  // Clear general error when inputs are interacted with
  const clearSubmitStepTwoError = () => {
    const submitStepTwoError = new WFComponent("#submitStepTwoError");
    submitStepTwoError.setText("");
    submitStepTwoError.setStyle({ display: "none" });
  };

  const firstNameInput = document.getElementById(
    "firstNameInput"
  ) as HTMLInputElement;
  const lastNameInput = document.getElementById(
    "lastNameInput"
  ) as HTMLInputElement;
  const emailInput = document.getElementById("emailInput") as HTMLInputElement;
  const inNameOfInput = document.getElementById("inNameOfInput") as HTMLInputElement;

  if (firstNameInput && lastNameInput && emailInput && inNameOfInput) {
    firstNameInput.addEventListener("focus", clearSubmitStepTwoError);
    lastNameInput.addEventListener("focus", clearSubmitStepTwoError);
    emailInput.addEventListener("focus", clearSubmitStepTwoError);
    inNameOfInput.addEventListener("focus", clearSubmitStepTwoError);
  }

  // Handle the "Make donation in someone else's name" checkbox
  const inNameOfCheckbox = document.getElementById(
    "inNameOfBoolInput"
  ) as HTMLInputElement;
  const hiddenInputWrapper = document.getElementById("hiddenInput") as HTMLElement;

  const toggleHiddenInput = () => {
    if (inNameOfCheckbox.checked) {
      hiddenInputWrapper.style.display = "block";
    } else {
      hiddenInputWrapper.style.display = "none";
      // Clear the input value and any error messages
      inNameOfInput.value = "";
      const inNameOfError = new WFComponent("#inNameOfInputError");
      inNameOfError.setText("");
      inNameOfError.setStyle({ display: "none" });
    }
    clearSubmitStepTwoError();
  };

  if (inNameOfCheckbox && hiddenInputWrapper) {
    // Initialize the hidden input state based on checkbox
    toggleHiddenInput();

    // Add event listener to the checkbox
    inNameOfCheckbox.addEventListener("change", toggleHiddenInput);
  }
};
