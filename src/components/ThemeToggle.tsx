"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

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

// Функция для получения начальной темы (работает только на клиенте)
function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";

  const savedTheme = window.localStorage.getItem("theme") as Theme | null;
  const savedAutoMode = window.localStorage.getItem("theme-auto");

  if (savedAutoMode === "false" && savedTheme) {
    // Ручной режим - используем сохраненную тему
    return savedTheme;
  }

  // Автоматический режим - определяем тему по времени суток
  return getThemeByTime();
}

export default function ThemeToggle() {
  // Используем lazy initialization для правильной инициализации на клиенте
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  // Применяем тему к DOM при монтировании и изменении
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);

    // Обновляем тему каждый час и при изменении даты
    const updateTheme = () => {
      const savedAutoMode = window.localStorage.getItem("theme-auto");
      if (savedAutoMode === "false") {
        return; // Не обновляем в ручном режиме
      }

      const newTheme = getThemeByTime();
      setTheme((currentTheme) => {
        if (newTheme !== currentTheme) {
          document.documentElement.setAttribute("data-theme", newTheme);
          return newTheme;
        }
        return currentTheme;
      });
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
  }, [theme]);

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("theme", nextTheme);
    window.localStorage.setItem("theme-auto", "false");
  }

  // Используем suppressHydrationWarning для предотвращения ошибок гидратации
  // На сервере всегда рендерится "light", на клиенте - правильная тема
  const displayTheme = theme;

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${displayTheme === "light" ? "dark" : "light"} theme`}
      title={`Current theme: ${displayTheme === "light" ? "Light" : "Dark"}. Click to toggle.`}
      suppressHydrationWarning
    >
      {displayTheme === "light" ? (
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
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>
      )}
    </button>
  );
}
