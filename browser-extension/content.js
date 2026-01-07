// Orivela Copilot - Content Script
// Captures screen context and provides it to the main app

(function() {
  'use strict'

  // Detect app name
  function detectApp() {
    const hostname = window.location.hostname.toLowerCase()
    
    if (hostname.includes('zoom.us') || hostname.includes('zoom.com')) {
      return 'Zoom'
    }
    if (hostname.includes('meet.google.com')) {
      return 'Google Meet'
    }
    if (hostname.includes('teams.microsoft.com')) {
      return 'Microsoft Teams'
    }
    if (hostname.includes('webex.com')) {
      return 'Webex'
    }
    
    return 'Browser'
  }

  // Extract page text (simplified - no full DOM dump)
  function extractPageText() {
    const body = document.body
    if (!body) return ''

    // Get visible text, limit to reasonable size
    const textContent = body.innerText || body.textContent || ''
    return textContent.substring(0, 2000) // Limit to 2000 chars
  }

  // Get screen context
  function getScreenContext() {
    return {
      appName: detectApp(),
      tabTitle: document.title,
      pageText: extractPageText(),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    }
  }

  // Expose to window for main app access
  if (!window.orivelaCopilot) {
    window.orivelaCopilot = {
      getScreenContext,
      detectApp,
    }
  }

  // Listen for context requests
  window.addEventListener('message', (event) => {
    if (event.data.type === 'ORIVELA_COPILOT_GET_CONTEXT') {
      window.postMessage(
        {
          type: 'ORIVELA_COPILOT_CONTEXT',
          context: getScreenContext(),
        },
        '*'
      )
    }
  })

  // Auto-update context periodically (if needed)
  setInterval(() => {
    // Context is generated on-demand, but we can trigger updates here if needed
  }, 5000)
})()



