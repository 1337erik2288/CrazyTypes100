import axios from 'axios';

// Updated Russian API URL - using a more reliable endpoint with pre-fetching
const OPENRUSSIAN_API = 'https://api.datamuse.com/words?sp=?????&v=ru&max=100';

// Updated English API URL - using pattern to get diverse words
const ENGLISH_WORDS_API = 'https://api.datamuse.com/words?sp=?????&max=100';

// Cache for English words to reduce API calls and improve response time
let englishWordsCache: string[] = [];

export async function fetchEnglishWords(count: number = 20): Promise<string[]> {
  // If we have enough words in the cache, use them
  if (englishWordsCache.length >= count) {
    console.log(`Using ${count} English words from cache (${englishWordsCache.length} words available)`);
    const result = englishWordsCache.slice(0, count);
    // Remove used words from cache
    englishWordsCache = englishWordsCache.slice(count);
    return result;
  }

  // Try up to 3 times to get words from API
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`Attempting to fetch English words from API (attempt ${attempt + 1}/3)`);
      const response = await axios.get(ENGLISH_WORDS_API, { timeout: 5000 }); // Reduced timeout for faster response
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} words from English API`);
        
        // Extract words from response (Datamuse API returns array of objects with 'word' property)
        const filteredWords = response.data
          .map((item: any) => item.word)
          .filter((word: string) => word.length >= 4 && word.length <= 12 && /^[a-zA-Z]+$/.test(word));
        
        console.log(`After filtering: ${filteredWords.length} valid English words`);
        
        // Ensure we have words with different starting letters
        const diverseWords = ensureDiverseWords(filteredWords);
        console.log(`After ensuring diversity: ${diverseWords.length} diverse English words`);
        
        // Add all words to cache
        englishWordsCache = [...englishWordsCache, ...diverseWords];
        
        if (englishWordsCache.length >= count) {
          const result = englishWordsCache.slice(0, count);
          // Remove used words from cache
          englishWordsCache = englishWordsCache.slice(count);
          return result;
        }
        
        // If we don't have enough words, try to get more in the next attempt
        console.log(`Not enough valid English words (${englishWordsCache.length}/${count}), trying again...`);
      } else {
        console.error('Invalid response format from English API:', response.data);
      }
    } catch (error) {
      console.error(`Error fetching English words from API (attempt ${attempt + 1}/3):`, error);
    }
    
    // Wait a bit before retrying, but less time to reduce delay
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Falling back to local English dictionary after failed API attempts');
  // Fallback to local dictionary after all attempts failed
  // Заменяем enWords на enSimpleWords
  const shuffledWords = [...enSimpleWords].sort(() => Math.random() - 0.5)
    .filter((word: string) => word.length >= 4 && word.length <= 12 && /^[a-zA-Z]+$/.test(word));
  
  // Ensure we have words with different starting letters
  const diverseLocalWords = ensureDiverseWords(shuffledWords);
  
  // Add some words to cache for future use
  if (diverseLocalWords.length > count) {
    englishWordsCache = [...englishWordsCache, ...diverseLocalWords.slice(count, count + 20)];
  }
  
  return diverseLocalWords.slice(0, count);
}

// Helper function to ensure words have different starting letters
function ensureDiverseWords(words: string[]): string[] {
  const letterGroups: {[key: string]: string[]} = {};
  
  // Group words by their first letter
  words.forEach(word => {
    const firstLetter = word.charAt(0).toLowerCase();
    if (!letterGroups[firstLetter]) {
      letterGroups[firstLetter] = [];
    }
    letterGroups[firstLetter].push(word);
  });
  
  // Take one word from each letter group in rotation until we have enough
  const result: string[] = [];
  const letters = Object.keys(letterGroups).sort();
  
  let index = 0;
  while (result.length < words.length && letters.length > 0) {
    const letter = letters[index % letters.length];
    const group = letterGroups[letter];
    
    if (group.length > 0) {
      result.push(group.shift()!);
    } else {
      // Remove this letter from rotation if no more words
      letters.splice(index % letters.length, 1);
      if (letters.length === 0) break;
      continue; // Don't increment index if we removed a letter
    }
    
    index++;
  }
  
  return result;
}

// Cache for Russian words to reduce API calls and improve response time
let russianWordsCache: string[] = [];

export async function fetchRussianWords(count: number = 20): Promise<string[]> {
  // If we have enough words in the cache, use them
  if (russianWordsCache.length >= count) {
    console.log(`Using ${count} Russian words from cache (${russianWordsCache.length} words available)`);
    const result = russianWordsCache.slice(0, count);
    // Remove used words from cache
    russianWordsCache = russianWordsCache.slice(count);
    return result;
  }

  // Try up to 3 times to get words from API
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`Attempting to fetch Russian words from API (attempt ${attempt + 1}/3)`);
      const response = await axios.get(OPENRUSSIAN_API, { timeout: 5000 }); // Reduced timeout for faster response
      
      if (response.data && Array.isArray(response.data)) {
        console.log(`Received ${response.data.length} words from Russian API`);
        
        // Extract words from response (Datamuse API returns array of objects with 'word' property)
        const words = response.data
          .map((item: any) => item.word)
          .filter((word: string) => word.length >= 4 && word.length <= 12 && /^[а-яё]+$/i.test(word));
        
        console.log(`After filtering: ${words.length} valid Russian words`);
        
        // Add all words to cache
        russianWordsCache = [...russianWordsCache, ...words];
        
        if (russianWordsCache.length >= count) {
          const result = russianWordsCache.slice(0, count);
          // Remove used words from cache
          russianWordsCache = russianWordsCache.slice(count);
          return result;
        }
        
        // If we don't have enough words, try to get more in the next attempt
        console.log(`Not enough valid Russian words (${russianWordsCache.length}/${count}), trying again...`);
      } else {
        console.error('Invalid response format from Russian API:', response.data);
      }
    } catch (error) {
      console.error(`Error fetching Russian words from API (attempt ${attempt + 1}/3):`, error);
    }
    
    // Wait a bit before retrying, but less time to reduce delay
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('Falling back to local Russian dictionary after failed API attempts');
  // Fallback to local dictionary after all attempts failed
  const shuffledWords = [...ruWords].sort(() => Math.random() - 0.5)
    .filter((word: string) => word.length >= 4 && word.length <= 12 && /^[а-яё]+$/i.test(word));
  
  // Add some words to cache for future use
  if (shuffledWords.length > count) {
    russianWordsCache = [...russianWordsCache, ...shuffledWords.slice(count, count + 20)];
  }
  
  return shuffledWords.slice(0, count);
}

// Заменяем импорт enWords на импорты новых массивов
import { enLetterCombinations, enSimpleWords, enComplexWordsAndPhrases } from '../data/en-words'; 
import { ruWords, ruLetters, ruSimpleWords, ruComplexWordsAndPhrases } from '../data/ru-words'; // Добавил также русские для полноты, если они понадобятся в подобной структуре

// Обновляем структуру allWords
// Вам нужно будет решить, как мапить ContentType на эти категории
const allWords: { [key: string]: { [key: string]: string[] } } = {
  en: {
    // Пример: используем enSimpleWords для категории 'keyboard-training'
    // Вам нужно будет добавить другие категории и связать их с ContentType
    'keyboard-training': enSimpleWords, 
    'letter-combinations': enLetterCombinations,
    'simple-words': enSimpleWords,
    'complex-words': enComplexWordsAndPhrases,
    // ... другие категории для английского языка
  },
  ru: {
    'keyboard-training': ruSimpleWords, // Пример для русских слов
    'letter-combinations': ruLetters,
    'simple-words': ruSimpleWords,
    'complex-words': ruComplexWordsAndPhrases,
    // ... другие категории для русского языка
  }
};

export const getWordsByLanguage = async (language: 'en' | 'ru', category: string): Promise<string[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const langWords = allWords[language] && allWords[language][category];
      if (langWords) {
        // Shuffle or select a subset as needed
        resolve([...langWords].sort(() => 0.5 - Math.random()).slice(0, 50)); // Example: shuffle and take 50
      } else {
        resolve([]); // Or reject with an error
      }
    }, 200);
  });
};

// If you adapt getAdditionalWords, it might look something like this:
// export const getAdditionalWords = async (category: string, language: 'en' | 'ru' = 'en'): Promise<string[]> => {
//   // ... logic to select words based on category and language ...
//   let sourceWords: string[] = [];
//   if (language === 'en') {
//     sourceWords = enWords; // Or specific category words for English
//   } else if (language === 'ru') {
//     sourceWords = ruWords; // Or specific category words for Russian
//   }
  
//   // Your existing logic to shuffle/select words
//   const shuffled = [...sourceWords].sort(() => 0.5 - Math.random());
//   return Promise.resolve(shuffled.slice(0, 20)); // Example: return 20 random words
// };
import { keyComboWords } from '../data/key-combos';
import { simpleWords } from '../data/simple-words';
import { phrasesWords } from '../data/phrases-words';
import { mathExpressions } from '../data/math-expressions';
import { textParagraphs } from '../data/text-paragraphs';
import { mixedChallenges } from '../data/mixed-challenges';
// import { enChallenges } from '../data/en-challenges'; // Removed unused import

import { ContentType } from '../types';

export async function getAdditionalWords(contentType: ContentType): Promise<string[]> {
  try {
    console.log(`Getting additional words for contentType: ${contentType}`);

    switch (contentType) {
      case ContentType.KeyCombos:
        return Promise.resolve(keyComboWords.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.SimpleWords:
        return Promise.resolve(simpleWords.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.Phrases:
        const useWords = Math.random() > 0.5;
        if (useWords) {
          return Promise.resolve(phrasesWords.words.sort(() => Math.random() - 0.5).slice(0, 10));
        } else {
          return Promise.resolve(phrasesWords.phrases.sort(() => Math.random() - 0.5).slice(0, 10));
        }
      case ContentType.Math:
        const useNumbers = Math.random() > 0.5;
        if (useNumbers) {
          return Promise.resolve(mathExpressions.numbers.sort(() => Math.random() - 0.5).slice(0, 10));
        } else {
          const shuffledExpressions = [...mathExpressions.expressions].sort(() => Math.random() - 0.5).slice(0, 10);
          return Promise.resolve(shuffledExpressions.map(expr => expr.answer));
        }
      case ContentType.Paragraphs:
        return Promise.resolve(textParagraphs.sort(() => Math.random() - 0.5).slice(0, 3));
      case ContentType.Mixed:
        const contentTypes = ['code', 'complexWords', 'mathExpressions', 'paragraphs'];
        const randomType = contentTypes[Math.floor(Math.random() * contentTypes.length)];
        return Promise.resolve(mixedChallenges[randomType as keyof typeof mixedChallenges].sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.RussianLetterCombinations:
        return Promise.resolve(ruLetters.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.RussianSimpleWords:
        return Promise.resolve(ruSimpleWords.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.RussianComplexWords:
        return Promise.resolve(ruComplexWordsAndPhrases.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.EnglishLetterCombinations: // Added case
        return Promise.resolve(enLetterCombinations.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.EnglishSimpleWords: // Added case
        return Promise.resolve(enSimpleWords.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.EnglishComplexWords: // Added case
        return Promise.resolve(enComplexWordsAndPhrases.sort(() => Math.random() - 0.5).slice(0, 10));
      case ContentType.RUSSIAN_TRACK:
        // Логика для общего русского трека, возможно, с использованием API или смешанных источников
        try {
          console.log('Attempting to fetch Russian words from API');
          const apiWords = await fetchRussianWords(10);
          console.log(`Fetched ${apiWords.length} Russian words from API`);
          return apiWords;
        } catch (apiError) {
          console.error('Error fetching Russian words from API, falling back to local dictionary:', apiError);
          const shuffledWords = [...ruWords].sort(() => Math.random() - 0.5);
          return shuffledWords.slice(0, 10);
        }
      case ContentType.ENGLISH_TRACK:
        // Логика для общего английского трека
        try {
          console.log('Attempting to fetch English words from API');
          const apiWords = await fetchEnglishWords(10);
          console.log(`Fetched ${apiWords.length} English words from API`);
          return apiWords;
        } catch (apiError) {
          console.error('Error fetching English words from API, falling back to local dictionary:', apiError);
          // Заменяем enWords на enSimpleWords
          const shuffledWords = [...enSimpleWords].sort(() => Math.random() - 0.5);
          return shuffledWords.slice(0, 10);
        }
      // Добавьте другие ContentType по мере необходимости
      default:
        console.warn(`Unknown contentType: ${contentType}. Falling back to default English simple words.`);
        // Заменяем enWords на enSimpleWords
        return Promise.resolve(enSimpleWords.sort(() => Math.random() - 0.5).slice(0, 10));
    }
  } catch (error) {
    console.error('Error in getAdditionalWords:', error);
    // Ultimate fallback to a generic set of words in case of any error
    // Заменяем enWords на enSimpleWords
    return Promise.resolve(enSimpleWords.sort(() => Math.random() - 0.5).slice(0, 10));
  }
}