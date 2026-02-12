/**
 * AI SYNC 101 DISCOVERY WIDGET - SIMPLE EMBED
 * Simpler version that includes everything inline
 */

(function() {
    'use strict';

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/ai-discovery-widget/widget-styles.css';
        document.head.appendChild(link);

        // Load widget HTML inline
        const widgetHTML = `
            <!-- Floating Chat Button -->
            <button id="chatToggle" class="chat-toggle" aria-label="Open chat">
                <svg class="chat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <svg class="close-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span class="notification-badge" id="notificationBadge">1</span>
            </button>

            <!-- Chat Widget Container -->
            <div id="chatWidget" class="chat-widget">
                <!-- Chat Header -->
                <div class="chat-header">
                    <div class="header-content">
                        <img src="/assets/logo.png" alt="AI Sync 101" class="header-logo">
                        <div class="header-text">
                            <h3>AI Sync 101</h3>
                            <p class="header-status" id="headerStatus">
                                <span class="status-indicator"></span>
                                Online now
                            </p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="refresh-btn" id="refreshBtn" aria-label="Clear conversation" title="Clear conversation">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                            </svg>
                            <span class="refresh-btn-text">Clear</span>
                        </button>
                        <button class="minimize-btn" id="minimizeBtn" aria-label="Minimize chat">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Chat Messages -->
                <div class="chat-messages" id="chatMessages"></div>

                <!-- Typing Indicator -->
                <div class="typing-indicator" id="typingIndicator" style="display: none;">
                    <div class="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                    <p>AI Sync 101 is typing...</p>
                </div>

                <!-- Chat Input -->
                <div class="chat-input-container">
                    <div class="chat-input-wrapper">
                        <textarea
                            id="chatInput"
                            class="chat-input"
                            placeholder="Type your message..."
                            rows="1"
                        ></textarea>
                        <button id="sendBtn" class="send-btn" aria-label="Send message">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </div>
                    <p class="input-hint">Press Enter to send, Shift+Enter for new line</p>
                </div>
            </div>
        `;

        // Insert widget HTML
        document.body.insertAdjacentHTML('beforeend', widgetHTML);

        // Load main script
        const script = document.createElement('script');
        script.src = '/ai-discovery-widget/widget-script.js';
        script.onload = function() {
            console.log('Widget script loaded successfully');
        };
        script.onerror = function() {
            console.error('Failed to load widget script');
        };
        document.body.appendChild(script);
    }
})();
