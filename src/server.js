const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const fetch = require('node-fetch');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 3000;

const defaultVirtualAssistantID = "675958338882c8208677486c";
const imuraiWSURL = "wss://sme-api.jina.bot/api/llm/connect-socket/";
const imuraiAPIURL = `https://sme-api.jina.bot/api/virtual-assistants/${defaultVirtualAssistantID}/send-message`;

let conversationHistory = [];

// Enable CORS for all routes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

async function sendMessageToImurai(userMessage) {
    try {
        const response = await fetch(imuraiAPIURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error Response:', errorData);
            throw new Error('Failed to send message to Imurai API');
        }

        const data = await response.json();

        // Format the message to remove unnecessary line breaks
        const formattedMessage = data.response.replace(/\n/g, ' '); // Replace line breaks with spaces
        return formattedMessage;
    } catch (error) {
        console.error('Imurai API error:', error);
        throw new Error('Failed to send message to Imurai API');
    }
}

const imuraiWS = new WebSocket(imuraiWSURL);

imuraiWS.on('open', () => {
    console.log('Connected to Imurai WebSocket server');
});

imuraiWS.on('message', (data) => {
    console.log('Received from Imurai WebSocket:', data.toString());
});

imuraiWS.on('error', (error) => {
    console.error('Imurai WebSocket error:', error);
});

imuraiWS.on('close', () => {
    console.log('Disconnected from Imurai WebSocket server');
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', async (message) => {
        const data = JSON.parse(message);

        if (data.chat_message && data.chat_message.role === 'user') {
            conversationHistory.push({
                role: 'user',
                content: data.chat_message.content,
                created_at: new Date().toISOString(),
            });

            try {
                const botResponse = await sendMessageToImurai(data.chat_message.content);
                console.log('Sending bot response:', botResponse); // Debug: Log the bot response

                ws.send(JSON.stringify({
                    chat_message: {
                        content: botResponse,
                        role: 'assistant',
                    },
                    done: true,
                }));

                conversationHistory.push({
                    role: 'assistant',
                    content: botResponse,
                    created_at: new Date().toISOString(),
                });
            } catch (error) {
                console.error('Error generating bot response:', error);
                ws.send(JSON.stringify({
                    chat_message: {
                        content: 'Sorry, I am unable to process your request at the moment.',
                        role: 'assistant',
                    },
                    done: true,
                }));
            }
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
app.get('/virtual-assistant', async (req, res) => {
    try {
        const response = await fetch('https://sme.api.jin.android', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch virtual assistant details");
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/clear-conversation', (req, res) => {
    conversationHistory = [];
    res.json({ message: 'Conversation history cleared' });
});

server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});