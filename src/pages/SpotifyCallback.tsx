import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const SpotifyCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The access token will be handled by the MusicContext
    // Just redirect back to the main app
    const timer = setTimeout(() => {
      navigate('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-celestial">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <h2 className="text-xl font-semibold text-white">
          Connecting to Spotify...
        </h2>
        <p className="text-white/70">
          Setting up your musical journey through the dreamscape
        </p>
      </div>
    </div>
  );
};

export default SpotifyCallback;