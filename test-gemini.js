const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = 'AIzaSyCN25Uyr_vuH3s_BEsLbHzX0qSPAkRRFYg';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGemini() {
  try {
    console.log('Testing Gemini API with gemini-2.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent('Write a short sentence about science fairs.');
    const response = await result.response;
    const text = response.text();

    console.log('Success! Response:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

testGemini();
