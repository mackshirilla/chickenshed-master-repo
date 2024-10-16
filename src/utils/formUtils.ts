import { WFComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { apiClient } from "../api/apiConfig";
import { userAuth } from "../auth/authConfig";

export function toggleError(
  errorMessageComponent: WFComponent<any>,
  message: string,
  show: boolean
): void {
  errorMessageComponent.updateTextViaAttrVar({ text: show ? message : "" });
  errorMessageComponent.setStyle({ display: show ? "flex" : "none" });
}

export function setupValidation(
  inputComponent: WFComponent,
  errorComponent: WFComponent,
  validate: () => string,
  requestErrorComponent?: WFComponent // Optional component to clear on input change
) {
  const validateAndUpdate = () => {
    const errorMessage = validate();
    toggleError(errorComponent, errorMessage, !!errorMessage);
    if (requestErrorComponent && errorMessage === "") {
      // Clear request error message when the user is correcting the input
      toggleError(requestErrorComponent, "", false);
    }
  };

  // Attach event listeners for real-time validation
  inputComponent.on("input", validateAndUpdate);
  inputComponent.on("blur", validateAndUpdate);
  inputComponent.on("change", validateAndUpdate);
}

export function createValidationFunction(
  inputComponent: WFComponent,
  validationFn: (input: string) => boolean,
  errorMessage: string
): () => string {
  return () => {
    const inputElement = inputComponent.getElement() as HTMLInputElement;
    const isValid = validationFn(inputElement.value);
    return isValid ? "" : errorMessage;
  };
}

export function createCheckboxValidationFunction(
  checkboxComponent: WFComponent,
  errorMessage: string
): () => string {
  return () => {
    const checkbox = checkboxComponent.getElement() as HTMLInputElement;
    return checkbox.checked ? "" : errorMessage;
  };
}

export function setupCheckboxValidation(
  checkboxComponent: WFComponent,
  checkboxErrorComponent: WFComponent,
  errorMessage: string
) {
  const validate = createCheckboxValidationFunction(
    checkboxComponent,
    errorMessage
  );
  setupValidation(checkboxComponent, checkboxErrorComponent, validate);
}

export function validateSelectedSessions(
  selectedSessions: { sessionId: string; studentIds: string[] }[],
  errorMessageComponent: WFComponent<any>,
  errorMessage: string
): boolean {
  const isValid =
    selectedSessions.length > 0 &&
    selectedSessions.some((session) => session.studentIds.length > 0);

  if (!isValid) {
    toggleError(errorMessageComponent, errorMessage, true);
  } else {
    toggleError(errorMessageComponent, "", false);
  }

  return isValid;
}

type fileUploadResponse = {
  status: string;
  url: {
    profile_pic: {
      url: string;
    };
  };
};

/**
 * Updates the user's profile picture URL in the authentication system.
 * @param {string} imageUrl - The URL of the uploaded image.
 */
export function setProfilePicUrl(imageUrl: string): void {
  const user = userAuth.getUser();
  if (user && user.profile) {
    // Ensure the profile_picture object exists
    user.profile.profile_pic = user.profile.profile_pic || { url: "" };

    // Set the profile picture URL
    user.profile.profile_pic.url = imageUrl;
    userAuth.setUser(user);
    localStorage.setItem("auth_user", JSON.stringify(user));
  }
}

/**
 * Handles file upload and displays the uploaded image.
 * @param {WFComponent} fileInput - The WFComponent instance for the file input field.
 * @param {WFComponent} fileInputError - The WFComponent instance for displaying error messages.
 * @param {WFComponent} fileInputSuccess - The WFComponent instance for displaying success messages.
 * @param {string} uploadEndpoint - The endpoint to which the file is sent.
 * @returns {Promise<string>} A promise that resolves with the URL of the uploaded image.
 */
/**
 * Handles file upload and displays the uploaded image.
 * Only JPEG files less than 2 MB can be uploaded.
 * @param {WFComponent} fileInput - The WFComponent instance for the file input field.
 * @param {WFComponent} fileInputError - The WFComponent instance for displaying error messages.
 * @param {WFComponent} fileInputSuccess - The WFComponent instance for displaying success messages.
 * @param {string} uploadEndpoint - The endpoint to which the file is sent.
 * @returns {Promise<string>} A promise that resolves with the URL of the uploaded image.
 */
export function setupFileUpload(
  fileInput: WFComponent,
  fileInputError: WFComponent,
  fileInputSuccess: WFComponent,
  uploadEndpoint: string
): Promise<string> {
  const profilePictureImage = new WFImage("#profilePictureImage");
  const uploadAnimation = new WFComponent("#uploadAnimation");

  const overlay = new WFComponent(".drop-zone");
  let dragCounter = 0;

  return new Promise<string>((resolve) => {
    const handleFile = (file: File) => {
      // Validate file type and size
      const validTypes = ["image/jpeg", "image/jpg"];
      const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB

      if (
        !validTypes.includes(file.type) &&
        !/\.(jpg|jpeg)$/i.test(file.name)
      ) {
        const errorMessage = "Only JPEG images are allowed.";
        toggleError(fileInputError, errorMessage, true);
        // Reset file input value
        (fileInput.getElement() as HTMLInputElement).value = "";
        return;
      }

      if (file.size > maxSizeInBytes) {
        const errorMessage = "File size must be less than 2 MB.";
        toggleError(fileInputError, errorMessage, true);
        // Reset file input value
        (fileInput.getElement() as HTMLInputElement).value = "";
        return;
      }

      // Show upload animation immediately
      uploadAnimation.setStyle({ display: "flex" });

      // Hide error and success messages
      fileInputError.setStyle({ display: "none" });
      fileInputSuccess.setStyle({ display: "none" });

      const reader = new FileReader();

      // Display preview image as soon as the file is loaded into memory
      reader.onload = (event) => {
        // Set the preview image for the profile picture
        const result = event.target?.result as string;
        profilePictureImage.setImage(result);

        // Hide overlay once the image is set
        overlay.setStyle({ display: "none" });
      };

      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append("profile_picture", file);

      const existingStudent = localStorage.getItem("current_student");
      if (existingStudent) {
        const student = JSON.parse(existingStudent);
        formData.append("student_profile_id", student.id.toString());
      }

      // Send the file to the server
      const postRequest = apiClient.post<fileUploadResponse>(uploadEndpoint, {
        data: formData,
      });

      postRequest.onData((response) => {
        if (response.status === "success") {
          const imageUrl = response.url.profile_pic.url;

          // Update the profile picture URL in the user session and local storage
          setProfilePicUrl(imageUrl);

          // Update the image for other parts of the UI as well
          profilePictureImage.setImage(imageUrl);

          // Store the URL in local storage
          localStorage.setItem("image_upload", imageUrl);

          // Show success message and hide upload animation
          fileInputSuccess.setStyle({ display: "flex" });
          uploadAnimation.setStyle({ display: "none" });

          // Resolve with the uploaded image URL
          resolve(imageUrl);
        } else {
          const errorMessage = "Failed to upload profile picture.";
          toggleError(fileInputError, errorMessage, true);
          uploadAnimation.setStyle({ display: "none" });
          overlay.setStyle({ display: "none" });
          dragCounter = 0;
          // Reset file input value
          (fileInput.getElement() as HTMLInputElement).value = "";
        }
      });

      postRequest.onError((error) => {
        let errorMessage = "An error occurred during image upload.";
        if (error.response && error.response.data) {
          errorMessage = error.response.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }

        // Show error message and hide upload animation
        toggleError(fileInputError, errorMessage, true);
        uploadAnimation.setStyle({ display: "none" });
        overlay.setStyle({ display: "none" });
        dragCounter = 0;
        // Reset file input value
        (fileInput.getElement() as HTMLInputElement).value = "";
      });

      // Make the API call
      postRequest.fetch();
    };

    // Event listener for file input changes
    fileInput.on("change", () => {
      const file = (fileInput.getElement() as HTMLInputElement).files?.[0];
      if (file) {
        handleFile(file);
      }
    });

    // Event listeners for drag-and-drop
    const dragZoneElement = document.body;
    dragZoneElement.addEventListener("dragenter", (event) => {
      event.preventDefault();
      dragCounter++;
      if (dragCounter === 1) {
        overlay.setStyle({ display: "flex" });
      }
    });

    dragZoneElement.addEventListener("dragleave", () => {
      dragCounter--;
      if (dragCounter <= 0) {
        overlay.setStyle({ display: "none" });
        dragCounter = 0;
      }
    });

    dragZoneElement.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    dragZoneElement.addEventListener("drop", (event) => {
      event.preventDefault();

      const files = event.dataTransfer?.files;
      if (files?.length) {
        handleFile(files[0]);
      }

      overlay.setStyle({ display: "none" });
      dragCounter = 0;
    });
  });
}

// src/utils/formUtils.ts

/**
 * Formats a phone number string to the format (xxx) xxx-xxxx.
 * If the input contains more than 10 digits, it truncates the extra digits.
 * If it contains fewer, it formats as much as possible.
 *
 * @param value - The raw phone number string.
 * @returns The formatted phone number string.
 */
export const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, ""); // Remove all non-digit characters

  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else if (cleaned.length <= 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else {
    // If more than 10 digits, truncate the extra digits
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6,
      10
    )}`;
  }
};
