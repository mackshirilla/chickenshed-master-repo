// src/modules/auth/authConfig.ts

import { WFAuth, WFAuthMiddleware } from "@xatom/core";

// User data, role, and config types (replace with your actual types)
export interface UserData {
  user_id: string;
  email: string;
  role: "USER" | "STUDENT" | "GUEST";
  profile?: {
    profile_id: string;
    first_name: string;
    last_name: string;
    profile_pic: {
      url: string;
    };
  };
}
type UserRole = "USER" | "STUDENT" | "GUEST";
interface UserConfig {
  token: string;
}

class AuthManager {
  private userAuth: WFAuth<UserData, UserRole, UserConfig>;
  private localStorageKeys = {
    user: "auth_user",
    role: "auth_role",
    config: "auth_config",
  };

  constructor() {
    this.userAuth = new WFAuth<UserData, UserRole, UserConfig>();
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedUser = this.getItemFromLocalStorage<UserData>(
      this.localStorageKeys.user
    );
    const storedRole = this.getItemFromLocalStorage<UserRole>(
      this.localStorageKeys.role
    );
    const storedConfig = this.getItemFromLocalStorage<UserConfig>(
      this.localStorageKeys.config
    );

    if (storedUser) {
      this.userAuth.setUser(storedUser);
    }
    if (storedRole) {
      this.userAuth.setRole(storedRole);
    }
    if (storedConfig) {
      this.userAuth.setConfig(storedConfig);
    } else {
      this.userAuth.setRole("GUEST"); // Default role
    }
  }

  private getItemFromLocalStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error loading from localStorage for key: ${key}`, error);
      return null;
    }
  }

  private saveToLocalStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error saving to localStorage for key: ${key}`, error);
    }
  }

  public setUser(userData: UserData, role: UserRole, token?: string): void {
    this.userAuth.setUser(userData);
    this.userAuth.setRole(role);
    this.saveToLocalStorage(this.localStorageKeys.user, userData);
    this.saveToLocalStorage(this.localStorageKeys.role, role);
    if (token) {
      this.userAuth.setConfig({ token });
      this.saveToLocalStorage(this.localStorageKeys.config, { token });
    }
    const userRole = userData.role || "GUEST"; // Fallback to "GUEST" if role is not present
    this.userAuth.setRole(userRole);
  }

  public getUserAuth(): WFAuth<UserData, UserRole, UserConfig> {
    return this.userAuth;
  }

  public clearUserAuth(): void {
    for (const key in this.localStorageKeys) {
      localStorage.removeItem(this.localStorageKeys[key]);
    }
    this.userAuth.logout(); // Reset userAuth state
  }

  // Add other methods as needed:
  // getUser(): UserData | null
  // getRole(): UserRole
  // getConfig(): UserConfig | null
  // isLoggedIn(): boolean
  // logout(): void
}

export const authManager = new AuthManager();
export const userAuth = authManager.getUserAuth(); // Access userAuth via getter
export const userMiddleware = new WFAuthMiddleware(userAuth);
