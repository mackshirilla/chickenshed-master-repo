import { WFComponent } from "@xatom/core";
import { updateSelectedItemUI } from "./utils/updateUi";
import { apiClient } from "../../api/apiConfig";
import { loadState, saveState } from "./state/registrationState";
import { initializeAlertBox } from "./components/alertBox";
import { initializePrimaryPaymentRadios } from "./components/primaryPaymentRadios";
import { initializeSecondaryPaymentRadios } from "./components/secondaryPaymentRadios";
import {
  renderLineItems,
  getLineItemsForSelectedOption,
} from "./components/lineItems";
import { updateTotalAmount } from "./components/updateTotalAmount";
import { initializeFinancialAid } from "./components/financialAid"; // Import financial aid initialization

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
      .post<CheckoutPreviewResponse>("/registration/checkout-preview", {
        data: registrationState,
      })
      .fetch();

    console.log("Checkout Preview Data:", response);

    updateSelectedItemUI();
    initializeAlertBox();

    const { selectedPricingOption } = response;

    // Extract line items data only
    const lineItemsOnly = {
      annual_line_items: response.annual_line_items,
      monthly_line_items: response.monthly_line_items,
      semester_line_items: response.semester_line_items,
      deposit_line_items: response.deposit_line_items,
    };

    // Save the entire response to state for later use
    saveState({ checkoutPreview: response, selectedPricingOption });

    initializePrimaryPaymentRadios(selectedPricingOption);
    initializeSecondaryPaymentRadios(selectedPricingOption);
    initializeFinancialAid(); // Initialize financial aid components

    const initialLineItems = getLineItemsForSelectedOption(
      selectedPricingOption,
      lineItemsOnly
    );
    renderLineItems(initialLineItems);

    updateTotalAmount();
  } catch (error) {
    console.error("Error fetching checkout preview data:", error);
  }
};
