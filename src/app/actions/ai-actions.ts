'use server'

import {
  generateContent,
  generateImagePrompt,
  improveContent,
  generateSocialPost,
  type ContentGenerationOptions,
  type ImageGenerationOptions,
} from '@/lib/ai/gemini-service'

export async function generateContentAction(options: ContentGenerationOptions) {
  try {
    const content = await generateContent(options)
    return { success: true, content }
  } catch (error) {
    console.error('Error in generateContentAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    }
  }
}

export async function generateImagePromptAction(options: ImageGenerationOptions) {
  try {
    const prompt = await generateImagePrompt(options)
    return { success: true, prompt }
  } catch (error) {
    console.error('Error in generateImagePromptAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate image prompt',
    }
  }
}

export async function improveContentAction(content: string, instructions?: string) {
  try {
    const improved = await improveContent(content, instructions)
    return { success: true, content: improved }
  } catch (error) {
    console.error('Error in improveContentAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to improve content',
    }
  }
}

export async function generateSocialPostAction(
  content: string,
  platform: 'instagram' | 'facebook' | 'both',
  tone?: 'professional' | 'friendly' | 'excited'
) {
  try {
    const post = await generateSocialPost(content, platform, tone)
    return { success: true, post }
  } catch (error) {
    console.error('Error in generateSocialPostAction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate social post',
    }
  }
}
