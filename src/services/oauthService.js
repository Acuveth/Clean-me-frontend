import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import { getAPIEndpoint } from '../config/secrets';

WebBrowser.maybeCompleteAuthSession();

const API_BASE_URL = getAPIEndpoint();

/**
 * OAuth2 Service for handling Google authentication
 * 
 * This service handles the OAuth2 flow for Google authentication.
 * It uses PKCE (Proof Key for Code Exchange) for enhanced security.
 */
class OAuthService {
  constructor() {
    this.discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    };
  }

  /**
   * Generate PKCE challenge for OAuth2 flow
   */
  async generatePKCE() {
    const codeVerifier = AuthSession.AuthRequest.makeRandomCodeChallenge(128);
    const codeChallenge = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64URL }
    );
    return { codeVerifier, codeChallenge };
  }

  /**
   * Authenticate with Google OAuth2
   */
  async authenticateWithGoogle() {
    try {
      const { codeVerifier, codeChallenge } = await this.generatePKCE();

      // Configure the request
      const request = new AuthSession.AuthRequest({
        clientId: 'YOUR_GOOGLE_CLIENT_ID', // Replace with actual client ID
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
      });

      // Start the authentication flow
      const result = await request.promptAsync(this.discovery);

      if (result.type === 'success') {
        // Exchange authorization code for tokens
        const tokenResult = await AuthSession.exchangeCodeAsync(
          {
            clientId: 'YOUR_GOOGLE_CLIENT_ID',
            code: result.params.code,
            redirectUri: AuthSession.makeRedirectUri({
              useProxy: true,
            }),
            codeVerifier,
          },
          this.discovery
        );

        // Get user info from Google
        const userInfo = await this.getGoogleUserInfo(tokenResult.accessToken);
        
        // Send to backend for registration/login
        const authResult = await this.authenticateWithBackend({
          provider: 'google',
          accessToken: tokenResult.accessToken,
          refreshToken: tokenResult.refreshToken,
          userInfo,
        });

        return {
          success: true,
          user: authResult.user,
          tokens: authResult.tokens,
        };
      }

      return { success: false, error: 'Authentication cancelled' };
    } catch (error) {
      console.error('Google OAuth error:', error);
      return { success: false, error: error.message };
    }
  }


  /**
   * Get user info from Google API
   */
  async getGoogleUserInfo(accessToken) {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google user info');
    }

    return response.json();
  }


  /**
   * Send OAuth data to backend for authentication
   */
  async authenticateWithBackend(oauthData) {
    const response = await fetch(`${API_BASE_URL}/auth/oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(oauthData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OAuth authentication failed');
    }

    return response.json();
  }

  /**
   * Refresh Google OAuth token
   */
  async refreshToken(refreshToken) {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: 'YOUR_GOOGLE_CLIENT_ID',
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData = await response.json();
      return {
        success: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || refreshToken,
      };
    } catch (error) {
      console.error('Token refresh error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Revoke Google OAuth token
   */
  async revokeToken(token) {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
      });

      return response.ok;
    } catch (error) {
      console.error('Token revoke error:', error);
      return false;
    }
  }
}

export default new OAuthService();