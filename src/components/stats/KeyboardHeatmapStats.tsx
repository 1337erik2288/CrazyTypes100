// KeyboardHeatmapStats.tsx
import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import SimpleKeyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import './KeyboardHeatmapStats.css';

import { latinLayout as englishLayout, cyrillicLayout as russianLayout } from '../KeyboardPanel';

interface KeyboardHeatmapStatsProps {
  errorCharCounts: { [key: string]: number };
  selectedLayout: 'russian' | 'english';
  maxErrorsOverride?: number;
}

const KeyboardHeatmapStats: React.FC<KeyboardHeatmapStatsProps> = ({
  errorCharCounts,
  selectedLayout,
  maxErrorsOverride,
}) => {
  const keyboardInstanceRef = useRef<SimpleKeyboard | null>(null);
  const keyboardContainerRef = useRef<HTMLDivElement | null>(null);

  console.log('Данные для тепловой карты (errorCharCounts):', errorCharCounts);

  const maxErrors = useMemo(() => {
    if (maxErrorsOverride !== undefined) return maxErrorsOverride;
    const currentErrorCounts = errorCharCounts
      ? Object.values(errorCharCounts).filter((val) => typeof val === 'number') as number[]
      : [];
    if (currentErrorCounts.length === 0) return 0;
    const max = Math.max(...currentErrorCounts);
    return max > 0 ? max : 1;
  }, [errorCharCounts, maxErrorsOverride]);

  const getButtonThemeForKeyboard = useCallback(() => {
    const generateTheme = (charErrorCounts: { [key: string]: number }, maxVal: number) => {
      const buttonsConfig = [];

      for (const charKey in charErrorCounts) {
        if (charErrorCounts[charKey] > 0) {
          const errorCount = charErrorCounts[charKey];
          const intensityLevel = maxVal > 0 ? Math.min(10, Math.ceil((errorCount / maxVal) * 10)) : 0;
          buttonsConfig.push({
            class: `stats-khm-intensity-${intensityLevel}`, // Ensure this matches your CSS
            buttons: charKey.toLowerCase(),
            // Remove this line if you want CSS to handle all styling:
            // style: `background-color: ${backgroundColor} !important; color: ${textColor} !important;` 
          });
        }
      }

      return buttonsConfig;
    };

    if (errorCharCounts && Object.keys(errorCharCounts).length > 0 && maxErrors > 0) {
      return generateTheme(errorCharCounts, maxErrors);
    }

    return [];
  }, [errorCharCounts, maxErrors]);

  const currentLayoutObject = useMemo(() => {
    return selectedLayout === 'russian' ? russianLayout : englishLayout;
  }, [selectedLayout]);

  useEffect(() => {
    if (keyboardContainerRef.current && !keyboardInstanceRef.current) {
      const keyboard = new SimpleKeyboard(keyboardContainerRef.current, {
        layout: currentLayoutObject, // Changed: Pass currentLayoutObject directly
        // Removed: display: currentLayoutObject.display,
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
  }, [currentLayoutObject]);

  useEffect(() => {
    if (keyboardInstanceRef.current) {
      const newButtonTheme = getButtonThemeForKeyboard();
      keyboardInstanceRef.current.setOptions({
        layout: currentLayoutObject, // Changed: Pass currentLayoutObject directly
        // Removed: display: currentLayoutObject.display,
        buttonTheme: newButtonTheme,
      });
    }
  }, [errorCharCounts, currentLayoutObject, getButtonThemeForKeyboard]);

  return (
    <div className="keyboard-heatmap-stats-container">
      <div ref={keyboardContainerRef} className="simple-keyboard" />
      <div className="stats-khm-legend">
        <span className="stats-khm-legend-label-left">Меньше ошибок</span>
        <div className="stats-khm-legend-gradient"></div>
        <span className="stats-khm-legend-label-right">Больше ошибок</span>
      </div>
    </div>
  );
};

export default KeyboardHeatmapStats;