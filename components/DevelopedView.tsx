
import React, { useState, useEffect } from 'react';
import { DevelopedPolaroid, CaptionStyle, Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../types';

interface DevelopedViewProps {
  polaroid: DevelopedPolaroid;
  onBack: () => void;
  onRegenerate: (style: CaptionStyle, language: Language) => Promise<void>;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const DevelopedView: React.FC<DevelopedViewProps> = ({ 
  polaroid, 
  onBack, 
  onRegenerate, 
  language,
  onLanguageChange
}) => {
  const [isDeveloped, setIsDeveloped] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<CaptionStyle>('inspirerend');
  const [isRegenerating, setIsRegenerating] = useState(false);

  const t = TRANSLATIONS[language];
  const styles: CaptionStyle[] = ['luchtig', 'grappig', 'serieus', 'inspirerend', 'filosofisch', 'literair', 'fortune cooky', 'positief'];

  useEffect(() => {
    const timer = setTimeout(() => setIsDeveloped(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    const link = document.createElement('a');
    link.href = polaroid.finalPolaroid;
    link.download = `polaroid-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      const response = await fetch(polaroid.finalPolaroid);
      const blob = await response.blob();
      const file = new File([blob], 'polaroid.jpg', { type: 'image/jpeg' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: 'Instanza',
          text: polaroid.caption
        });
      } else {
        handleSave();
      }
    } catch (err) {
      console.error('Sharing failed', err);
      handleSave();
    }
  };

  const handleRegenerateClick = async () => {
    if (isRegenerating) return;
    setIsRegenerating(true);
    try {
      await onRegenerate(selectedStyle, language);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-start p-6 overflow-y-auto no-scrollbar pt-20 pb-12">
      {/* The Polaroid Print */}
      <div className="relative w-full flex flex-col items-center">
        <div 
          className={`relative w-full max-w-[340px] aspect-[8.8/10.7] bg-white shadow-[0_30px_60px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-[2000ms] ease-out transform ${isDeveloped ? 'opacity-100 scale-100 translate-y-0 rotate-0' : 'opacity-0 scale-95 translate-y-20 -rotate-2 blur-sm'}`}
        >
          <img 
            src={polaroid.finalPolaroid} 
            alt="Developed Polaroid"
            className={`w-full h-full object-contain transition-opacity duration-500 ${isRegenerating ? 'opacity-40 grayscale blur-sm' : 'opacity-100'}`}
          />
          
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/dust.png')]"></div>
          
          {isRegenerating && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <div className="w-8 h-8 border-2 border-black/10 border-t-black/60 rounded-full animate-spin"></div>
               <span className="mt-4 text-[8px] tracking-[0.3em] uppercase text-black font-bold">{t.rescribing}</span>
            </div>
          )}
        </div>
      </div>

      {/* Redevelop Controls */}
      <div className={`w-full max-w-[360px] mt-10 transition-all duration-1000 delay-[1200ms] ${isDeveloped ? 'opacity-100' : 'opacity-0'}`}>
        <p className="text-[8px] text-white/30 uppercase tracking-[0.4em] mb-4 text-center">{t.langAndStyle}</p>
        
        {/* Language Selection */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              disabled={isRegenerating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-bold tracking-wider transition-all border ${
                language === lang.code 
                ? 'bg-white/20 text-white border-white/40' 
                : 'bg-transparent text-white/20 border-white/5 hover:text-white/40'
              }`}
            >
              <span>{lang.flag}</span>
              <span className="uppercase">{lang.code}</span>
            </button>
          ))}
        </div>

        {/* Style Selection */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              disabled={isRegenerating}
              className={`px-3 py-1.5 rounded-full text-[8px] uppercase tracking-widest font-bold transition-all border ${
                selectedStyle === style 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent text-white/40 border-white/10'
              }`}
            >
              {t.styles[style]}
            </button>
          ))}
        </div>

        <button
          onClick={handleRegenerateClick}
          disabled={isRegenerating}
          className="w-full py-3 bg-white/5 border border-white/20 text-white text-[9px] font-bold tracking-[0.3em] uppercase rounded hover:bg-white/10 transition-all disabled:opacity-20"
        >
          {isRegenerating ? t.working : t.regenerate}
        </button>
      </div>

      {/* Action Buttons */}
      <div className={`mt-10 flex flex-col items-center gap-6 transition-all duration-1000 delay-[1800ms] ${isDeveloped ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={isRegenerating}
            className="flex-1 min-w-[130px] px-6 py-4 bg-white text-black rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-transform active:scale-95 shadow-xl"
          >
            {t.save}
          </button>
          <button
            onClick={handleShare}
            disabled={isRegenerating}
            className="flex-1 min-w-[130px] px-6 py-4 bg-neutral-800 text-white rounded-lg text-[10px] font-bold tracking-[0.2em] uppercase transition-transform active:scale-95 shadow-xl"
          >
            {t.share}
          </button>
        </div>
        
        <button
          onClick={onBack}
          disabled={isRegenerating}
          className="px-8 py-3 text-[10px] text-white/40 tracking-[0.4em] uppercase hover:text-white transition-colors border-b border-transparent hover:border-white/20"
        >
          {t.newShot}
        </button>
      </div>
    </div>
  );
};

export default DevelopedView;