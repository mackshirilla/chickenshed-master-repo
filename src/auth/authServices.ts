import { apiClient } from "../api/apiConfig";
import { authManager, UserData } from "../auth/authConfig";

type validateUserResponse = {
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

// Function to validate user with /auth/me endpoint
export async function validateUser(): Promise<UserData | null> {
  try {
    const response = await apiClient
      .get<validateUserResponse>("/auth/me", {}) // Assuming no data is needed for this request
      .fetch();

    if (response.status === "success" && response.user) {
      // Transform response user object to match the UserData structure
      const user: UserData = {
        user_id: response.user.user_id,
        email: response.user.email,
        role: response.user.role,
        profile: response.user.profile
          ? {
              profile_id: response.user.profile.profile_id,
              first_name: response.user.profile.first_name,
              last_name: response.user.profile.last_name,
              profile_pic: response.user.profile.profile_picture, // Map `profile_picture` to `profile_pic`
            }
          : undefined,
      };

      // Update authManager with the latest user data and token
      authManager.setUser(user, user.role, response.authToken);
      return user;
    } else {
      // Handle error or invalid token
      authManager.clearUserAuth();

      // Save the current URL to localStorage for redirecting after login
      localStorage.setItem("loginRedirect", window.location.href);

      return null;
    }
  } catch (error) {
    // Handle API errors
    console.error("Error validating user:", error);

    // Save the current URL to localStorage for redirecting after login
    localStorage.setItem("loginRedirect", window.location.href);

    return null;
  }
}
