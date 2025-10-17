import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export interface ContentGenerationOptions {
  type: 'event' | 'news' | 'volunteer' | 'general'
  context?: {
    title?: string
    description?: string
    campus?: string[]
    eventType?: string
    targetAudience?: string
  }
  prompt?: string
  length?: 'short' | 'medium' | 'long'
}

export interface ImageGenerationOptions {
  subject: string
  style?: 'professional' | 'fun' | 'educational' | 'festive'
  context?: string
}

/**
 * Generate content using Gemini AI
 */
export async function generateContent(options: ContentGenerationOptions): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = buildSystemPrompt(options)
    const userPrompt = options.prompt || buildDefaultPrompt(options)

    const result = await model.generateContent(`${systemPrompt}\n\n${userPrompt}`)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error generating content:', error)
    throw new Error('Failed to generate content. Please try again.')
  }
}

/**
 * Generate image prompt using Gemini AI
 */
export async function generateImagePrompt(options: ImageGenerationOptions): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Create a detailed image generation prompt for the following:
Subject: ${options.subject}
Style: ${options.style || 'professional'}
${options.context ? `Context: ${options.context}` : ''}

Generate a detailed, descriptive prompt that could be used with an image generation AI like DALL-E or Midjourney.
The prompt should be specific about:
- Visual style and composition
- Color palette
- Mood and atmosphere
- Key elements to include
- Any specific details that make it suitable for a school PTO website

Return only the image prompt, nothing else.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text().trim()
  } catch (error) {
    console.error('Error generating image prompt:', error)
    throw new Error('Failed to generate image prompt. Please try again.')
  }
}

/**
 * Improve existing content using Gemini AI
 */
export async function improveContent(
  content: string,
  instructions: string = 'Make this more engaging and professional'
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `${instructions}

Original content:
${content}

Improved content:`

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error('Error improving content:', error)
    throw new Error('Failed to improve content. Please try again.')
  }
}

/**
 * Generate social media post from content
 */
export async function generateSocialPost(
  content: string,
  platform: 'instagram' | 'facebook' | 'both',
  tone: 'professional' | 'friendly' | 'excited' = 'friendly'
): Promise<{ caption: string; hashtags: string[] }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const platformGuidelines = {
      instagram: 'Instagram post (2200 character limit, casual and visual)',
      facebook: 'Facebook post (no strict limit, can be more detailed)',
      both: 'social media post suitable for both Instagram and Facebook',
    }

    const prompt = `Create an engaging ${platformGuidelines[platform]} from this content:

${content}

Tone: ${tone}
Target audience: Parents and families at Centner Academy

Return a JSON object with:
{
  "caption": "the post caption text",
  "hashtags": ["relevant", "hashtags", "array"]
}

Include relevant hashtags for a private school PTO in Miami.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    throw new Error('Invalid response format')
  } catch (error) {
    console.error('Error generating social post:', error)
    throw new Error('Failed to generate social media post. Please try again.')
  }
}

// Helper functions

function buildSystemPrompt(options: ContentGenerationOptions): string {
  const basePrompt = `You are a helpful assistant for Centner Academy PTO (Parent Teacher Organization).
Centner Academy is a private school in Miami with three campuses: Preschool, Elementary, and Middle/High School.
Your task is to help create engaging, professional content for the PTO website.`

  const typeSpecific = {
    event: `Focus on creating compelling event descriptions that will encourage parent participation.
Include key details like date, time, location, and what attendees can expect.`,
    news: `Create informative and engaging news articles for the school community.
Maintain a professional yet warm tone that speaks to parents and families.`,
    volunteer: `Create inspiring volunteer opportunity descriptions that motivate parents to get involved.
Highlight the impact and benefits of volunteering.`,
    general: `Create clear, engaging content appropriate for a school PTO website.`,
  }

  return `${basePrompt}\n\n${typeSpecific[options.type]}`
}

function buildDefaultPrompt(options: ContentGenerationOptions): string {
  const { context, length = 'medium', type } = options

  const lengthGuide = {
    short: '2-3 sentences',
    medium: '1-2 paragraphs',
    long: '3-4 paragraphs',
  }

  let prompt = `Generate ${lengthGuide[length]} of content for a ${type}.`

  if (context?.title) {
    prompt += `\nTitle: ${context.title}`
  }

  if (context?.description) {
    prompt += `\nInitial description: ${context.description}`
  }

  if (context?.campus && context.campus.length > 0) {
    prompt += `\nCampus: ${context.campus.join(', ')}`
  }

  if (context?.eventType) {
    prompt += `\nEvent type: ${context.eventType}`
  }

  if (context?.targetAudience) {
    prompt += `\nTarget audience: ${context.targetAudience}`
  }

  return prompt
}
