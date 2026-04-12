import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: TranslationKey) => any;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'd2picker_lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'ru' || stored === 'en') return stored;
        // Auto-detect Russian-speaking browsers
        const lang = navigator.language.toLowerCase();
        if (lang.startsWith('ru') || lang.startsWith('uk') || lang.startsWith('be')) return 'ru';
        return 'en';
    });

    const setLanguage = (lang: Language) => {
        localStorage.setItem(STORAGE_KEY, lang);
        setLanguageState(lang);
    };

    const t = (key: TranslationKey) => translations[language][key];

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
    return ctx;
};
