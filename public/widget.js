// Embeddable Chat Widget Script
// Usage: <script src="https://yourdomain.com/widget.js" data-business-id="your-business-id"></script>

(function() {
  const script = document.currentScript;
  const businessId = script.getAttribute('data-business-id');
  const apiUrl = script.getAttribute('data-api-url') || '/api/ai/respond';
  const primaryColor = script.getAttribute('data-primary-color') || '#3b82f6';
  const position = script.getAttribute('data-position') || 'bottom-right';

  // Create widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.id = 'kotae-ai-widget';
  document.body.appendChild(widgetContainer);

  // Load React and widget (simplified - in production, use a CDN or bundle)
  // This is a placeholder - you'd need to bundle the widget properly
  console.log('KotaeAI Widget loaded', { businessId, apiUrl, primaryColor, position });
  
  // In production, you'd load the actual React component here
  // For now, this is a placeholder that shows the structure
})();

