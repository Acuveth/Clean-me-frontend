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
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const { user, token } = await response.json();
        await storage.setItemAsync("authToken", token);
        setUser(user);
        return { success: true };
      } else {
        const error = await response.json();
        return { success: false, error: error.error || error.message || "Authentication failed" };
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
    try {
      // Get stored OAuth tokens for revocation
      const oauthTokens = await storage.getItemAsync("oauthTokens");
      if (oauthTokens) {
        const { provider, accessToken } = JSON.parse(oauthTokens);
        if (provider === 'google') {
          await oauthService.revokeToken(accessToken);
        }
        await storage.deleteItemAsync("oauthTokens");
      }
      
      await storage.deleteItemAsync("authToken");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Even if token revocation fails, still log out locally
      await storage.deleteItemAsync("authToken");
      await storage.deleteItemAsync("oauthTokens");
      setUser(null);
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

  const value = { 
    user, 
    login, 
    register, 
    logout, 
    loading,
    loginWithGoogle,
    refreshTokenIfNeeded
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
