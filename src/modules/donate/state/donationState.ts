export interface DonationState {
  selectedCampaignId?: string;
  selectedCampaignName?: string;
  selectedCampaignSubheading?: string;
  selectedCampaignImageUrl?: string;
  selectedCampaignDescription?: string;
  selectedProductId?: string;
  selectedProductName?: string;
  selectedProductAmount?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  isAnonymous?: boolean; // Added this line for anonymous donation
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
  };
};

// Save the selected product details
export const saveSelectedProduct = (product: {
  id: string;
  name: string;
  amount: number;
}) => {
  saveDonationState({
    selectedProductId: product.id,
    selectedProductName: product.name,
    selectedProductAmount: product.amount,
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
  };
};

// Save the donor details
export const saveDonorDetails = (donor: {
  email: string;
  firstName: string;
  lastName: string;
  isAnonymous: boolean;
}) => {
  saveDonationState({
    email: donor.email,
    firstName: donor.firstName,
    lastName: donor.lastName,
    isAnonymous: donor.isAnonymous,
  });
};
