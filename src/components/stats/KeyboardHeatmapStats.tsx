import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import SimpleKeyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import './KeyboardHeatmapStats.css';
// Импортируем раскладки из KeyboardPanel.tsx
import { latinLayout as englishLayout, cyrillicLayout as russianLayout } from '../KeyboardPanel'; 
// Используем OverallPlayerStats или убедитесь, что OverallCharStats экспортируется и имеет правильный тип
// import { OverallPlayerStats } from '../../services/overallStatsService'; // Больше не нужен весь объект

// Убедитесь, что тип для stats соответствует объекту { [char: string]: number }
// Если OverallPlayerStats имеет другую структуру, вам нужно будет адаптировать это
interface KeyboardHeatmapStatsProps {
  language: 'english' | 'russian';
  // stats: OverallPlayerStats; // <--- ИЗМЕНЕНО
  errorCharCounts: { [key: string]: number } | undefined; // <--- ИЗМЕНЕНО
  maxErrorsOverride?: number;
}

const KeyboardHeatmapStats: React.FC<KeyboardHeatmapStatsProps> = ({ language, errorCharCounts, maxErrorsOverride }) => {
  const keyboardContainerRef = useRef<HTMLDivElement>(null);
  const keyboardInstanceRef = useRef<SimpleKeyboard | null>(null);

  const selectedLayout = language === 'english' ? englishLayout : russianLayout;

  const maxErrors = useMemo(() => {
    if (maxErrorsOverride !== undefined) {
      return maxErrorsOverride;
    }
    // const errorCounts = stats && typeof stats === 'object' ? Object.values(stats).filter(val => typeof val === 'number') as number[] : []; // <--- ИЗМЕНЕНО
    const currentErrorCounts = errorCharCounts ? Object.values(errorCharCounts).filter(val => typeof val === 'number') as number[] : [];
    if (currentErrorCounts.length === 0) return 0; // Если ошибок нет, maxErrors = 0
    const max = Math.max(...currentErrorCounts);
    return max > 0 ? max : 1; // Если макс. ошибка 0, но ошибки есть, то 1 для предотвращения деления на 0
  }, [errorCharCounts, maxErrorsOverride]);

  const getButtonThemeForKeyboard = useCallback(() => {
    const buttonTheme = [];
    // if (stats && typeof stats === 'object' && Object.keys(stats).length > 0 && maxErrors > 0) { // <--- ИЗМЕНЕНО
    if (errorCharCounts && Object.keys(errorCharCounts).length > 0 && maxErrors > 0) { 
      // for (const char in stats) { // <--- ИЗМЕНЕНО
      for (const char in errorCharCounts) {
        // const errorCount = stats[char as keyof OverallPlayerStats]; // <--- ИЗМЕНЕНО
        const errorCount = errorCharCounts[char];
        if (typeof errorCount === 'number' && errorCount > 0) {
          // Интенсивность будет от 0 до 1. Если maxErrors = 0, то intensity будет NaN или Infinity, поэтому проверяем maxErrors > 0
          const intensity = Math.min(errorCount / maxErrors, 1);
          // const cssClass = `heatmap-intensity-${Math.round(intensity * 100)}`; // <--- ИЗМЕНЕНО
          // Группируем интенсивность в 10 шагов (0-9 или 1-10)
          // Например, 0-9%, 10-19%, ..., 90-100%
          // Math.floor(intensity * 10) даст значения от 0 до 9 для intensity < 1, и 10 для intensity = 1
          // Чтобы классы были от heatmap-intensity-0 до heatmap-intensity-10 (11 классов)
          // или heatmap-intensity-1 до heatmap-intensity-10 (10 классов)
          // Давайте сделаем 10 классов, где 10 - максимальная интенсивность.
          // Если intensity = 0, класс будет heatmap-intensity-0
          // Если intensity > 0 и <= 0.1, класс будет heatmap-intensity-1
          // ...
          // Если intensity > 0.9 и <= 1, класс будет heatmap-intensity-10
          let intensityLevel = Math.ceil(intensity * 10); // от 1 до 10
          if (errorCount === 0) intensityLevel = 0; // для явного нуля
          else if (intensityLevel === 0 && errorCount > 0) intensityLevel = 1; // если очень мало ошибок, но не ноль
          
          const cssClass = `stats-khm-intensity-${intensityLevel}`; // Используем новый CSS класс

          buttonTheme.push({
            class: cssClass,
            buttons: char === ' ' ? '{space}' : char,
          });
        }
      }
    }
    // Этот класс можно оставить для общего стиля кнопок, если нужно
    // buttonTheme.push({
    //   class: 'hg-button-heatmap',
    //   buttons: selectedLayout.default.join(' ') + ' ' + selectedLayout.shift.join(' ') 
    // });
    return buttonTheme;
  }, [errorCharCounts, maxErrors, selectedLayout]); // Changed 'stats' to 'errorCharCounts'

  useEffect(() => {
    if (keyboardContainerRef.current && !keyboardInstanceRef.current) {
      const keyboard = new SimpleKeyboard(keyboardContainerRef.current, {
        layout: selectedLayout, // Используется selectedLayout
        // display: selectedLayout.display, // Removed: display is not part of selectedLayout's type
        theme: 'hg-theme-default hg-layout-default keyboard-heatmap-stats-theme',
        physicalKeyboardHighlight: false,
        preventMouseDownDefault: true,
        disableButtonHold: true,
      });
      keyboardInstanceRef.current = keyboard;
    }

    return () => {
      if (keyboardInstanceRef.current) {
        keyboardInstanceRef.current.destroy();
        keyboardInstanceRef.current = null;
      }
    };
  // ВАЖНО: selectedLayout должен быть в зависимостях, чтобы клавиатура пересоздавалась при смене языка
  }, [selectedLayout]); 

  useEffect(() => {
    if (keyboardInstanceRef.current) {
      const newButtonTheme = getButtonThemeForKeyboard();
      keyboardInstanceRef.current.setOptions({
        layout: selectedLayout, // Используется selectedLayout
        buttonTheme: newButtonTheme,
      });
    }
  // ВАЖНО: selectedLayout и language должны быть в зависимостях
  }, [errorCharCounts, language, selectedLayout, getButtonThemeForKeyboard]); // <--- ИЗМЕНЕНО stats на errorCharCounts

  return (
    <div className="keyboard-heatmap-stats-container">
      <div ref={keyboardContainerRef} className="simple-keyboard" />
      <div className="heatmap-legend">
        <span>Меньше ошибок</span>
        <div className="gradient-bar"></div>
        <span>Больше ошибок</span>
      </div>
    </div>
  );
};

export default KeyboardHeatmapStats;