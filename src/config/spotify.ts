// Spotify configuration
export const SPOTIFY_CONFIG = {
  CLIENT_ID:
    import.meta.env.VITE_SPOTIFY_CLIENT_ID ||
    "aac3b66236a04e61a09a888767949d40",
  REDIRECT_URI: (() => {
    // Use environment variable if available, otherwise determine dynamically
    if (import.meta.env.VITE_SPOTIFY_REDIRECT_URI) {
      return import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
    }

    const hostname = window.location.hostname;
    const port = window.location.port;

    console.log("🎵 Spotify Config - Current location:", {
      hostname,
      port,
      protocol: window.location.protocol,
    });

    // For localhost development, always use HTTPS on port 3000
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return `https://localhost:3000/callback`;
    }
    return "https://kittus-universe.vercel.app/callback";
  })(),
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || "https://localhost:3000",
  SCOPES: [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "playlist-read-private",
    "playlist-read-collaborative",
  ].join(" "),
  API_BASE_URL: "https://api.spotify.com/v1",
};

console.log("🎵 Spotify Config Loaded:", {
  clientId: SPOTIFY_CONFIG.CLIENT_ID,
  redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
  scopes: SPOTIFY_CONFIG.SCOPES,
});

// Generate code verifier and challenge for PKCE
export const generateCodeChallenge = async () => {
  const codeVerifier = generateRandomString(128);
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const codeChallenge = btoa(
    String.fromCharCode.apply(null, [...new Uint8Array(digest)])
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  console.log("🎵 Generated PKCE challenge");
  return { codeVerifier, codeChallenge };
};

const generateRandomString = (length: number) => {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};
