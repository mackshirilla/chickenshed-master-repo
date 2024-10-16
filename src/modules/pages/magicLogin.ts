import { WFComponent, navigate } from "@xatom/core";
import { toggleError } from "../../utils/formUtils";

import { apiClient } from "../../api/apiConfig";
import { authManager } from "../../auth/authConfig";

type magicLoginResponse = {
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
      profile_picture: {
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

type LoginResponse = {
  status: string;
  message: string;
  authToken?: string;
  user?: {
    user_id: string;
    email: string;
    profile?: {
      profile_id: string;
      first_name: string;
      last_name: string;
      profile_picture: {
        url: string;
      };
    };
  };
};

export const magicLogin = async () => {
  console.log("Magic login page loaded");
  const urlParams = new URLSearchParams(window.location.search);
  const params: MagicLinkParams = {
    token: urlParams.get("token") || "",
    resetPassword: urlParams.get("password-reset") || "",
  };
  const requestError = new WFComponent("#requestError");

  if (params.token) {
    try {
      const response = await apiClient
        .post<magicLoginResponse>("/auth/magic-login", {
          data: { magic_token: params.token },
        })
        .fetch();

      if (response.status === "success") {
        // Set user information in AuthManager
        authManager.setUser(
          response.user,
          response.user.role,
          response.authToken
        );

        // Handle navigation based on reset-password parameter
        if (params.resetPassword === "true") {
          navigate("/create-account/reset-password");
        } else {
          navigate("/create-account/complete-profile");
        }
      } else {
        throw new Error("Login failed.");
      }
    } catch (error) {
      console.error("Error during magic login:", error);
      toggleError(
        requestError,
        error.response.data.message || "Failed to log in.",
        true
      );
    }
  } else {
    // Handle case where token is missing
    console.error("Missing token in URL parameter");
  }
};
