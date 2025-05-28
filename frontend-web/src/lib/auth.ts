import Cookies from "js-cookie";

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isOAuth2User?: boolean;
}

export interface AuthValidationResult {
  isValid: boolean;
  user: UserProfile | null;
}

/**
 * Validates the current token against the backend
 * Returns the validation result and clears invalid tokens
 */
export async function validateToken(): Promise<AuthValidationResult> {
  const token = Cookies.get("token");
  
  if (!token) {
    return { isValid: false, user: null };
  }

  try {
    const response = await fetch("/api/auth/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      // Token is invalid, clear it
      clearAuthCookies();
      return { isValid: false, user: null };
    }

    const userData = await response.json();
    return { 
      isValid: true, 
      user: {
        id: userData.userId || userData.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isOAuth2User: userData.isOAuth2User
      }
    };
  } catch (error) {
    console.error("Token validation error:", error);
    // Clear potentially corrupted tokens
    clearAuthCookies();
    return { isValid: false, user: null };
  }
}

/**
 * Clears all authentication cookies
 */
export function clearAuthCookies(): void {
  Cookies.remove("token");
  Cookies.remove("refreshToken");
  Cookies.remove("user");
}

/**
 * Gets user data from cookies (for quick access without API call)
 */
export function getUserFromCookies(): UserProfile | null {
  try {
    const userCookie = Cookies.get("user");
    if (!userCookie) return null;
    
    return JSON.parse(userCookie) as UserProfile;
  } catch (error) {
    console.error("Error parsing user cookie:", error);
    return null;
  }
} 