// state/selectedProgram.ts

export const loadSelectedProgram = () => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  return {
    id: state.selectedProgramId || null,
    name: state.selectedProgramName || null,
    imageUrl: state.selectedProgramImageUrl || null,
    ageRange: state.selectedProgramAgeRange || null,
  };
};

export const saveSelectedProgram = (program: {
  id: string;
  name: string;
  imageUrl: string;
  ageRange: string;
}) => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  state.selectedProgramId = program.id;
  state.selectedProgramName = program.name;
  state.selectedProgramImageUrl = program.imageUrl;
  state.selectedProgramAgeRange = program.ageRange;

  console.log("Saving selected program to state:", state); // Debug log

  localStorage.setItem("registrationState", JSON.stringify(state));
};
