
export interface CapturedPhoto {
  base64: string;
  id: string;
  timestamp: number;
}

export interface DevelopedPolaroid {
  id: string;
  originalImage: string;
  finalPolaroid: string;
  caption: string;
}

export enum AppState {
  CAMERA = 'CAMERA',
  DEVELOPING = 'DEVELOPING',
  GALLERY = 'GALLERY',
  VIEWER = 'VIEWER'
}

export type CaptionStyle = 'luchtig' | 'grappig' | 'serieus' | 'inspirerend' | 'filosofisch' | 'literair' | 'fortune cooky' | 'positief';

export type Language = 'en' | 'fr' | 'es' | 'it' | 'de' | 'zh' | 'nl';

export const SUPPORTED_LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' }
];

export const TRANSLATIONS: Record<Language, any> = {
  en: {
    unit: "Experimental Analog Unit",
    tagline: "See beyond the frame.",
    analyzing: "Analyzing mood...",
    inking: "Inking edges...",
    rescribing: "Rescribing...",
    langAndStyle: "Language & Style",
    working: "Working...",
    regenerate: "Regenerate Caption",
    save: "Save",
    share: "Share",
    newShot: "New Shot",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • AI-ENHANCED PRINT",
    styles: {
      luchtig: "Breezy",
      grappig: "Funny",
      serieus: "Serious",
      inspirerend: "Inspiring",
      filosofisch: "Philosophic",
      literair: "Literary",
      "fortune cooky": "Fortune",
      positief: "Positive"
    }
  },
  nl: {
    unit: "Experimentele Analoge Unit",
    tagline: "Kijk verder dan het kader.",
    analyzing: "Sfeer analyseren...",
    inking: "Randen inkt geven...",
    rescribing: "Herschrijven...",
    langAndStyle: "Taal & Stijl",
    working: "Bezig...",
    regenerate: "Onderschrift vernieuwen",
    save: "Opslaan",
    share: "Delen",
    newShot: "Nieuwe Foto",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • AI-VERBETERDE AFDRUK",
    styles: {
      luchtig: "Luchtig",
      grappig: "Grappig",
      serieus: "Serieus",
      inspirerend: "Inspirerend",
      filosofisch: "Filosofisch",
      literair: "Literair",
      "fortune cooky": "Gelukskoekje",
      positief: "Positief"
    }
  },
  fr: {
    unit: "Unité Analogique Expérimentale",
    tagline: "Voir au-delà du cadre.",
    analyzing: "Analyse de l'ambiance...",
    inking: "Encrage des bords...",
    rescribing: "Réécriture...",
    langAndStyle: "Langue et Style",
    working: "En cours...",
    regenerate: "Régénérer la légende",
    save: "Enregistrer",
    share: "Partager",
    newShot: "Nouveau cliché",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • IMPRESSION IA",
    styles: {
      luchtig: "Léger",
      grappig: "Drôle",
      serieus: "Sérieux",
      inspirerend: "Inspirant",
      filosofisch: "Philosophique",
      literair: "Littéraire",
      "fortune cooky": "Fortune",
      positief: "Positif"
    }
  },
  es: {
    unit: "Unidad Analógica Experimental",
    tagline: "Ver más allá del marco.",
    analyzing: "Analizando el ambiente...",
    inking: "Entintando bordes...",
    rescribing: "Reescribiendo...",
    langAndStyle: "Idioma y Estilo",
    working: "Trabajando...",
    regenerate: "Regenerar subtítulo",
    save: "Guardar",
    share: "Compartir",
    newShot: "Nueva foto",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • IMPRESIÓN IA",
    styles: {
      luchtig: "Ligero",
      grappig: "Divertido",
      serieus: "Serio",
      inspirerend: "Inspirador",
      filosofisch: "Filosófico",
      literair: "Literario",
      "fortune cooky": "Fortuna",
      positief: "Positivo"
    }
  },
  it: {
    unit: "Unità Analogica Sperimentale",
    tagline: "Guarda oltre la cornice.",
    analyzing: "Analisi dell'atmosfera...",
    inking: "Inchiostrazione bordi...",
    rescribing: "Riscrittura...",
    langAndStyle: "Lingua e Stile",
    working: "In corso...",
    regenerate: "Rigenera didascalia",
    save: "Salva",
    share: "Condividi",
    newShot: "Nuovo scatto",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • STAMPA AI",
    styles: {
      luchtig: "Leggero",
      grappig: "Divertente",
      serieus: "Serio",
      inspirerend: "Ispiratore",
      filosofisch: "Filosofico",
      literair: "Letterario",
      "fortune cooky": "Fortuna",
      positief: "Positivo"
    }
  },
  de: {
    unit: "Experimentelle Analogeinheit",
    tagline: "Blick über den Rahmen.",
    analyzing: "Stimmung analysieren...",
    inking: "Kanten einfärben...",
    rescribing: "Umschreiben...",
    langAndStyle: "Sprache & Stil",
    working: "In Arbeit...",
    regenerate: "Bildunterschrift erneuern",
    save: "Speichern",
    share: "Teilen",
    newShot: "Neues Foto",
    cam: "Cam",
    footer: "ISO 400 • F/8.0 • KI-DRUCK",
    styles: {
      luchtig: "Locker",
      grappig: "Lustig",
      serieus: "Ernst",
      inspirerend: "Inspirierend",
      filosofisch: "Philosophisch",
      literair: "Literarisch",
      "fortune cooky": "Glückskeks",
      positief: "Positiv"
    }
  },
  zh: {
    unit: "实验性模拟单元",
    tagline: "看透画框。",
    analyzing: "正在分析氛围...",
    inking: "正在填充边缘...",
    rescribing: "正在重新编写...",
    langAndStyle: "语言与风格",
    working: "处理中...",
    regenerate: "重新生成字幕",
    save: "保存",
    share: "分享",
    newShot: "新照片",
    cam: "相机",
    footer: "ISO 400 • F/8.0 • AI增强打印",
    styles: {
      luchtig: "轻盈",
      grappig: "幽默",
      serieus: "严肃",
      inspirerend: "鼓舞人心",
      filosofisch: "富有哲理",
      literair: "文学气息",
      "fortune cooky": "幸运饼干",
      positief: "积极向上"
    }
  }
};
