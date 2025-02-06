import { WFComponent, navigate } from "@xatom/core";
import { toggleError } from "../../utils/formUtils";
import { apiClient } from "../../api/apiConfig";
import { authManager, UserData } from "../../auth/authConfig";

type MagicLoginResponse = {
  status: string;
  message: string;
  authToken?: string;
  user?: {
    user_id: string;
    email: string;
    role: "USER" | "STUDENT" | "GUEST";
    profile?: {
      profile_id: string;
      first_name: string;
      last_name: string;
      profile_picture?: {
        url: string;
      };
    };
  };
};

// Interface for magic link URL parameters
interface MagicLinkParams {
  token: string;
  resetPassword: string;
}

export const magicLogin = async () => {
  console.log("Magic login page loaded");
  const urlParams = new URLSearchParams(window.location.search);
  const params: MagicLinkParams = {
    token: urlParams.get("token") || "",
    resetPassword: urlParams.get("password-reset") || "",
  };
  const requestError = new WFComponent("#requestError");

  // Helper function to handle API responses
  const handleApiResponse = (response: MagicLoginResponse) => {
    if (response.status !== "success") {
      throw new Error(response.message || "An unknown error occurred.");
    }
    return response;
  };

  if (params.token) {
    try {
      const response = await apiClient
        .post<MagicLoginResponse>("/auth/magic-login", {
          data: { magic_token: params.token },
        })
        .fetch();

      // Process the response
      const result = handleApiResponse(response);

      // Transform the API response to match the expected UserData format
      const user: UserData = {
        user_id: result.user?.user_id || "",
        email: result.user?.email || "",
        role: result.user?.role || "GUEST",
        profile: result.user?.profile
          ? {
              profile_id: result.user.profile.profile_id,
              first_name: result.user.profile.first_name,
              last_name: result.user.profile.last_name,
              profile_pic: result.user.profile.profile_picture,
            }
          : undefined,
      };

      // Set user information in AuthManager
      authManager.setUser(user, user.role, result.authToken);

      // Handle navigation based on reset-password parameter
      if (params.resetPassword === "true") {
        navigate("/create-account/reset-password");
      } else {
        navigate("/create-account/complete-profile");
      }
    } catch (error: any) {
      console.error("Error during magic login:", error);
      toggleError(
        requestError,
        error.message || "Failed to log in.",
        true
      );
    }
  } else {
    // Handle case where token is missing
    console.error("Missing token in URL parameter");
    toggleError(requestError, "Missing magic token in the URL.", true);
  }
};
