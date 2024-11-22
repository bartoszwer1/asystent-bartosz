// Endpoint backendu
const API_ENDPOINT = 'http://localhost:3000/api/chat';

// Elementy DOM
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');
const conversation = document.getElementById('conversation');
const container = document.querySelector('.container'); // Dodany kontener

// Funkcja do dodawania wiadomości do konwersacji
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    if (sender === 'assistant') {
        // Przekształć Markdown na HTML
        textDiv.innerHTML = marked.parse(text);
    } else {
        // Dla wiadomości użytkownika wyświetl jako tekst
        textDiv.textContent = text;
    }
    
    messageDiv.appendChild(textDiv);
    conversation.appendChild(messageDiv);
    
    // Przewiń do dołu konwersacji
    conversation.scrollTop = conversation.scrollHeight;
}

// Funkcja do animacji rozmiaru kontenera
function expandContainer() {
    container.classList.add('expanded');
}

// Funkcja do wysyłania zapytania do backendu
async function sendMessage(message) {
    addMessage('user', message);
    
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: message })
        });
        
        const result = await response.json();
        if (response.ok) {
            addMessage('assistant', result.reply);
            expandContainer(); // Wywołanie animacji po wysłaniu wiadomości
        } else {
            addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
        }
        
    } catch (error) {
        console.error('Błąd:', error);
        addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
    }
}

// Obsługa kliknięcia przycisku "Wyślij"
sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message !== '') {
        sendMessage(message);
        userInput.value = '';
    }
});

// Obsługa naciśnięcia klawisza Enter w polu input
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});