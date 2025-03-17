import { codeLines } from '../data/code-lines';

interface CodeSnippet {
  code: string;
  language: string;
}



export const getCodeSnippets = async (language: string = 'javascript'): Promise<string[]> => {
  const availableLanguages = Object.keys(codeLines);
  const selectedLanguage = availableLanguages.includes(language) ? language : 'javascript';
  return codeLines[selectedLanguage];
}

export const getRandomCodeLine = async (language: string = 'javascript'): Promise<string> => {
  const lines = await getCodeSnippets(language);
  const randomIndex = Math.floor(Math.random() * lines.length);
  return lines[randomIndex];
}