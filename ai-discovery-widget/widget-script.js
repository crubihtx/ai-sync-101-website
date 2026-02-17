// ==========================================
// AI SYNC 101 DISCOVERY WIDGET - MAIN SCRIPT
// ==========================================

class AIDiscoveryWidget {
    constructor() {
        // Configuration
        this.config = {
            apiEndpoint: 'https://ai-sync-101-website.vercel.app/api/chat',
            trackerEndpoint: 'https://ai-sync-101-website.vercel.app/api/conversation-complete', // Vercel endpoint
            autoOpenDelay: 5000, // Auto-open after 5 seconds
            maxMessages: 30, // Maximum conversation length (15 exchanges = 30 messages)
            leadCaptureThreshold: 3, // Ask for contact info after 3 messages from user (early qualification)
            typingDelay: { min: 800, max: 2000 }, // Typing indicator duration
            idleTimeout: 10 * 60 * 1000, // 10 minutes idle = conversation end
        };

        // State
        this.state = {
            isOpen: false,
            messages: [],
            conversationId: this.generateConversationId(),
            leadCaptured: false,
            leadInfo: null,
            messageCount: 0,
            userMessageCount: 0,
            lastUserMessageTime: null,
            idleTimer: null,
            conversationSent: false, // Track if we've sent this conversation to tracker
        };

        // DOM Elements
        this.elements = {
            chatToggle: document.getElementById('chatToggle'),
            chatWidget: document.getElementById('chatWidget'),
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            sendBtn: document.getElementById('sendBtn'),
            minimizeBtn: document.getElementById('minimizeBtn'),
            refreshBtn: document.getElementById('refreshBtn'),
            typingIndicator: document.getElementById('typingIndicator'),
            headerStatus: document.getElementById('headerStatus'),
            notificationBadge: document.getElementById('notificationBadge'),
        };

        this.init();
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    init() {
        this.loadConversationFromStorage();
        this.attachEventListeners();
        this.autoOpenWidget();

        // Send initial greeting if no messages
        if (this.state.messages.length === 0) {
            setTimeout(() => {
                this.sendAssistantMessage(this.getInitialGreeting());
            }, 1000);
        } else {
            this.renderMessages();
        }
    }

    attachEventListeners() {
        // Toggle chat widget
        this.elements.chatToggle.addEventListener('click', () => this.toggleWidget());
        this.elements.minimizeBtn.addEventListener('click', () => this.toggleWidget());
        this.elements.refreshBtn.addEventListener('click', () => this.startNewConversation());

        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.elements.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Auto-resize textarea
        this.elements.chatInput.addEventListener('input', () => this.autoResizeTextarea());
    }

    autoOpenWidget() {
        setTimeout(() => {
            if (!this.state.isOpen && !localStorage.getItem('aisync_widget_dismissed')) {
                this.openWidget();
            }
        }, this.config.autoOpenDelay);
    }

    // ==========================================
    // WIDGET CONTROLS
    // ==========================================

    toggleWidget() {
        if (this.state.isOpen) {
            this.closeWidget();
        } else {
            this.openWidget();
        }
    }

    openWidget() {
        this.state.isOpen = true;
        this.elements.chatWidget.classList.add('active');
        this.elements.chatToggle.classList.add('active');
        this.elements.notificationBadge.classList.add('hidden');
        this.elements.chatInput.focus();
        this.scrollToBottom();
    }

    closeWidget() {
        this.state.isOpen = false;
        this.elements.chatWidget.classList.remove('active');
        this.elements.chatToggle.classList.remove('active');
        localStorage.setItem('aisync_widget_dismissed', 'true');
    }

    startNewConversation() {
        if (confirm('Start a new conversation? This will clear your current chat history.')) {
            // Clear state
            this.state.messages = [];
            this.state.conversationId = this.generateConversationId();
            this.state.leadCaptured = false;
            this.state.leadInfo = null;
            this.state.messageCount = 0;
            this.state.userMessageCount = 0;

            // Clear storage
            localStorage.removeItem('aisync_conversation');

            // Clear UI
            this.elements.chatMessages.innerHTML = '';
            this.hideLeadCaptureForm();

            // Send initial greeting
            setTimeout(() => {
                this.sendAssistantMessage(this.getInitialGreeting());
            }, 500);
        }
    }

    // ==========================================
    // MESSAGE HANDLING
    // ==========================================

    async handleSendMessage() {
        const message = this.elements.chatInput.value.trim();

        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        this.elements.chatInput.value = '';
        this.autoResizeTextarea();

        // Get AI response (extraction happens automatically in response handler)
        await this.getAIResponse(message);
    }

    async getAIResponse(userMessage) {
        this.showTypingIndicator();

        try {
            const response = await fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: this.state.conversationId,
                    message: userMessage,
                    messages: this.state.messages,
                    leadInfo: this.state.leadInfo,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Process extracted contact information from user's message
            if (data.extractedInfo) {
                this.updateLeadInfo(data.extractedInfo);
            }

            // Simulate typing delay for more natural feel
            const typingDelay = this.getRandomTypingDelay();
            await this.sleep(typingDelay);

            this.hideTypingIndicator();
            this.sendAssistantMessage(data.response);

            // Check if conversation should end
            if (this.shouldEndConversation()) {
                await this.sendConversationSummary();
            }

        } catch (error) {
            console.error('Error getting AI response:', error);
            this.hideTypingIndicator();
            this.sendAssistantMessage(
                "I'm having trouble connecting right now. Could you try again in a moment, or email us directly at info@aisync101.com?"
            );
        }
    }

    addMessage(role, content) {
        const message = {
            role,
            content,
            timestamp: new Date().toISOString(),
        };

        this.state.messages.push(message);
        this.state.messageCount++;

        if (role === 'user') {
            this.state.userMessageCount++;
            this.state.lastUserMessageTime = Date.now();
            this.resetIdleTimer(); // Reset idle detection on each user message
        }

        this.renderMessage(message);
        this.saveConversationToStorage();
        this.scrollToBottom();
    }

    sendAssistantMessage(content) {
        this.addMessage('assistant', content);

        // Show notification badge if widget is closed
        if (!this.state.isOpen) {
            this.elements.notificationBadge.classList.remove('hidden');
        }
    }

    // ==========================================
    // MESSAGE RENDERING
    // ==========================================

    renderMessages() {
        this.elements.chatMessages.innerHTML = '';
        this.state.messages.forEach(message => this.renderMessage(message));
        this.scrollToBottom();
    }

    renderMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = message.content;

        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.formatTime(message.timestamp);

        messageDiv.appendChild(bubbleDiv);
        messageDiv.appendChild(timeDiv);
        this.elements.chatMessages.appendChild(messageDiv);
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }, 100);
    }

    // ==========================================
    // TYPING INDICATOR
    // ==========================================

    showTypingIndicator() {
        this.elements.typingIndicator.style.display = 'flex';
        this.elements.headerStatus.textContent = 'Typing...';
        this.elements.headerStatus.classList.add('typing');
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.elements.typingIndicator.style.display = 'none';
        this.elements.headerStatus.textContent = 'Discovery Assistant';
        this.elements.headerStatus.classList.remove('typing');
    }

    getRandomTypingDelay() {
        const { min, max } = this.config.typingDelay;
        return Math.random() * (max - min) + min;
    }

    // ==========================================
    // LEAD INFORMATION GATHERING (Natural Extraction)
    // ==========================================

    updateLeadInfo(extractedInfo) {
        // Update leadInfo state with any newly extracted information
        if (!this.state.leadInfo) {
            this.state.leadInfo = {};
        }

        let updated = false;

        // Only update if we don't already have this info
        if (extractedInfo.name && !this.state.leadInfo.name) {
            this.state.leadInfo.name = extractedInfo.name;
            updated = true;
            console.log('Extracted name:', extractedInfo.name);
        }

        if (extractedInfo.email && !this.state.leadInfo.email) {
            this.state.leadInfo.email = extractedInfo.email;
            updated = true;
            console.log('Extracted email:', extractedInfo.email);
        }

        if (extractedInfo.company && !this.state.leadInfo.company) {
            this.state.leadInfo.company = extractedInfo.company;
            updated = true;
            console.log('Extracted company:', extractedInfo.company);
        }

        if (extractedInfo.website && !this.state.leadInfo.website) {
            this.state.leadInfo.website = extractedInfo.website;
            updated = true;
            console.log('Extracted website:', extractedInfo.website);
        }

        if (extractedInfo.phone && !this.state.leadInfo.phone) {
            this.state.leadInfo.phone = extractedInfo.phone;
            updated = true;
            console.log('Extracted phone:', extractedInfo.phone);
        }

        // Save to localStorage if anything was updated
        if (updated) {
            this.saveConversationToStorage();
            console.log('Updated lead info:', this.state.leadInfo);
        }

        // Mark as lead captured once we have minimum required info (name + email)
        if (this.state.leadInfo.name && this.state.leadInfo.email && !this.state.leadCaptured) {
            this.state.leadCaptured = true;
            console.log('Lead captured! We have name and email');
        }
    }

    hasCompleteLeadInfo() {
        // Check if we have all critical info
        return this.state.leadInfo &&
               this.state.leadInfo.name &&
               this.state.leadInfo.email &&
               (this.state.leadInfo.company || this.state.leadInfo.website);
    }

    // ==========================================
    // CONVERSATION MANAGEMENT
    // ==========================================

    shouldEndConversation() {
        // End if max messages reached
        if (this.state.messageCount >= this.config.maxMessages) {
            return true;
        }

        // Don't end if less than 10 messages (too short to be useful)
        if (this.state.messages.length < 10) {
            return false;
        }

        // Check for explicit goodbye
        const lastUserMessage = this.state.messages
            .filter(m => m.role === 'user')
            .slice(-1)[0];

        if (lastUserMessage) {
            const goodbyePhrases = ['goodbye', 'bye', 'talk soon', 'ttyl'];
            const content = lastUserMessage.content.toLowerCase();
            if (goodbyePhrases.some(phrase => content.includes(phrase))) {
                return true;
            }
        }

        return false;
    }

    resetIdleTimer() {
        // Clear existing timer
        if (this.state.idleTimer) {
            clearTimeout(this.state.idleTimer);
        }

        // Don't set idle timer if conversation already sent or too short
        if (this.state.conversationSent || this.state.messages.length < 10) {
            return;
        }

        // Set new timer
        this.state.idleTimer = setTimeout(() => {
            console.log('Conversation idle for 10 minutes - sending to tracker');
            this.sendConversationSummary('idle');
        }, this.config.idleTimeout);
    }

    async sendConversationSummary(reason = 'completed') {
        // Don't send if already sent or conversation too short
        if (this.state.conversationSent || this.state.messages.length < 10) {
            console.log('Skipping summary - already sent or too short');
            return;
        }

        this.state.conversationSent = true;
        console.log(`Sending conversation summary (reason: ${reason})`);
        console.log('Lead info:', this.state.leadInfo);

        // Send conversation to tracker service
        try {
            const response = await fetch(this.config.trackerEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: this.state.messages,
                    metadata: {
                        conversationId: this.state.conversationId,
                        endReason: reason,
                        leadInfo: this.state.leadInfo,
                        source: 'widget',
                        url: window.location.href,
                    },
                }),
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Conversation sent to tracker:', result);

                // AI handles all messaging — widget sends nothing to the user on conversation end
            } else {
                console.error('Failed to send conversation to tracker:', response.status);
            }

        } catch (error) {
            console.error('Error sending conversation to tracker:', error);
            // Fail silently - don't disrupt user experience
        }
    }

    // ==========================================
    // LOCAL STORAGE
    // ==========================================

    saveConversationToStorage() {
        const data = {
            conversationId: this.state.conversationId,
            messages: this.state.messages,
            leadCaptured: this.state.leadCaptured,
            leadInfo: this.state.leadInfo,
            messageCount: this.state.messageCount,
            userMessageCount: this.state.userMessageCount,
            timestamp: new Date().toISOString(),
        };

        localStorage.setItem('aisync_conversation', JSON.stringify(data));
    }

    loadConversationFromStorage() {
        const data = localStorage.getItem('aisync_conversation');

        if (data) {
            try {
                const parsed = JSON.parse(data);

                // Check if conversation is less than 24 hours old
                const timestamp = new Date(parsed.timestamp);
                const now = new Date();
                const hoursDiff = (now - timestamp) / (1000 * 60 * 60);

                if (hoursDiff < 24) {
                    this.state.conversationId = parsed.conversationId;
                    this.state.messages = parsed.messages || [];
                    this.state.leadCaptured = parsed.leadCaptured || false;
                    this.state.leadInfo = parsed.leadInfo || null;
                    this.state.messageCount = parsed.messageCount || 0;
                    this.state.userMessageCount = parsed.userMessageCount || 0;
                } else {
                    // Clear old conversation
                    localStorage.removeItem('aisync_conversation');
                }
            } catch (error) {
                console.error('Error loading conversation:', error);
            }
        }
    }

    // ==========================================
    // UTILITIES
    // ==========================================

    generateConversationId() {
        return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    autoResizeTextarea() {
        const textarea = this.elements.chatInput;
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    getInitialGreeting() {
        return "I'm with AI Sync 101. What operational challenges are you dealing with?";
    }
}

// ==========================================
// INITIALIZE WIDGET
// ==========================================

// Initialize immediately if DOM is already loaded, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiDiscoveryWidget = new AIDiscoveryWidget();
    });
} else {
    // DOM already loaded, initialize immediately
    window.aiDiscoveryWidget = new AIDiscoveryWidget();
}
