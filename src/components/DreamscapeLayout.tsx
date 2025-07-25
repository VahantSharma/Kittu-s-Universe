
import { ReactNode } from 'react';
import { ParticleSystem } from './ParticleSystem';
import celestialGardenBg from '@/assets/celestial-garden-bg.jpg';

interface DreamscapeLayoutProps {
  children: ReactNode;
  showParticles?: boolean;
}

export const DreamscapeLayout = ({ children, showParticles = true }: DreamscapeLayoutProps) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - Made flowers more visible */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{ 
          backgroundImage: `url(${celestialGardenBg})`,
          filter: 'blur(0.5px)'
        }}
      />
      
      {/* Gradient Overlay - Reduced opacity to show more flowers */}
      <div className="fixed inset-0 bg-celestial opacity-60" />
      
      {/* Particle System */}
      {showParticles && <ParticleSystem />}
      
      {/* Content */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};
