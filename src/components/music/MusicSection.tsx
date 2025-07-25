import React, { useState } from 'react';
import { Music, Search, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SpotifyLogin } from './SpotifyLogin';
import { MusicSearch } from './MusicSearch';
import { SpotifyDiagnostics } from './SpotifyDiagnostics';
import { useMusicContext } from '@/contexts/MusicContext';

export const MusicSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'search'>('login');
  const { isAuthenticated, accessToken, player, deviceId } = useMusicContext();

  React.useEffect(() => {
    if (isAuthenticated) {
      setActiveTab('search');
    }
  }, [isAuthenticated]);

  return (
    <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="relative">
              <Headphones className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground font-serif">
            Music for Your Journey
          </h3>
          <p className="text-sm text-muted-foreground">
            Enhance your dreamscape experience with beautiful melodies
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 bg-background/20 p-1 rounded-lg">
          <Button
            variant={activeTab === 'login' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('login')}
            className="flex-1"
          >
            <Music className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button
            variant={activeTab === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('search')}
            className="flex-1"
            disabled={!isAuthenticated}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          <SpotifyDiagnostics 
            isAuthenticated={isAuthenticated}
            accessToken={accessToken}
            player={player}
            deviceId={deviceId}
          />
          {activeTab === 'login' && <SpotifyLogin />}
          {activeTab === 'search' && <MusicSearch />}
        </div>
      </div>
    </Card>
  );
};