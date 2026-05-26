import { useState, useCallback } from 'react';
import { TRANSLATIONS } from '../data/translations';

export type Language = 'en' | 'pt';

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem('wurm_chest_lang');
      if (stored === 'en' || stored === 'pt') {
        return stored;
      }
    } catch (e) {
      console.error("Failed to read language from localStorage", e);
    }
    return 'en'; // Default to English as primary
  });

  const changeLanguage = useCallback((newLang: Language) => {
    setLang(newLang);
    try {
      localStorage.setItem('wurm_chest_lang', newLang);
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  }, []);

  const t = useCallback((key: keyof typeof TRANSLATIONS.en): string => {
    const translationsForLang = TRANSLATIONS[lang] || TRANSLATIONS.en;
    return translationsForLang[key] || TRANSLATIONS.en[key] || String(key);
  }, [lang]);

  return {
    lang,
    changeLanguage,
    t
  };
}
