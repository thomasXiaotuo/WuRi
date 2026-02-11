import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { zh, en, Translation } from '../i18n/locales';

type Language = 'zh' | 'en';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: Translation; // 当前语言的翻译对象
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'daily-calendar-language';

export function LanguageProvider({ children }: { children: ReactNode }) {
    // 默认语言逻辑：如果您想检测浏览器默认语言，可以使用 navigator.language
    // 这里默认为 'zh'，但优先读取本地存储
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'zh') return stored;
        return 'zh'; // 默认中文
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    const t = language === 'zh' ? zh : en;

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
