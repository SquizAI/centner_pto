const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Event image prompts
const eventImagePrompts = [
  {
    id: 'f49ccf59-0838-411e-8b63-883e73efd7a6',
    title: 'School Bash / Bee Green Uniform Program',
    prompt: 'Vibrant school welcome event with students in green uniforms, friendly bee mascot, colorful banners, and families gathering at outdoor tables. Sunny day, cheerful atmosphere, modern school campus background. Professional photography style, bright colors, 16:9 aspect ratio.'
  },
  {
    id: '399e40ba-ff08-4946-bb7f-7419e907f106',
    title: 'Middle/High Pool Party',
    prompt: 'Teenagers having fun at luxury pool party, swimming, playing games, DJ setup in background, palm trees, sunset lighting, modern pool design. Energetic atmosphere, Miami style, professional event photography, 16:9 aspect ratio.'
  },
  {
    id: '371c6a66-c316-4e9c-8914-5b087c623f5f',
    title: 'Fall Decor',
    prompt: 'School hallways decorated with beautiful fall decorations, pumpkins, autumn leaves, orange and yellow colors, students helping hang decorations, warm lighting. Cozy autumn atmosphere, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '09f6c1dd-a11d-4562-997c-f7e447ae4ed1',
    title: 'Tents of Treasure - Elementary',
    prompt: 'Colorful circus tents on school tennis courts, kids playing carnival games, bouncy castles, food stands, festive decorations. Bright daylight, happy children, professional event photography, 16:9 aspect ratio.'
  },
  {
    id: '8c2de6b8-c030-4d14-97b8-0836f7a98830',
    title: 'Tents of Treasure - Preschool',
    prompt: 'Whimsical carnival tents in preschool courtyard, young children playing gentle games, colorful balloons, friendly staff, soft pastel colors. Safe and joyful atmosphere, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '51fc0578-d33f-4f3c-9117-b6df50e33822',
    title: 'Community Service Events',
    prompt: 'Students volunteering together, planting trees, helping community, wearing matching service t-shirts, diverse group of teens and kids working together. Inspiring community service atmosphere, professional photography, 16:9 aspect ratio.'
  },
  {
    id: 'cfd4da9c-bf6d-4ed9-bd59-7f56a163b5e8',
    title: 'Fall Bash on Wheels',
    prompt: 'Modern party bus with teenagers inside, DJ equipment, neon lights, Miami night scene, students dancing and having fun. Energetic nightlife atmosphere, professional event photography, 16:9 aspect ratio.'
  },
  {
    id: '835c0dc9-3b5b-4dcc-b1fd-df1729240089',
    title: 'Winter Holiday Decor',
    prompt: 'School decorated for winter holidays, Christmas trees, festive lights, students hanging ornaments, snow decorations, warm indoor lighting. Magical holiday atmosphere, professional photography, 16:9 aspect ratio.'
  },
  {
    id: 'ebe5e30f-c61e-45ef-9dbb-45bff8de8312',
    title: 'School Spirit Week',
    prompt: 'Students wearing school colors and spirit wear, face paint, pep rally atmosphere, banners and signs, energetic crowd. School pride theme, vibrant colors, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '04fb9dfd-4d37-4c3e-839e-cc7e9e6dd74c',
    title: 'Holiday Gift for Faculty & Staff',
    prompt: 'Beautifully wrapped gifts with holiday cards, teachers receiving appreciation gifts, warm smiles, festive office setting. Gratitude and appreciation theme, warm lighting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '4f1f46d1-4f46-4485-98b2-e54cfc03ccc5',
    title: 'Bee Green Uniform Sale',
    prompt: 'Organized display of school uniforms on racks, green polo shirts and khaki pants, parents shopping, sale price tags. Clean and organized setup, bright retail lighting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: 'feef99cf-1d50-4309-a12e-ec3e58582285',
    title: 'Movie Night Under the Stars',
    prompt: 'Outdoor movie screening on school field, large screen, kids sitting on blankets with popcorn, string lights, starry night sky. Cozy outdoor cinema atmosphere, twilight lighting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: 'e4f181a3-0390-4032-a7ff-898eb0743ced',
    title: 'Spring Decor',
    prompt: 'School halls decorated with spring flowers, pastel colors, butterflies, students creating flower arrangements, bright natural lighting. Fresh spring atmosphere, cheerful and colorful, professional photography, 16:9 aspect ratio.'
  },
  {
    id: 'e3d2de53-0d4a-4950-9103-208efbc971e9',
    title: 'Book Fair - Preschool',
    prompt: 'Young children browsing colorful picture books at book fair, Scholastic book displays, cozy reading corner, excited kids holding books. Literacy celebration atmosphere, bright colors, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '09267e46-3175-44e9-9971-6ee48384b912',
    title: 'Book Fair - Elementary',
    prompt: 'Elementary students excited about books, Scholastic book fair setup, kids reading together, posters and book displays. Reading enthusiasm theme, colorful and inviting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '3cad07e9-3b2d-44b1-abdf-eeffe1fba3c6',
    title: 'Curated Book Fair',
    prompt: 'Sophisticated book display for middle and high school students, curated collection, modern reading lounge, teens browsing contemporary literature. Intellectual and modern atmosphere, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '5f6d275e-4a87-4900-b74b-00012d57de29',
    title: 'Faculty & Staff Appreciation Week',
    prompt: 'Teachers being celebrated with breakfast spread, thank you banners, appreciation gifts, happy faculty gathering. Gratitude celebration theme, warm and inviting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '27da5862-c388-42e2-8f33-de56bbb7e46a',
    title: 'End of Year Party',
    prompt: 'Upscale venue party for high school students, DJ, dance floor, elegant lighting, teens dressed up and dancing. Celebration atmosphere, professional event photography, 16:9 aspect ratio.'
  },
  {
    id: 'ce30a853-a013-4ba6-bce6-c1e7085ef06b',
    title: 'Uniform Collection',
    prompt: 'Organized collection boxes for uniforms, volunteers sorting gently used school uniforms, cap and gown display, recycling theme. Sustainable fashion concept, bright lighting, professional photography, 16:9 aspect ratio.'
  },
  {
    id: '0b00aec3-c387-4cd7-b2d8-cd1564f33774',
    title: 'End of Year Gift',
    prompt: 'Thank you cards and gifts for teachers, emotional farewell scene, students presenting appreciation gifts to faculty. Heartfelt gratitude theme, warm lighting, professional photography, 16:9 aspect ratio.'
  }
];

async function generateEventImage(eventData) {
  try {
    console.log(`\nGenerating image for: ${eventData.title}`);
    console.log(`Prompt: ${eventData.prompt}`);

    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-exp'
    });

    const result = await model.generateContent([eventData.prompt]);
    const response = result.response;

    // Check if we got image data
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];

      // For image generation, we need to check the parts
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData) {
            const imageData = part.inlineData.data;
            const mimeType = part.inlineData.mimeType;

            // Save image to public folder
            const fileName = `event-${eventData.id}.png`;
            const filePath = path.join(process.cwd(), 'public', 'events', fileName);

            // Create events directory if it doesn't exist
            const eventsDir = path.join(process.cwd(), 'public', 'events');
            if (!fs.existsSync(eventsDir)) {
              fs.mkdirSync(eventsDir, { recursive: true });
            }

            // Convert base64 to buffer and save
            const buffer = Buffer.from(imageData, 'base64');
            fs.writeFileSync(filePath, buffer);

            console.log(`✓ Image saved: ${fileName}`);

            return {
              id: eventData.id,
              imageUrl: `/events/${fileName}`,
              success: true
            };
          }
        }
      }
    }

    console.log('✗ No image data in response');
    return {
      id: eventData.id,
      imageUrl: null,
      success: false,
      error: 'No image data in response'
    };

  } catch (error) {
    console.error(`✗ Error generating image for ${eventData.title}:`, error.message);
    return {
      id: eventData.id,
      imageUrl: null,
      success: false,
      error: error.message
    };
  }
}

async function generateAllImages() {
  console.log('Starting event image generation...');
  console.log(`Total events: ${eventImagePrompts.length}\n`);

  const results = [];

  // Generate images one at a time to avoid rate limits
  for (const eventData of eventImagePrompts) {
    const result = await generateEventImage(eventData);
    results.push(result);

    // Wait 2 seconds between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Summary
  console.log('\n\n=== GENERATION SUMMARY ===');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed events:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`- ${r.id}: ${r.error}`);
    });
  }

  // Save results to JSON file for updating database
  const outputPath = path.join(process.cwd(), 'event-images-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputPath}`);
}

// Run the generation
generateAllImages().catch(console.error);
