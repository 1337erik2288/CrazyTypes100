// Simple script to test the APIs used in the application
import axios from 'axios';

// Updated API endpoints
const ENGLISH_WORDS_API = 'https://api.datamuse.com/words?sp=?????&max=100';
const OPENRUSSIAN_API = 'https://api.datamuse.com/words?sp=?????&v=ru&max=100';

async function testEnglishAPI() {
  try {
    console.log('Testing English API...');
    const response = await axios.get(ENGLISH_WORDS_API, { timeout: 5000 });
    console.log('English API response:', response.data);
    
    // Process the response to show words
    if (response.data && Array.isArray(response.data)) {
      const words = response.data.map(item => item.word);
      console.log('Extracted English words:', words);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error testing English API:', error.message);
    return null;
  }
}

async function testRussianAPI() {
  try {
    console.log('Testing Russian API...');
    const response = await axios.get(OPENRUSSIAN_API, { timeout: 5000 });
    console.log('Russian API response:', response.data);
    
    // Process the response to show words
    if (response.data && Array.isArray(response.data)) {
      const words = response.data.map(item => item.word);
      console.log('Extracted Russian words:', words);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error testing Russian API:', error.message);
    return null;
  }
}

// Run tests
async function runTests() {
  await testEnglishAPI();
  console.log('-------------------');
  await testRussianAPI();
}

runTests();