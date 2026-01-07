import { Business } from '@prisma/client'

export interface CalendlyEventType {
  uri: string
  name: string
  slug: string
  active: boolean
}

export interface CalendlyAvailability {
  start_time: string
  end_time: string
}

export interface CalendlyTimeSlot {
  start_time: string
  end_time: string
  invitee_uri?: string
}

/**
 * Detect scheduling intent from user message
 */
export function detectSchedulingIntent(message: string): boolean {
  const schedulingKeywords = [
    'schedule',
    'book',
    'appointment',
    'meeting',
    'call',
    'demo',
    'consultation',
    'talk',
    'speak',
    'meet',
    'set up',
    'arrange',
    'when can',
    'available',
    'calendar',
    'time slot',
    'pick a time',
    'choose a time',
    'reserve',
    'book a call',
    'book a meeting',
    'schedule a call',
    'schedule a meeting',
    'set up a call',
    'set up a meeting',
  ]

  const lowerMessage = message.toLowerCase()
  return schedulingKeywords.some((keyword) => lowerMessage.includes(keyword))
}

/**
 * Get available time slots from Calendly
 */
export async function getCalendlyAvailability(
  business: Business,
  daysAhead: number = 14
): Promise<CalendlyTimeSlot[]> {
  if (!business.calendlyApiKey || !business.calendlyUserUri) {
    return []
  }

  try {
    const startDate = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + daysAhead)

    // Get user's event types if not specified
    let eventTypeUri = business.calendlyEventType

    if (!eventTypeUri) {
      const eventTypes = await getCalendlyEventTypes(business)
      if (eventTypes.length > 0) {
        eventTypeUri = eventTypes[0].uri
      } else {
        return []
      }
    }

    // Get availability
    const response = await fetch(
      `https://api.calendly.com/event_type_available_times?event_type=${encodeURIComponent(
        eventTypeUri
      )}&start_time=${startDate.toISOString()}&end_time=${endDate.toISOString()}`,
      {
        headers: {
          Authorization: `Bearer ${business.calendlyApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Calendly API error:', await response.text())
      return []
    }

    const data = await response.json()
    return data.collection || []
  } catch (error) {
    console.error('Calendly availability error:', error)
    return []
  }
}

/**
 * Get user's event types from Calendly
 */
export async function getCalendlyEventTypes(
  business: Business
): Promise<CalendlyEventType[]> {
  if (!business.calendlyApiKey || !business.calendlyUserUri) {
    return []
  }

  try {
    const response = await fetch(
      `https://api.calendly.com/event_types?user=${encodeURIComponent(
        business.calendlyUserUri
      )}&active=true`,
      {
        headers: {
          Authorization: `Bearer ${business.calendlyApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return (
      data.collection?.map((et: any) => ({
        uri: et.uri,
        name: et.name,
        slug: et.slug,
        active: et.active,
      })) || []
    )
  } catch (error) {
    console.error('Calendly event types error:', error)
    return []
  }
}

/**
 * Format time slots for display
 */
export function formatTimeSlots(
  slots: CalendlyTimeSlot[],
  timezone: string = 'America/New_York',
  limit: number = 5
): string[] {
  return slots.slice(0, limit).map((slot) => {
    const date = new Date(slot.start_time)
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  })
}

/**
 * Generate Calendly scheduling response
 */
export async function generateSchedulingResponse(
  business: Business,
  userMessage: string,
  userTimezone?: string
): Promise<{
  message: string
  calendlyLink?: string
  suggestedTimes?: string[]
  actionRequired: boolean
}> {
  const timezone = userTimezone || business.timezone || 'America/New_York'

  // If business has public Calendly link, use it
  if (business.calendlyLink) {
    return {
      message: `I'd be happy to help you schedule a ${business.name.toLowerCase()}. You can book a time that works for you using this link: ${business.calendlyLink}`,
      calendlyLink: business.calendlyLink,
      actionRequired: true,
    }
  }

  // Try to get available slots if API is configured
  if (business.calendlyApiKey) {
    const slots = await getCalendlyAvailability(business, 14)
    const formattedTimes = formatTimeSlots(slots, timezone, 5)

    if (formattedTimes.length > 0) {
      return {
        message: `I'd be happy to schedule a ${business.name.toLowerCase()}! Here are some available times:\n\n${formattedTimes
          .map((time, idx) => `${idx + 1}. ${time}`)
          .join('\n')}\n\nWould you like to book one of these times? Or you can choose a time that works best for you.`,
        suggestedTimes: formattedTimes,
        calendlyLink: business.calendlyLink || undefined,
        actionRequired: true,
      }
    }
  }

  // Fallback if no Calendly configured
  return {
    message: `I'd be happy to help you schedule a ${business.name.toLowerCase()}. Please let me know what time works best for you, or I can have someone contact you to arrange a time.`,
    actionRequired: false,
  }
}

/**
 * Detect timezone from user message or use default
 */
export function detectTimezone(message: string): string | undefined {
  // Simple timezone detection based on common patterns
  // Can be enhanced with more sophisticated detection
  const timezoneMap: { [key: string]: string } = {
    est: 'America/New_York',
    edt: 'America/New_York',
    pst: 'America/Los_Angeles',
    pdt: 'America/Los_Angeles',
    cst: 'America/Chicago',
    cdt: 'America/Chicago',
    mst: 'America/Denver',
    mdt: 'America/Denver',
    gmt: 'Europe/London',
    utc: 'UTC',
  }

  const lowerMessage = message.toLowerCase()
  for (const [tz, timezone] of Object.entries(timezoneMap)) {
    if (lowerMessage.includes(tz)) {
      return timezone
    }
  }

  return undefined
}




