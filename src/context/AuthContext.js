import React, { createContext, useContext, useEffect, useState } from "react";
import storage from "../utils/storage";
import { API_BASE_URL } from "../config/constants";
import oauthService from "../services/oauthService";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const token = await storage.getItemAsync("authToken");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log("Login attempt with:", { email, password: password ? "***" : undefined });
      console.log("API URL:", `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      console.log("Response status:", response.status);
      
      if (response.ok) {
        const { user, token } = await response.json();
        await storage.setItemAsync("authToken", token);
        setUser(user);
        return { success: true };
      } else {
        let errorMessage = "Authentication failed";
        try {
          const error = await response.json();
          console.log("Error response:", error);
          errorMessage = error.error || error.message || errorMessage;
        } catch (e) {
          console.error("Failed to parse error response:", e);
          errorMessage = `Authentication failed (${response.status})`;
        }
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please check your connection." };
    }
  };

  const register = async (email, name, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        await storage.setItemAsync("authToken", token);
        setUser(user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || error.message || "Registration failed" };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error. Please check your connection." };
    }
  };

  const logout = async () => {
    console.log("🔴 Logout function called");
    try {
      console.log("🔴 Starting logout process...");
      
      // Get stored OAuth tokens for revocation
      try {
        const oauthTokens = await storage.getItemAsync("oauthTokens");
        console.log("🔴 OAuth tokens:", oauthTokens ? "found" : "not found");
        
        if (oauthTokens) {
          const { provider, accessToken } = JSON.parse(oauthTokens);
          console.log("🔴 OAuth provider:", provider);
          
          if (provider === 'google') {
            console.log("🔴 Revoking Google token...");
            await oauthService.revokeToken(accessToken);
          }
          await storage.deleteItemAsync("oauthTokens");
          console.log("🔴 OAuth tokens deleted");
        }
      } catch (oauthError) {
        console.error("🔴 OAuth cleanup error:", oauthError);
        // Continue with logout even if OAuth cleanup fails
      }
      
      // Delete auth token
      console.log("🔴 Deleting auth token...");
      await storage.deleteItemAsync("authToken");
      console.log("🔴 Auth token deleted");
      
      // Clear user state
      console.log("🔴 Setting user to null...");
      setUser(null);
      console.log("🔴 Logout completed successfully");
      
    } catch (error) {
      console.error("🔴 Logout error:", error);
      console.log("🔴 Attempting fallback cleanup...");
      
      // Fallback: force cleanup even if errors occur
      try {
        await storage.deleteItemAsync("authToken");
        await storage.deleteItemAsync("oauthTokens");
        setUser(null);
        console.log("🔴 Fallback logout completed");
      } catch (fallbackError) {
        console.error("🔴 Fallback logout error:", fallbackError);
        // Force logout by clearing user state regardless
        setUser(null);
        console.log("🔴 Force logout - user state cleared");
      }
    }
  };

  /**
   * Authenticate with Google OAuth2
   */
  const loginWithGoogle = async () => {
    try {
      const result = await oauthService.authenticateWithGoogle();
      
      if (result.success) {
        await storage.setItemAsync("authToken", result.tokens.accessToken);
        await storage.setItemAsync("oauthTokens", JSON.stringify({
          provider: 'google',
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
        }));
        setUser(result.user);
        return { success: true };
      }
      
      return result;
    } catch (error) {
      console.error("Google login error:", error);
      return { success: false, error: "Google authentication failed" };
    }
  };


  /**
   * Refresh OAuth token if needed
   */
  const refreshTokenIfNeeded = async () => {
    try {
      const oauthTokens = await storage.getItemAsync("oauthTokens");
      if (!oauthTokens) return;

      const { provider, refreshToken } = JSON.parse(oauthTokens);
      if (!refreshToken || provider !== 'google') return;

      const result = await oauthService.refreshToken(refreshToken);
      
      if (result.success) {
        await storage.setItemAsync("authToken", result.accessToken);
        await storage.setItemAsync("oauthTokens", JSON.stringify({
          provider,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        }));
      }
    } catch (error) {
      console.error("Token refresh error:", error);
    }
  };

  // Simple logout for testing - bypasses OAuth cleanup
  const simpleLogout = async () => {
    console.log("🟣 Simple logout called");
    try {
      await storage.deleteItemAsync("authToken");
      console.log("🟣 Token deleted");
      setUser(null);
      console.log("🟣 User set to null");
    } catch (error) {
      console.error("🟣 Simple logout error:", error);
      // Force logout anyway
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const token = await storage.getItemAsync("authToken");
      if (!token) {
        throw new Error("No auth token found");
      }

      const formData = new FormData();

      // Add text fields
      if (profileData.name) formData.append('name', profileData.name);
      if (profileData.bio) formData.append('bio', profileData.bio);
      if (profileData.location) formData.append('location', profileData.location);

      // Add profile picture if it's a new file
      if (profileData.profileImage && profileData.profileImage.startsWith('file://')) {
        formData.append('profileImage', {
          uri: profileData.profileImage,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for FormData - let the browser set it
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
          return { success: true };
        } else {
          return { success: false, error: result.message || "Profile update failed" };
        }
      } else {
        const error = await response.json();
        return { success: false, error: error.message || error.error || "Profile update failed" };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, error: "Network error. Please check your connection." };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    simpleLogout,
    loading,
    loginWithGoogle,
    refreshTokenIfNeeded,
    updateProfile
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
