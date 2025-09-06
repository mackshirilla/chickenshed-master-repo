import { WFComponent } from "@xatom/core";

/**
 * Checks if the API data has any student profiles.
 * If not, displays the Action Required dialog and clicks the trigger element.
 */
export function showActionRequiredDialogIfNoStudentProfiles(apiData: any): void {
  // Check if student_profiles is missing or empty.
  if (!apiData.student_profiles || apiData.student_profiles.length === 0) {
    const dialogComp = new WFComponent("#actionRequiredDialog");
    const dialogEl = dialogComp.getElement();
    if (dialogEl instanceof HTMLDialogElement) {
      dialogEl.showModal();
    } else {
      dialogEl.style.display = "block";
    }
    // Also trigger the animation click.
    const trigger = document.getElementById("alertDialogAnimationTrigger");
    if (trigger) {
      trigger.click();
    }
  }
}
