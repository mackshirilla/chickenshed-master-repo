import { WFComponent } from "@xatom/core";
import { saveCustomQuestion } from "../state/ticketPurchaseState"; // Correct function name

export const updateCustomQuestion = (questionText: string) => {
  const customQuestionLabel = new WFComponent(
    "label[for='customQuestionInput']"
  );
  const customQuestionInput = new WFComponent("#customQuestionInput");

  if (customQuestionLabel && customQuestionInput) {
    customQuestionLabel.setText(
      questionText || "No custom question available."
    );

    customQuestionInput.on("input", () => {
      const answer = (customQuestionInput.getElement() as HTMLInputElement)
        .value;
      saveCustomQuestion(answer); // Use the correct function name
    });
  }
};
