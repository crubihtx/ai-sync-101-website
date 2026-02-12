// ==========================================
// AI SYNC 101 DISCOVERY WIDGET - MAIN SCRIPT
// ==========================================

class AIDiscoveryWidget {
    constructor() {
        // Configuration
        this.config = {
            apiEndpoint: 'https://ai-sync-101-website.vercel.app/api/chat', // Azure Function endpoint
            autoOpenDelay: 5000, // Auto-open after 5 seconds
            maxMessages: 30, // Maximum conversation length (15 exchanges = 30 messages)
            leadCaptureThreshold: 7, // Ask for contact info after 7 messages from user
            typingDelay: { min: 800, max: 2000 }, // Typing indicator duration
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
            leadCaptureForm: document.getElementById('leadCaptureForm'),
            leadName: document.getElementById('leadName'),
            leadEmail: document.getElementById('leadEmail'),
            submitLeadBtn: document.getElementById('submitLeadBtn'),
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

        // Lead capture form
        this.elements.submitLeadBtn.addEventListener('click', () => this.handleLeadCapture());

        // Enter key in lead form
        this.elements.leadEmail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleLeadCapture();
            }
        });
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

        // Check if we should show lead capture form
        if (this.shouldShowLeadCapture()) {
            this.showLeadCaptureForm();
            return;
        }

        // Get AI response
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
    // LEAD CAPTURE
    // ==========================================

    shouldShowLeadCapture() {
        return (
            !this.state.leadCaptured &&
            this.state.userMessageCount >= this.config.leadCaptureThreshold
        );
    }

    showLeadCaptureForm() {
        this.elements.leadCaptureForm.classList.add('visible');
        this.elements.leadCaptureForm.style.display = 'block';
        this.elements.leadName.focus();
    }

    hideLeadCaptureForm() {
        this.elements.leadCaptureForm.classList.remove('visible');
        setTimeout(() => {
            this.elements.leadCaptureForm.style.display = 'none';
        }, 300);
    }

    async handleLeadCapture() {
        const name = this.elements.leadName.value.trim();
        const email = this.elements.leadEmail.value.trim();

        if (!name || !email) {
            alert('Please enter both your name and email.');
            return;
        }

        if (!this.isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }

        this.state.leadCaptured = true;
        this.state.leadInfo = { name, email };
        this.saveConversationToStorage();

        this.hideLeadCaptureForm();

        // Send confirmation message
        this.sendAssistantMessage(
            `Thanks, ${name}! I'll send you a summary and recommendations to ${email}. Let's keep going - what else would you like to know?`
        );

        // Send conversation summary email
        await this.sendConversationSummary();

        // Continue with AI response to their previous message
        const lastUserMessage = this.getLastUserMessage();
        if (lastUserMessage) {
            await this.getAIResponse(lastUserMessage);
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getLastUserMessage() {
        for (let i = this.state.messages.length - 1; i >= 0; i--) {
            if (this.state.messages[i].role === 'user') {
                return this.state.messages[i].content;
            }
        }
        return null;
    }

    // ==========================================
    // CONVERSATION MANAGEMENT
    // ==========================================

    shouldEndConversation() {
        return this.state.messageCount >= this.config.maxMessages;
    }

    async sendConversationSummary() {
        // Send conversation transcript to backend for email
        try {
            await fetch('https://ai-sync-101-website.vercel.app/api/send-summary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    conversationId: this.state.conversationId,
                    messages: this.state.messages,
                    leadInfo: this.state.leadInfo,
                }),
            });

            this.sendAssistantMessage(
                "This has been a great conversation! I've sent a summary to our team, and they'll reach out to you shortly with more detailed recommendations. Looking forward to working with you! 🚀"
            );

        } catch (error) {
            console.error('Error sending summary:', error);
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
        return "Hey! I'm with AI Sync 101. We help mid-market companies solve expensive operational problems through custom platforms and automation.\n\nQuick question to get started - what's the biggest operational bottleneck that's costing your business time or money right now?";
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
