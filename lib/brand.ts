/**
 * Central brand configuration for Orivela
 * Single source of truth for all brand-related strings
 */

export const brandConfig = {
  // Primary brand names
  brandName: 'Orivela',
  brandFullName: 'Orivela AI',
  
  // URLs
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://orivela.ai',
  docsUrl: process.env.NEXT_PUBLIC_DOCS_URL ?? 'https://orivela.ai/docs',
  
  // Email addresses
  supportEmail: 'support@orivela.ai',
  noreplyEmail: 'noreply@orivela.ai',
  privacyEmail: 'privacy@orivela.ai',
  
  // Product names
  copilotName: 'Orivela Copilot',
  
  // Taglines (can be customized)
  tagline: 'Your AI Assistant That Never Sleeps',
  taglineShort: 'AI-Powered Customer Communication',
  
  // Meta descriptions
  defaultMetaDescription: 'Orivela AI - Automate customer communication across phone, SMS, and email with intelligent AI that understands, responds, and assists your team in real-time.',
} as const

// Export individual constants for convenience
export const {
  brandName,
  brandFullName,
  siteUrl,
  docsUrl,
  supportEmail,
  noreplyEmail,
  privacyEmail,
  copilotName,
  tagline,
  taglineShort,
  defaultMetaDescription,
} = brandConfig



