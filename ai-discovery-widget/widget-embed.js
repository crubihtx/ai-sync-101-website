/**
 * AI SYNC 101 DISCOVERY WIDGET - EMBED SCRIPT
 *
 * Add this script tag to your website to load the discovery widget:
 * <script src="/ai-discovery-widget/widget-embed.js"></script>
 */

(function() {
    'use strict';

    // Configuration
    const WIDGET_CONFIG = {
        baseUrl: '/ai-discovery-widget', // Adjust if hosted elsewhere
        apiEndpoint: '/api/chat', // Azure Function endpoint
        autoOpenDelay: 5000, // Auto-open after 5 seconds
    };

    // Load CSS
    const loadCSS = () => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `${WIDGET_CONFIG.baseUrl}/widget-styles.css`;
        document.head.appendChild(link);
    };

    // Load Widget HTML
    const loadWidgetHTML = async () => {
        try {
            const response = await fetch(`${WIDGET_CONFIG.baseUrl}/widget.html`);
            const html = await response.text();

            // Create a temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;

            // Extract and append widget elements to body
            const elements = temp.querySelectorAll('button, .chat-widget, .powered-by');
            elements.forEach(el => document.body.appendChild(el));

        } catch (error) {
            console.error('Failed to load AI Discovery Widget:', error);
        }
    };

    // Load Widget Script
    const loadScript = () => {
        const script = document.createElement('script');
        script.src = `${WIDGET_CONFIG.baseUrl}/widget-script.js`;
        script.async = true;
        document.body.appendChild(script);
    };

    // Initialize widget when DOM is ready
    const init = () => {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', async () => {
                loadCSS();
                await loadWidgetHTML();
                loadScript();
            });
        } else {
            loadCSS();
            loadWidgetHTML().then(() => loadScript());
        }
    };

    // Start initialization
    init();

})();
