const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateImage(prompt, filename) {
  try {
    console.log(`Generating ${filename}...`);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.4,
        topK: 32,
        topP: 1,
        maxOutputTokens: 4096,
      }
    });

    // Extract image data from response
    const response = await result.response;
    const imageData = response.candidates[0]?.content?.parts?.find(part => part.inlineData);

    if (imageData && imageData.inlineData) {
      const buffer = Buffer.from(imageData.inlineData.data, 'base64');
      const outputPath = path.join(__dirname, '..', 'public', filename);

      fs.writeFileSync(outputPath, buffer);
      console.log(`✓ Generated ${filename}`);
      return true;
    } else {
      console.log(`✗ No image data returned for ${filename}`);
      return false;
    }
  } catch (error) {
    console.error(`Error generating ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('Generating placeholder images with Gemini...\n');

  // Create public directory if it doesn't exist
  const publicDir = path.join(__dirname, '..', 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const images = [
    {
      filename: 'placeholder-image.jpg',
      prompt: 'Create a warm, welcoming placeholder image for a school photo gallery. Use soft pastel colors (light blue, coral pink, mint green). Show abstract shapes representing community, learning, and childhood - like books, paper airplanes, pencils, stars, and hearts floating in a dreamy space. Style: modern, minimalist, friendly. No text. Aspect ratio 4:3.'
    },
    {
      filename: 'placeholder-album.jpg',
      prompt: 'Create a placeholder image for a school photo album cover. Show a soft gradient background with subtle geometric patterns. Include abstract icons representing school activities - a graduation cap, books, art palette, music notes, sports equipment - arranged in a pleasing composition. Colors: warm oranges and yellows with soft blues. Style: clean, modern, inviting. No text. Aspect ratio 16:9.'
    },
    {
      filename: 'placeholder-event.jpg',
      prompt: 'Create a placeholder image for school events. Show a vibrant, energetic design with confetti, balloons, and streamers in school colors (red, blue, yellow, green). Add subtle silhouettes of children playing and celebrating. Background: soft white to cream gradient. Style: joyful, festive, family-friendly. No text. Aspect ratio 16:9.'
    }
  ];

  let successCount = 0;

  for (const { filename, prompt } of images) {
    const success = await generateImage(prompt, filename);
    if (success) successCount++;

    // Wait a bit between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✓ Successfully generated ${successCount}/${images.length} images`);
}

main().catch(console.error);
