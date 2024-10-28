import { WFComponent, WFFormComponent } from "@xatom/core";
import {
  setupValidation,
  createValidationFunction,
  toggleError,
} from "../../../../../utils/formUtils";
import {
  validateNotEmpty,
  validateEmailOptional,
  validatePhoneNumberOptional,
} from "../../../../../utils/validationUtils";
import { handleRecaptcha } from "../../../../../utils/recaptchaUtils";
import { apiClient } from "../../../../../api/apiConfig";
import { WFSlider } from "@xatom/slider";
import { userAuth } from "../../../../../auth/authConfig";

export const initializeStepOne = (slider: WFSlider) => {
  console.log("Initialize Add Student Form");

  // Set sidebar first name from userAuth
  const firstNameText = new WFComponent("#firstNameText");
  firstNameText.setText(userAuth.getUser().profile.first_name);
  console.log(`First name set to: ${userAuth.getUser().profile.first_name}`);

  // Step 1 Form Initialization
  const formStepOne = new WFFormComponent<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  }>("#formStepOne");

  // Check if current_student exists in local storage
  const existingStudent = localStorage.getItem("current_student");
  console.log(`Existing Student at Initialization: ${existingStudent}`);
  if (existingStudent) {
    try {
      const student = JSON.parse(existingStudent);
      console.log("Parsed existing student data:", student);
      formStepOne.setFromData({
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email,
        phone: student.phone,
        send_texts: student.send_texts,
      });
    } catch (parseError) {
      console.error("Error parsing existing_student:", parseError);
    }
  }

  // Define the fields with associated validation rules and error messages
  const fieldsStepOne = [
    {
      input: new WFComponent("#firstNameInput"),
      error: new WFComponent("#firstNameInputError"),
      validationFn: validateNotEmpty,
      message: "First name is required",
    },
    {
      input: new WFComponent("#lastNameInput"),
      error: new WFComponent("#lastNameInputError"),
      validationFn: validateNotEmpty,
      message: "Last name is required",
    },
    {
      input: new WFComponent("#emailInput"),
      error: new WFComponent("#emailInputError"),
      validationFn: validateEmailOptional,
      message: "Please enter a valid email address",
    },
    {
      input: new WFComponent("#phoneNumberInput"),
      error: new WFComponent("#phoneNumberInputError"),
      validationFn: validatePhoneNumberOptional,
      message: "Please enter a valid phone number or leave it empty",
    },
  ];

  // Auto-format phone number input to (xxx) xxx-xxxx
  const phoneNumberInput = new WFComponent("#phoneNumberInput");
  phoneNumberInput.on("input", () => {
    const inputElement = phoneNumberInput.getElement() as HTMLInputElement;
    const cursorPosition = inputElement.selectionStart as number;
    const originalValue = inputElement.value;
    inputElement.value = formatPhoneNumber(inputElement.value);
    const formattedLength = inputElement.value.length;
    const cleanedLength = inputElement.value.replace(/\D/g, "").length;
    inputElement.setSelectionRange(
      cursorPosition + (formattedLength - cleanedLength),
      cursorPosition + (formattedLength - cleanedLength)
    );
    console.log(
      `Phone number formatted from "${originalValue}" to "${inputElement.value}"`
    );
  });

  // Initialize validation for each field
  fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
    // Optional Enhancement: Real-time validation on blur
    input.on("blur", () => {
      const errorMessage = createValidationFunction(input, validationFn, message)();
      console.log(
        `Validation on blur for ${input.getElement().id}: "${errorMessage}"`
      );
      if (errorMessage) {
        toggleError(error, errorMessage, true);
      } else {
        toggleError(error, "", false);
      }
    });

    // Setup overall validation
    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepOneError")
    );
  });

  // Handle form submission for Step 1
  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault(); // Stop default form submission
    console.log("Form submission initiated.");
    const stepOneRequestingAnimation = new WFComponent(
      "#stepOneRequestingAnimation"
    );
    stepOneRequestingAnimation.setStyle({ display: "block" }); // Show loading animation
    console.log("Loading animation displayed.");
    let isFormValid = true;

    // Log the phone number input value on submit
    const phoneInputElement = document.querySelector(
      "#phoneNumberInput"
    ) as HTMLInputElement;
    console.log(
      `Phone Number Input Value on Submit: "${phoneInputElement.value}"`
    );

    // Validate all fields before proceeding
    fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(input, validationFn, message)();
      console.log(
        `Validation result for ${input.getElement().id}: "${errorMessage}"`
      );
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
      console.log("Form validation failed. Errors are displayed.");
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      console.log("Loading animation hidden.");
      return;
    }

    // **Fetch 'current_student' from localStorage at the time of submission**
    const existingStudentNow = localStorage.getItem("current_student");
    console.log(`existingStudentNow: ${existingStudentNow}`);

    // Check if a student profile already exists in local storage
    if (existingStudentNow) {
      try {
        const student = JSON.parse(existingStudentNow);
        console.log("Existing student found during submission:", student);

        // Compare form data with existing student data
        const formMatchesExisting = compareFormDataWithStudent(formData, student);
        console.log(`Form matches existing student: ${formMatchesExisting}`);

        if (formMatchesExisting) {
          // Skip creating a new profile and navigate directly to the next step
          console.log("Form data matches existing student. Navigating to next step.");
          slider.goNext();
          stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
          console.log("Loading animation hidden.");
          return;
        } else {
          // Make a request to update the existing student profile
          console.log(
            "Form data does not match existing student. Initiating update request."
          );
          try {
            const updateResponse = await updateStudentProfile(student.id, formData);
            if (updateResponse.status === "success") {
              const { profile } = updateResponse;
              localStorage.setItem("current_student", JSON.stringify(profile));
              console.log("Student profile updated successfully:", profile);
              slider.goNext(); // Proceed to next step
              console.log("Navigated to the next step after successful update.");
            } else {
              // Extract and display the server's error message
              const serverErrorMessage = updateResponse.message || "Unexpected response from the server.";
              console.warn("Server Error during update:", serverErrorMessage);

              toggleError(
                new WFComponent("#submitStepOneError"),
                serverErrorMessage,
                true
              );
              console.log("Server error message displayed to the user.");
            }
          } catch (updateError: any) {
            // Handle errors thrown during the update request
            console.error("Error during update request:", updateError);
            const serverErrorMessage =
              updateError.response?.data?.message ||
              updateError.message ||
              "Failed to update student profile.";
            toggleError(
              new WFComponent("#submitStepOneError"),
              serverErrorMessage,
              true
            );
            console.log("Server-provided error message displayed to the user.");
          }
        }
      } catch (parseError) {
        console.error(
          "Error parsing existing_student during submission:",
          parseError
        );
        toggleError(
          new WFComponent("#submitStepOneError"),
          "Invalid existing student data. Please try again.",
          true
        );
      } finally {
        stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
        console.log("Loading animation hidden.");
      }
      return;
    }

    // Handle reCAPTCHA verification
    const recaptchaAction = "create_account";
    console.log(`Handling reCAPTCHA for action: "${recaptchaAction}"`);
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);
    console.log(`reCAPTCHA validation result: ${isRecaptchaValid}`);
    if (!isRecaptchaValid) {
      toggleError(
        new WFComponent("#submitStepOneError"),
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      console.log("reCAPTCHA validation failed. Error message displayed.");
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      console.log("Loading animation hidden.");
      return;
    }

    // Post data to a server endpoint to create a new student profile
    try {
      console.log("Sending POST request to create student profile.");
      const response = await apiClient
        .post("/profiles/students/create-student", {
          data: formData,
        })
        .fetch();

      console.log(`Response received: ${JSON.stringify(response)}`);

      if (response.status === "success") {
        const { profile } = response;
        localStorage.setItem("current_student", JSON.stringify(profile));
        console.log("current_student set in localStorage:", profile);
        slider.goNext(); // Proceed to next step
        console.log("Navigated to the next step after successful submission.");
      } else {
        // Extract and display the server's error message
        const serverErrorMessage = response.message || "Unexpected response from the server.";
        console.warn("Server Error during creation:", serverErrorMessage);

        toggleError(
          new WFComponent("#submitStepOneError"),
          serverErrorMessage,
          true
        );
        console.log("Server error message displayed to the user.");
      }
    } catch (error: any) {
      console.error("Error during form submission:", error);
      const serverErrorMessage =
        error.response?.data?.message || error.message || "Failed to create account.";
      toggleError(
        new WFComponent("#submitStepOneError"),
        serverErrorMessage,
        true
      );
      console.log("Server-provided error message displayed to the user.");
    } finally {
      stepOneRequestingAnimation.setStyle({ display: "none" }); // Hide loading animation
      console.log("Loading animation hidden in finally block.");
    }
  });
};

/**
 * Helper function to format phone number.
 */
function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  let formatted = "";
  if (cleaned.length <= 3) {
    formatted = cleaned;
  } else if (cleaned.length <= 6) {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(
      3,
      6
    )}-${cleaned.slice(6, 10)}`;
  }
  return formatted;
}

/**
 * Compares form data with existing student data.
 * @param formData The data submitted from the form.
 * @param student The existing student data from local storage.
 * @returns True if all fields match, false otherwise.
 */
function compareFormDataWithStudent(
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  },
  student: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  }
): boolean {
  return (
    formData.first_name === student.first_name &&
    formData.last_name === student.last_name &&
    formData.email === student.email &&
    formData.phone === student.phone &&
    formData.send_texts === student.send_texts
  );
}

/**
 * Updates the existing student profile by making a POST request.
 * @param id The ID of the existing student.
 * @param formData The updated form data.
 * @returns The response from the server.
 */
async function updateStudentProfile(
  id: string,
  formData: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  }
): Promise<any> {
  try {
    console.log(
      `Sending POST request to update student profile with ID: ${id}`
    );
    const response = await apiClient
      .post("/profiles/students/create-student-updated", {
        data: {
          ...formData,
          id: id, // Include the existing student's ID
        },
      })
      .fetch();

    console.log(`Update response received: ${JSON.stringify(response)}`);

    return response;
  } catch (error: any) {
    console.error("Error updating student profile:", error);
    throw error;
  }
}
