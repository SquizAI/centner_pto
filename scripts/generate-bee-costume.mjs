import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ Error: GEMINI_API_KEY environment variable is not set');
  process.exit(1);
}

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

async function generateBeeImage() {
  const prompt = "A cute, friendly cartoon bumblebee mascot wearing a festive costume. The bee should have a joyful, welcoming expression with big friendly eyes. Wearing colorful party clothes or celebration attire. Vibrant colors including yellow, black, blue, purple, and orange. Whimsical, playful style suitable for a school mascot. Transparent or white background. High quality, professional illustration style.";

  console.log('Generating bee in costume image with Gemini...');

  const requestBody = {
    contents: [{
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      response_modalities: ['image']
    }
  };

  const response = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error('No images generated');
  }

  // Get the base64 image data from response
  const imageData = data.candidates[0].content.parts[0].inlineData.data;

  // Convert base64 to buffer and save
  const buffer = Buffer.from(imageData, 'base64');
  const outputPath = path.join(__dirname, '../public/bee-costume.png');

  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Bee costume image saved to: ${outputPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateBeeImage().catch(console.error);
