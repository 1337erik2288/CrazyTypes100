import axios from 'axios';

interface WordResponse {
  word: string;
  language: 'en' | 'ru';
}

const WORDS_API_KEY = import.meta.env.VITE_WORDS_API_KEY;
const WORDS_API_HOST = 'wordsapiv1.p.rapidapi.com';
const OPENRUSSIAN_API = 'https://openrussian.org/api/v1/words/random';

export async function fetchEnglishWords(count: number = 20): Promise<string[]> {
  try {
    const options = {
      method: 'GET',
      url: `https://${WORDS_API_HOST}/words/`,
      params: { random: 'true', limit: count },
      headers: {
        'X-RapidAPI-Key': WORDS_API_KEY,
        'X-RapidAPI-Host': WORDS_API_HOST
      }
    };

    const response = await axios.request(options);
    return response.data.map((item: any) => item.word)
      .filter((word: string) => word.length >= 4 && word.length <= 12
        && /^[a-zA-Z]+$/.test(word));
  } catch (error) {
    console.error('Error fetching English words:', error);
    return [];
  }
}

export async function fetchRussianWords(count: number = 20): Promise<string[]> {
  try {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      const response = await axios.get(OPENRUSSIAN_API);
      const word = response.data.word.toLowerCase();
      if (word.length >= 4 && word.length <= 12 && /^[а-яё]+$/i.test(word)) {
        words.push(word);
      }
    }
    return words;
  } catch (error) {
    console.error('Error fetching Russian words:', error);
    return [];
  }
}

import { ruWords } from '../data/ru-words';

export async function getAdditionalWords(language: string): Promise<string[]> {
  try {
    if (language === 'ru') {
      // Use local Russian words
      const shuffledWords = [...ruWords].sort(() => Math.random() - 0.5);
      return shuffledWords.slice(0, 10);
    } else {
      // For English words, continue using the API
      const response = await fetch('https://random-word-api.herokuapp.com/word?number=10&lang=en');
      const words = await response.json();
      return words;
    }
  } catch (error) {
    console.error('Error fetching words:', error);
    return [];
  }
}