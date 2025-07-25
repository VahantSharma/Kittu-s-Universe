import { SPOTIFY_CONFIG, generateCodeChallenge } from "@/config/spotify";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  uri: string;
  duration_ms: number;
}

interface PlaybackState {
  isPlaying: boolean;
  position: number;
  duration: number;
  currentTrack: Track | null;
  volume: number;
}

interface MusicContextType {
  // Authentication
  isAuthenticated: boolean;
  accessToken: string | null;
  login: () => void;
  logout: () => void;

  // Player
  player: Spotify.Player | null;
  deviceId: string | null;
  playbackState: PlaybackState;

  // Controls
  play: (trackUri?: string) => void;
  pause: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  seek: (position: number) => void;

  // Search
  searchTracks: (query: string) => Promise<Track[]>;

  // UI
  showPlayer: boolean;
  setShowPlayer: (show: boolean) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicContext = () => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error("useMusicContext must be used within a MusicProvider");
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [tokenExpiresAt, setTokenExpiresAt] = useState<number | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    position: 0,
    duration: 0,
    currentTrack: null,
    volume: 0.5,
  });

  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    if (!accessToken) {
      console.log("🎵 No access token, skipping SDK initialization");
      return;
    }

    if (player) {
      console.log("🎵 Player already exists, skipping initialization");
      return;
    }

    console.log("🎵 Initializing Spotify Web Playback SDK...");

    const initializePlayer = () => {
      if (!window.Spotify || !window.Spotify.Player) {
        console.error("🎵 Spotify SDK not available");
        return;
      }

      console.log("🎵 Creating new Spotify Player...");
      const newPlayer = new window.Spotify.Player({
        name: "Kittu's Dreamscape Player",
        getOAuthToken: (cb: (token: string) => void) => {
          console.log("🎵 SDK requesting OAuth token");
          cb(accessToken);
        },
        volume: 0.5,
      });

      // Error handling
      newPlayer.addListener("initialization_error", ({ message }) => {
        console.error("🎵 Failed to initialize player:", message);
      });

      newPlayer.addListener("authentication_error", ({ message }) => {
        console.error("🎵 Authentication error:", message);
        logout();
      });

      newPlayer.addListener("account_error", ({ message }) => {
        console.error("🎵 Account error (Premium required?):", message);
      });

      // Ready
      newPlayer.addListener("ready", ({ device_id }) => {
        console.log("🎵 Player ready! Device ID:", device_id);
        setDeviceId(device_id);
      });

      // Not Ready
      newPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("🎵 Device offline:", device_id);
      });

      // Player state changes
      newPlayer.addListener("player_state_changed", (state) => {
        console.log("🎵 Player state changed:", state);
        if (!state) return;

        const track = state.track_window.current_track;
        setPlaybackState({
          isPlaying: !state.paused,
          position: state.position,
          duration: state.duration,
          currentTrack: track
            ? {
                id: track.id,
                name: track.name,
                artists: track.artists,
                album: track.album,
                uri: track.uri,
                duration_ms: state.duration,
              }
            : null,
          volume: 0.5,
        });
        setShowPlayer(!!track);
      });

      console.log("🎵 Connecting player...");
      newPlayer.connect().then((success) => {
        if (success) {
          console.log("🎵 Player connected successfully!");
          setPlayer(newPlayer);
        } else {
          console.error("🎵 Failed to connect player");
        }
      });
    };

    // Check if script already exists
    if (
      document.querySelector(
        'script[src="https://sdk.scdn.co/spotify-player.js"]'
      )
    ) {
      console.log("🎵 SDK script already loaded, initializing player...");
      initializePlayer();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;
    script.onload = () => {
      console.log("🎵 SDK script loaded successfully");
    };
    script.onerror = () => {
      console.error("🎵 Failed to load Spotify SDK script");
    };
    document.body.appendChild(script);

    // Set up the global callback
    window.onSpotifyWebPlaybackSDKReady = initializePlayer;

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [accessToken]);

  const login = async () => {
    try {
      console.log("🎵 Starting Spotify Authorization Code flow with PKCE...");

      // Debug current configuration
      console.log("🔍 DEBUG - Current SPOTIFY_CONFIG:", {
        CLIENT_ID: SPOTIFY_CONFIG.CLIENT_ID,
        REDIRECT_URI: SPOTIFY_CONFIG.REDIRECT_URI,
        BACKEND_URL: SPOTIFY_CONFIG.BACKEND_URL,
        SCOPES: SPOTIFY_CONFIG.SCOPES,
      });

      // Debug current location
      console.log("🔍 DEBUG - Current location:", {
        href: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        port: window.location.port,
        pathname: window.location.pathname,
      });

      // Generate PKCE parameters
      const { codeVerifier, codeChallenge } = await generateCodeChallenge();

      // Store code verifier for later use
      sessionStorage.setItem("spotify_code_verifier", codeVerifier);

      // Use Authorization Code flow with PKCE (more secure)
      const params = new URLSearchParams({
        response_type: "code",
        client_id: SPOTIFY_CONFIG.CLIENT_ID,
        scope: SPOTIFY_CONFIG.SCOPES,
        redirect_uri: SPOTIFY_CONFIG.REDIRECT_URI,
        state: generateRandomString(16),
        code_challenge_method: "S256",
        code_challenge: codeChallenge,
        show_dialog: "true", // Force user to see the authorization dialog
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params}`;
      console.log("🎵 Redirecting to Spotify auth:", authUrl);
      console.log(
        "🔍 DEBUG - Exact redirect_uri being sent:",
        SPOTIFY_CONFIG.REDIRECT_URI
      );

      window.location.href = authUrl;
    } catch (error) {
      console.error("🎵 Error during login:", error);
    }
  };

  const logout = useCallback(() => {
    console.log("🎵 Logging out...");
    if (player) {
      player.disconnect();
      setPlayer(null);
    }
    setAccessToken(null);
    setIsAuthenticated(false);
    setDeviceId(null);
    setShowPlayer(false);
    setPlaybackState({
      isPlaying: false,
      position: 0,
      duration: 0,
      currentTrack: null,
      volume: 0.5,
    });
    // Clear stored tokens
    sessionStorage.removeItem("spotify_code_verifier");
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_refresh_token");
    sessionStorage.removeItem("spotify_token_expires_at");
    console.log("🎵 Logout complete");
  }, [player]);

  const play = async (trackUri?: string) => {
    if (!player || !deviceId || !accessToken) {
      console.log("🎵 Cannot play - missing requirements:", {
        hasPlayer: !!player,
        hasDeviceId: !!deviceId,
        hasToken: !!accessToken,
      });
      return;
    }

    try {
      if (trackUri) {
        console.log("🎵 Playing track:", trackUri);
        // Play specific track
        const response = await fetch(
          `${SPOTIFY_CONFIG.API_BASE_URL}/me/player/play?device_id=${deviceId}`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uris: [trackUri] }),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("🎵 Play API error:", response.status, errorText);
        } else {
          console.log("🎵 Track started successfully");
        }
      } else {
        console.log("🎵 Resuming playback");
        await player.resume();
      }
    } catch (error) {
      console.error("🎵 Error playing track:", error);
    }
  };

  const pause = async () => {
    if (!player) return;
    await player.pause();
  };

  const nextTrack = async () => {
    if (!player) return;
    await player.nextTrack();
  };

  const previousTrack = async () => {
    if (!player) return;
    await player.previousTrack();
  };

  const setVolume = async (volume: number) => {
    if (!player) return;
    await player.setVolume(volume);
  };

  const seek = async (position: number) => {
    if (!player) return;
    await player.seek(position);
  };

  const searchTracks = async (query: string): Promise<Track[]> => {
    if (!accessToken || !query.trim()) return [];

    try {
      const response = await fetch(
        `${SPOTIFY_CONFIG.API_BASE_URL}/search?q=${encodeURIComponent(
          query
        )}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      return data.tracks.items;
    } catch (error) {
      console.error("Error searching tracks:", error);
      return [];
    }
  };

  // Token management functions
  const clearStoredTokens = useCallback(() => {
    sessionStorage.removeItem("spotify_access_token");
    sessionStorage.removeItem("spotify_refresh_token");
    sessionStorage.removeItem("spotify_token_expires_at");
    sessionStorage.removeItem("spotify_code_verifier");
  }, []);

  const attemptTokenRefresh = useCallback(async () => {
    try {
      const refreshToken = sessionStorage.getItem("spotify_refresh_token");
      if (!refreshToken) {
        console.log(
          "🎵 No refresh token available, user needs to re-authenticate"
        );
        clearStoredTokens();
        return;
      }

      const response = await fetch(`/api/spotify/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refreshToken,
        }),
      });

      if (!response.ok) {
        console.error("🎵 Token refresh failed, clearing session");
        clearStoredTokens();
        return;
      }

      const tokenData = await response.json();

      console.log("🎵 Token refresh successful!");
      setAccessToken(tokenData.access_token);
      setIsAuthenticated(true);

      // Calculate expiry time
      const expiryTime = Date.now() + tokenData.expires_in * 1000;
      setTokenExpiresAt(expiryTime);

      // Update stored tokens
      sessionStorage.setItem("spotify_access_token", tokenData.access_token);
      sessionStorage.setItem("spotify_token_expires_at", expiryTime.toString());
    } catch (error) {
      console.error("🎵 Error refreshing token:", error);
      clearStoredTokens();
    }
  }, [clearStoredTokens]);

  const checkStoredTokens = useCallback(() => {
    const storedToken = sessionStorage.getItem("spotify_access_token");
    const storedExpiry = sessionStorage.getItem("spotify_token_expires_at");

    if (storedToken && storedExpiry) {
      const expiryTime = parseInt(storedExpiry);

      // Check if token is still valid (with 5 minute buffer)
      if (Date.now() < expiryTime - 5 * 60 * 1000) {
        console.log("🎵 Found valid stored token, restoring session...");
        setAccessToken(storedToken);
        setIsAuthenticated(true);
        setTokenExpiresAt(expiryTime);
      } else {
        console.log("🎵 Stored token expired, attempting refresh...");
        attemptTokenRefresh();
      }
    }
  }, [attemptTokenRefresh]);

  const exchangeCodeForTokens = useCallback(async (code: string) => {
    try {
      const codeVerifier = sessionStorage.getItem("spotify_code_verifier");
      if (!codeVerifier) {
        console.error("🎵 No code verifier found in session storage");
        return;
      }

      const response = await fetch(`/api/spotify/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          codeVerifier,
          redirectUri: SPOTIFY_CONFIG.REDIRECT_URI,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("🎵 Token exchange failed:", errorData);
        return;
      }

      const tokenData = await response.json();

      console.log("🎵 Token exchange successful!");
      setAccessToken(tokenData.access_token);
      setIsAuthenticated(true);

      // Calculate expiry time
      const expiryTime = Date.now() + tokenData.expires_in * 1000;
      setTokenExpiresAt(expiryTime);

      // Store tokens securely
      sessionStorage.setItem("spotify_access_token", tokenData.access_token);
      sessionStorage.setItem("spotify_token_expires_at", expiryTime.toString());

      if (tokenData.refresh_token) {
        sessionStorage.setItem(
          "spotify_refresh_token",
          tokenData.refresh_token
        );
      }

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (error) {
      console.error("🎵 Error exchanging code for tokens:", error);
    }
  }, []);

  // Handle authentication from URL parameters (Authorization Code flow)
  useEffect(() => {
    console.log("🎵 Checking for authentication tokens...");

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    if (error) {
      console.error("🎵 Spotify auth error:", error);
      return;
    }

    if (code) {
      console.log("🎵 Authorization code found, exchanging for tokens...");
      exchangeCodeForTokens(code);
    } else {
      // Check for stored tokens
      checkStoredTokens();
    }
  }, [checkStoredTokens, exchangeCodeForTokens]);

  // Check for token expiry
  useEffect(() => {
    if (!isAuthenticated || !tokenExpiresAt) return;

    const checkTokenExpiry = () => {
      // Check if token will expire in the next 5 minutes
      if (Date.now() > tokenExpiresAt - 5 * 60 * 1000) {
        console.log("🎵 Token expired or expiring soon, attempting refresh...");
        attemptTokenRefresh();
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60 * 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, tokenExpiresAt, attemptTokenRefresh]);

  const value: MusicContextType = {
    isAuthenticated,
    accessToken,
    login,
    logout,
    player,
    deviceId,
    playbackState,
    play,
    pause,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
    searchTracks,
    showPlayer,
    setShowPlayer,
  };

  return (
    <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
  );
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
