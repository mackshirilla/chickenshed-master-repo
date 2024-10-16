import { WFComponent } from "@xatom/core";
import {
  saveAssistanceNeeded,
  saveAssistanceMessage,
} from "../state/ticketPurchaseState";

export const initializeAssistanceInput = () => {
  const assistanceInput = new WFComponent("#assistanceInput");
  const hiddenAssistanceWrapper = new WFComponent("#hiddenAssistanceWrapper");
  const assistanceMessageInput = new WFComponent("#assistanceMessageInput");

  if (!assistanceInput || !hiddenAssistanceWrapper || !assistanceMessageInput) {
    console.error("Assistance input or hidden wrapper elements not found.");
    return;
  }

  // Initialize state based on current input values
  const isChecked = (assistanceInput.getElement() as HTMLInputElement).checked;
  saveAssistanceNeeded(isChecked);

  if (isChecked) {
    hiddenAssistanceWrapper.removeCssClass("g-hide");
    const assistanceMessage = (
      assistanceMessageInput.getElement() as HTMLTextAreaElement
    ).value;
    saveAssistanceMessage(assistanceMessage);
  } else {
    hiddenAssistanceWrapper.addCssClass("g-hide");
    saveAssistanceMessage(""); // Clear the message in the state if hidden
  }

  assistanceInput.on("change", () => {
    const isChecked = (assistanceInput.getElement() as HTMLInputElement)
      .checked;

    if (isChecked) {
      hiddenAssistanceWrapper.removeCssClass("g-hide");
    } else {
      hiddenAssistanceWrapper.addCssClass("g-hide");
      (assistanceMessageInput.getElement() as HTMLTextAreaElement).value = ""; // Clear the input when hidden
      saveAssistanceMessage(""); // Clear the message in the state if hidden
    }

    saveAssistanceNeeded(isChecked); // Save the checkbox state
  });

  assistanceMessageInput.on("input", () => {
    const message = (assistanceMessageInput.getElement() as HTMLTextAreaElement)
      .value;
    saveAssistanceMessage(message); // Save the message to the state
  });
};
