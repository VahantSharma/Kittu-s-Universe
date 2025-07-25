
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Star, Coffee, Music } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { MusicSection } from '@/components/music/MusicSection';
import etherealCloudsBg from '@/assets/ethereal-clouds-sunset.png';

interface HomePageProps {
  onNavigate: (section: 'chronicles' | 'starlight' | 'tealounge' | 'home') => void;
  skipEntrance?: boolean;
}

export const HomePage = ({ onNavigate, skipEntrance = false }: HomePageProps) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [showEntrance, setShowEntrance] = useState(!skipEntrance);
  const [showInvitation, setShowInvitation] = useState(false);
  const [showMain, setShowMain] = useState(skipEntrance);

  useEffect(() => {
    if (skipEntrance) {
      setShowEntrance(false);
      setShowMain(true);
      return;
    }

    // Show invitation after 3 seconds
    const invitationTimer = setTimeout(() => {
      setShowInvitation(true);
    }, 3000);

    return () => clearTimeout(invitationTimer);
  }, [skipEntrance]);

  const handleEnterDreamscape = () => {
    setShowEntrance(false);
    setTimeout(() => setShowMain(true), 800);
  };

  if (showEntrance && !skipEntrance) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Full-screen ethereal clouds background */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${etherealCloudsBg})`,
          }}
        />
        
        {/* Entrance invitation */}
        {showInvitation && (
          <div className="fixed inset-0 flex items-center justify-center z-20">
            <button
              onClick={handleEnterDreamscape}
              className="font-romantic text-4xl md:text-5xl text-romantic hover:text-shimmer transition-all duration-500 hover:scale-105 animate-fade-bloom cursor-pointer text-shadow-lg"
            >
              Enter the Dreamscape, Kittu
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!showMain) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-fade-bloom">
          <div className="w-16 h-16 border-4 border-romantic border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-fade-bloom">
      {/* Kittu's name in the clouds */}
      <div className="mb-16">
        <h1 className="font-romantic text-8xl md:text-9xl text-shimmer mb-4 animate-gentle-float">
          Kittu's
        </h1>
        <h2 className="font-romantic text-6xl md:text-7xl text-romantic opacity-90">
          Dreamscape
        </h2>
        <p className="font-elegant text-xl text-romantic mt-6 opacity-80">
          Your own celestial sanctuary
        </p>
      </div>

      {/* Interactive hotspots */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Music Section - Top Row */}
        <div className="md:col-span-2 lg:col-span-3">
          <Card className="p-6 bg-card/20 backdrop-blur-sm border-primary/20 romantic-glow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 rounded-full liquid-gold">
                <Music className="w-6 h-6 text-romantic" />
              </div>
              <div>
                <h3 className="font-romantic text-2xl text-romantic">Music Sanctuary</h3>
                <p className="font-elegant text-romantic opacity-80 text-sm">
                  Let melodies accompany your journey through the dreamscape
                </p>
              </div>
            </div>
            <MusicSection />
          </Card>
        </div>
        {/* The Lumina Chronicles */}
        <div 
          className={`relative group ${hoveredSection === 'chronicles' ? 'z-10' : ''}`}
          onMouseEnter={() => setHoveredSection('chronicles')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('chronicles')}
            className="h-auto p-8 bg-card/40 backdrop-blur-sm romantic-glow hover-bloom border-0 w-full transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full liquid-gold animate-shimmer">
                <BookOpen className="w-8 h-8 text-romantic" />
              </div>
              <div>
                <h3 className="font-romantic text-3xl text-romantic mb-2">
                  The Lumina Chronicles
                </h3>
                <p className="font-elegant text-romantic opacity-80 text-sm">
                  Your story written in starlight
                </p>
              </div>
            </div>
          </Button>
        </div>

        {/* Starlight Catcher */}
        <div 
          className={`relative group ${hoveredSection === 'starlight' ? 'z-10' : ''}`}
          onMouseEnter={() => setHoveredSection('starlight')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('starlight')}
            className="h-auto p-8 bg-card/40 backdrop-blur-sm romantic-glow hover-bloom border-0 w-full transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full liquid-gold animate-shimmer">
                <Star className="w-8 h-8 text-romantic" />
              </div>
              <div>
                <h3 className="font-romantic text-3xl text-romantic mb-2">
                  Starlight Catcher
                </h3>
                <p className="font-elegant text-romantic opacity-80 text-sm">
                  Dance among the stars, my beautiful Bubu
                </p>
              </div>
            </div>
          </Button>
        </div>

        {/* Tea Lounge */}
        <div 
          className={`relative group ${hoveredSection === 'tealounge' ? 'z-10' : ''}`}
          onMouseEnter={() => setHoveredSection('tealounge')}
          onMouseLeave={() => setHoveredSection(null)}
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('tealounge')}
            className="h-auto p-8 bg-card/40 backdrop-blur-sm romantic-glow hover-bloom border-0 w-full transition-all duration-300"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 rounded-full liquid-gold animate-shimmer">
                <Coffee className="w-8 h-8 text-romantic" />
              </div>
              <div>
                <h3 className="font-romantic text-3xl text-romantic mb-2">
                  Gigi&Kittu's Tea Lounge
                </h3>
                <p className="font-elegant text-romantic opacity-80 text-sm">
                  Chat with me bae
                </p>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Romantic footer message */}
      <div className="mt-16 animate-fade-bloom">
        <p className="font-elegant text-romantic opacity-70 max-w-2xl mx-auto leading-relaxed">
          Every pixel of this sanctuary sings with gratitude for you, every animation a tribute to your joy. 
          Welcome to your dreamscape, dearest Kittu. ✨
        </p>
      </div>
    </div>
  );
};
