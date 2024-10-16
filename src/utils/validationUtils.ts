import { WFComponent } from "@xatom/core";
import { toggleError } from "./formUtils";

export function validateNotEmpty(input: string | undefined): boolean {
  return input !== undefined && input.trim() !== "";
}

export function validateEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
}

/**
 * Validates that the email is either empty or correctly formatted.
 * @param value The email input value.
 * @returns True if valid, false otherwise.
 */
export const validateEmailOptional = (value: string): boolean => {
  if (value.trim() === "") {
    // Email is optional, so empty string is valid
    return true;
  }
  // Validate the email format if not empty
  return validateEmail(value);
};

export function validatePasswordRequirements(password: string): boolean {
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasValidLength = password.length >= 8;
  return (
    hasLowercase && hasUppercase && hasDigit && hasSpecialChar && hasValidLength
  );
}

export function validateCheckbox(checked: boolean): boolean {
  return checked;
}

export function validatePasswordsMatch(
  originalPassword: string,
  confirmPassword: string
): boolean {
  return originalPassword === confirmPassword;
}

export function validateSelectField(input: string | undefined): boolean {
  return input !== undefined && input !== "N/A";
}

export function validatePhoneNumber(input: string): boolean {
  const phoneRegex = /^\(\d{3}\)\s\d{3}-\d{4}$/;
  return phoneRegex.test(input);
}
