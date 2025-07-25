
import { useState } from 'react';
import { DreamscapeLayout } from '@/components/DreamscapeLayout';
import { HomePage } from '@/components/HomePage';
import { LuminaChronicles } from '@/components/LuminaChronicles';
import { StarlightCatcher } from '@/components/StarlightCatcher';
import { TeaLounge } from '@/components/TeaLounge';

type Section = 'entrance' | 'home' | 'chronicles' | 'starlight' | 'tealounge';

const Index = () => {
  const [currentSection, setCurrentSection] = useState<Section>('entrance');
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);

  const handleNavigate = (section: Section) => {
    if (section === 'home' && !hasEnteredOnce) {
      setHasEnteredOnce(true);
    }
    setCurrentSection(section);
  };

  const renderSection = () => {
    switch (currentSection) {
      case 'chronicles':
        return <LuminaChronicles onNavigate={handleNavigate} />;
      case 'starlight':
        return <StarlightCatcher onNavigate={handleNavigate} />;
      case 'tealounge':
        return <TeaLounge onNavigate={handleNavigate} />;
      case 'home':
        return <HomePage onNavigate={handleNavigate} skipEntrance={hasEnteredOnce} />;
      default:
        return <HomePage onNavigate={handleNavigate} skipEntrance={false} />;
    }
  };

  return (
    <DreamscapeLayout showParticles={currentSection === 'home'}>
      {renderSection()}
    </DreamscapeLayout>
  );
};

export default Index;
