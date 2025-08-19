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
    // Generate a random code verifier (43-128 characters)
    const codeVerifier = Crypto.getRandomBytes(32)
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    console.log('🟡 Generated codeVerifier:', codeVerifier);
    console.log('🟡 CodeVerifier length:', codeVerifier.length);
    
    // Create SHA256 hash and convert to base64url
    const hash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      codeVerifier,
      { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    
    // Convert base64 to base64url (replace + with -, / with _, remove padding =)
    const codeChallenge = hash
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    console.log('🟡 Generated codeChallenge:', codeChallenge);
    
    return { codeVerifier, codeChallenge };
  }

  /**
   * Authenticate with Google OAuth2 with PKCE support for backend exchange
   * Ensures fresh authorization code and PKCE parameters for every attempt
   */
  async authenticateWithGoogle() {
    try {
      // Generate PKCE parameters since Google client requires it
      const { codeVerifier, codeChallenge } = await this.generatePKCE();
      
      const redirectUri = AuthSession.makeRedirectUri({
        useProxy: true,
      });
      
      console.log('🟢 Starting OAuth flow with required PKCE');
      console.log('🟢 OAuth redirect URI:', redirectUri);
      console.log('🟢 OAuth code challenge:', codeChallenge);
      console.log('🟢 OAuth code verifier:', codeVerifier.substring(0, 20) + '...');
      
      const request = new AuthSession.AuthRequest({
        clientId: '303247933150-96o2fdm3u7b9rtugn5g2issvflor9p6v.apps.googleusercontent.com',
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        redirectUri,
        codeChallenge,
        codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
        additionalParameters: {
          access_type: 'offline',     // Get refresh token
          prompt: 'select_account',   // Force fresh authorization - no reuse
          state: Math.random().toString(36).substring(7), // Prevent caching
        },
      });

      // Start the authentication flow - this will get a FRESH authorization code
      console.log('🟢 Requesting authorization code from Google...');
      const result = await request.promptAsync(this.discovery);

      if (result.type === 'success') {
        console.log('🟢 Authorization successful!');
        console.log('🟢 Authorization code:', result.params.code);
        
        // Send the authorization code with code verifier to backend
        const authResult = await this.exchangeCodeOnBackend(result.params.code, codeVerifier, redirectUri);

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
   * Exchange authorization code on backend with PKCE support
   */
  async exchangeCodeOnBackend(code, codeVerifier, redirectUri) {
    console.log('🔵 Sending authorization code to backend for PKCE exchange...');
    console.log('🔵 Code:', code?.substring(0, 20) + '...');
    console.log('🔵 Code Verifier:', codeVerifier ? codeVerifier.substring(0, 20) + '...' : 'missing');
    console.log('🔵 Redirect URI:', redirectUri);
    
    const requestBody = {
      code,
      codeVerifier,
      redirectUri,
      clientId: '303247933150-96o2fdm3u7b9rtugn5g2issvflor9p6v.apps.googleusercontent.com',
    };
    
    console.log('🔵 Full request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${API_BASE_URL}/auth/google/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔵 Backend response status:', response.status);
    console.log('🔵 Backend response headers:', response.headers.get('content-type'));

    // Get response text first to see what we're actually receiving
    const responseText = await response.text();
    console.log('🔵 Backend raw response:', responseText.substring(0, 200) + '...');

    if (!response.ok) {
      console.error('🔵 Backend exchange failed with status:', response.status);
      console.error('🔵 Response body:', responseText);
      
      // Try to parse as JSON, fallback to text error
      let errorMessage;
      try {
        const error = JSON.parse(responseText);
        errorMessage = error.message || error.error || 'Code exchange failed';
      } catch (e) {
        errorMessage = `Server error: ${responseText || 'Unknown error'}`;
      }
      
      throw new Error(errorMessage);
    }

    // Try to parse the successful response
    let result;
    try {
      result = JSON.parse(responseText);
      console.log('🔵 Backend exchange successful, received user:', result.user?.email || 'unknown');
    } catch (e) {
      console.error('🔵 Failed to parse backend response as JSON:', responseText);
      throw new Error('Backend returned invalid JSON response');
    }
    
    if (!result.success) {
      throw new Error(result.message || 'Backend exchange failed');
    }
    
    return result;
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
          client_id: '303247933150-96o2fdm3u7b9rtugn5g2issvflor9p6v.apps.googleusercontent.com',
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