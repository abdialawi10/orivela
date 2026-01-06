// Kotae Copilot - Popup Script

let isActive = false

document.getElementById('toggleBtn').addEventListener('click', async () => {
  const statusEl = document.getElementById('status')
  const btn = document.getElementById('toggleBtn')

  if (!isActive) {
    // Start copilot
    isActive = true
    statusEl.textContent = 'Active'
    statusEl.className = 'status active'
    btn.textContent = 'Stop Copilot'
    
    // Send message to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'KOTAE_COPILOT_START' })
    })
  } else {
    // Stop copilot
    isActive = false
    statusEl.textContent = 'Inactive'
    statusEl.className = 'status inactive'
    btn.textContent = 'Start Copilot'
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'KOTAE_COPILOT_STOP' })
    })
  }
})

// Check current status
chrome.storage.local.get(['copilotActive'], (result) => {
  isActive = result.copilotActive || false
  const statusEl = document.getElementById('status')
  const btn = document.getElementById('toggleBtn')
  
  if (isActive) {
    statusEl.textContent = 'Active'
    statusEl.className = 'status active'
    btn.textContent = 'Stop Copilot'
  }
})


