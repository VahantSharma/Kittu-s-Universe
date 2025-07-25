import express from "express";

const router = express.Router();

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// Exchange authorization code for access token
router.post("/token", async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    if (!code || !codeVerifier) {
      return res.status(400).json({
        error: "Missing required parameters: code and codeVerifier",
      });
    }

    const tokenParams = new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUri || process.env.SPOTIFY_REDIRECT_URI!,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      code_verifier: codeVerifier,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: tokenParams,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("🎵 Spotify token exchange failed:", errorData);
      return res.status(response.status).json({
        error: "Token exchange failed",
        details: errorData,
      });
    }

    const tokenData = (await response.json()) as SpotifyTokenResponse;

    return res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      refresh_token: tokenData.refresh_token,
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error("🎵 Error in token exchange:", error);
    return res.status(500).json({
      error: "Internal server error during token exchange",
    });
  }
});

// Refresh access token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: "Missing refresh token",
      });
    }

    const refreshParams = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID!,
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: refreshParams,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("🎵 Token refresh failed:", errorData);
      return res.status(response.status).json({
        error: "Token refresh failed",
        details: errorData,
      });
    }

    const tokenData = (await response.json()) as SpotifyTokenResponse;

    return res.json({
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in,
      scope: tokenData.scope,
    });
  } catch (error) {
    console.error("🎵 Error refreshing token:", error);
    return res.status(500).json({
      error: "Internal server error during token refresh",
    });
  }
});

// Get user profile (for testing authentication)
router.get("/profile", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ error: "Missing or invalid authorization header" });
    }

    const accessToken = authHeader.substring(7);

    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: "Failed to fetch user profile",
      });
    }

    const profile = await response.json();
    return res.json(profile);
  } catch (error) {
    console.error("🎵 Error fetching profile:", error);
    return res.status(500).json({
      error: "Internal server error fetching profile",
    });
  }
});

export default router;
