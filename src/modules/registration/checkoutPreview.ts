// components/registration/checkoutPreview.ts
import { WFComponent } from "@xatom/core";
import { updateSelectedItemUI } from "./utils/updateUi";
import { apiClient } from "../../api/apiConfig";
import { loadState, saveState } from "./state/registrationState";
import { initializeAlertBox } from "./components/alertBox";
import { initializePrimaryPaymentRadios } from "./components/primaryPaymentRadios";
import {
  renderLineItems,
  getLineItemsForSelectedOption,
} from "./components/lineItems";
import { updateTotalAmount } from "./components/updateTotalAmount";
import { initializeFinancialAid } from "./components/financialAid"; // Import financial aid initialization
import { initializeAlertBoxEarly } from "./components/alertBoxEarly"; // Import the new alertBoxEarly

export interface CheckoutPreviewResponse {
  selectedPricingOption: string;
  annual_line_items: LineItem[];
  monthly_line_items: LineItem[];
  semester_line_items: LineItem[];
  deposit_line_items: LineItem[];
  annual_amount_due: number;
  monthly_amount_due: number;
  semester_amount_due: number;
  deposit_amount_due: number;
  early_registration: boolean; // Added early_registration flag
  start_date: string; // Added start_date field
}

export interface LineItem {
  price: string;
  quantity: number;
  unit_amount: number;
  product_name: string;
  total_amount: number;
}

export const initializeCheckoutPreview = async () => {
  try {
    const registrationState = loadState();

    const response = await apiClient
      .post<CheckoutPreviewResponse>("/registration/checkout-preview_new", {
        data: registrationState,
      })
      .fetch();

    console.log("Checkout Preview Data:", response);

    updateSelectedItemUI();
    initializeAlertBox();

    const { selectedPricingOption, early_registration, start_date } = response;

    // Extract line items data only
    const lineItemsOnly = {
      annual_line_items: response.annual_line_items,
      monthly_line_items: response.monthly_line_items,
      semester_line_items: response.semester_line_items,
      deposit_line_items: response.deposit_line_items,
    };

    // **Always** save 'early_registration' and 'start_date' to state
    saveState({ 
      checkoutPreview: response, 
      selectedPricingOption, 
      early_registration,
      start_date: response.start_date, // Ensure start_date is saved
    });

    initializePrimaryPaymentRadios(selectedPricingOption);
    initializeFinancialAid(); // Initialize financial aid components

    // Determine if deposit should be displayed
    const hasPendingStudents = registrationState.pendingStudents?.length > 0;
    const shouldShowDeposit =
      (early_registration && selectedPricingOption === "Monthly") ||
      hasPendingStudents;

    console.log(`shouldShowDeposit: ${shouldShowDeposit}`);

    if (shouldShowDeposit) {
      // Display deposit line items
      const depositLineItems = response.deposit_line_items;
      console.log("Initial deposit line items:", depositLineItems);
      renderLineItems(depositLineItems, true); // Pass a flag to indicate deposit items
      // Update total amounts accordingly
      updateTotalAmount(true, selectedPricingOption);
      console.log("Initial deposit line items rendered.");
    } else {
      // Render primary line items
      const primaryLineItems = getLineItemsForSelectedOption(
        selectedPricingOption,
        lineItemsOnly
      );
      renderLineItems(primaryLineItems);
      updateTotalAmount(false, selectedPricingOption);
      console.log("Initial primary line items rendered.");
    }

    // **Initialize the new early registration alert box**
    initializeAlertBoxEarly();
  } catch (error) {
    console.error("Error fetching checkout preview data:", error);
  }
};
