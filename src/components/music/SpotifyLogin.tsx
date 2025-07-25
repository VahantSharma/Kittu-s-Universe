import React from 'react';
import { Music, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMusicContext } from '@/contexts/MusicContext';

export const SpotifyLogin: React.FC = () => {
  const { login, isAuthenticated, logout } = useMusicContext();

  if (isAuthenticated) {
    return (
      <Card className="p-4 bg-card/20 backdrop-blur-sm border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Connected to Spotify</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={logout}
            className="text-xs"
          >
            Disconnect
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <Music className="w-12 h-12 text-primary" />
            <Sparkles className="w-4 h-4 text-accent absolute -top-1 -right-1 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">
            Add Music to Your Dreamscape
          </h3>
          <p className="text-sm text-muted-foreground">
            Connect your Spotify account to play any song as you explore Kittu's celestial sanctuary
          </p>
        </div>
        
        <Button 
          onClick={login}
          className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-white border-0"
        >
          <Music className="w-4 h-4 mr-2" />
          Connect with Spotify
        </Button>
        
        <p className="text-xs text-muted-foreground opacity-70">
          Premium Spotify account required for full playback
        </p>
      </div>
    </Card>
  );
};