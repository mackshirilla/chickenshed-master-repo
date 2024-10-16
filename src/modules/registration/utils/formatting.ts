// utils/formatting.ts

export const formatCurrency = (amount: number | string): string => {
  // Convert to a number if the amount is a string
  const numericAmount =
    typeof amount === "string" ? parseFloat(amount) : amount;

  // Ensure the conversion worked and format the number
  if (!isNaN(numericAmount)) {
    return numericAmount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return "$0.00"; // Default value in case of error
};
