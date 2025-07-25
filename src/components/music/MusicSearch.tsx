import React, { useState, useEffect } from 'react';
import { Search, Play, Music } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMusicContext } from '@/contexts/MusicContext';
import { useToast } from '@/hooks/use-toast';

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

export const MusicSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { searchTracks, play, isAuthenticated } = useMusicContext();
  const { toast } = useToast();

  useEffect(() => {
    if (!query.trim() || !isAuthenticated) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const tracks = await searchTracks(query);
        setResults(tracks);
      } catch (error) {
        console.error('Search error:', error);
        toast({
          title: "Search Error",
          description: "Failed to search for tracks. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [query, searchTracks, isAuthenticated, toast]);

  const handlePlay = async (track: Track) => {
    try {
      await play(track.uri);
      toast({
        title: "Now Playing",
        description: `${track.name} by ${track.artists[0]?.name}`,
      });
    } catch (error) {
      console.error('Play error:', error);
      toast({
        title: "Playback Error",
        description: "Failed to play track. Make sure Spotify is active on this device.",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isAuthenticated) {
    return (
      <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
        <div className="text-center space-y-2">
          <Music className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            Connect to Spotify to search and play music
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/20 backdrop-blur-sm border-primary/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search for songs, artists, or albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 bg-background/50 border-primary/20"
          />
        </div>
      </Card>

      {isSearching && (
        <Card className="p-4 bg-card/20 backdrop-blur-sm border-primary/20">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-muted-foreground">Searching...</span>
          </div>
        </Card>
      )}

      {results.length > 0 && (
        <Card className="bg-card/20 backdrop-blur-sm border-primary/20 max-h-96 overflow-y-auto">
          <div className="space-y-1 p-2">
            {results.map((track) => (
              <div
                key={track.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-primary/10 transition-colors group cursor-pointer"
                onClick={() => handlePlay(track)}
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url}
                    alt={track.album.name}
                    className="w-12 h-12 rounded-md object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {track.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {track.artists.map(artist => artist.name).join(', ')}
                  </p>
                  <p className="text-xs text-muted-foreground/70 truncate">
                    {track.album.name}
                  </p>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {formatDuration(track.duration_ms)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {query && !isSearching && results.length === 0 && (
        <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20">
          <div className="text-center space-y-2">
            <Music className="w-8 h-8 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              No results found for "{query}"
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};