import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useMusicContext } from "@/contexts/MusicContext";
import { Pause, Play, SkipBack, SkipForward, Volume2, X } from "lucide-react";
import React, { useEffect, useState } from "react";

export const MusicPlayer: React.FC = () => {
  const {
    playbackState,
    play,
    pause,
    nextTrack,
    previousTrack,
    setVolume,
    seek,
    showPlayer,
    setShowPlayer,
  } = useMusicContext();

  const [localVolume, setLocalVolume] = useState([50]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalVolume([playbackState.volume * 100]);
  }, [playbackState.volume]);

  const handleVolumeChange = (value: number[]) => {
    setLocalVolume(value);
    setVolume(value[0] / 100);
  };

  const handleSeek = (value: number[]) => {
    const newPosition = (value[0] / 100) * playbackState.duration;
    seek(newPosition);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const progressPercentage =
    playbackState.duration > 0
      ? (playbackState.position / playbackState.duration) * 100
      : 0;

  if (!showPlayer || !playbackState.currentTrack) {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 bg-card/95 backdrop-blur-md border-primary/30 shadow-2xl">
      <div className="p-3">
        {/* Compact View */}
        <div className="flex items-center space-x-3">
          {/* Album Art */}
          <div
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <img
              src={
                playbackState.currentTrack.album.images[2]?.url ||
                playbackState.currentTrack.album.images[0]?.url
              }
              alt={playbackState.currentTrack.album.name}
              className="w-12 h-12 rounded-md object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-background/30 rounded-b-md overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Track Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {playbackState.currentTrack.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {playbackState.currentTrack.artists
                .map((artist) => artist.name)
                .join(", ")}
            </p>
          </div>

          {/* Compact Controls */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={playbackState.isPlaying ? pause : () => play()}
              className="w-8 h-8 p-0"
            >
              {playbackState.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPlayer(false)}
              className="w-6 h-6 p-0 opacity-60 hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Expanded View */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border/20 space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(playbackState.position)}</span>
                <span>{formatTime(playbackState.duration)}</span>
              </div>
              <Slider
                value={[progressPercentage]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full cursor-pointer"
              />
            </div>

            {/* Full Controls */}
            <div className="flex items-center justify-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={previousTrack}
                className="w-8 h-8 p-0"
              >
                <SkipBack className="w-4 h-4" />
              </Button>

              <Button
                variant="default"
                size="sm"
                onClick={playbackState.isPlaying ? pause : () => play()}
                className="w-10 h-10 p-0 rounded-full"
              >
                {playbackState.isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={nextTrack}
                className="w-8 h-8 p-0"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={localVolume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {Math.round(localVolume[0])}%
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
