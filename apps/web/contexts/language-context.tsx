"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "pt-BR" | "en" | "es";

type Dict = Record<string, string>;

const dictionaries: Record<Language, Dict> = {
    "pt-BR": {
        "nav.courses": "Conteúdos",
        "nav.trails": "Trilhas",
        "nav.profile": "Meu Perfil",
        "nav.main": "Principal",
        "nav.lightMode": "Modo Claro",
        "nav.darkMode": "Modo Escuro",
        "nav.logout": "Sair da Conta",
        "nav.studentPortal": "Portal do Aluno",
        "nav.hello": "Olá, {name}",
        "profile.settingsTitle": "Configurações da Conta",
        "profile.preferencesTitle": "Preferências",
        "profile.preferencesDesc": "Idioma e tema da plataforma.",
        "profile.language": "IDIOMA",
        "profile.darkMode": "Modo Noturno",
        "profile.enableDarkMode": "Ativar modo noturno",
        "profile.disableDarkMode": "Desativar modo noturno",
        "profile.securityDesc": "Alterar senha e proteger o acesso da conta.",
        "profile.currentPassword": "SENHA ATUAL",
        "profile.newPassword": "NOVA SENHA",
        "profile.passwordMin": "Mínimo 8 caracteres",
        "profile.twoFactor": "Autenticação em 2 fatores",
        "profile.twoFactorDesc": "Exige uma verificação extra no login.",
        "profile.notificationsTitle": "Notificações",
        "profile.notificationsDesc": "Alertas e e-mails da sua conta.",
        "profile.personalData": "Dados Pessoais",
        "profile.saveChanges": "Salvar Alterações",
        "trails.journey": "Sua Jornada",
        "trails.title": "Trilhas de Aprendizado",
        "trails.subtitle": "Caminhos guiados passo a passo para você atingir seus objetivos mais rápido. Escolha uma trilha e comece sua evolução.",
        "trails.emptyTitle": "Nenhuma trilha encontrada",
        "trails.emptyDesc": "Novas trilhas serão publicadas em breve pela nossa equipe de criadores.",
        "trails.exploreCatalog": "Explorar conteúdos",
        "trails.coursesCount": "{count} Cursos",
        "trails.progress": "Progresso",
    },
    en: {
        "nav.courses": "Content",
        "nav.trails": "Trails",
        "nav.profile": "My Profile",
        "nav.main": "Main",
        "nav.lightMode": "Light Mode",
        "nav.darkMode": "Dark Mode",
        "nav.logout": "Sign Out",
        "nav.studentPortal": "Student Portal",
        "nav.hello": "Hi, {name}",
        "profile.settingsTitle": "Account Settings",
        "profile.preferencesTitle": "Preferences",
        "profile.preferencesDesc": "Platform language and theme.",
        "profile.language": "LANGUAGE",
        "profile.darkMode": "Dark Mode",
        "profile.enableDarkMode": "Turn on dark mode",
        "profile.disableDarkMode": "Turn off dark mode",
        "profile.securityDesc": "Change password and protect account access.",
        "profile.currentPassword": "CURRENT PASSWORD",
        "profile.newPassword": "NEW PASSWORD",
        "profile.passwordMin": "Minimum 8 characters",
        "profile.twoFactor": "Two-factor authentication",
        "profile.twoFactorDesc": "Requires an extra check at sign in.",
        "profile.notificationsTitle": "Notifications",
        "profile.notificationsDesc": "Account alerts and emails.",
        "profile.personalData": "Personal Data",
        "profile.saveChanges": "Save Changes",
        "trails.journey": "Your Journey",
        "trails.title": "Learning Trails",
        "trails.subtitle": "Step-by-step guided paths to reach your goals faster. Pick a trail and start evolving.",
        "trails.emptyTitle": "No trails found",
        "trails.emptyDesc": "New trails will be published soon by our creator team.",
        "trails.exploreCatalog": "Browse Course Catalog",
        "trails.coursesCount": "{count} Courses",
        "trails.progress": "Progress",
    },
    es: {
        "nav.courses": "Contenidos",
        "nav.trails": "Rutas",
        "nav.profile": "Mi Perfil",
        "nav.main": "Principal",
        "nav.lightMode": "Modo Claro",
        "nav.darkMode": "Modo Oscuro",
        "nav.logout": "Cerrar sesión",
        "nav.studentPortal": "Portal del Alumno",
        "nav.hello": "Hola, {name}",
        "profile.settingsTitle": "Configuración de la Cuenta",
        "profile.preferencesTitle": "Preferencias",
        "profile.preferencesDesc": "Idioma y tema de la plataforma.",
        "profile.language": "IDIOMA",
        "profile.darkMode": "Modo Oscuro",
        "profile.enableDarkMode": "Activar modo oscuro",
        "profile.disableDarkMode": "Desactivar modo oscuro",
        "profile.securityDesc": "Cambiar contraseña y proteger el acceso de la cuenta.",
        "profile.currentPassword": "CONTRASEÑA ACTUAL",
        "profile.newPassword": "NUEVA CONTRASEÑA",
        "profile.passwordMin": "Mínimo 8 caracteres",
        "profile.twoFactor": "Autenticación en 2 pasos",
        "profile.twoFactorDesc": "Requiere una verificación extra al iniciar sesión.",
        "profile.notificationsTitle": "Notificaciones",
        "profile.notificationsDesc": "Alertas y correos de tu cuenta.",
        "profile.personalData": "Datos Personales",
        "profile.saveChanges": "Guardar Cambios",
        "trails.journey": "Tu Ruta",
        "trails.title": "Rutas de Aprendizaje",
        "trails.subtitle": "Caminos guiados paso a paso para lograr tus objetivos más rápido. Elige una ruta y comienza tu evolución.",
        "trails.emptyTitle": "No se encontraron rutas",
        "trails.emptyDesc": "Nuevas rutas se publicarán pronto por nuestro equipo de creadores.",
        "trails.exploreCatalog": "Explorar Catálogo de Cursos",
        "trails.coursesCount": "{count} Cursos",
        "trails.progress": "Progreso",
    },
};

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = "app_language";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>("pt-BR");

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
        if (stored === "pt-BR" || stored === "en" || stored === "es") {
            setLanguageState(stored);
        }
    }, []);

    const setLanguage = (next: Language) => {
        setLanguageState(next);
        localStorage.setItem(STORAGE_KEY, next);
    };

    const t = (key: string, vars?: Record<string, string | number>) => {
        const raw = dictionaries[language][key] ?? dictionaries["pt-BR"][key] ?? key;
        if (!vars) return raw;
        return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`{${k}}`, String(v)), raw);
    };

    const value = useMemo(() => ({ language, setLanguage, t }), [language]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
    return ctx;
}
