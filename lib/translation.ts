import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Supported languages with their ISO 639-1 codes
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
  id: 'Indonesian',
  so: 'Somali',
} as const

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES

/**
 * Detect the language of a text string using OpenAI
 */
export async function detectLanguage(text: string): Promise<LanguageCode> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a language detection expert. Given a text, return only the ISO 639-1 language code (2 letters) for the language detected. 
          
Supported codes: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}
If the language is not in the supported list, return 'en'.
Return only the 2-letter code, nothing else.`,
        },
        {
          role: 'user',
          content: text.substring(0, 500), // Limit text length for detection
        },
      ],
      temperature: 0,
      max_tokens: 5,
    })

    const detectedCode = completion.choices[0]?.message?.content?.trim().toLowerCase() || 'en'
    
    // Validate the code is in supported languages
    if (detectedCode in SUPPORTED_LANGUAGES) {
      return detectedCode as LanguageCode
    }
    
    return 'en'
  } catch (error) {
    console.error('Language detection error:', error)
    return 'en' // Default to English on error
  }
}

/**
 * Translate text to a target language using OpenAI
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode = 'en'
): Promise<string> {
  if (targetLanguage === 'en') {
    return text // No translation needed
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text to ${SUPPORTED_LANGUAGES[targetLanguage]}. 
          
Rules:
- Preserve the tone and style
- Keep technical terms and proper nouns as-is when appropriate
- Maintain the same level of formality
- Return only the translation, no explanations`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    return completion.choices[0]?.message?.content?.trim() || text
  } catch (error) {
    console.error('Translation error:', error)
    return text // Return original text on error
  }
}

/**
 * Get language name from code
 */
export function getLanguageName(code: LanguageCode): string {
  return SUPPORTED_LANGUAGES[code] || 'English'
}

/**
 * Detect language with fallback to conversation language
 */
export async function detectLanguageWithFallback(
  text: string,
  fallbackLanguage: LanguageCode = 'en'
): Promise<LanguageCode> {
  // Quick check: if text is very short, use fallback
  if (text.trim().length < 10) {
    return fallbackLanguage
  }

  const detected = await detectLanguage(text)
  
  // If detection fails or returns English for non-English looking text, use fallback
  if (detected === 'en' && fallbackLanguage !== 'en') {
    // Double-check: if fallback is not English, the user might want that language
    return fallbackLanguage
  }
  
  return detected
}

