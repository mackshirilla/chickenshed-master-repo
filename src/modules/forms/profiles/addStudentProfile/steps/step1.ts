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

type ApiResponse<T> = {
  status: string;
  message?: string;
  profile?: T;
};

type StudentProfile = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  send_texts: boolean;
};

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
    input.on("blur", () => {
      const errorMessage = createValidationFunction(input, validationFn, message)();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
      } else {
        toggleError(error, "", false);
      }
    });

    setupValidation(
      input,
      error,
      createValidationFunction(input, validationFn, message),
      new WFComponent("#submitStepOneError")
    );
  });


  const submitButtonStepOne = new WFComponent("#submitStepOne");
  // Handle form submission for Step 1
  formStepOne.onFormSubmit(async (formData, event) => {
    event.preventDefault();
    submitButtonStepOne.setAttribute("disabled", "true");
    console.log("Form submission initiated.");
    const stepOneRequestingAnimation = new WFComponent("#stepOneRequestingAnimation");
    stepOneRequestingAnimation.setStyle({ display: "block" });

    let isFormValid = true;
    fieldsStepOne.forEach(({ input, error, validationFn, message }) => {
      const errorMessage = createValidationFunction(input, validationFn, message)();
      if (errorMessage) {
        toggleError(error, errorMessage, true);
        isFormValid = false;
      } else {
        toggleError(error, "", false);
      }
    });

    if (!isFormValid) {
      toggleError(new WFComponent("#submitStepOneError"), "Please correct all errors above.", true);
      stepOneRequestingAnimation.setStyle({ display: "none" });
      submitButtonStepOne.removeAttribute("disabled");
      return;
    }

    const existingStudentNow = localStorage.getItem("current_student");
    if (existingStudentNow) {
      try {
        const student = JSON.parse(existingStudentNow);
        const formMatchesExisting = compareFormDataWithStudent(formData, student);

        if (formMatchesExisting) {
          slider.goNext();
          stepOneRequestingAnimation.setStyle({ display: "none" });
          submitButtonStepOne.removeAttribute("disabled");
          return;
        } else {
          const updatedProfile = await updateStudentProfile(student.id, formData);
          localStorage.setItem("current_student", JSON.stringify(updatedProfile));
          slider.goNext();
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Failed to update student profile.";
        toggleError(new WFComponent("#submitStepOneError"), errorMessage, true);
      } finally {
        stepOneRequestingAnimation.setStyle({ display: "none" });
        submitButtonStepOne.removeAttribute("disabled");
      }
      return;
    }

    const recaptchaAction = "create_account";
    const isRecaptchaValid = await handleRecaptcha(recaptchaAction);
    if (!isRecaptchaValid) {
      toggleError(
        new WFComponent("#submitStepOneError"),
        "reCAPTCHA verification failed. Please try again.",
        true
      );
      stepOneRequestingAnimation.setStyle({ display: "none" });
      submitButtonStepOne.removeAttribute("disabled");
      return;
    }

    try {
      const response = await apiClient
        .post<ApiResponse<StudentProfile>>("/profiles/students/create-student", {
          data: formData,
        })
        .fetch();

      if (response.status === "success" && response.profile) {
        localStorage.setItem("current_student", JSON.stringify(response.profile));
        slider.goNext();
      } else {
        throw new Error(response.message || "Failed to create student profile.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || "Failed to create student profile.";
      toggleError(new WFComponent("#submitStepOneError"), errorMessage, true);
    } finally {
      stepOneRequestingAnimation.setStyle({ display: "none" });
      submitButtonStepOne.removeAttribute("disabled");
    }
  });
};

function formatPhoneNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  return cleaned.length <= 3
    ? cleaned
    : cleaned.length <= 6
    ? `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`
    : `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
}

function compareFormDataWithStudent(formData: StudentProfile, student: StudentProfile): boolean {
  return (
    formData.first_name === student.first_name &&
    formData.last_name === student.last_name &&
    formData.email === student.email &&
    formData.phone === student.phone &&
    formData.send_texts === student.send_texts
  );
}

async function updateStudentProfile(id: string, formData: StudentProfile): Promise<StudentProfile> {
  const response = await apiClient
    .post<ApiResponse<StudentProfile>>("/profiles/students/create-student-updated", {
      data: { ...formData, id },
    })
    .fetch();

  if (response.status === "success" && response.profile) {
    return response.profile;
  } else {
    throw new Error(response.message || "Failed to update student profile.");
  }
}
