// completeUserProfile/index.ts

import { WFComponent, WFFormComponent, WFInvisibleForm } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { WFSlider } from "@xatom/slider";
import { userAuth } from "../../../../auth/authConfig";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
  setupFileUpload,
} from "../../../../utils/formUtils";
import {
  validateNotEmpty,
  validatePhoneNumber,
  validateSelectField,
} from "../../../../utils/validationUtils";
import { handleRecaptcha } from "../../../../utils/recaptchaUtils"; // Ensure this function is implemented for reCAPTCHA handling
import { apiClient } from "../../../../api/apiConfig";
import {
  initializeSidebarIndicators,
  setActiveStep,
  markStepAsCompleted,
  unmarkStepAsCompleted,
} from "./sidebarIndicator"; // Import sidebar functions

type completeProfileResponse = {
  status: string;
  message?: string;
  profile?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    profile_pic?: {
      url?: string;
    };
  };
};

export const completeUserProfile = async () => {
  // Set first name from userAuth
  const firstNameText = new WFComponent("#firstNameText");
  firstNameText.setText(userAuth.getUser().profile.first_name);

  // Request animation element
  const requestingAnimation = new WFComponent("#requestingAnimation");

  // Initialize the sidebar indicators
  initializeSidebarIndicators();

  // Initialize the form components
  const formStepOne = new WFFormComponent<{
    referred_by: string;
    is_y_memeber: boolean;
    y_member_id: string;
  }>("#formStepOne");

  const formStepTwo = new WFFormComponent<{
    profile_pic: string;
    phone: string;
    send_texts: boolean;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    zip: string;
  }>("#formStepTwo");

  const formStepThree = new WFFormComponent<{}>("#formStepThree");

  // Slider element
  const slider = new WFSlider(".multi-step_form_slider");

  // --- Step 3 Submit Button ---
  const submitStepThree = new WFComponent("#submitStepThree");

  // --- Step 1 ---
  const fieldsStepOne = [
    {
      input: new WFComponent("#referralInput"),
      error: new WFComponent("#referralInputError"),
      validationFn: validateSelectField,
      message: "This field is required.",
    },
  ];

  // Initialize validation for Step 1 fields
  fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepOneError")
    );
  });

  const yMemberCheckbox = new WFComponent("#isYMemberInput");
  const yInputHiddenWrapper = new WFComponent("#hiddenyMemberWrapper");

  yMemberCheckbox.on("change", () => {
    yInputHiddenWrapper.setStyle({
      display: yMemberCheckbox.getElement()["checked"] ? "block" : "none",
    });
  });

  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    let isFormValid = true;

    fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(
        input,
        validationFn,
        message
      )();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      toggleError(
        new WFComponent("#submitStepOneError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    slider.goNext();
  });

  // --- Step 2 ---
  const fieldsStepTwo = [
    {
      input: new WFComponent("#phoneNumberInput"),
      error: new WFComponent("#phoneNumberInputError"),
      validationFn: validatePhoneNumber,
      message: "This field is required.",
    },
  ];

  setupFileUpload(
    new WFComponent("#profilePictureInput"),
    new WFComponent("#profilePictureInputError"),
    new WFComponent("#profilePictureInputSuccess"),
    "/profiles/image-upload" // Replace with your actual endpoint
  );

  const phoneNumberInput = new WFComponent("#phoneNumberInput");
  phoneNumberInput.on("input", () => {
    const inputElement = phoneNumberInput.getElement() as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart as number;

    inputElement.value = formatPhoneNumber(inputElement.value);

    const formattedLength = inputElement.value.length;
    const cleanedLength = inputElement.value.replace(/\D/g, "").length;
    inputElement.setSelectionRange(
      cursorPosition + (formattedLength - cleanedLength),
      cursorPosition + (formattedLength - cleanedLength)
    );
  });

  function formatPhoneNumber(value: string): string {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    }
  }

  fieldsStepTwo.forEach(({ input, error, validationFn, message }) => {
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepTwoError")
    );
  });

  formStepTwo.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    let isFormValid = true;

    fieldsStepTwo.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(
        input,
        validationFn,
        message
      )();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      toggleError(
        new WFComponent("#submitStepTwoError"),
        "Please correct all errors above.",
        true
      );
      return;
    }

    slider.goNext();
  });

  // --- Step 3 ---
  const userProfilePic = new WFImage("#userProfilePic");

  slider.onSlideChange((activeIndex) => {
    if (activeIndex === 2) {
      // Step 3 becomes active
      const userProfile = userAuth.getUser().profile;
      const profilePicUrl =
        userProfile.profile_pic && userProfile.profile_pic.url
          ? userProfile.profile_pic.url
          : "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"; // Default fallback image

      userProfilePic.setImage(profilePicUrl);

      // Populate review elements
      new WFComponent("#userFullName").setText(
        `${userProfile.first_name} ${userProfile.last_name}`
      );
      new WFComponent("#userEmail").setText(userAuth.getUser().email);
      new WFComponent("#userPhone").setText(formStepTwo.getFormData().phone);
      new WFComponent("#userAddress").setText(
        formStepTwo.getFormData().address_line_1
      );
      new WFComponent("#userAddressLine2").setText(
        formStepTwo.getFormData().address_line_2
      );
      new WFComponent("#userCity").setText(formStepTwo.getFormData().city);
      new WFComponent("#userState").setText(formStepTwo.getFormData().state);
      new WFComponent("#userZip").setText(formStepTwo.getFormData().zip);
    }
  });

  formStepThree.onFormSubmit(async (formData, event) => {
    event.preventDefault();

    // Disable the submit button to prevent multiple submissions
    submitStepThree.setAttribute("disabled", "true");
    requestingAnimation.setStyle({ display: "block" });
    console.log("requesting animation displayed");

    const isRecaptchaValid = await handleRecaptcha("complete_profile");
    if (!isRecaptchaValid) {
      requestingAnimation.setStyle({ display: "none" }); // Hide animation on error
      submitStepThree.removeAttribute("disabled"); // Re-enable button on error
      toggleError(
        new WFComponent("#submitStepThreeError"),
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      return;
    }

    const completeProfileData = {
      ...formStepOne.getFormData(),
      ...formStepTwo.getFormData(),
    };

    try {
      const response = await apiClient
        .post<completeProfileResponse>("profiles/complete-profile", {
          data: completeProfileData,
        })
        .fetch();
    
      // Check for response status and handle accordingly
      if (response.status === "success" && response.profile) {
        const profile = response.profile;
    
        new WFComponent("#profileLinkTemplate").updateTextViaAttrVar({
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          phone: profile.phone,
        });
    
        // Set profile picture, or fallback if no URL exists
        const profilePicUrl =
          profile.profile_pic && profile.profile_pic.url
            ? profile.profile_pic.url
            : "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"; // Default fallback image
        new WFImage("#profileCardImg").setImage(profilePicUrl);
    
        requestingAnimation.setStyle({ display: "none" }); // Hide animation on success
        submitStepThree.removeAttribute("disabled"); // Re-enable button on success
        slider.goNext();
      } else {
        throw new Error(response.message || "Failed to complete profile.");
      }
    } catch (error: any) {
      console.error("Error completing profile:", error);
      toggleError(
        new WFComponent("#submitStepThreeError"),
        error.response?.data?.message || error.message || "An error occurred. Please try again.",
        true
      );
      requestingAnimation.setStyle({ display: "none" }); // Hide animation on error
      submitStepThree.removeAttribute("disabled"); // Re-enable button on error
    }
    
  });

  // --- Handle Back Button for Step 2 ---
  const backStepTwo = new WFComponent("#backStepTwo");

  backStepTwo.on("click", () => {
    slider.goPrevious();
  });

  // --- Handle Back Button for Step 3 ---
  const backStepThree = new WFComponent("#backStepThree");

  backStepThree.on("click", () => {
    requestingAnimation.setStyle({ display: "none" }); // Hide animations or loading states
    slider.goPrevious();
  });

  // --- Handle Submit Button for Step 4 ---
  const submitStepFour = new WFComponent("#submitStepFour");

  submitStepFour.on("click", () => {
    // Mark step 4 as completed **before** navigating to the next slide
    markStepAsCompleted(4);
    console.log("Step 4 is marked as complete");

    // Move to the next slide (step 5), which has no sidebar indicator
    slider.goNext();
  });

  // --- Handle Back Button for Step 4 ---
  const backStepFour = new WFComponent("#backStepFour");

  backStepFour.on("click", () => {
    // Unmark step 4 as completed since the user is going back
    unmarkStepAsCompleted(4);
    console.log("Step 4 is unmarked as complete");

    // Move back to the previous slide (step 3)
    slider.goPrevious();
  });

  // --- Slider Change Event for Sidebar Updates ---
  slider.onSlideChange((activeIndex, prevIndex) => {
    // Set the active step if navigating to a step with a sidebar indicator (steps 1-4)
    if (activeIndex < 4) {
      setActiveStep(activeIndex + 1);
    }

    // Mark previous steps as complete if moving forward, up to step 4
    if (prevIndex !== -1 && prevIndex < activeIndex) {
      for (let i = prevIndex + 1; i <= activeIndex; i++) {
        if (i <= 4) {
          markStepAsCompleted(i);
        }
      }
    }

    // Unmark all subsequent steps if moving backward, up to step 4
    if (prevIndex !== -1 && prevIndex > activeIndex) {
      for (let i = prevIndex; i > activeIndex; i--) {
        if (i <= 4) {
          unmarkStepAsCompleted(i);
        }
      }
    }
  });

  // Ensure the sidebar is correctly updated on initialization
  setActiveStep(slider.getActiveSlideIndex() + 1);
};
