import OpenAI from 'openai'
import { LanguageCode } from './translation'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate text-to-speech audio URL using OpenAI TTS
 * Returns a data URL or file path that can be used with Twilio
 */
export async function generateSpeech(
  text: string,
  language: LanguageCode = 'en',
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' = 'nova'
): Promise<Buffer> {
  try {
    // Map language to appropriate voice
    // For non-English, we might want to use different voices
    const voiceMap: Record<string, 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'> = {
      en: 'nova',
      es: 'shimmer', // Spanish
      fr: 'alloy', // French
      de: 'onyx', // German
      it: 'echo', // Italian
      pt: 'shimmer', // Portuguese
      ru: 'onyx', // Russian
      zh: 'alloy', // Chinese
      ja: 'shimmer', // Japanese
      ko: 'alloy', // Korean
      ar: 'onyx', // Arabic
      hi: 'shimmer', // Hindi
      nl: 'alloy', // Dutch
      pl: 'onyx', // Polish
      tr: 'shimmer', // Turkish
      vi: 'alloy', // Vietnamese
      th: 'shimmer', // Thai
      id: 'alloy', // Indonesian
      so: 'onyx', // Somali
    }

    const selectedVoice = voiceMap[language] || voice

    // Map language code to TTS format (ISO 639-1)
    // OpenAI TTS supports multiple languages
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: selectedVoice,
      input: text,
      response_format: 'mp3',
    })

    // Convert response to buffer
    const buffer = Buffer.from(await response.arrayBuffer())
    return buffer
  } catch (error) {
    console.error('Text-to-speech error:', error)
    throw error
  }
}

/**
 * Get TwiML <Say> with language attribute for multi-language support
 * For Twilio, we use the <Say> verb with language attribute
 */
export function getTwiMLSayWithLanguage(
  text: string,
  language: LanguageCode = 'en'
): string {
  // Map language codes to Twilio language codes
  const twilioLanguageMap: Record<LanguageCode, string> = {
    en: 'en-US',
    es: 'es-ES',
    fr: 'fr-FR',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-BR',
    ru: 'ru-RU',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ar: 'ar-SA',
    hi: 'hi-IN',
    nl: 'nl-NL',
    pl: 'pl-PL',
    tr: 'tr-TR',
    vi: 'vi-VN',
    th: 'th-TH',
    id: 'id-ID',
    so: 'so-SO',
  }

  const twilioLang = twilioLanguageMap[language] || 'en-US'

  // Escape XML special characters
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  return `<Say language="${twilioLang}">${escapedText}</Say>`
}

/**
 * Generate speech and return as base64 for Twilio
 * Note: Twilio can also use URLs, but for immediate playback, we can use TwiML <Say>
 */
export async function generateSpeechForTwilio(
  text: string,
  language: LanguageCode = 'en'
): Promise<{ twiml: string; audioUrl?: string }> {
  // For Twilio, we'll use TwiML <Say> with language attribute
  // This is more efficient than generating audio files
  const twiml = getTwiMLSayWithLanguage(text, language)

  // Optionally, we could generate an audio file and host it
  // For now, return TwiML which Twilio will handle
  return {
    twiml,
  }
}

