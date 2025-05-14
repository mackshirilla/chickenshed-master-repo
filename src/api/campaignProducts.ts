import { apiClient } from "./apiConfig";

export interface Product {
  id: number;
  Product_name: string;
  Product_id: string;
  Annual_price_id: string;
  Monthly_price_id: string;
  Single_sale_price_id: string;
  Displayed_annual_price: string;
  Displayed_monthly_price: string;
  Displayed_single_sale_price: string;
  Annual_price_amount: number;
  Monthly_price_amount: number;
  Single_sale_price_amount: number;
}

export interface ProductApiResponse {
  products: Product[];
}

// Fetch products from the server based on the selected campaign ID
export const fetchProducts = async (campaignId: string): Promise<Product[]> => {
  try {
    const response = await apiClient
      .post<ProductApiResponse>("/donate/campaign/products", {
        data: { campaign_id: campaignId },
      })
      .fetch();
    return response.products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
