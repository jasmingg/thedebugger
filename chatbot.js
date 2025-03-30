const chatboxContainer = document.getElementById('chatbox-container');
const chatboxMessages = document.getElementById('chatbox-messages');
const chatboxInput = document.getElementById('chatbox-input');
const chatboxSendButton = document.getElementById('chatbox-send-button');
let canSendMessage = false;

function addChatMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${sender === 'user' ? 'You:' : 'Miss Java:'} ${message}`;
    chatboxMessages.appendChild(messageDiv);
    chatboxMessages.scrollTop = chatboxMessages.scrollHeight; // Scroll to the bottom
}

chatboxSendButton.addEventListener('click', () => {
    if (canSendMessage) {
        const userMessage = chatboxInput.value.trim();
        if (userMessage) {
            addChatMessage(userMessage, 'user');
            chatboxInput.value = '';
            // The call to callGeminiAPI will need to be handled in the main file
            window.sendMessageToGemini(userMessage); // Use a global function to communicate
        }
    } else {
        console.warn("Cannot send message yet. Interaction not fully initialized.");
    }
});

chatboxInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && canSendMessage) {
        chatboxSendButton.click();
    }
});

function showChatbox() {
    chatboxContainer.style.display = 'block';
    chatboxInput.focus();
    canSendMessage = true;
}

function hideChatbox() {
    chatboxContainer.style.display = 'none';
    canSendMessage = false;
}