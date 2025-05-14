import { WFComponent } from "@xatom/core";
import { saveCustomQuestion } from "../state/ticketPurchaseState";

export const updateCustomQuestion = (questionText: string) => {
  const wrapper = new WFComponent("#customQuestionWrap");
  const divider = new WFComponent("#customQuestionDivider");
  const label = new WFComponent("label[for='customQuestionInput']");
  const input = new WFComponent("#customQuestionInput");

  if (!questionText) {
    wrapper.setStyle({ display: "none" });
    divider.setStyle({ display: "none" });
    return;
  }

  wrapper.setStyle({ display: "" });
  divider.setStyle({ display: "" });

  // Set the label text inside the wrapper
  label.setText(questionText);

  // Wire up input save
  input.on("input", () => {
    const answer = (input.getElement() as HTMLInputElement).value;
    saveCustomQuestion(answer);
  });
};
