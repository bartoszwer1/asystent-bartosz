// public/script.js

// Elementy DOM
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');
const conversation = document.getElementById('conversation');
const container = document.querySelector('.container'); // Kontener główny
const loading = document.getElementById('loading');

const historyButton = document.getElementById('historyButton');
const historySidebar = document.getElementById('historySidebar');
const closeHistoryButton = document.getElementById('closeHistory');
const historyList = document.getElementById('historyList');
const newHistoryButton = document.getElementById('newHistoryButton');
const deleteHistoriesButton = document.getElementById('deleteHistoriesButton');

const modelButton = document.getElementById('modelButton');
const modelModal = document.getElementById('modelModal');
const closeModelModal = document.getElementById('closeModelModal');
const modelOptions = document.querySelectorAll('.model-option');

// Aktualny wybrany historyId
let currentHistoryId = null;

// Aktualny wybrany model
let currentModel = "gpt-4o"; // Domyślny model

// Funkcja do animacji rozmiaru kontenera
let isExpanded = false;

function expandContainer() {
    if (!isExpanded) {
        container.classList.add('expanded');
        isExpanded = true;
    }
}

// Funkcja do dodawania wiadomości do konwersacji
function addMessage(sender, text) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    
    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    if (sender === 'assistant') {
        // Przekształć Markdown na HTML i oczyść
        const dirtyHTML = marked.parse(text);
        const cleanHTML = DOMPurify.sanitize(dirtyHTML);
        textDiv.innerHTML = cleanHTML;
    } else {
        // Dla wiadomości użytkownika wyświetl jako tekst
        textDiv.textContent = text;
    }
    
    messageDiv.appendChild(textDiv);
    conversation.appendChild(messageDiv);
    
    // Przewiń do dołu konwersacji
    conversation.scrollTop = conversation.scrollHeight;
}

// Funkcja do wysyłania zapytania do backendu
async function sendMessage(message) {
    if (!currentHistoryId) {
        alert('Proszę utworzyć lub wybrać historię czatu.');
        return;
    }

    addMessage('user', message);
    expandContainer(); // Wywołanie animacji po wysłaniu wiadomości
    loading.classList.remove('hidden'); // Pokazanie ładowania

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ historyId: currentHistoryId, message: message, model: currentModel })
        });
        
        const result = await response.json();
        if (response.ok) {
            addMessage('assistant', result.reply);
        } else {
            addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
        }
        
    } catch (error) {
        console.error('Błąd:', error);
        addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
    } finally {
        loading.classList.add('hidden'); // Ukrycie ładowania
    }
}

// Funkcja do otwierania bocznego panelu historii
function openHistorySidebar() {
    historySidebar.classList.remove('hidden');
    historySidebar.classList.add('visible');
}

// Funkcja do zamykania bocznego panelu historii
function closeHistorySidebarFunc() { // Zmieniono nazwę funkcji, aby uniknąć konfliktu z `closeHistoryButton`
    historySidebar.classList.remove('visible');
    historySidebar.classList.add('hidden');
}

// Funkcja do ładowania listy historii
async function loadHistories() {
    try {
        const response = await fetch('/api/histories');
        const data = await response.json();
        displayHistories(data.histories);
    } catch (error) {
        console.error('Błąd podczas ładowania historii:', error);
    }
}

// Funkcja do wyświetlania listy historii w bocznym panelu
function displayHistories(histories) {
    historyList.innerHTML = ''; // Czyści listę

    histories.forEach(history => {
        const historyItem = document.createElement('div');
        historyItem.classList.add('history-item');
        historyItem.textContent = `${history.name} (${history.createdAt})`;
        historyItem.dataset.historyId = history.id;

        // Dodanie klasy 'active' jeśli to aktualnie wybrana historia
        if (history.id === currentHistoryId) {
            historyItem.classList.add('active');
        }

        historyItem.addEventListener('click', () => {
            selectHistory(history.id);
            closeHistorySidebarFunc();
        });

        historyList.appendChild(historyItem);
    });
}

// Funkcja do wybierania historii
async function selectHistory(historyId) {
    currentHistoryId = historyId;
    highlightActiveHistory();
    await loadConversation(historyId);
}

// Funkcja do wyróżnienia aktywnej historii
function highlightActiveHistory() {
    const items = document.querySelectorAll('.history-item');
    items.forEach(item => {
        if (item.dataset.historyId === currentHistoryId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Funkcja do ładowania konwersacji z wybranej historii
async function loadConversation(historyId) {
    conversation.innerHTML = ''; // Czyści aktualną konwersację

    try {
        const response = await fetch(`/api/histories/${historyId}`);
        const data = await response.json();
        if (response.ok) {
            data.history.forEach(msg => {
                addMessage(msg.role, msg.content);
            });
        } else {
            console.error('Błąd podczas ładowania historii:', data.error);
        }
    } catch (error) {
        console.error('Błąd:', error);
    }
}

// Funkcja do tworzenia nowej historii
async function createNewHistory() {
    try {
        const response = await fetch('/api/histories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            currentHistoryId = data.historyId;
            highlightActiveHistory();
            conversation.innerHTML = ''; // Czyści konwersację
            loadHistories(); // Odświeża listę historii
        } else {
            alert('Błąd podczas tworzenia nowej historii.');
        }
    } catch (error) {
        console.error('Błąd:', error);
    }
}

// Funkcja do usuwania wszystkich historii
async function deleteAllHistories() {
    const confirmDelete = confirm('Czy na pewno chcesz usunąć wszystkie historie czatów?');
    if (!confirmDelete) return;

    try {
        const response = await fetch('/api/histories', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (response.ok) {
            currentHistoryId = null;
            conversation.innerHTML = ''; // Czyści konwersację
            loadHistories(); // Odświeża listę historii
            alert('Wszystkie historie zostały usunięte.');
        } else {
            alert('Błąd podczas usuwania historii.');
        }
    } catch (error) {
        console.error('Błąd:', error);
    }
}

// Funkcja do otwierania modalu wyboru modelu
function openModelModal() {
    modelModal.classList.remove('hidden');
}

// Funkcja do zamykania modalu wyboru modelu
function closeModelModalFunc() { // Zmieniono nazwę funkcji, aby uniknąć konfliktu z `closeModelModal`
    modelModal.classList.add('hidden');
}

// Funkcja do aktualizacji przycisku modelu
function updateModelButton() {
    const modelName = getModelDisplayName(currentModel);
    modelButton.textContent = `Model: ${modelName}`;
}

// Funkcja do mapowania nazwy modelu na wyświetlaną nazwę
function getModelDisplayName(model) {
    switch(model) {
        case 'gpt-4o':
            return 'GPT-4o';
        case 'o1-mini':
            return 'o1-mini';
        case 'o1-preview':
            return 'o1-preview';
        default:
            return 'GPT-4o';
    }
}

// Funkcja do obsługi wyboru modelu
function handleModelSelection(model) {
    currentModel = model;
    updateModelButton();
    closeModelModalFunc();
}

// Event Listeners
sendButton.addEventListener('click', () => {
    const message = userInput.value.trim();
    if (message !== '') {
        sendMessage(message);
        userInput.value = '';
    }
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendButton.click();
    }
});

historyButton.addEventListener('click', () => {
    openHistorySidebar();
});

closeHistoryButton.addEventListener('click', () => {
    closeHistorySidebarFunc();
});

newHistoryButton.addEventListener('click', () => {
    createNewHistory();
});

deleteHistoriesButton.addEventListener('click', () => {
    deleteAllHistories();
});

modelButton.addEventListener('click', () => {
    openModelModal();
});

closeModelModal.addEventListener('click', () => {
    closeModelModalFunc();
});

// Obsługa wyboru modelu
modelOptions.forEach(option => {
    option.addEventListener('click', () => {
        const selectedModel = option.getAttribute('data-model');
        handleModelSelection(selectedModel);
    });
});

// Inicjalizacja po załadowaniu strony
window.addEventListener('DOMContentLoaded', async () => {
    await loadHistories();
    updateModelButton();
});