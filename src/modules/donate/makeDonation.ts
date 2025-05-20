// makeDonation.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { initializeCampaignList } from "./campaignList";
import { initializeDynamicProductList, renderProductListForDonationType } from "./campaignProductList";
import {
  getSelectedCampaign,
  getSelectedProduct,
  getSelectedDonationType,
  clearDonationState,
  saveDonorDetails,
  loadDonationState,
  saveSelectedDonationType,
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

const setupDonationTypeSelection = () => {
  const radios = document.querySelectorAll<HTMLInputElement>(
    'input[name="selectDonationType"]'
  );
  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        saveSelectedDonationType(radio.value as "one-time" | "month" | "year");
        console.log("Donation type changed to:", radio.value);
        renderProductListForDonationType(); // 👈 this line ensures product list updates
      }
    });
  });
};

// Initialize the donation process
export const makeDonation = async () => {
  // Clear selected campaign and product on load to ensure a fresh start
  clearDonationState();
  setupDonationTypeSelection();
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

  const submitButtonStepOne = new WFComponent("#submitStepOne")

  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    submitButtonStepOne.setAttribute("disabled", "true");
    const selectedCampaign = getSelectedCampaign();
  
    if (!selectedCampaign || !selectedCampaign.id) {
      console.error("No campaign selected.");
      const submitStepOneError = new WFComponent("#submitStepOneError");
      submitStepOneError.setText("Please select a campaign.");
      submitStepOneError.setStyle({ display: "block" });
      submitButtonStepOne.removeAttribute("disabled"); // ✅ Fix: re-enable button on early return
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
    } finally {
      submitButtonStepOne.removeAttribute("disabled");
    }
  });
  

  // Handle step 2 interactions
  const formStepTwo = new WFFormComponent<{ product_id: string }>(
    "#formStepTwo"
  );

  const submitButtonStepTwo = new WFComponent("#submitStepTwo");

  formStepTwo.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    submitButtonStepTwo.setAttribute("disabled", "true"); // ✅ Disable button immediately
  
    const selectedProduct = getSelectedProduct();
    const donationType = getSelectedDonationType();
    let isPriceAvailable = false;
  
    switch (donationType) {
      case "one-time":
        isPriceAvailable = !!selectedProduct.Single_sale_price_id;
        break;
      case "month":
        isPriceAvailable = !!selectedProduct.Monthly_price_id;
        break;
      case "year":
        isPriceAvailable = !!selectedProduct.Annual_price_id;
        break;
    }
  
    if (!isPriceAvailable) {
      const submitStepTwoError = new WFComponent("#submitStepTwoError");
      submitStepTwoError.setText("The selected product is not available for this donation type.");
      submitStepTwoError.setStyle({ display: "block" });
      submitButtonStepTwo.removeAttribute("disabled"); // ✅ Re-enable on early return
      return;
    }
  
    const user = userAuth.getUser();
    const userEmail = user && user.email ? user.email : null;
  
    const emailWrap = document.getElementById("emailWrap");
    let hasErrors = false;
    let email = userEmail;
  
    let donorDetails = {
      email: "",
      firstName: "",
      lastName: "",
      isAnonymous: false,
    } as {
      email: string;
      firstName: string;
      lastName: string;
      isAnonymous: boolean;
      inNameOf?: string;
    };
  
    if (emailWrap && emailWrap.style.display !== "none") {
      const firstNameInput = document.getElementById("firstNameInput") as HTMLInputElement;
      const lastNameInput = document.getElementById("lastNameInput") as HTMLInputElement;
      const emailInput = document.getElementById("emailInput") as HTMLInputElement;
  
      const firstNameError = !validateNotEmpty(firstNameInput.value);
      const lastNameError = !validateNotEmpty(lastNameInput.value);
      const emailError = !validateEmail(emailInput.value);
  
      if (firstNameError || lastNameError || emailError) {
        hasErrors = true;
  
        if (firstNameError) {
          const err = new WFComponent("#firstNameInputError");
          err.setText("First name is required.");
          err.setStyle({ display: "block" });
        }
  
        if (lastNameError) {
          const err = new WFComponent("#lastNameInputError");
          err.setText("Last name is required.");
          err.setStyle({ display: "block" });
        }
  
        if (emailError) {
          const err = new WFComponent("#emailInputError");
          err.setText("A valid email address is required.");
          err.setStyle({ display: "block" });
        }
  
        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText("Please correct the errors above.");
        submitStepTwoError.setStyle({ display: "block" });
        submitButtonStepTwo.removeAttribute("disabled"); // ✅ Re-enable on validation failure
        return;
      }
  
      if (!userEmail) {
        email = emailInput.value;
      }
  
      const isAnonymous = (document.getElementById("anonymousInput") as HTMLInputElement).checked;
      donorDetails = {
        email,
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        isAnonymous,
      };
    } else {
      const isAnonymous = (document.getElementById("anonymousInput") as HTMLInputElement).checked;
      donorDetails = {
        email: userEmail || "",
        firstName: user ? user.profile.first_name : "",
        lastName: user ? user.profile.last_name : "",
        isAnonymous,
      };
    }
  
    const inNameOfCheckbox = document.getElementById("inNameOfBoolInput") as HTMLInputElement;
    const inNameOfInput = document.getElementById("inNameOfInput") as HTMLInputElement;
  
    if (inNameOfCheckbox?.checked) {
      const inNameOfValue = inNameOfInput.value.trim();
      if (!validateNotEmpty(inNameOfValue)) {
        hasErrors = true;
        const err = new WFComponent("#inNameOfInputError");
        err.setText("Please enter the name.");
        err.setStyle({ display: "block" });
  
        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText("Please correct the errors above.");
        submitStepTwoError.setStyle({ display: "block" });
        submitButtonStepTwo.removeAttribute("disabled"); // ✅ Re-enable on validation failure
        return;
      }
      donorDetails.inNameOf = inNameOfValue;
    } else {
      donorDetails.inNameOf = "";
    }
  
    if (!hasErrors) {
      saveDonorDetails(donorDetails);
  
      const stepTwoRequestingAnimation = new WFComponent("#stepTwoRequestingAnimation");
      stepTwoRequestingAnimation.setStyle({ display: "block" });
  
      try {
        const donationState = {
          ...loadDonationState(),
          currentPageUrl: window.location.href,
        };
  
        const response = await apiClient
          .post<{ checkout_url: string }>("/donate/begin_checkout", {
            data: donationState,
          })
          .fetch();
  
        window.location.href = response.checkout_url;
      } catch (error) {
        console.error("Error during checkout:", error);
        const submitStepTwoError = new WFComponent("#submitStepTwoError");
        submitStepTwoError.setText("An error occurred during checkout. Please try again.");
        submitStepTwoError.setStyle({ display: "block" });
      } finally {
        const stepTwoRequestingAnimation = new WFComponent("#stepTwoRequestingAnimation");
        stepTwoRequestingAnimation.setStyle({ display: "none" });
        submitButtonStepTwo.removeAttribute("disabled"); // ✅ Always re-enable
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
