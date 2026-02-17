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

    // ==========================================
    // PDF DOWNLOAD FEATURE
    // ==========================================

    loadJsPDF() {
        return new Promise((resolve) => {
            if (window.jspdf) { resolve(); return; }
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
            script.onload = () => resolve();
            document.head.appendChild(script);
        });
    }

    showDownloadButton() {
        const container = document.querySelector('.chat-input-container');
        if (!container) return;

        const btn = document.createElement('button');
        btn.id = 'downloadSessionBtn';
        btn.innerHTML = '&#8595; Download Session Summary';
        btn.style.cssText = [
            'width: 100%',
            'padding: 7px 12px',
            'background: transparent',
            'border: 1px solid #00A3FF',
            'border-radius: 6px',
            'color: #ffffff',
            'font-size: 12px',
            'font-family: Inter, sans-serif',
            'cursor: pointer',
            'transition: background 0.2s ease',
            'margin-bottom: 6px',
            'letter-spacing: 0.02em',
        ].join(';');

        btn.addEventListener('mouseenter', () => {
            btn.style.background = 'rgba(0, 163, 255, 0.1)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.background = 'transparent';
        });
        btn.addEventListener('click', () => this.generatePDF());

        container.insertBefore(btn, container.firstChild);
        this.elements.downloadBtn = btn;
    }

    extractWorkflowFromMessages() {
        const messages = this.state.messages;
        // Scan in reverse to find the most recent assistant message containing workflow info
        for (let i = messages.length - 1; i >= 0; i--) {
            const msg = messages[i];
            if (msg.role !== 'assistant') continue;
            const text = msg.content;
            if (!text.includes('CURRENT:') && !text.includes('PROPOSED:')) continue;

            let current = null;
            let proposed = null;
            let keyChange = null;

            // Extract CURRENT section
            if (text.includes('CURRENT:')) {
                const afterCurrent = text.split('CURRENT:')[1];
                const end = afterCurrent.search(/\n(PROPOSED:|KEY CHANGE:|$)/i);
                current = (end > -1 ? afterCurrent.substring(0, end) : afterCurrent).trim();
            }

            // Extract PROPOSED section
            if (text.includes('PROPOSED:')) {
                const afterProposed = text.split('PROPOSED:')[1];
                const end = afterProposed.search(/\n(CURRENT:|KEY CHANGE:|$)/i);
                proposed = (end > -1 ? afterProposed.substring(0, end) : afterProposed).trim();
            }

            // Extract KEY CHANGE section
            const keyChangeMatch = text.match(/KEY CHANGE:\s*([\s\S]*?)(?:\n\n|$)/i);
            if (keyChangeMatch) {
                keyChange = keyChangeMatch[1].trim();
            }

            return { current, proposed, keyChange };
        }
        return { current: null, proposed: null, keyChange: null };
    }

    async generatePDF() {
        await this.loadJsPDF();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        const pageW = 210;
        const pageH = 297;
        const margin = 14;
        const contentW = pageW - margin * 2;
        const companyName = this.state.leadInfo?.company || this.state.leadInfo?.name || null;
        const visitorName = this.state.leadInfo?.name || null;
        const visitorEmail = this.state.leadInfo?.email || null;
        const visitorPhone = this.state.leadInfo?.phone || null;
        const visitorWebsite = this.state.leadInfo?.website || null;
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const workflow = this.extractWorkflowFromMessages();

        // --- Derive problem text: prefer leadInfo.problem, fall back to first substantive user message ---
        let problemText = this.state.leadInfo?.problem || null;
        if (!problemText) {
            const firstUserMsg = this.state.messages.find(m => m.role === 'user' && m.content.length > 10);
            problemText = firstUserMsg ? firstUserMsg.content : 'No problem statement captured yet.';
        }

        // ---- Helpers ----
        const hexToRgb = (hex) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const setFill = (hex) => { const [r, g, b] = hexToRgb(hex); doc.setFillColor(r, g, b); };
        const setTextColor = (hex) => { const [r, g, b] = hexToRgb(hex); doc.setTextColor(r, g, b); };

        // Draw full-page dark background
        const darkBg = () => {
            setFill('#0A0A0A');
            doc.rect(0, 0, pageW, pageH, 'F');
        };

        // Gradient separator line
        const gradientLine = (y) => {
            const segW = contentW / 3;
            setFill('#00A3FF');
            doc.rect(margin, y, segW, 0.5, 'F');
            setFill('#7B2FFF');
            doc.rect(margin + segW, y, segW, 0.5, 'F');
            setFill('#FF1F8F');
            doc.rect(margin + segW * 2, y, segW, 0.5, 'F');
        };

        const drawHeader = () => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            setTextColor('#FFFFFF');
            doc.setCharSpace(2);
            doc.text('AI SYNC 101', margin, 13);
            doc.setCharSpace(0);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            setTextColor('#00A3FF');
            doc.text('Discovery Session Summary', pageW - margin, 13, { align: 'right' });
            gradientLine(16.5);
        };

        const drawFooter = () => {
            gradientLine(pageH - 14);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            setTextColor('#FFFFFF');
            doc.text('aisync101.com', pageW / 2, pageH - 9, { align: 'center' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            setTextColor('#AAAAAA');
            doc.text('We build what you need, not what we sell', pageW / 2, pageH - 5, { align: 'center' });
        };

        // Card with left accent border
        const drawCard = (y, height, borderColor) => {
            setFill('#161616');
            doc.rect(margin, y, contentW, height, 'F');
            setFill(borderColor || '#00A3FF');
            doc.rect(margin, y, 2.5, height, 'F');
        };

        // Section label — returns y after label
        const sectionLabel = (text, y) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setTextColor('#666666');
            doc.setCharSpace(1.5);
            doc.text(text.toUpperCase(), margin, y);
            doc.setCharSpace(0);
            return y + 3.5;
        };

        // Measure card height for given text at fontSize 8.5, maxWidth, lineH
        const measureCardH = (text, maxWidth, lineH, padY) => {
            doc.setFontSize(8.5);
            const lines = doc.splitTextToSize(text, maxWidth);
            return lines.length * lineH + padY * 2 + 5;
        };

        // Render plain wrapped text inside a card
        const cardText = (text, x, y, maxWidth, lineH) => {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setTextColor('#DDDDDD');
            const lines = doc.splitTextToSize(text, maxWidth);
            doc.text(lines, x, y);
            return y + lines.length * lineH;
        };

        // Numbered list inside card
        const numberedList = (rawText, startX, startY, maxWidth, lineH) => {
            if (!rawText) return startY;
            const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            let y = startY;
            let num = 1;
            for (const line of lines) {
                const clean = line.replace(/^[\d]+[.)]\s*/, '').replace(/^[-*]\s*/, '');
                if (!clean) continue;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(8.5);
                setTextColor('#DDDDDD');
                const wrapped = doc.splitTextToSize(`${num}. ${clean}`, maxWidth);
                doc.text(wrapped, startX, y);
                y += wrapped.length * lineH;
                num++;
            }
            return y;
        };

        const LH = 4.2;   // line height for body text
        const PAD = 4;     // card vertical padding (top + bottom)
        const GAP = 5;     // gap between sections
        const INNER = contentW - 9; // text width inside card

        // =============================================
        // PAGE 1 — SUMMARY
        // =============================================
        darkBg();
        drawHeader();

        let y = 22;

        // Meta line: date | company
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        setTextColor('#555555');
        const metaLine = companyName ? `${dateStr}  ·  ${companyName}` : dateStr;
        doc.text(metaLine, margin, y);
        y += 7;

        // --- PROBLEM DIAGNOSED ---
        y = sectionLabel('Problem Diagnosed', y);
        {
            doc.setFontSize(8.5);
            const pLines = doc.splitTextToSize(problemText, INNER);
            const cardH = pLines.length * LH + PAD * 2 + 5;
            drawCard(y, cardH, '#00A3FF');
            doc.setFont('helvetica', 'normal');
            setTextColor('#DDDDDD');
            doc.text(pLines, margin + 6, y + PAD + 3.5);
            y += cardH + GAP;
        }

        // --- CURRENT WORKFLOW ---
        y = sectionLabel('Current Workflow', y);
        {
            const currentText = workflow.current || 'Workflow not yet mapped in conversation.';
            doc.setFontSize(8.5);
            // Measure all lines
            let totalLines = 0;
            const cleanLines = currentText.split('\n').map(l => l.trim()).filter(l => l);
            cleanLines.forEach(l => {
                const clean = l.replace(/^[\d]+[.)]\s*/, '').replace(/^[-*]\s*/, '');
                totalLines += doc.splitTextToSize(clean ? `1. ${clean}` : l, INNER).length;
            });
            const cardH = Math.max(totalLines * LH + PAD * 2 + 5, 14);
            drawCard(y, cardH, '#00A3FF');
            numberedList(currentText, margin + 6, y + PAD + 3.5, INNER, LH);
            y += cardH + GAP;
        }

        // --- PROPOSED WORKFLOW ---
        y = sectionLabel('Proposed Workflow', y);
        {
            const proposedText = workflow.proposed || 'Proposed solution not yet defined.';
            doc.setFontSize(8.5);
            let totalLines = 0;
            const cleanLines = proposedText.split('\n').map(l => l.trim()).filter(l => l);
            cleanLines.forEach(l => {
                const clean = l.replace(/^[\d]+[.)]\s*/, '').replace(/^[-*]\s*/, '');
                totalLines += doc.splitTextToSize(clean ? `1. ${clean}` : l, INNER).length;
            });
            const cardH = Math.max(totalLines * LH + PAD * 2 + 5, 14);
            drawCard(y, cardH, '#FF1F8F');
            numberedList(proposedText, margin + 6, y + PAD + 3.5, INNER, LH);
            y += cardH + GAP;
        }

        // --- KEY CHANGE ---
        if (workflow.keyChange) {
            y = sectionLabel('Key Change', y);
            doc.setFontSize(8.5);
            const kcLines = doc.splitTextToSize(workflow.keyChange, INNER);
            const cardH = kcLines.length * LH + PAD * 2 + 5;
            drawCard(y, cardH, '#7B2FFF');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8.5);
            setTextColor('#FFFFFF');
            doc.text(kcLines, margin + 6, y + PAD + 3.5);
            y += cardH + GAP;
        }

        // --- NEXT STEPS (contact info + CTA) ---
        if (visitorName || visitorEmail || visitorPhone) {
            y = sectionLabel('Next Steps', y);
            // Two-column row: contact info left, CTA right
            const rowH = 18;
            setFill('#161616');
            doc.rect(margin, y, contentW, rowH, 'F');
            // Left accent
            setFill('#00A3FF');
            doc.rect(margin, y, 2.5, rowH, 'F');

            // Contact info lines
            let contactY = y + 5;
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            setTextColor('#AAAAAA');
            doc.setCharSpace(0.5);
            doc.text('CONTACT', margin + 6, contactY);
            doc.setCharSpace(0);
            contactY += 3.5;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            setTextColor('#FFFFFF');
            const contactParts = [visitorName, visitorEmail, visitorPhone, visitorWebsite].filter(Boolean);
            doc.text(contactParts.join('  ·  '), margin + 6, contactY);

            // Right side CTA
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(8);
            setTextColor('#00A3FF');
            doc.text('Discovery call within 24 hours', pageW - margin, y + 8, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(7.5);
            setTextColor('#555555');
            doc.text('info@aisync101.com', pageW - margin, y + 13, { align: 'right' });

            y += rowH + GAP;
        }

        drawFooter();

        // =============================================
        // PAGE 2+ — FULL CONVERSATION
        // =============================================
        doc.addPage();
        darkBg();
        drawHeader();

        y = 22;
        const cardPadX = 5;
        const cardPadY = 3.5;

        for (const msg of this.state.messages) {
            const isUser = msg.role === 'user';
            const labelText = isUser ? 'YOU' : 'AI SYNC 101';
            const bgColor = isUser ? '#161616' : '#1E1E1E';
            const labelColor = isUser ? '#00A3FF' : '#FF1F8F';

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            const textLines = doc.splitTextToSize(msg.content, contentW - cardPadX * 2 - 2);
            const cardH = textLines.length * LH + cardPadY * 2 + 5;

            // Only add new page if this card genuinely doesn't fit
            if (y + cardH > pageH - 18) {
                drawFooter();
                doc.addPage();
                darkBg();
                drawHeader();
                y = 22;
            }

            setFill(bgColor);
            doc.rect(margin, y, contentW, cardH, 'F');

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(6.5);
            setTextColor(labelColor);
            doc.setCharSpace(1);
            doc.text(labelText, margin + cardPadX, y + cardPadY + 2);
            doc.setCharSpace(0);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8.5);
            setTextColor('#CCCCCC');
            doc.text(textLines, margin + cardPadX, y + cardPadY + 6.5);

            y += cardH + 2;
        }

        drawFooter();

        // Save
        const safeName = (companyName || 'Session').replace(/[^a-zA-Z0-9]/g, '-');
        doc.save(`AISSync101-Discovery-${safeName}.pdf`);
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
