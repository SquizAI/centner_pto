import https from 'https';
import fs from 'fs';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', '.env.local') });

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY not found in .env.local file');
}

async function generateImage(prompt, outputFile) {
  return new Promise((resolve, reject) => {
    console.log(`Generating ${outputFile}...`);

    const url = new URL(`${API_URL}?key=${API_KEY}`);
    const payload = JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { response_modalities: ['image'] }
    });

    const req = https.request({
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (data.error) {
            console.error(`✗ Error for ${outputFile}:`, data.error.message);
            reject(new Error(data.error.message));
            return;
          }

          if (data.candidates && data.candidates[0]?.content?.parts) {
            const imagePart = data.candidates[0].content.parts.find(p => p.inlineData);
            if (imagePart) {
              const imageData = imagePart.inlineData.data;
              const outputPath = path.join(__dirname, '..', 'public', outputFile);
              fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
              console.log(`✅ Generated ${outputFile}`);
              resolve(outputFile);
            } else {
              console.error(`✗ No image data in response for ${outputFile}`);
              reject(new Error('No image in response'));
            }
          } else {
            console.error(`✗ No candidates in response for ${outputFile}`);
            reject(new Error('No candidates in response'));
          }
        } catch (e) {
          console.error(`✗ Error parsing response for ${outputFile}:`, e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`✗ Request error for ${outputFile}:`, e.message);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log('🎨 Generating placeholder images with Gemini API...\n');

  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const images = [
    {
      filename: 'placeholder-image.jpg',
      prompt: 'Create a warm, welcoming placeholder image for a school photo gallery. Use soft pastel colors - light sky blue (#E0F2FE), coral pink (#FED7E2), and mint green (#D1FAE5) in a gradient. Show abstract shapes representing community, learning, and childhood: floating books, paper airplanes, pencils, stars, and hearts in a dreamy space. Style: modern, minimalist, friendly, professional. Clean composition. No text. High quality. Aspect ratio 4:3.'
    },
    {
      filename: 'placeholder-album.jpg',
      prompt: 'Create a placeholder image for a school photo album cover. Show a soft multi-color gradient background (warm oranges #FDB47D, yellows #FEF3C7, and soft blues #BFDBFE). Include subtle geometric patterns with abstract icons representing school activities - a graduation cap, books, art palette, music notes, sports equipment - arranged in a modern, pleasing composition. Style: clean, contemporary, inviting. Professional quality. No text. Aspect ratio 16:9.'
    },
    {
      filename: 'placeholder-event.jpg',
      prompt: 'Create a vibrant placeholder image for school events. Show an energetic design with colorful confetti, balloons, and streamers in primary school colors (red #EF4444, blue #3B82F6, yellow #FBBF24, green #10B981) against a soft white-to-cream gradient background. Add subtle silhouettes of children celebrating and playing. Style: joyful, festive, family-friendly, modern. High quality. No text. Aspect ratio 16:9.'
    }
  ];

  let successCount = 0;

  for (const { filename, prompt } of images) {
    try {
      await generateImage(prompt, filename);
      successCount++;
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`Failed to generate ${filename}`);
    }
  }

  console.log(`\n✨ Successfully generated ${successCount}/${images.length} images`);

  if (successCount === 0) {
    console.error('\n⚠️ No images were generated. Please check:');
    console.error('  1. GEMINI_API_KEY is set in .env.local');
    console.error('  2. API key is valid and has access to image generation');
    console.error('  3. Internet connection is working');
    process.exit(1);
  }
}

main().catch(console.error);
