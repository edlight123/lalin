import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

// Translation resources
import ht from './locales/ht.json';
import fr from './locales/fr.json';
import en from './locales/en.json';

const resources = {
  ht: { translation: ht },
  fr: { translation: fr },
  en: { translation: en },
};

// Get device locale
const getDeviceLanguage = () => {
  const languageTag = Localization.getLocales?.()?.[0]?.languageTag;

  // Safety check
  if (!languageTag || typeof languageTag !== 'string') {
    return 'en';
  }

  const normalized = languageTag.toLowerCase();

  // Map locale to supported languages
  if (normalized.startsWith('ht')) return 'ht'; // Haitian Creole
  if (normalized.startsWith('fr')) return 'fr'; // French
  return 'en'; // Default to English
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
