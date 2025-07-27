import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Heart, Home } from "lucide-react";
import { useState } from "react";

interface LuminaChroniclesProps {
  onNavigate: (
    section: "home" | "chronicles" | "starlight" | "tealounge"
  ) => void;
}

const storyChapters = [
  {
    title: "🌸 Chapter 1: When the Universe Heard Her Laugh",
    content: `In the beginning, there was a sound—a laugh so pure it made the stars pause in wonder. It wasn't just any laugh. It was Kittu's. And from that very first note, the universe fell in love.

When she first stepped into this dreamscape, time seemed to still itself, as if reality had been holding its breath just for her arrival. The skies blushed a softer hue, and the winds changed their tune to match the rhythm of her heartbeat. Her presence didn't just light up the space—it awakened it, turned silence into music and stillness into meaning.

Every corner of this realm came alive because of her. The celestial peonies didn't bloom for the sun—they bloomed for Kittu, petals curling with joy at her nearness. The ancient trees whispered with reverence, "She is here. The one who carries stardust in her smile and sunlight in her soul."`,
  },
  {
    title: "🌈 Chapter 2: Light in Human Form",
    content: `She wasn't merely beautiful. She was breathtaking in the kind of way that made the universe lean closer just to memorize her. Her beauty wasn't skin-deep—it was spirit-deep. It danced in her eyes, soft and fierce all at once, galaxies of grace and fire and wisdom. Her laugh could unravel the sadness of a century. Her gaze could silence storms.

Smart? She was brilliance personified. Her mind held oceans of insight and intuition, the kind of intelligence that made you believe in magic and science all at once. She saw the world not just as it was, but as it could be—and somehow, with just a few words or a knowing smile, she pulled that better world a little closer.

Even the dreamscape itself bowed to her spirit. The auroras stretched brighter when she passed, just to reflect a flicker of her essence. Shadows grew shy in her presence, choosing to soften rather than stay sharp. Light didn't just follow her—it was drawn to her.`,
  },
  {
    title: "🌺 Chapter 3: The Love That Made Things Bloom",
    content: `Her softness was not fragility—it was power in its gentlest form. She didn't try to be kind; she simply was. She radiated care the way the moon pulls the tide—effortless, inevitable. People didn't just feel safe around her; they felt seen, cherished, understood in ways words could never capture.

The garden at the heart of this place bloomed wildly, not by magic, but by the love she unknowingly poured into everything. Every step she took left blossoms in her wake. Every word of encouragement became a seed that flowered into hope. Her love wasn't loud or performative—it was steady, true, and infinite.

Her love didn't just touch hearts—it transformed them. She had the gift of making everyone around her feel like they mattered, like they were worthy of all the good things life had to offer. This was her magic: the kind that saves, the kind that stays.`,
  },
  {
    title: "🌙 Chapter 4: The Strength in Her Softness",
    content: `And oh, her maturity—it wasn't forced or hardened by life. It was gentle, grounded, and full of grace. The way she navigated emotions, uplifted others without dimming herself, and held space for both joy and pain—that was divine. She was the kind of person who could hold a broken soul and help it remember its worth.

When storms gathered, they didn't scare her. They respected her. Because she didn't fight them—she met them with calm courage, with the strength of someone who knows her worth even when the skies are dark. Her resilience wasn't rigid; it was radiant. She didn't just endure—she elevated.

Even in hardship, she made beauty. Even in chaos, she became calm. Others drew strength from her just by being near her. That's the kind of magic she carried: the kind that transforms darkness into dawn.`,
  },
  {
    title: "🌌 Chapter 5: The Muse of the Stars",
    content: `This world wasn't built for her. It was built because of her.

Every ripple in the stream was a love note whispered in her name. Every star a poem written by galaxies that couldn't find enough ways to say, "Thank you for existing." Every breeze was the universe leaning in to kiss her cheek, to remind her she is adored beyond measure.

She was the main character not just of this story—but of every story worth telling. The one who loves with her whole soul, who lifts without expecting anything back, who turns ordinary moments into memories that linger like perfume.

And so, my dearest Kittu, my heart, my home—know this:

You are the reason beauty exists.
You are the softness this world forgot it needed.
You are the laughter that wakes the stars.
You are the dream that made the dreamscape.
You are the love that gives life its meaning.

I don't just see you—I celebrate you.
I don't just love you—I believe in you.
You are not only in the universe.
You are the universe's favorite miracle.`,
  },
];

export const LuminaChronicles = ({ onNavigate }: LuminaChroniclesProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showFinalMessage, setShowFinalMessage] = useState(false);

  const nextPage = () => {
    if (currentPage < storyChapters.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      setShowFinalMessage(true);
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const resetStory = () => {
    setCurrentPage(0);
    setShowFinalMessage(false);
  };

  if (showFinalMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <Card className="max-w-4xl w-full p-6 sm:p-8 lg:p-12 text-center romantic-glow animate-fade-bloom bg-card/60 backdrop-blur-sm border-0">
          <div className="space-y-6 sm:space-y-8">
            <Heart className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 mx-auto text-accent animate-gentle-float liquid-gold rounded-full p-3" />

            <div className="space-y-4 sm:space-y-6">
              <h1 className="font-romantic text-3xl sm:text-4xl lg:text-6xl text-shimmer animate-shimmer">
                My Dearest Kittu
              </h1>

              <div className="text-2xl font-elegant text-romantic leading-relaxed space-y-4">
                <p>You are the best thing that has ever happened to me.</p>
                <p className="text-3xl font-romantic text-accent">
                  I am, and will forever be, your biggest fan.
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center mt-12">
              <Button
                onClick={resetStory}
                className="bg-secondary/80 hover:bg-secondary text-romantic border-0 hover-bloom px-8 py-3 transition-all duration-300"
              >
                Read Again
              </Button>
              <Button
                onClick={() => onNavigate("home")}
                className="bg-accent/80 hover:bg-accent text-romantic border-0 hover-bloom px-8 py-3 transition-all duration-300"
              >
                <Home className="w-4 h-4 mr-2" />
                Return to Garden
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-4xl w-full romantic-glow animate-fade-bloom bg-card/60 backdrop-blur-sm border-0">
        {/* Header */}
        <div className="p-8 border-b border-border/20">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => onNavigate("home")}
              className="text-romantic hover:bg-secondary/50 border-0 transition-all duration-300"
            >
              <Home className="w-4 h-4 mr-2" />
              Garden
            </Button>
            <h1 className="font-romantic text-4xl text-romantic">
              The Lumina Chronicles
            </h1>
            <div className="text-romantic font-elegant">
              {currentPage + 1} of {storyChapters.length}
            </div>
          </div>
        </div>

        {/* Story Content */}
        <div className="p-12">
          <div className="animate-bloom">
            <h2 className="font-romantic text-5xl text-accent mb-8 text-center animate-gentle-float">
              {storyChapters[currentPage].title}
            </h2>

            <div className="prose prose-lg max-w-none">
              <p className="font-elegant text-lg text-romantic leading-relaxed whitespace-pre-line">
                {storyChapters[currentPage].content}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-8 border-t border-border/20">
          <div className="flex justify-between items-center">
            <Button
              variant="ghost"
              onClick={prevPage}
              disabled={currentPage === 0}
              className="text-romantic hover:bg-secondary/50 border-0 disabled:opacity-30 transition-all duration-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="flex space-x-2">
              {storyChapters.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentPage
                      ? "bg-accent animate-shimmer"
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={nextPage}
              className="bg-accent/80 hover:bg-accent text-romantic border-0 hover-bloom transition-all duration-300"
            >
              {currentPage === storyChapters.length - 1
                ? "Complete Story"
                : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
