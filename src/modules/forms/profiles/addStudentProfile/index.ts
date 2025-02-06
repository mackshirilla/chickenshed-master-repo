// src/modules/forms/profiles/addStudentProfile/index.ts

import { WFComponent, WFFormComponent } from "@xatom/core";
import { WFImage } from "@xatom/image";
import { WFSlider } from "@xatom/slider";
import { initializeSidebarIndicators } from "./sidebar";
import { initializeSlider } from "./slider";
import { initializeStepOne } from "./steps/step1";
import { initializeStepTwo } from "./steps/step2";
import { initializeStepThree } from "./steps/step3";
import { initializeStepFour } from "./steps/step4";
import { initializeStepFive } from "./steps/step5";
import { initializeStepSix } from "./steps/step6";
import { initializeStepSeven } from "./steps/step7";
import { initializeStepEight } from "./steps/step8";
import { initializeStepNine } from "./steps/step9";
import { initializeStepTen } from "./steps/step10";

export const addStudentProfile = async () => {
  console.log("Initialize Add Student Form");

  // Initialize the sidebar indicators
  initializeSidebarIndicators();

  // Initialize the slider
  const slider = initializeSlider();

  // Initialize form components for all steps
  const formStepOne = new WFFormComponent<{
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    send_texts: boolean;
  }>("#formStepOne");

  const formStepTwo = new WFFormComponent<{
    profile_pic: string;
    grade: string;
    school: string;
    dob: string;
    gender: string;
  }>("#formStepTwo");

  const formStepThree = new WFFormComponent<{
    health: string;
  }>("#formStepThree");

  const formStepFive = new WFFormComponent<{
    emergency_first_name: string;
    emergency_last_name: string;
    emergency_email: string;
    emergency_phone: string;
    emergency_relationship: string;
  }>("#formStepFive");

  const formStepSix = new WFFormComponent<{
    dismissal_names: string;
    independent_travel: boolean;
  }>("#formStepSix");

  const formStepSeven = new WFFormComponent<{
    family_involved: string;
    photo_release: boolean;
    student_id: number | null;
  }>("#formStepSeven");

  // Function to collect form data from each step
  const getFormData = () => {
    const formStepOneData = formStepOne.getFormData();
    const formStepTwoData = formStepTwo.getFormData();
    const formStepThreeData = formStepThree.getFormData();
    const formStepFiveData = formStepFive.getFormData();
    const formStepSixData = formStepSix.getFormData();
    const formStepSevenData = formStepSeven.getFormData();

    // Retrieve the existing student's ID from local storage, if any
    const existingStudent = localStorage.getItem("current_student");
    const studentId = existingStudent ? JSON.parse(existingStudent).id : null;

    // Consolidate all form data
    const formData = {
      ...formStepOneData,
      ...formStepTwoData,
      ...formStepThreeData,
      ...formStepFiveData,
      ...formStepSixData,
      ...formStepSevenData,
    };

    // Add the student ID to the form data if available
    if (studentId) {
      formData.student_id = studentId;
    }

    return formData;
  };

  // Initialize all steps
  initializeStepOne(slider);
  initializeStepTwo(slider);
  initializeStepThree(slider);
  initializeStepFour(slider);
  initializeStepFive(slider);
  initializeStepSix(slider);
  initializeStepSeven(slider);
  initializeStepEight(slider, getFormData); // Pass both slider and getFormData to Step Eight
  initializeStepNine(slider);
  initializeStepTen(slider);

  
};

