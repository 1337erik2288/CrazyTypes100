import React, { useEffect, useRef } from 'react';
import Keyboard from 'simple-keyboard';
import 'simple-keyboard/build/css/index.css';
import './KeyboardPanel.css';
import FingerLegend from "./FingerLegend";

export interface KeyboardPanelProps { // Add export here
  input: string;
  layoutType: 'latin' | 'cyrillic';
  onInputChange?: (input: string) => void;
  highlightKey?: string | null;
}

// Определение атрибутов для слепой печати (аналогично TrainingRoom.tsx)
const keyboardButtonAttributes = [
  { attribute: 'data-finger', value: 'pinky-left', buttons: '` 1 q a z ё ۱ й ф я {tab} {lock} {shiftleft} {controlleft}' },
  { attribute: 'data-finger', value: 'ring-left', buttons: '2 w s x ۲ ц ы ч' },
  { attribute: 'data-finger', value: 'middle-left', buttons: '3 e d c ۳ у в с' },
  { attribute: 'data-finger', value: 'index-left', buttons: '4 r f v 5 t g b ۴ к а м ۵ е п и ۶ н р т' }, 
  { attribute: 'data-finger', value: 'index-right', buttons: '6 y h n 7 u j m ۶ о г ь ۷' }, 
  { attribute: 'data-finger', value: 'middle-right', buttons: '8 i k , ۸ ш л б' }, 
  { attribute: 'data-finger', value: 'ring-right', buttons: '9 o l . ۹ ж з д щ ю' }, // Точка '.' добавлена сюда для английской раскладки (розовый)
  { attribute: 'data-finger', value: 'pinky-right', buttons: '0 p ; / - = \\ [ ] \' ۰ х э з ж э ъ . {bksp} {enter} {shiftright} {altright} {controlright}' }, // Точка '.' уже здесь для русской раскладки (желтый)
  { attribute: 'data-finger', value: 'thumb', buttons: '{space} {altleft}' },
];

const latinLayout = {
  default: [
    '` 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} q w e r t y u i o p [ ] \\',
    '{lock} a s d f g h j k l ; \' {enter}',
    '{shiftleft} z x c v b n m , . / {shiftright}',
    '{controlleft} {altleft} {space} {altright} {controlright}'
  ],
  shift: [
    '~ ! @ # $ % ^ & * ( ) _ + {bksp}',
    '{tab} Q W E R T Y U I O P { } |',
    '{lock} A S D F G H J K L : " {enter}',
    '{shiftleft} Z X C V B N M < > ? {shiftright}',
    '{controlleft} {altleft} {space} {altright} {controlright}'
  ]
};

const cyrillicLayout = {
  default: [
    '\u0451 1 2 3 4 5 6 7 8 9 0 - = {bksp}',
    '{tab} й ц у к е н г ш щ з х ъ \\',
    '{lock} ф ы в а п р о л д ж э {enter}',
    '{shiftleft} я ч с м и т ь б ю . {shiftright}',
    '{controlleft} {altleft} {space} {altright} {controlright}'
  ],
  shift: [
    'Ё ! " № ; % : ? * ( ) _ + {bksp}',
    '{tab} Й Ц У К Е Н Г Ш Щ З Х Ъ /',
    '{lock} Ф Ы В А П Р О Л Д Ж Э {enter}',
    '{shiftleft} Я Ч С М И Т Ь Б Ю , {shiftright}',
    '{controlleft} {altleft} {space} {altright} {controlright}'
  ]
};

const KeyboardPanel: React.FC<KeyboardPanelProps> = ({ input, layoutType, highlightKey }) => {
  const keyboardRef = useRef<Keyboard | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevHighlightedKey = useRef<string | null>(null);

  useEffect(() => {
    if (containerRef.current && !keyboardRef.current) {
      keyboardRef.current = new Keyboard(containerRef.current, {
        layout: layoutType === 'latin' ? latinLayout : cyrillicLayout,
        theme: 'hg-theme-default',
        buttonAttributes: keyboardButtonAttributes,
        // Remove or comment out onChange to disable input
        // onChange: onInputChange,
        debug: false,
        // Prevent key presses from updating input
        onKeyPress: () => {},
      });
    }
    return () => {
      keyboardRef.current?.destroy();
      keyboardRef.current = null;
    };
  }, [layoutType]); // Remove onInputChange from deps

  useEffect(() => {
    if (keyboardRef.current && input !== undefined) {
      keyboardRef.current.setInput(input);
    }
  }, [input]);

  useEffect(() => {
    if (keyboardRef.current) {
      // Remove highlight from previous key
      if (prevHighlightedKey.current) {
        const prevBtn = keyboardRef.current.getButtonElement(prevHighlightedKey.current);
        if (prevBtn && 'classList' in prevBtn) {
          (prevBtn as HTMLElement).classList.remove('highlighted-key');
        }
      }
      // Add highlight to the new key
      if (highlightKey) {
        const btn = keyboardRef.current.getButtonElement(highlightKey);
        if (btn && 'classList' in btn) {
          (btn as HTMLElement).classList.add('highlighted-key');
        }
        prevHighlightedKey.current = highlightKey;
      } else {
        prevHighlightedKey.current = null;
      }
    }
  }, [highlightKey]);

  return <div className="keyboard-panel-container" ref={containerRef} />;
};


export default KeyboardPanel;