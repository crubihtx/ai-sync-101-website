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
            downloadBtn: document.getElementById('downloadSessionBtn'),
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

        // Download button
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => this.generatePDF());
        }
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
    // PDF DOWNLOAD FEATURE
    // ==========================================


    // ==========================================
    // PDF DOWNLOAD FEATURE  (HTML → print window)
    // ==========================================

    extractWorkflowFromMessages() {
        const messages = this.state.messages;
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role !== 'assistant') continue;
            const text = msg.content;
            if (!text.includes('CURRENT:') && !text.includes('PROPOSED:')) continue;
            let current = null, proposed = null, keyChange = null;
            if (text.includes('CURRENT:')) {
                const after = text.split('CURRENT:')[1];
                const end = after.search(/\n(PROPOSED:|KEY CHANGE:|$)/i);
                current = (end > -1 ? after.substring(0, end) : after).trim();
            }
            if (text.includes('PROPOSED:')) {
                const after = text.split('PROPOSED:')[1];
                const end = after.search(/\n(CURRENT:|KEY CHANGE:|$)/i);
                proposed = (end > -1 ? after.substring(0, end) : after).trim();
            }
            const kcm = text.match(/KEY CHANGE:\s*([\s\S]*?)(?:\n\n|$)/i);
            if (kcm) keyChange = kcm[1].trim();
            return { current, proposed, keyChange };
        }
        return { current: null, proposed: null, keyChange: null };
    }

    esc(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    generatePDF() {
        const LOGO_B64 = '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';

        // Gather data
        const li      = this.state.leadInfo || {};
        const name    = li.name    || null;
        const company = li.company || null;
        const email   = li.email   || null;
        const phone   = li.phone   || null;
        const website = li.website || null;
        const dateStr = new Date().toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
        const wf      = this.extractWorkflowFromMessages();

        let problem = li.problem || null;
        if (!problem) {
            const firstUser = this.state.messages.find(m => m.role === 'user' && m.content.length > 10);
            if (firstUser) problem = firstUser.content.slice(0, 220) + (firstUser.content.length > 220 ? '\u2026' : '');
        }

        const self = this;

        // Contact rows
        const contactRows = [
            name    ? `<tr><td class="cl">Name</td><td class="cv">${self.esc(name)}</td></tr>` : '',
            company ? `<tr><td class="cl">Company</td><td class="cv">${self.esc(company)}</td></tr>` : '',
            email   ? `<tr><td class="cl">Email</td><td class="cv">${self.esc(email)}</td></tr>` : '',
            phone   ? `<tr><td class="cl">Phone</td><td class="cv">${self.esc(phone)}</td></tr>` : '',
            website ? `<tr><td class="cl">Website</td><td class="cv">${self.esc(website)}</td></tr>` : '',
        ].filter(Boolean).join('');

        // Workflow section
        const workflowSection = (wf.current || wf.proposed) ? `
        <div class="section">
            <div class="section-label">Workflow Analysis</div>
            <div class="wf-grid">
                ${wf.current ? `
                <div class="wf-block wf-current">
                    <div class="wf-tag">Current</div>
                    <p>${self.esc(wf.current).replace(/\n/g,'<br>')}</p>
                </div>` : ''}
                ${wf.proposed ? `
                <div class="wf-block wf-proposed">
                    <div class="wf-tag">Proposed</div>
                    <p>${self.esc(wf.proposed).replace(/\n/g,'<br>')}</p>
                </div>` : ''}
            </div>
            ${wf.keyChange ? `
            <div class="key-change-box">
                <span class="key-change-label">Key Change</span>
                <span>${self.esc(wf.keyChange)}</span>
            </div>` : ''}
        </div>` : '';

        // Transcript
        const transcriptHTML = this.state.messages.map(msg => {
            const isUser = msg.role === 'user';
            const label  = isUser ? (name ? self.esc(name) : 'Visitor') : 'AI Sync 101';
            const text   = self.esc(msg.content).replace(/\n/g,'<br>');
            return `<div class="msg ${isUser ? 'msg-user' : 'msg-ai'}">
                <div class="msg-label">${label}</div>
                <div class="msg-text">${text}</div>
            </div>`;
        }).join('');

        // Next steps
        const reachOut = [email, phone].filter(Boolean).join(' / ');
        const nextStepsHTML = `
        <div class="section">
            <div class="section-label">Next Steps</div>
            <div class="timeline">
                <div class="tl-item">
                    <div class="tl-dot"><span>01</span></div>
                    <div class="tl-line"></div>
                    <div class="tl-body">
                        <div class="tl-title">Discovery Call</div>
                        <div class="tl-desc">Our team will reach out${reachOut ? ' to <strong>' + self.esc(reachOut) + '</strong>' : ''} within 24 hours to schedule a 30-minute deep-dive.</div>
                    </div>
                </div>
                <div class="tl-item">
                    <div class="tl-dot"><span>02</span></div>
                    <div class="tl-line"></div>
                    <div class="tl-body">
                        <div class="tl-title">Operational Analysis</div>
                        <div class="tl-desc">We map your full workflow end-to-end and quantify the financial impact of each gap.</div>
                    </div>
                </div>
                <div class="tl-item">
                    <div class="tl-dot"><span>03</span></div>
                    <div class="tl-line tl-line-last"></div>
                    <div class="tl-body">
                        <div class="tl-title">Custom Proposal</div>
                        <div class="tl-desc">Scope, timeline, and pricing tailored to your specific operations. Priced at 5&ndash;10% of first-year financial impact.</div>
                    </div>
                </div>
            </div>
        </div>`;

        // Full HTML document
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AI Sync 101 &mdash; Discovery Session${company ? ': ' + self.esc(company) : ''}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{
  background:#0A0A0A;color:#FFFFFF;
  font-family:'Inter',sans-serif;font-size:14px;line-height:1.6;
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
@media print{
  html,body{background:#0A0A0A!important}
  @page{margin:0;size:letter}
  .no-print{display:none!important}
  .avoid-break{page-break-inside:avoid}
}
/* PAGE */
.page{width:100%;max-width:816px;margin:0 auto;padding:72px 96px 72px;box-sizing:border-box}
/* GRADIENT BAR */
.gradient-bar{
  height:4px;
  background:linear-gradient(135deg,#00A3FF 0%,#7B2FFF 50%,#FF1F8F 100%);
  border-radius:2px;margin-bottom:48px;
}
/* HEADER */
.doc-header{
  display:flex;align-items:center;justify-content:space-between;
  margin-bottom:32px;padding-bottom:24px;
  border-bottom:1px solid rgba(255,255,255,0.1);
}
.doc-logo{height:48px;width:auto}
.doc-type{
  font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  white-space:nowrap;
  background:linear-gradient(135deg,#00A3FF,#FF1F8F);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.doc-date{font-size:12px;color:#666;margin-top:4px;text-align:right;white-space:nowrap}
/* HERO */
.hero{margin-bottom:32px}
.hero h1{
  display:inline-block;
  font-size:30px;font-weight:700;line-height:1.2;margin-bottom:8px;
  background:linear-gradient(135deg,#00A3FF 0%,#FF1F8F 100%);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.hero-sub{font-size:14px;color:#666}
/* SECTION */
.section{margin-bottom:28px}
.section-label{
  font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;
  color:#00A3FF;margin-bottom:14px;
}
/* CONTACT TABLE */
.contact-table{
  width:100%;border-collapse:collapse;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:16px;overflow:hidden;
}
.contact-table tr{border-bottom:1px solid rgba(255,255,255,0.06)}
.contact-table tr:last-child{border-bottom:none}
.contact-table td{padding:11px 20px}
.cl{color:#666;font-size:12px;font-weight:500;width:90px}
.cv{color:#fff;font-size:13px}
/* PROBLEM CARD */
.problem-card{
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.1);
  border-left:4px solid #00A3FF;
  border-radius:16px;padding:22px 26px;
  color:#CCC;font-size:14px;line-height:1.75;
}
/* WORKFLOW */
.wf-grid{display:flex;gap:14px;margin-bottom:14px}
.wf-block{
  flex:1;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.1);
  border-radius:16px;padding:18px 22px;
}
.wf-current{border-left:4px solid #FF1F8F}
.wf-proposed{border-left:4px solid #00A3FF}
.wf-tag{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px}
.wf-current .wf-tag{color:#FF1F8F}
.wf-proposed .wf-tag{color:#00A3FF}
.wf-block p{color:#CCC;font-size:13px;line-height:1.7}
.key-change-box{
  display:flex;gap:14px;align-items:flex-start;
  background:rgba(123,47,255,0.1);border:1px solid rgba(123,47,255,0.25);
  border-radius:12px;padding:14px 18px;
  font-size:13px;color:#CCC;line-height:1.6;
}
.key-change-label{
  font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;
  color:#7B2FFF;white-space:nowrap;margin-top:2px;flex-shrink:0;
}
/* TIMELINE */
.timeline{display:block}
.tl-item{
  position:relative;
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.1);
  border-left:4px solid #00A3FF;
  border-radius:16px;
  padding:18px 22px 18px 68px;
  margin-bottom:12px;
}
.tl-dot{
  position:absolute;left:16px;top:50%;transform:translateY(-50%);
}
.tl-dot span{
  display:block;
  width:34px;height:34px;line-height:34px;text-align:center;
  border-radius:50%;
  background:linear-gradient(135deg,#00A3FF,#7B2FFF);
  font-size:12px;font-weight:700;color:#fff;
}
.tl-line{display:none}
.tl-line-last{display:none}
.tl-body{display:block}
.tl-title{font-size:15px;font-weight:600;color:#FFF;margin-bottom:4px}
.tl-desc{font-size:13px;color:#888;line-height:1.6}
/* TRANSCRIPT */
.transcript-section{margin-top:32px}
.transcript-divider{
  display:flex;align-items:center;gap:16px;margin-bottom:28px;
}
.transcript-divider h2{
  font-size:20px;font-weight:700;color:#FFF;white-space:nowrap;
}
.tline{flex:1;height:1px;background:rgba(255,255,255,0.1)}
.msg{
  background:rgba(255,255,255,0.03);
  border:1px solid rgba(255,255,255,0.07);
  border-radius:12px;padding:14px 18px;margin-bottom:10px;
}
.msg-user{border-left:3px solid #00A3FF}
.msg-ai{border-left:3px solid #7B2FFF}
.msg-label{
  font-size:10px;font-weight:700;letter-spacing:1px;
  text-transform:uppercase;margin-bottom:6px;
}
.msg-user .msg-label{color:#00A3FF}
.msg-ai .msg-label{color:#7B2FFF}
.msg-text{font-size:13px;color:#CCC;line-height:1.7}
/* FOOTER */
.doc-footer{
  margin-top:40px;padding-top:20px;
  border-top:1px solid rgba(255,255,255,0.1);
  display:flex;align-items:center;justify-content:space-between;
}
.footer-brand{
  font-size:13px;font-weight:600;
  background:linear-gradient(135deg,#00A3FF,#FF1F8F);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
}
.footer-note{font-size:11px;color:#444}
/* MOBILE */
@media screen and (max-width:680px){
  .page{padding:32px 24px 48px}
  .doc-header{flex-wrap:wrap;gap:12px}
  .doc-meta{text-align:left}
  .wf-grid{flex-direction:column}
  .hero h1{font-size:22px}
  .contact-table td{padding:9px 14px}
  .tl-item{padding:16px 16px 16px 58px}
  .msg{padding:12px 14px}
}
/* PRINT BAR */
.print-bar{
  position:fixed;bottom:0;left:0;right:0;
  background:rgba(10,10,10,0.95);backdrop-filter:blur(10px);
  border-top:1px solid rgba(255,255,255,0.1);
  padding:14px 24px;display:flex;gap:16px;
  align-items:center;justify-content:center;z-index:999;
}
.print-bar p{font-size:13px;color:#666}
.btn-print{
  padding:10px 28px;
  background:linear-gradient(135deg,#00A3FF,#7B2FFF);
  border:none;border-radius:8px;
  color:#fff;font-family:'Inter',sans-serif;
  font-size:14px;font-weight:600;cursor:pointer;
}
.btn-print:hover{opacity:0.85}
</style>
</head>
<body>

<div class="gradient-bar"></div>

<div class="page">

  <div class="doc-header">
    <img class="doc-logo" src="data:image/png;base64,${LOGO_B64}" alt="AI Sync 101">
    <div>
      <div class="doc-type">Discovery Session Summary</div>
      <div class="doc-date">${dateStr}</div>
    </div>
  </div>

  <div class="hero">
    <h1>${company ? self.esc(company) + ' \u2014 ' : ''}Discovery Session</h1>
    <p class="hero-sub">Pre-sales analysis prepared by AI Sync 101</p>
  </div>

  ${contactRows ? `<div class="section avoid-break">
    <div class="section-label">Contact Information</div>
    <table class="contact-table">${contactRows}</table>
  </div>` : ''}

  ${problem ? `<div class="section avoid-break">
    <div class="section-label">Problem Diagnosed</div>
    <div class="problem-card">${self.esc(problem)}</div>
  </div>` : ''}

  ${workflowSection}

  ${nextStepsHTML}

  ${this.state.messages.length ? `
  <div class="transcript-section">
    <div class="transcript-divider">
      <h2>Full Conversation</h2>
      <div class="tline"></div>
    </div>
    ${transcriptHTML}
  </div>` : ''}

  <div class="doc-footer avoid-break">
    <div class="footer-brand">AI Sync 101 &times; LAComputech</div>
    <div class="footer-note">Confidential &mdash; prepared for ${company ? self.esc(company) : 'prospect'}</div>
  </div>

</div>

<script>
var isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
if (!isMobile) {
  // Desktop: show print bar and auto-trigger print dialog
  document.write('<div class="print-bar no-print"><p>To save as PDF &rarr; click the button and choose &ldquo;Save as PDF&rdquo; in the dialog<\/p><button class="btn-print" onclick="window.print()">&#8595;&nbsp; Save as PDF<\/button><\/div>');
  window.addEventListener('load', function() {
    setTimeout(function() { window.print(); }, 900);
  });
}
<\/script>
</body>
</html>`;

        const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

        if (isMobile) {
            // Mobile: inject into a fullscreen overlay on the current page
            // (window.open / window.print are unreliable on iOS Safari)
            const overlay = document.createElement('div');
            overlay.id = 'pdf-overlay';
            overlay.style.cssText = [
                'position:fixed','top:0','left:0','right:0','bottom:0',
                'z-index:999999','background:#0A0A0A','overflow-y:auto',
                '-webkit-overflow-scrolling:touch'
            ].join(';');

            // Close button (always visible at top)
            const closeBar = document.createElement('div');
            closeBar.style.cssText = [
                'position:sticky','top:0','z-index:10',
                'background:rgba(10,10,10,0.95)',
                'backdrop-filter:blur(10px)',
                '-webkit-backdrop-filter:blur(10px)',
                'border-bottom:1px solid rgba(255,255,255,0.1)',
                'padding:12px 16px',
                'display:flex','align-items:center','justify-content:space-between',
                'gap:12px'
            ].join(';');
            closeBar.innerHTML =
                '<span style="font-family:Inter,sans-serif;font-size:13px;color:#888">' +
                "Use your browser's share menu to save as PDF" +
                '</span>' +
                '<button onclick="document.getElementById(\'pdf-overlay\').remove()" style="' +
                'padding:8px 16px;border:1px solid rgba(255,255,255,0.2);' +
                'border-radius:8px;background:transparent;color:#fff;' +
                'font-family:Inter,sans-serif;font-size:13px;cursor:pointer;white-space:nowrap;">' +
                '\u00d7 Close</button>';

            // iframe to render the HTML safely
            const iframe = document.createElement('iframe');
            iframe.style.cssText = 'width:100%;height:calc(100vh - 57px);border:none;display:block';
            iframe.setAttribute('sandbox', 'allow-same-origin allow-scripts');

            overlay.appendChild(closeBar);
            overlay.appendChild(iframe);
            document.body.appendChild(overlay);

            // Write HTML into iframe after appending
            const idoc = iframe.contentDocument || iframe.contentWindow.document;
            idoc.open();
            idoc.write(html);
            idoc.close();

        } else {
            // Desktop: open new window and auto-print
            const win = window.open('', '_blank', 'width=900,height=800');
            if (!win) {
                alert('Please allow pop-ups for this site to generate your PDF.');
                return;
            }
            win.document.write(html);
            win.document.close();
        }
    }

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
