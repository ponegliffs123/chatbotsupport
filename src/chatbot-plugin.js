(function (window, document) {
    // Default configuration
    const defaults = {
        websocketUrl: 'wss://sme-api.jina.bot/api/llm/connect-socket/',
        token: 'jina_821a154c29d74af48b22cbbd7cb40c03mqKDgkZOAFqAY_6Vm8p6mL0424ux', // Replace with your token
        position: 'bottom-right', // Options: 'bottom-right', 'bottom-left', 'top-right', 'top-left'
        title: 'Chatbot', // Chatbox header title
    };

    // Merge user options with defaults
    function configure(options) {
        return { ...defaults, ...options };
    }

    // Inject CSS into the document
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #chatbot-plugin-chathead {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background-color: #0078ff;
                color: white;
                font-size: 24px;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: background-color 0.3s ease;
                z-index: 1000;
            }

            #chatbot-plugin-chathead:hover {
                background-color: #005bb5;
            }

            #chatbot-plugin-chatbox {
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 350px;
                max-height: 500px;
                background-color: white;
                border-radius: 12px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 1000;
            }

            #chatbot-plugin-chatbox-header {
                background-color: #0078ff;
                color: white;
                padding: 12px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top-left-radius: 12px;
                border-top-right-radius: 12px;
            }

            #chatbot-plugin-chatbox-header span {
                font-size: 16px;
                font-weight: 600;
            }

            #chatbot-plugin-chatbox-header button {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 10px;
            }

            #chatbot-plugin-chatbox-header button:hover {
                opacity: 0.8;
            }

            #chatbot-plugin-chatbox-messages {
                padding: 12px;
                flex-grow: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                background-color: #f9f9f9;
            }

            .message-wrapper {
                display: flex;
                flex-direction: column;
                max-width: 80%;
            }

            .message {
                padding: 10px 15px;
                border-radius: 12px;
                font-size: 14px;
                word-wrap: break-word;
                line-height: 1.4;
            }

            .user-message {
                background-color: #0078ff;
                color: white;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            }

            .bot-message {
                background-color: #e0e0e0;
                color: #333;
                align-self: flex-start;
                border-bottom-left-radius: 4px;
            }

            .timestamp {
                font-size: 10px;
                color: #888;
                margin-top: 4px;
                text-align: right;
            }

            #chatbot-plugin-chatbox-input {
                display: flex;
                border-top: 1px solid #ddd;
                padding: 12px;
                background-color: white;
            }

            #chatbot-plugin-chatbox-input input {
                flex-grow: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                outline: none;
                font-size: 14px;
                margin-right: 10px;
            }

            #chatbot-plugin-chatbox-input input:focus {
                border-color: #0078ff;
                box-shadow: 0 0 0 2px rgba(0, 120, 255, 0.2);
            }

            #chatbot-plugin-chatbox-input button {
                background-color: #0078ff;
                color: white;
                border: none;
                padding: 10px 16px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                transition: background-color 0.3s ease;
            }

            #chatbot-plugin-chatbox-input button:hover {
                background-color: #005bb5;
            }

            /* Typing animation styles */
            .typing-indicator {
                display: inline-block;
                margin-left: 8px;
            }

            .typing-indicator span {
                display: inline-block;
                width: 6px;
                height: 6px;
                background-color: #888;
                border-radius: 50%;
                margin: 0 2px;
                animation: typing 1s infinite;
            }

            .typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 100% {
                    transform: translateY(0);
                }
                50% {
                    transform: translateY(-4px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Inject HTML into the document
    function injectHTML(config) {
        const chathead = document.createElement('div');
        chathead.id = 'chatbot-plugin-chathead';
        chathead.innerHTML = '💬';

        const chatbox = document.createElement('div');
        chatbox.id = 'chatbot-plugin-chatbox';
        chatbox.innerHTML = `
            <div id="chatbot-plugin-chatbox-header">
                <span>${config.title}</span>
                <div>
                    <button id="chatbot-plugin-minimize-button">−</button>
                    <button id="chatbot-plugin-clear-button">Clear</button>
                </div>
            </div>
            <div id="chatbot-plugin-chatbox-messages"></div>
            <div id="chatbot-plugin-chatbox-input">
                <input type="text" id="chatbot-plugin-user-input" placeholder="Type a message...">
                <button id="chatbot-plugin-send-button">Send</button>
            </div>
        `;

        document.body.appendChild(chathead);
        document.body.appendChild(chatbox);
    }

    // Initialize the chatbot
    function init(options) {
        const config = configure(options);

        // Inject styles and HTML
        injectStyles();
        injectHTML(config);

        // Get DOM elements
        const chathead = document.getElementById('chatbot-plugin-chathead');
        const chatbox = document.getElementById('chatbot-plugin-chatbox');
        const chatboxMessages = document.getElementById('chatbot-plugin-chatbox-messages');
        const userInput = document.getElementById('chatbot-plugin-user-input');
        const sendButton = document.getElementById('chatbot-plugin-send-button');
        const clearButton = document.getElementById('chatbot-plugin-clear-button');
        const minimizeButton = document.getElementById('chatbot-plugin-minimize-button');

        let buffer = ''; // Buffer to store chunks of the bot's message

        // WebSocket connection
        const socket = new WebSocket(`${config.websocketUrl}?token=${config.token}`);

        socket.onopen = () => {
            console.log('WebSocket connection established');
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.chat_message && data.chat_message.role === 'assistant') {
                // Append the chunk to the buffer
                buffer += data.chat_message.content;

                // If the message is complete (done: true), display it
                if (data.done) {
                    // Show typing animation
                    const typingIndicator = document.createElement('div');
                    typingIndicator.className = 'message-wrapper';
                    typingIndicator.innerHTML = `
                        <div class="message bot-message">
                            <div class="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    `;
                    chatboxMessages.appendChild(typingIndicator);
                    chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Auto-scroll

                    // Simulate typing delay
                    setTimeout(() => {
                        // Remove typing indicator
                        chatboxMessages.removeChild(typingIndicator);

                        // Append the full message from the buffer
                        appendMessage('bot', buffer);

                        // Clear the buffer for the next message
                        buffer = '';
                    }, 1500); // Adjust delay as needed (e.g., 1.5 seconds)
                }
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            appendMessage('bot', 'Connection error. Please try again.');
        };

        socket.onclose = () => {
            console.log('WebSocket connection closed');
        };

        // Toggle chatbox visibility
        chathead.addEventListener('click', () => {
            chatbox.style.display = chatbox.style.display === 'none' ? 'flex' : 'none';
        });

        // Minimize the chatbox
        minimizeButton.addEventListener('click', () => {
            chatbox.style.display = 'none';
        });

        // Send user message
        sendButton.addEventListener('click', () => {
            const message = userInput.value.trim();
            if (message) {
                appendMessage('user', message);
                userInput.value = '';

                const messageObject = {
                    chat_message: {
                        content: message,
                        role: 'user',
                        use_agent: false,
                    },
                    conversation_id: '',
                    user_id: '',
                    virtual_assistant_id: '675958338882c8208677486c',
                };

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify(messageObject));
                } else {
                    console.error('WebSocket is not open. Unable to send message.');
                    appendMessage('bot', 'Connection error. Please try again.');
                }
            }
        });

        // Clear chat history
        clearButton.addEventListener('click', async () => {
            try {
                const response = await fetch('http://localhost:3000/clear', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await response.json();
                chatboxMessages.innerHTML = ''; // Clear the chatbox
                alert(data.message); // Notify the user
            } catch (error) {
                console.error('Error clearing conversation:', error);
            }
        });

        // Append a message to the chatbox
        function appendMessage(sender, message) {
            const messageElement = document.createElement('div');
            const timestampElement = document.createElement('span');

            // Apply sender-specific class for alignment
            messageElement.className = `message ${sender}-message`;
            messageElement.textContent = message; // Use full message, no splitting

            // Add timestamp
            timestampElement.className = "timestamp";
            const time = new Date();
            timestampElement.textContent = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Create wrapper for message and timestamp
            const wrapper = document.createElement('div');
            wrapper.className = "message-wrapper";
            wrapper.appendChild(messageElement);
            wrapper.appendChild(timestampElement);

            chatboxMessages.appendChild(wrapper); // Append to chatbox
            chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Auto-scroll
        }
    }

    // Expose the plugin to the global scope
    window.ChatbotPlugin = { init };
})(window, document);