# Chatbot Plugin

A modern chatbot plugin for websites. Easily integrate a chatbot into your website with just a few lines of code.

## Installation

### Via CDN

Include the following script in your HTML file:

```html
<script src="https://cdn.jsdelivr.net/gh/your-username/your-repo@latest/dist/chatbot-plugin.min.js"></script>
<script>
    ChatbotPlugin.init({
        websocketUrl: 'wss://sme-api.jina.bot/api/llm/connect-socket/',
        token: 'your-token-here',
        title: 'Chatbot',
        position: 'bottom-right',
    });
</script>

