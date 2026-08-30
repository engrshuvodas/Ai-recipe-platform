import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('recipe_companion_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('recipe_companion_lang', currentLang);
  }, [currentLang]);

  const t = (key, fallback) => {
    const dict = translations[currentLang] || translations.en;
    return dict[key] || fallback || key;
  };

  const changeLanguage = (langCode) => {
    if (translations[langCode]) {
      setCurrentLang(langCode);
    }
  };

  const availableLanguages = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳' },
    { code: 'es', label: 'Español (Spanish)', flag: '🇪🇸' },
    { code: 'fr', label: 'Français (French)', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
  ];

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, availableLanguages, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
