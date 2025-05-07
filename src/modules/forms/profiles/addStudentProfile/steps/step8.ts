import { WFComponent } from "@xatom/core";
import { WFSlider } from "@xatom/slider";
import { WFImage } from "@xatom/image";
import { handleRecaptcha } from "../../../../../utils/recaptchaUtils";
import { apiClient } from "../../../../../api/apiConfig";
import { toggleError } from "../../../../../utils/formUtils";
import { unmarkStepAsCompleted, unsetActiveStep } from "../sidebar";

// Prevent double-binding on initialization
let step8Initialized = false;

type ApiResponse<T> = {
  status: string;
  message?: string;
  profile?: T;
};

type StudentProfile = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_pic?: {
    url?: string;
  };
};

export const initializeStepEight = (slider: WFSlider, getFormData: () => any) => {
  // Guard to ensure this setup runs only once
  if (step8Initialized) return;
  step8Initialized = true;

  console.log("Initialize Step Eight");

  // Initialize form review items
  const studentProfilePic = new WFImage("#studentProfilePic");
  const studentFullName = new WFComponent("#studentFullName");
  const studentEmail = new WFComponent("#studentEmail");
  const studentPhone = new WFComponent("#studentPhone");
  const studentGrade = new WFComponent("#studentGrade");
  const studentSchool = new WFComponent("#studentSchool");
  const studentDOB = new WFComponent("#studentDOB");
  const studentGender = new WFComponent("#studentGender");
  const studentHealth = new WFComponent("#studentHealth");
  const studentEmergencyName = new WFComponent("#studentEmergencyName");
  const studentEmergencyEmail = new WFComponent("#studentEmergencyEmail");
  const studentEmergencyPhone = new WFComponent("#studentEmergencyPhone");
  const studentEmergencyRelationship = new WFComponent("#studentEmergencyRelationship");
  const studentDismissalNames = new WFComponent("#studentDismissalNames");
  const studentTravelTrue = new WFComponent("#studentTravelTrue");
  const studentTravelFalse = new WFComponent("#studentTravelFalse");
  const studentFamily = new WFComponent("#studentFamily");
  const studentPhotoTrue = new WFComponent("#studentPhotoTrue");
  const studentPhotoFalse = new WFComponent("#studentPhotoFalse");
  const studentTextTrue = new WFComponent("#studentTextTrue");
  const studentTextFalse = new WFComponent("#studentTextFalse");

  // Function to set form review items from collected data
  const setFormReviewItems = () => {
    const data = getFormData();

    // Set student profile picture if available
    if (localStorage.getItem("image_upload")) {
      const image = localStorage.getItem("image_upload");
      studentProfilePic.setImage(image);
    } else {
      console.log("No profile picture available");
      studentProfilePic.setImage(
        "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
      );
    }

    // Set form review items with the appropriate data
    studentFullName.setText(`${data.first_name} ${data.last_name}`);
    studentEmail.setText(data.email);
    studentPhone.setText(data.phone);
    studentGrade.setText(data.grade);
    studentSchool.setText(data.school);
    studentDOB.setText(data.dob);
    studentGender.setText(data.gender);
    studentHealth.setText(data.health);
    studentEmergencyName.setText(
      `${data.emergency_first_name} ${data.emergency_last_name}`
    );
    studentEmergencyEmail.setText(data.emergency_email);
    studentEmergencyPhone.setText(data.emergency_phone);
    studentEmergencyRelationship.setText(data.emergency_relationship);
    studentDismissalNames.setText(data.dismissal_names);
    studentFamily.setText(data.family_involved);

    // Set independent travel info
    if (data.independent_travel) {
      studentTravelTrue.setStyle({ display: "block" });
      studentTravelFalse.setStyle({ display: "none" });
    } else {
      studentTravelFalse.setStyle({ display: "block" });
      studentTravelTrue.setStyle({ display: "none" });
    }

    // Set photo release info
    if (data.photo_release) {
      studentPhotoTrue.setStyle({ display: "block" });
      studentPhotoFalse.setStyle({ display: "none" });
    } else {
      studentPhotoFalse.setStyle({ display: "block" });
      studentPhotoTrue.setStyle({ display: "none" });
    }

    // Set text message opt-in info
    if (data.send_texts) {
      studentTextTrue.setStyle({ display: "block" });
      studentTextFalse.setStyle({ display: "none" });
    } else {
      studentTextFalse.setStyle({ display: "block" });
      studentTextTrue.setStyle({ display: "none" });
    }
  };

  // Set review items when slide changes to step 8
  slider.onSlideChange(setFormReviewItems);

  // Handle Step Eight form submission (Review and Save)
  const submitStepEight = new WFComponent("#submitStepEight");
  const stepEightRequestingAnimation = new WFComponent("#stepEightRequestingAnimation");
  const submitStepEightError = new WFComponent("#submitStepEightError");

  submitStepEight.on("click", async (event) => {
    event.preventDefault(); // Prevent normal form submission
    stepEightRequestingAnimation.setStyle({ display: "block" }); // Show loading animation

    // Handle reCAPTCHA verification
    const recaptchaAction = "complete_student";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);

    if (!isRecaptchaValid) {
      toggleError(
        submitStepEightError,
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      stepEightRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      return;
    }

    const formData = getFormData();

    try {
      const response = await apiClient
        .post<ApiResponse<StudentProfile>>("/profiles/students/complete-profile", {
          data: formData,
        })
        .fetch();
    
      if (response.status === "success" && response.profile) {
        const profile = response.profile;
    
        // Update the profile link template with the returned data
        const studentProfileLinkTemplate = new WFComponent("#studentCard");
        studentProfileLinkTemplate.updateTextViaAttrVar({
          name: `${profile.first_name} ${profile.last_name}`,
          email: profile.email,
          phone: profile.phone,
        });
    
        // **Updated code to append ?id={student_id} to the #studentCard link**
        const studentCardElement =
          studentProfileLinkTemplate.getElement() as HTMLAnchorElement;
        const currentHref = studentCardElement.getAttribute("href") || "";
        const newHref = `${currentHref}?id=${profile.id}`;
        studentCardElement.setAttribute("href", newHref);
    
        // Update the profile card image with the profile picture if available
        const profileCardImg = new WFImage("#profileCardImg");
        if (profile.profile_pic?.url) {
          profileCardImg.setImage(profile.profile_pic.url);
        } else {
          console.log("No profile picture available");
          profileCardImg.setImage(
            "https://cdn.prod.website-files.com/667f080f36260b9afbdc46b2/667f080f36260b9afbdc46be_placeholder.svg"
          );
        }
    
        // Clear current student and uploaded image from local storage
        localStorage.removeItem("current_student");
        localStorage.removeItem("image_upload");
    
        stepEightRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
        slider.goNext(); // Navigate to the next step
      } else {
        toggleError(
          submitStepEightError,
          response.message || "Failed to complete profile.",
          true
        );
        stepEightRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      }
    } catch (error: any) {
      console.error("Error completing profile:", error);
      toggleError(
        submitStepEightError,
        error.response?.data?.message || "Failed to complete profile.",
        true
      );
      stepEightRequestingAnimation.setStyle({ display: "none" });
    }
  });

  // Handle back button for Step 8
  const backStepButton = new WFComponent("#backStepEight");
  backStepButton.on("click", () => {
    slider.goPrevious();
    unsetActiveStep(8);
    unmarkStepAsCompleted(7);
    unmarkStepAsCompleted(8);
  });
};
