import { codeLines } from '../data/code-lines';

interface CodeCache {
  lastIndex: number;
  usedIndexes: Set<number>;
}

const codeCache: { [key: string]: CodeCache } = {};

export const getCodeSnippets = (language: string = 'javascript'): Promise<string[]> => {
  return Promise.resolve(codeLines[language as keyof typeof codeLines] || []);
};

export const getRandomCodeLine = async (language: string = 'javascript'): Promise<string> => {
  const lines = await getCodeSnippets(language);
  if (lines.length === 0) {
    return Promise.resolve('console.log("Hello, World!");');
  }

  if (!codeCache[language]) {
    codeCache[language] = {
      lastIndex: -1,
      usedIndexes: new Set()
    };
  }

  const cache = codeCache[language];
  let randomIndex;

  // Если все индексы использованы, сбрасываем кэш
  if (cache.usedIndexes.size >= lines.length) {
    cache.usedIndexes.clear();
  }

  // Выбираем случайный индекс, который еще не использовался
  do {
    randomIndex = Math.floor(Math.random() * lines.length);
  } while (cache.usedIndexes.has(randomIndex));

  cache.lastIndex = randomIndex;
  cache.usedIndexes.add(randomIndex);

  return lines[randomIndex];
}