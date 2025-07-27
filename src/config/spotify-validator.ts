// Spotify Configuration Validator & Debugger
export const validateSpotifyConfig = () => {
  console.group("🔍 SPOTIFY CONFIGURATION VALIDATOR");

  // Current location info
  console.log("📍 Current Location:", {
    href: window.location.href,
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    isSecure: window.location.protocol === "https:",
  });

  // Environment variables
  console.log("🌍 Environment Variables:", {
    VITE_SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
    VITE_SPOTIFY_REDIRECT_URI: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
    VITE_BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE,
  });

  // Computed configuration
  import("./spotify").then(({ SPOTIFY_CONFIG }) => {
    console.log("⚙️ Computed SPOTIFY_CONFIG:", {
      CLIENT_ID: SPOTIFY_CONFIG.CLIENT_ID,
      REDIRECT_URI: SPOTIFY_CONFIG.REDIRECT_URI,
      BACKEND_URL: SPOTIFY_CONFIG.BACKEND_URL,
      SCOPES: SPOTIFY_CONFIG.SCOPES,
    });

    // Validation checks
    const checks = {
      hasClientId: !!SPOTIFY_CONFIG.CLIENT_ID,
      hasRedirectUri: !!SPOTIFY_CONFIG.REDIRECT_URI,
      redirectUriIsHttps: SPOTIFY_CONFIG.REDIRECT_URI.startsWith("https://"),
      redirectUriMatchesLocation: SPOTIFY_CONFIG.REDIRECT_URI.includes(
        window.location.hostname
      ),
      currentLocationIsHttps: window.location.protocol === "https:",
      portMatches:
        SPOTIFY_CONFIG.REDIRECT_URI.includes(":5173") ||
        window.location.port === "5173" ||
        (window.location.hostname.includes("vercel.app") && !window.location.port),
    };

    console.log("✅ Validation Checks:", checks);

    // Issues detection
    const issues = [];
    if (!checks.hasClientId) issues.push("❌ Missing Client ID");
    if (!checks.hasRedirectUri) issues.push("❌ Missing Redirect URI");
    if (!checks.redirectUriIsHttps) issues.push("❌ Redirect URI is not HTTPS");
    if (!checks.currentLocationIsHttps)
      issues.push("❌ Current page is not HTTPS");
    if (!checks.redirectUriMatchesLocation)
      issues.push("❌ Redirect URI hostname mismatch");
    if (!checks.portMatches)
      issues.push("❌ Port mismatch between redirect URI and current location");

    if (issues.length > 0) {
      console.error("🚨 ISSUES DETECTED:", issues);
    } else {
      console.log("🎉 Configuration looks good!");
    }

    // Spotify Dashboard reminder
    console.log("📋 REQUIRED SPOTIFY DASHBOARD SETTINGS:");
    console.log("   Add this exact URI:", SPOTIFY_CONFIG.REDIRECT_URI);
    console.log("   Dashboard URL: https://developer.spotify.com/dashboard");

    console.groupEnd();
  });
};

// Auto-run validation on import
if (typeof window !== "undefined") {
  validateSpotifyConfig();
}
