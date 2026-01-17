
import React, { useState, useEffect } from 'react';
import { AppState, DevelopedPolaroid, CaptionStyle, Language, TRANSLATIONS, SUPPORTED_LANGUAGES } from './types';
import Viewfinder from './components/Viewfinder';
import DevelopedView from './components/DevelopedView';
import { generatePoeticCaption } from './services/geminiService';
import { createPolaroid } from './utils/imageProcessor';

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-3">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" strokeOpacity="0.9"/>
    <circle cx="12" cy="13" r="1.5" fill="white"/>
    <rect x="17" y="3" width="3" height="3" fill="#dc2626"/>
  </svg>
);

const STORAGE_KEY = 'instanza_language_preference';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CAMERA);
  const [result, setResult] = useState<DevelopedPolaroid | null>(null);
  const [loadingStep, setLoadingStep] = useState('');
  
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        return saved as Language;
      }
    } catch (e) {
      console.warn("Could not access localStorage for language preference:", e);
    }
    return 'en';
  });

  const t = TRANSLATIONS[language];

  // Wrapper to update state and persist choice
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      console.warn("Could not save language preference to localStorage:", e);
    }
  };

  /**
   * Core logic to transform a base64 image, style, and language into a finished Polaroid
   */
  const developImage = async (originalBase64: string, style: CaptionStyle, lang: Language) => {
    const activeT = TRANSLATIONS[lang];
    setLoadingStep(activeT.analyzing);
    const caption = await generatePoeticCaption(originalBase64, style, lang);
    
    setLoadingStep(activeT.inking);
    const finalPolaroid = await createPolaroid(originalBase64, caption);
    
    return { caption, finalPolaroid };
  };

  const handleCapture = async (base64: string, style: CaptionStyle, lang: Language) => {
    setAppState(AppState.DEVELOPING);
    try {
      const { caption, finalPolaroid } = await developImage(base64, style, lang);
      
      setResult({
        id: Date.now().toString(),
        originalImage: base64,
        finalPolaroid: finalPolaroid,
        caption: caption
      });

      setTimeout(() => {
        setAppState(AppState.VIEWER);
      }, 800);
    } catch (error) {
      console.error("Development failed:", error);
      setAppState(AppState.CAMERA);
      alert("Something went wrong with the chemistry. Try again.");
    }
  };

  const handleRegenerate = async (style: CaptionStyle, lang: Language) => {
    if (!result) return;
    try {
      const { caption, finalPolaroid } = await developImage(result.originalImage, style, lang);
      
      setResult({
        ...result,
        finalPolaroid: finalPolaroid,
        caption: caption
      });
    } catch (error) {
      console.error("Regeneration failed:", error);
      alert("Failed to regenerate caption.");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-black overflow-hidden select-none">
      {/* App Header */}
      <header className="fixed top-0 left-0 right-0 z-40 p-6 flex justify-between items-center pointer-events-none">
        <div className="flex items-center">
          <CameraIcon />
          <div className="flex flex-col">
            <h1 className="text-sm font-bold tracking-[0.4em] uppercase text-white/90 leading-tight">Instanza</h1>
            <div className="flex flex-col mt-0.5">
              <span className="text-[8px] tracking-[0.2em] text-white/30 uppercase">{t.unit}</span>
              <span className="text-[7px] tracking-[0.1em] text-white/20 italic lowercase mt-0.5">{t.tagline}</span>
            </div>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse shadow-[0_0_8px_red]"></div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative">
        {appState === AppState.CAMERA && (
          <Viewfinder 
            onCapture={handleCapture} 
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        {appState === AppState.DEVELOPING && (
          <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center">
            <div className="relative w-48 h-64 bg-neutral-900 shadow-inner rounded-sm overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
              <div className="w-12 h-12 border-2 border-white/10 border-t-white/60 rounded-full animate-spin"></div>
            </div>
            <p className="mt-8 text-[10px] tracking-[0.3em] uppercase text-white/40 animate-pulse">
              {loadingStep}
            </p>
          </div>
        )}

        {appState === AppState.VIEWER && result && (
          <DevelopedView 
            polaroid={result} 
            onBack={() => {
              setResult(null);
              setAppState(AppState.CAMERA);
            }}
            onRegenerate={handleRegenerate}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}
      </main>

      {/* Footer Info */}
      {appState === AppState.CAMERA && (
        <footer className="p-8 text-center pointer-events-none">
          <p className="text-[8px] text-white/20 uppercase tracking-[0.5em]">
            {t.footer}
          </p>
        </footer>
      )}
    </div>
  );
};

export default App;
