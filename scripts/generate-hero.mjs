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

async function generateHeroImage() {
  const prompt = "A vibrant, modern educational scene showcasing diverse students ages 5-18 (kindergarten through high school) engaged in entrepreneurial and innovative learning activities at a contemporary academy. In the foreground: older students presenting a startup project on a tablet to younger students, middle schoolers collaborating on a design thinking challenge, high schoolers mentoring elementary kids. Background: bright, open learning spaces with natural light, students doing yoga or active movement, others working on sustainable projects, technology integration. The scene conveys innovation, health consciousness, community, and entrepreneurial spirit. Modern realistic photography style with shallow depth of field. Warm natural lighting. Color palette includes vibrant blues, purples, pinks, and oranges that feel energetic and welcoming. Professional, aspirational atmosphere that represents holistic education, wellness, leadership, and real-world learning. Wide horizontal composition, 16:9 aspect ratio. NO text or words in image.";

  console.log('Generating hero image with Gemini...');

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
  const outputPath = path.join(__dirname, '../public/hero-image.png');

  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Hero image saved to: ${outputPath}`);
  console.log(`   Size: ${(buffer.length / 1024).toFixed(2)} KB`);
}

generateHeroImage().catch(console.error);
