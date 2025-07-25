import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, Star, RotateCcw } from 'lucide-react';

interface StarlightCatcherProps {
  onNavigate: (section: 'home' | 'chronicles' | 'starlight' | 'tealounge') => void;
}

interface StarPosition {
  x: number;
  y: number;
  id: number;
  collected: boolean;
}

interface DuduPosition {
  x: number;
  y: number;
}

const loveMessages = [
  "My Motu is a gaming pro! ⭐",
  "Nobody shines brighter than my Kit-kut! ✨", 
  "I love you, my sweet Bebu 💕",
  "You're collecting stars just like you collect hearts... effortlessly ⭐",
  "Go, Motu, go! You're a superstar! 🌟",
  "My sweet Kit-kut is doing so well! 💕",
  "Every star you catch is another reason I love you, Bebu ✨",
  "You make everything look so easy and beautiful, Motu! 💫",
  "So proud of you, my Kittu! ❤️",
  "You are strong, you are amazing, you are my everything, Kit-kut! ⭐",
  "Look at my Bebu go! Absolutely incredible! ✨",
  "My Motu never ceases to amaze me! 🌟",
  "Kit-kut, you're pure starlight in motion! 💫",
  "Dancing through the cosmos like the goddess you are, Bebu! ⭐",
  "My heart swells with pride watching you, Motu! 💕",
  "You turn everything into magic, my darling Kit-kut! ✨",
  "Bebu, you're rewriting the laws of beauty with every move! 🌟",
  "My precious Motu makes the stars jealous! 💫",
  "Kit-kut, you're the reason the universe sparkles! ⭐",
  "Sweet Bebu, you make my world complete! 💕",
  "Motu, you're poetry in motion! ✨",
  "My brilliant Kit-kut conquers everything! 🌟",
  "Bebu, you're the masterpiece the cosmos dreamed of! 💫",
  "Every moment with you is a gift, Motu! ⭐",
  "Kit-kut, you're my favorite wonder of the world! 💕",
  "My incredible Bebu makes miracles look routine! ✨",
  "Motu, you're the symphony that makes my heart sing! 🌟",
  "Kit-kut, you turn ordinary moments into fairy tales! 💫",
  "My beloved Bebu, you're the light that guides my soul! ⭐",
  "Motu, watching you is like witnessing magic being born! 💕"
];

export const StarlightCatcher = ({ onNavigate }: StarlightCatcherProps) => {
  const [duduPosition, setDuduPosition] = useState<DuduPosition>({ x: 50, y: 50 });
  const [stars, setStars] = useState<StarPosition[]>([]);
  const [score, setScore] = useState(0);
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const targetPositionRef = useRef<DuduPosition>({ x: 50, y: 50 });
  const animationFrameRef = useRef<number>();

  // Smooth movement animation
  useEffect(() => {
    const smoothMove = () => {
      setDuduPosition(current => {
        const target = targetPositionRef.current;
        const dx = target.x - current.x;
        const dy = target.y - current.y;
        
        // Lerp for smooth movement
        const lerp = 0.1;
        return {
          x: current.x + dx * lerp,
          y: current.y + dy * lerp
        };
      });
      animationFrameRef.current = requestAnimationFrame(smoothMove);
    };
    
    if (gameStarted) {
      animationFrameRef.current = requestAnimationFrame(smoothMove);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted]);

  // Generate stars
  useEffect(() => {
    if (!gameStarted) return;
    
    const generateStar = () => {
      const newStar: StarPosition = {
        x: Math.random() * 80 + 10, // Keep stars away from edges
        y: Math.random() * 80 + 10,
        id: Date.now() + Math.random(),
        collected: false
      };
      
      setStars(current => [...current, newStar]);
    };

    const interval = setInterval(generateStar, 2000);
    
    // Generate initial stars
    for (let i = 0; i < 3; i++) {
      setTimeout(generateStar, i * 500);
    }

    return () => clearInterval(interval);
  }, [gameStarted]);

  // Handle mouse movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameAreaRef.current || !gameStarted) return;
    
    const rect = gameAreaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    targetPositionRef.current = { 
      x: Math.max(5, Math.min(95, x)), 
      y: Math.max(5, Math.min(95, y)) 
    };
  };

  // Check star collection
  useEffect(() => {
    stars.forEach(star => {
      if (star.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(duduPosition.x - star.x, 2) + Math.pow(duduPosition.y - star.y, 2)
      );
      
      if (distance < 8) {
        setStars(current => 
          current.map(s => s.id === star.id ? { ...s, collected: true } : s)
        );
        setScore(current => current + 1);
        
        // Show love message every 5 stars
        if ((score + 1) % 5 === 0) {
          const randomMessage = loveMessages[Math.floor(Math.random() * loveMessages.length)];
          setShowMessage(randomMessage);
          setTimeout(() => setShowMessage(null), 3000);
        }
        
        // Remove collected star after animation
        setTimeout(() => {
          setStars(current => current.filter(s => s.id !== star.id));
        }, 500);
      }
    });
  }, [duduPosition, stars, score]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setStars([]);
    setShowMessage(null);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setStars([]);
    setShowMessage(null);
    setDuduPosition({ x: 50, y: 50 });
    targetPositionRef.current = { x: 50, y: 50 };
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full p-12 text-center romantic-glow animate-fade-bloom bg-card/60 backdrop-blur-sm border-0">
          <div className="space-y-8">
            <div className="space-y-4">
              <Star className="w-16 h-16 mx-auto text-accent animate-shimmer liquid-gold rounded-full p-3" />
              <h1 className="font-romantic text-6xl text-shimmer">
                Starlight Catcher
              </h1>
              <p className="font-elegant text-xl text-romantic">
                Dance among the stars, my beautiful Bubu
              </p>
            </div>
            
            <div className="space-y-6 text-romantic font-elegant">
              <p>Guide your character with your mouse to collect falling stars.</p>
              <p>Every 5 stars brings you a special message of love! ✨</p>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => onNavigate('home')}
                variant="ghost"
                className="text-romantic hover:bg-secondary/50 border-0 transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Garden
              </Button>
              <Button
                onClick={startGame}
                className="bg-accent/80 hover:bg-accent text-romantic border-0 hover-bloom px-8 py-3 transition-all duration-300"
              >
                Begin Dancing
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="text-romantic hover:bg-secondary/50 border-0 transition-all duration-300"
        >
          <Home className="w-4 h-4 mr-2" />
          Garden
        </Button>
        
        <div className="flex items-center gap-6">
          <div className="text-romantic font-elegant text-xl">
            Stars: <span className="font-romantic text-2xl text-accent">{score}</span>
          </div>
          <Button
            onClick={resetGame}
            variant="ghost"
            className="text-romantic hover:bg-secondary/50 border-0 transition-all duration-300"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>

      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full h-[600px] bg-twilight rounded-3xl romantic-glow cursor-none overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Dudu Character */}
        <div
          className="absolute w-12 h-12 transition-transform duration-100"
          style={{
            left: `${duduPosition.x}%`,
            top: `${duduPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-accent to-primary rounded-full animate-gentle-float shadow-lg">
            <div className="w-full h-full bg-accent/80 rounded-full animate-shimmer" />
            {/* Trailing scarf effect */}
            <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-accent/30 to-transparent rounded-full animate-pulse" />
          </div>
        </div>

        {/* Stars */}
        {stars.map(star => (
          <div
            key={star.id}
            className={`absolute w-8 h-8 transition-all duration-500 ${
              star.collected ? 'scale-150 opacity-0' : 'scale-100 opacity-100'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <Star className="w-full h-full text-accent animate-shimmer fill-current" />
          </div>
        ))}

        {/* Love Message Overlay */}
        {showMessage && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-card/90 backdrop-blur-sm p-8 rounded-3xl romantic-glow animate-bloom">
              <p className="font-romantic text-3xl text-accent text-center animate-shimmer">
                {showMessage}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center mt-6">
        <p className="font-elegant text-romantic opacity-70">
          Move your mouse to guide your character • Collect stars to unlock love messages
        </p>
      </div>
    </div>
  );
};
