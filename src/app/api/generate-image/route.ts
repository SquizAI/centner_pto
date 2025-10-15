import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Initialize Supabase client with service role for storage upload
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    console.log('Generating image with prompt:', prompt);

    // Generate image with Gemini
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-2.0-flash-exp',
    });

    const result = await model.generateContent([prompt]);
    const response = result.response;

    // Extract image data from response
    if (!response.candidates?.[0]?.content?.parts) {
      console.error('No image data in Gemini response');
      return NextResponse.json(
        { error: 'Failed to generate image - no image data returned' },
        { status: 500 }
      );
    }

    let imageData: string | null = null;
    let mimeType: string = 'image/png';

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || 'image/png';
        break;
      }
    }

    if (!imageData) {
      console.error('No inline image data found in response');
      return NextResponse.json(
        { error: 'Failed to generate image - no image data found' },
        { status: 500 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(imageData, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(7);
    const extension = mimeType.split('/')[1] || 'png';
    const filename = `ai-generated-${timestamp}-${randomString}.${extension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filename, buffer, {
        contentType: mimeType,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.error('Error uploading to Supabase:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('event-images')
      .getPublicUrl(filename);

    console.log('Image generated and uploaded successfully:', urlData.publicUrl);

    return NextResponse.json({
      imageUrl: urlData.publicUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
