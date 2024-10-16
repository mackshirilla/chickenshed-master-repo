// src/pages/removeStudent.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { apiClient } from "../../../../api/apiConfig";
import { validateNotEmpty } from "../../../../utils/validationUtils";
import {
  toggleError,
  setupValidation,
  createValidationFunction,
} from "../../../../utils/formUtils";

// RemoveStudentDialog Component
type RemoveStudentDialogOptions = {
  subscriptionId: string;
  sessionId: string;
  students: Array<{
    id: number; // This represents the subscription item ID linked to each student
    student_profile_id: number;
    student_name: string;
  }>;
};

export class RemoveStudentDialog {
  private dialog: WFComponent;
  private removeForm: WFFormComponent;
  private subscriptionId: string;
  private sessionId: string;
  private students: Array<{
    id: number;
    student_profile_id: number;
    student_name: string;
  }>;
  private studentId?: string;
  private subscriptionItemId?: number;
  private pageMain: WFComponent;

  constructor(options: RemoveStudentDialogOptions) {
    const { subscriptionId, sessionId, students } = options;

    this.subscriptionId = subscriptionId;
    this.sessionId = sessionId;
    this.students = students;

    this.dialog = new WFComponent("#removeStudentDialog"); // Changed to class selector
    this.removeForm = new WFFormComponent("#cancelSubscriptionForm"); // Changed to class selector
    this.pageMain = new WFComponent(".page_main");

    this.initialize();
  }

  private initialize() {
    // Attach event listeners to the remove buttons
    const removeButtons = document.querySelectorAll(".remove_button"); // Updated selector to class

    if (removeButtons.length === 0) {
      console.error("Remove buttons not found");
      return;
    }

    removeButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const target = event.currentTarget as HTMLElement;

        // Extract data attributes
        const studentProfileId = target.getAttribute("data-student-id");
        const subscriptionItemId = target.getAttribute(
          "data-subscription-item-id"
        );

        console.log("Clicked remove button:", {
          studentProfileId,
          subscriptionItemId,
        });

        if (!studentProfileId || !subscriptionItemId) {
          console.error("Missing data attributes on remove button", {
            studentProfileId,
            subscriptionItemId,
          });
          alert("Unable to remove student. Missing necessary data.");
          return;
        }

        // Find the student using the `student_profile_id`
        const student = this.students.find(
          (s) => s.student_profile_id.toString() === studentProfileId
        );

        if (student) {
          this.studentId = student.student_profile_id.toString();
          this.subscriptionItemId = student.id; // This is the `subscription_item_id` we need
          this.openDialog(student.student_name);
        } else {
          console.error("Student not found in provided student list", {
            studentProfileId,
            students: this.students,
          });
          alert("Student not found. Please try again.");
        }
      });
    });

    // Setup close button listener
    const closeButton = new WFComponent("#close-dialog-btn"); // Changed to class selector
    if (closeButton.getElement()) {
      closeButton.on("click", () => {
        this.closeDialog();
      });
    } else {
      console.error("Close dialog button not found");
    }

    // Setup form submission handling
    this.setupFormSubmission();
    this.setupFormValidation();
  }

  private openDialog(studentName: string) {
    if (this.dialog.getElement() && this.pageMain.getElement()) {
      console.log("Opening remove student dialog");
      const studentNameElement = new WFComponent("#removeStudentName"); // Changed to class selector
      studentNameElement.setText(studentName);

      // Update page_main data-brand attribute
      if (this.pageMain.getElement()) {
        this.pageMain.setAttribute("data-brand", "6");
      } else {
        console.error("page_main element not found");
      }

      const dialogElement = this.dialog.getElement() as HTMLDialogElement;
      if (dialogElement) {
        dialogElement.showModal(); // Using `showModal()` to ensure it behaves as a modal
      } else {
        console.error("Dialog element not found");
      }
    } else {
      console.error("Dialog or page_main element not found");
    }
  }

  private closeDialog() {
    if (this.dialog.getElement() && this.pageMain.getElement()) {
      console.log("Closing remove student dialog");

      // Reset page_main data-brand attribute
      if (this.pageMain.getElement()) {
        this.pageMain.setAttribute("data-brand", "2");
      } else {
        console.error("page_main element not found");
      }

      const dialogElement = this.dialog.getElement() as HTMLDialogElement;
      if (dialogElement) {
        dialogElement.close(); // Using `close()` to properly close the dialog
      } else {
        console.error("Dialog element not found");
      }
    } else {
      console.error("Dialog or page_main element not found");
    }
  }

  private setupFormSubmission() {
    this.removeForm.onFormSubmit(async (formData, event) => {
      event.preventDefault(); // Prevent form default submission
      event.stopPropagation(); // Stop any other event listeners on the form

      console.log("Remove student form submission intercepted");

      const reason = formData.removed_because as string;

      if (!validateNotEmpty(reason)) {
        const errorComponent = new WFComponent("#removedReasonError"); // Changed to class selector
        toggleError(
          errorComponent,
          "Reason for removing the student is required.",
          true
        );
        return;
      }

      try {
        // Show loading animation
        this.setLoadingState(true);

        if (!this.studentId || !this.subscriptionItemId) {
          throw new Error(
            "No student ID or subscription item ID found for removal."
          );
        }

        // Make DELETE request to API to remove student
        console.log(
          "Submitting removal to API for student ID:",
          this.studentId,
          "with subscription item ID:",
          this.subscriptionItemId
        );

        const response = await apiClient
          .delete(
            `/subscriptions/${this.subscriptionId}/session/${this.sessionId}/student/${this.studentId}`,
            {
              data: {
                reason: reason,
                subscription_item_id: this.subscriptionItemId, // Use the subscription item ID here
              },
            }
          )
          .fetch();

        if (response) {
          console.log("Student removed successfully");

          // Clear any previous error messages
          const errorComponent = new WFComponent("#removedReasonError"); // Changed to class selector
          toggleError(errorComponent, "", false); // Explicitly hide error on success

          // Close dialog and remove student from UI
          this.closeDialog();
          this.removeStudentFromUI(this.studentId);
        } else {
          throw new Error(
            "Unexpected response received from student removal API."
          );
        }
      } catch (error) {
        console.error("Error removing student: ", error);
        this.showErrorMessage(
          "Oops! Something went wrong while submitting the form."
        );
      } finally {
        // Hide loading animation
        this.setLoadingState(false);
      }
    });
  }

  private setupFormValidation() {
    const reasonInput = new WFComponent("#removedReason"); // Changed to class selector
    const reasonErrorComponent = new WFComponent("#removedReasonError"); // Changed to class selector

    if (!reasonInput.getElement() || !reasonErrorComponent.getElement()) {
      console.error("Reason input or error component not found for validation");
      return;
    }

    const validateReason = createValidationFunction(
      reasonInput,
      (input) => validateNotEmpty(input),
      "Reason for removing the student is required."
    );

    setupValidation(reasonInput, reasonErrorComponent, validateReason);
  }

  private setLoadingState(isLoading: boolean) {
    const loadingAnimation = new WFComponent("#removeStudentRequesting"); // Changed to class selector
    const submitButton = new WFComponent("#removeStudentSubmit"); // Changed to class selector

    if (loadingAnimation.getElement() && submitButton.getElement()) {
      if (isLoading) {
        loadingAnimation.setStyle({ display: "block" });
        submitButton.setAttribute("disabled", "true");
      } else {
        loadingAnimation.setStyle({ display: "none" });
        submitButton.removeAttribute("disabled");
      }
    } else {
      console.error(
        "Loading animation or submit button not found for setting loading state"
      );
    }
  }

  private removeStudentFromUI(studentId: string) {
    const studentRow = document.querySelector(
      `#listStudentCard[data-student-id="${studentId}"]`
    ) as HTMLElement | null;

    if (studentRow) {
      studentRow.remove();
      console.log(
        `Removed student row with data-student-id="${studentId}" from UI.`
      );
    } else {
      console.error(
        `Student row with data-student-id="${studentId}" not found in DOM.`
      );
    }
  }

  private showErrorMessage(message: string) {
    const errorElement = new WFComponent("#submitInviteCaregiverError"); // Changed to class selector
    if (errorElement.getElement()) {
      errorElement.setText(message);
      errorElement.setStyle({ display: "flex" });
    } else {
      console.error("Error element not found for showing error message");
    }
  }
}
