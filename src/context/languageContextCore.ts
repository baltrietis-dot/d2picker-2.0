import { createContext } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

export type Translate = <K extends TranslationKey>(key: K) => (typeof translations.en)[K];

export interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translate;
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
