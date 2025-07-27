import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMusicContext } from "@/contexts/MusicContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Headphones, Music, Search } from "lucide-react";
import React, { useState } from "react";
import { MusicSearch } from "./MusicSearch";
import { SpotifyDiagnostics } from "./SpotifyDiagnostics";
import { SpotifyLogin } from "./SpotifyLogin";

export const MusicSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"login" | "search">("login");
  const { isAuthenticated, accessToken, player, deviceId } = useMusicContext();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    if (isAuthenticated) {
      setActiveTab("search");
    }
  }, [isAuthenticated]);

  return (
    <Card
      className={`${
        isMobile ? "p-3" : "p-6"
      } bg-card/20 backdrop-blur-sm border-primary/20`}
    >
      <div className={`space-y-${isMobile ? "4" : "6"}`}>
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <Headphones
                className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-primary`}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <h3
            className={`${
              isMobile ? "text-lg" : "text-xl"
            } font-semibold text-foreground font-serif`}
          >
            Music for Your Journey
          </h3>
          <p
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } text-muted-foreground`}
          >
            Enhance your dreamscape experience with beautiful melodies
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 sm:space-x-2 bg-background/20 p-1 rounded-lg">
          <Button
            variant={activeTab === "login" ? "default" : "ghost"}
            size={isMobile ? "sm" : "sm"}
            onClick={() => setActiveTab("login")}
            className="flex-1 min-h-[44px]"
          >
            <Music
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1 sm:mr-2`}
            />
            <span className={isMobile ? "text-xs" : "text-sm"}>Connect</span>
          </Button>
          <Button
            variant={activeTab === "search" ? "default" : "ghost"}
            size={isMobile ? "sm" : "sm"}
            onClick={() => setActiveTab("search")}
            className="flex-1 min-h-[44px]"
            disabled={!isAuthenticated}
          >
            <Search
              className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} mr-1 sm:mr-2`}
            />
            <span className={isMobile ? "text-xs" : "text-sm"}>Search</span>
          </Button>
        </div>

        {/* Content */}
        <div className={`${isMobile ? "min-h-[180px]" : "min-h-[200px]"}`}>
          <SpotifyDiagnostics
            isAuthenticated={isAuthenticated}
            accessToken={accessToken}
            player={player}
            deviceId={deviceId}
          />
          {activeTab === "login" && <SpotifyLogin />}
          {activeTab === "search" && <MusicSearch />}
        </div>
      </div>
    </Card>
  );
};
