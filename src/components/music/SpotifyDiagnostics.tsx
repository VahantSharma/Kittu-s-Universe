import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, ExternalLink, Headphones } from "lucide-react";
import React from "react";
import { validateSpotifyConfig } from "../../config/spotify-validator";

interface SpotifyDiagnosticsProps {
  isAuthenticated: boolean;
  accessToken: string | null;
  player: Spotify.Player | null;
  deviceId: string | null;
}

export const SpotifyDiagnostics: React.FC<SpotifyDiagnosticsProps> = ({
  isAuthenticated,
  accessToken,
  player,
  deviceId,
}) => {
  const diagnostics = [
    {
      label: "Authentication",
      status: isAuthenticated && accessToken ? "success" : "error",
      message: isAuthenticated ? "Connected to Spotify" : "Not authenticated",
      details: accessToken
        ? `Token: ${accessToken.substring(0, 20)}...`
        : "No access token",
    },
    {
      label: "Web Playback SDK",
      status: player ? "success" : "warning",
      message: player ? "Player initialized" : "Player not ready",
      details: player
        ? "SDK loaded and connected"
        : "Waiting for SDK initialization",
    },
    {
      label: "Device Registration",
      status: deviceId ? "success" : "warning",
      message: deviceId ? "Device registered" : "No device ID",
      details: deviceId
        ? `Device: ${deviceId}`
        : "Player not registered as device",
    },
  ];

  const hasErrors = diagnostics.some((d) => d.status === "error");
  const hasWarnings = diagnostics.some((d) => d.status === "warning");

  if (!hasErrors && !hasWarnings) return null;

  return (
    <Card className="p-4 bg-card/20 backdrop-blur-sm border-primary/20 mb-4">
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-semibold">
            Spotify Connection Diagnostics
          </h3>
        </div>

        <div className="space-y-2">
          {diagnostics.map((diagnostic, index) => (
            <div
              key={index}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    diagnostic.status === "success"
                      ? "bg-green-500"
                      : diagnostic.status === "warning"
                      ? "bg-amber-500"
                      : "bg-red-500"
                  }`}
                />
                <span className="font-medium">{diagnostic.label}:</span>
                <span
                  className={
                    diagnostic.status === "success"
                      ? "text-green-400"
                      : diagnostic.status === "warning"
                      ? "text-amber-400"
                      : "text-red-400"
                  }
                >
                  {diagnostic.message}
                </span>
              </div>
              <span className="text-xs text-muted-foreground opacity-70">
                {diagnostic.details}
              </span>
            </div>
          ))}
        </div>

        {hasErrors && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <strong>Authentication Required:</strong> You need a Spotify
              Premium account and must log in to use the music features.
              <br />
              <Button
                variant="link"
                size="sm"
                className="p-0 h-auto text-xs mt-1"
                onClick={() =>
                  window.open("https://open.spotify.com/premium", "_blank")
                }
              >
                Get Spotify Premium <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasWarnings && !hasErrors && (
          <Alert>
            <Headphones className="h-4 w-4" />
            <AlertDescription className="text-xs">
              The Spotify player is initializing. If this persists, try
              refreshing the page or check that you have Spotify Premium.
            </AlertDescription>
          </Alert>
        )}

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => validateSpotifyConfig()}
            className="text-xs"
          >
            Run Configuration Validator
          </Button>
        </div>
      </div>
    </Card>
  );
};
