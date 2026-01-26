"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";
type ThemeMode = "light" | "dark" | "auto";

// Функция для определения времени восхода и захода солнца (упрощенная версия)
function getSunriseSunset(): { sunrise: number; sunset: number } {
  // Примерные значения: восход в 6:00, заход в 20:00
  // Можно улучшить, используя API для определения точного времени на основе геолокации
  return {
    sunrise: 6,
    sunset: 20,
  };
}

// Функция для определения темы на основе времени суток
function getThemeByTime(): Theme {
  const now = new Date();
  const hours = now.getHours();
  const { sunrise, sunset } = getSunriseSunset();

  // Темная тема до восхода и после захода солнца
  if (hours < sunrise || hours >= sunset) {
    return "dark";
  }
  return "light";
}

// Функция для получения начального режима темы (работает только на клиенте)
function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "auto";

  const savedThemeMode = window.localStorage.getItem("theme-mode") as ThemeMode | null;
  
  if (savedThemeMode && (savedThemeMode === "light" || savedThemeMode === "dark" || savedThemeMode === "auto")) {
    return savedThemeMode;
  }

  // По умолчанию - автоматический режим
  return "auto";
}

// Функция для получения фактической темы на основе режима
function getEffectiveTheme(mode: ThemeMode): Theme {
  if (mode === "auto") {
    return getThemeByTime();
  }
  return mode;
}

export default function ThemeToggle() {
  // На сервере всегда "auto", на клиенте обновим после монтирования
  const [themeMode, setThemeMode] = useState<ThemeMode>("auto");
  const [mounted, setMounted] = useState(false);

  // Инициализируем режим темы на клиенте после монтирования
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const initialMode = getInitialThemeMode();
    setThemeMode(initialMode);
    const effectiveTheme = getEffectiveTheme(initialMode);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
  }, []);

  // Применяем тему к DOM при изменении
  useEffect(() => {
    if (!mounted) return;

    const effectiveTheme = getEffectiveTheme(themeMode);
    document.documentElement.setAttribute("data-theme", effectiveTheme);

    // Обновляем тему только в автоматическом режиме
    if (themeMode !== "auto") {
      return; // Не обновляем в ручном режиме
    }

    // Обновляем тему каждый час и при изменении даты
    const updateTheme = () => {
      const newTheme = getThemeByTime();
      const currentEffectiveTheme = getEffectiveTheme(themeMode);
      
      if (newTheme !== currentEffectiveTheme) {
        document.documentElement.setAttribute("data-theme", newTheme);
      }
    };

    const interval = setInterval(updateTheme, 3600000); // Проверка каждый час

    // Также проверяем при изменении даты (переход через полночь)
    const checkDateChange = setInterval(() => {
      updateTheme();
    }, 60000); // Проверка каждую минуту для точности

    return () => {
      clearInterval(interval);
      clearInterval(checkDateChange);
    };
  }, [themeMode, mounted]);

  function toggleTheme() {
    // Переключение: light -> dark -> auto -> light
    const nextMode: ThemeMode = 
      themeMode === "light" ? "dark" : 
      themeMode === "dark" ? "auto" : 
      "light";
    
    setThemeMode(nextMode);
    const effectiveTheme = getEffectiveTheme(nextMode);
    document.documentElement.setAttribute("data-theme", effectiveTheme);
    window.localStorage.setItem("theme-mode", nextMode);
  }

  // Используем suppressHydrationWarning для предотвращения ошибок гидратации
  // На сервере всегда рендерится "auto", на клиенте - правильный режим
  const displayMode = themeMode;
  const effectiveTheme = getEffectiveTheme(themeMode);

  const getAriaLabel = () => {
    if (displayMode === "light") return "Switch to dark theme";
    if (displayMode === "dark") return "Switch to auto theme";
    return "Switch to light theme";
  };

  const getTitle = () => {
    if (displayMode === "light") return "Current: Light. Click to switch to Dark.";
    if (displayMode === "dark") return "Current: Dark. Click to switch to Auto.";
    return `Current: Auto (${effectiveTheme === "light" ? "Light" : "Dark"} based on time). Click to switch to Light.`;
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
      aria-label={getAriaLabel()}
      title={getTitle()}
      suppressHydrationWarning
    >
      {displayMode === "light" ? (
        <svg
          className="theme-toggle__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        >
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>
      ) : displayMode === "dark" ? (
        <svg
          className="theme-toggle__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      ) : (
        <svg
          className="theme-toggle__icon"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          suppressHydrationWarning
        >
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )}
    </button>
  );
}
