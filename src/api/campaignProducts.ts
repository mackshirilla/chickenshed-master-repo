import { apiClient } from "./apiConfig";

export interface Product {
  id: string;
  fieldData: {
    name: string;
    productName: string;
    description: string;
    price: number;
  };
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
