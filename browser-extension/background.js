// Kotae Copilot - Background Service Worker

chrome.runtime.onInstalled.addListener(() => {
  console.log('Kotae Copilot extension installed')
})

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'KOTAE_COPILOT_CONTEXT_UPDATE') {
    // Store context if needed
    chrome.storage.local.set({
      lastContext: message.context,
      lastUpdate: Date.now(),
    })
  }
  
  return true
})


