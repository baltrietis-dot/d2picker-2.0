import { useState, type ReactNode } from 'react';
import { translations, type Language, type TranslationKey } from '../i18n/translations';
import { LanguageContext, type Translate } from './languageContextCore';

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

    const t: Translate = <K extends TranslationKey>(key: K) => (
        translations[language][key] as (typeof translations.en)[K]
    );

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
