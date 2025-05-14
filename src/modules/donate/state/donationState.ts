export interface DonationState {
  selectedCampaignId?: string;
  selectedCampaignName?: string;
  selectedCampaignSubheading?: string;
  selectedCampaignImageUrl?: string;
  selectedCampaignDescription?: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedProductAmount?: number;
  Single_sale_price_id?: string;
  Monthly_price_id?: string;
  Annual_price_id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAnonymous?: boolean;
  inNameOf?: string;
  selectedDonationType?: "one-time" | "month" | "year"; // ✅ added
  currentPageUrl?: string; // ✅ Add this

}

const DONATION_STATE_KEY = "donationState";

// Load the donation state from local storage
export const loadDonationState = (): DonationState => {
  const savedState = localStorage.getItem(DONATION_STATE_KEY);
  return savedState ? JSON.parse(savedState) : {};
};

// Save the donation state to local storage
export const saveDonationState = (state: Partial<DonationState>) => {
  const currentState = loadDonationState();
  const newState = { ...currentState, ...state };
  localStorage.setItem(DONATION_STATE_KEY, JSON.stringify(newState));
};

// Clear the donation state from local storage
export const clearDonationState = () => {
  localStorage.removeItem(DONATION_STATE_KEY);
};

// Get the selected campaign details
export const getSelectedCampaign = () => {
  const state = loadDonationState();
  return {
    id: state.selectedCampaignId || null,
    name: state.selectedCampaignName || null,
    imageUrl: state.selectedCampaignImageUrl || null,
    description: state.selectedCampaignDescription || null,
    subheading: state.selectedCampaignSubheading || null,
  };
};

// Save the selected campaign details
export const saveSelectedCampaign = (campaign: {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  subheading: string;
}) => {
  saveDonationState({
    selectedCampaignId: campaign.id,
    selectedCampaignName: campaign.name,
    selectedCampaignImageUrl: campaign.imageUrl,
    selectedCampaignDescription: campaign.description,
    selectedCampaignSubheading: campaign.subheading,
  });
};

// Get the selected product details
export const getSelectedProduct = () => {
  const state = loadDonationState();
  return {
    id: state.selectedProductId || null,
    name: state.selectedProductName || null,
    amount: state.selectedProductAmount || null,
    Single_sale_price_id: state.Single_sale_price_id || null,
    Monthly_price_id: state.Monthly_price_id || null,
    Annual_price_id: state.Annual_price_id || null,
  };
};

// Save the selected product details
export const saveSelectedProduct = (product: {
  id: string;
  name: string;
  amount: number;
  Single_sale_price_id?: string;
  Monthly_price_id?: string;
  Annual_price_id?: string;
}) => {
  saveDonationState({
    selectedProductId: product.id,
    selectedProductName: product.name,
    selectedProductAmount: product.amount,
    Single_sale_price_id: product.Single_sale_price_id,
    Monthly_price_id: product.Monthly_price_id,
    Annual_price_id: product.Annual_price_id,
  });
};

// Get the donor details
export const getDonorDetails = () => {
  const state = loadDonationState();
  return {
    email: state.email || null,
    firstName: state.firstName || null,
    lastName: state.lastName || null,
    isAnonymous: state.isAnonymous || false,
    inNameOf: state.inNameOf || null,
  };
};

// Save the donor details
export const saveDonorDetails = (donor: {
  email: string;
  firstName: string;
  lastName: string;
  isAnonymous: boolean;
  inNameOf?: string;
}) => {
  saveDonationState({
    email: donor.email,
    firstName: donor.firstName,
    lastName: donor.lastName,
    isAnonymous: donor.isAnonymous,
    inNameOf: donor.inNameOf,
  });
};

// Get and save donation type
export const getSelectedDonationType = (): "one-time" | "month" | "year" => {
  const state = loadDonationState();
  return (state.selectedDonationType as "one-time" | "month" | "year") || "one-time";
};

export const saveSelectedDonationType = (type: "one-time" | "month" | "year") => {
  saveDonationState({ selectedDonationType: type });
};
