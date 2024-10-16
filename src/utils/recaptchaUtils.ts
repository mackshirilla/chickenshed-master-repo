//../../utils/recaptchaUtils.ts
import { apiClient } from "../api/apiConfig";

// Declaration for the global reCAPTCHA variable.
declare const grecaptcha: any;

/**
 * Asynchronously obtains a reCAPTCHA token for a specified action.
 * @param {string} action - The action name for which the reCAPTCHA token is requested.
 * @returns {Promise<string>} A promise that resolves with the reCAPTCHA token.
 */
export async function getRecaptchaToken(action: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Ensure grecaptcha is ready and execute the token request.
    grecaptcha.ready(() => {
      grecaptcha
        .execute("6Lekaa8pAAAAAN6qiq0LSP5Akckql4Blg6K5ToUq", { action: action })
        .then((token: string) => {
          resolve(token); // Resolve with the obtained token.
        }, reject); // Reject the promise if there is an error.
    });
  });
}

/**
 * Validates a reCAPTCHA token with the backend server.
 * @param {string} token - The reCAPTCHA token to validate.
 * @returns {Promise<any>} A promise that resolves with the validation response from the server.
 */
export async function validateRecaptchaToken(token: string): Promise<any> {
  try {
    // Send the reCAPTCHA token to the server for validation.
    const response = await apiClient
      .post("/recaptcha/validate", {
        data: { "g-recaptcha-response": token },
      })
      .fetch();

    // Return the server's response directly assuming it's already in JSON format.
    return response; // Assume response is the direct JSON body.
  } catch (error) {
    throw new Error(`ReCAPTCHA validation failed: ${error}`);
  }
}

/**
 * Handles the full reCAPTCHA verification flow from obtaining the token to validating it.
 * @param {string} action - The action name for which the reCAPTCHA should be processed.
 * @returns {Promise<boolean>} A promise that resolves with true if the reCAPTCHA verification is successful.
 */
export async function handleRecaptcha(action: string): Promise<boolean> {
  try {
    const token = await getRecaptchaToken(action);
    const validationResponse = await validateRecaptchaToken(token);
    return validationResponse.status === "success";
  } catch (error) {
    console.error("ReCAPTCHA handling failed:", error);
    // If error has a response, log it for more context
    if (error.response) {
      console.error("Error response:", error.response);
    }
    return false;
  }
}
