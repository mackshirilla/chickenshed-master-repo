// state/selectedWorkshop.ts

export const loadSelectedWorkshop = () => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  return {
    id: state.selectedWorkshopId || null,
    name: state.selectedWorkshopName || null,
    imageUrl: state.selectedWorkshopImageUrl || null,
    ageRange: state.selectedWorkshopAgeRange || null,
  };
};

export const saveSelectedWorkshop = (workshop: {
  id: string;
  name: string;
  imageUrl: string;
  ageRange: string;
}) => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  state.selectedWorkshopId = workshop.id;
  state.selectedWorkshopName = workshop.name;
  state.selectedWorkshopImageUrl = workshop.imageUrl;
  state.selectedWorkshopAgeRange = workshop.ageRange;

  console.log("Saving selected workshop to state:", state); // Debug log

  localStorage.setItem("registrationState", JSON.stringify(state));
};

export const resetSelectedWorkshop = () => {
  const state = JSON.parse(localStorage.getItem("registrationState") || "{}");
  delete state.selectedWorkshopId;
  delete state.selectedWorkshopName;
  delete state.selectedWorkshopImageUrl;
  delete state.selectedWorkshopAgeRange;

  console.log("Resetting selected workshop in state:", state); // Debug log

  localStorage.setItem("registrationState", JSON.stringify(state));
};
