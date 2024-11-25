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

// Modal do zmiany nazwy historii
const renameModal = document.createElement('div');
renameModal.id = 'renameModal';
renameModal.classList.add('rename-modal', 'hidden');
renameModal.innerHTML = `
    <div class="rename-modal-content">
        <span class="close">&times;</span>
        <h2>Zmiana Nazwy Historii</h2>
        <input type="text" id="newHistoryName" placeholder="Nowa nazwa historii" />
        <button id="saveHistoryName">Zapisz</button>
    </div>
`;
document.body.appendChild(renameModal);

const closeRenameModalButton = renameModal.querySelector('.close');
const saveHistoryNameButton = document.getElementById('saveHistoryName');
const newHistoryNameInput = document.getElementById('newHistoryName');

// Aktualny wybrany historyId
let currentHistoryId = null;

// Aktualny wybrany model
let currentModel = "gpt-4o"; // Domyślny model

// Przechowywanie ID historii, którą zmieniamy nazwę
let historyIdToRename = null;

// Funkcja do animacji rozmiaru kontenera
let isExpanded = false;

function expandContainer() {
    if (!isExpanded) {
        container.classList.add('expanded');
        isExpanded = true;
    }
}

expandContainer(); // Wywołanie animacji po wysłaniu wiadomości

// Funkcja do dodawania wiadomości do konwersacji
function addMessage(sender, text, isImage = false) {
    // Ignoruj wiadomości z rolą 'system'
    if (sender === 'system') return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    if (sender === 'assistant' && isImage) {
        // Wyświetlanie obrazu
        const img = document.createElement('img');
        img.src = text;
        img.alt = 'Generated Image';
        img.classList.add('generated-image');
        textDiv.appendChild(img);
    } else if (sender === 'assistant') {
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
            if (currentModel === 'dall-e-2' || currentModel === 'dall-e-3') {
                addMessage('assistant', result.image_url, true);
            } else {
                addMessage('assistant', result.reply);
            }
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
        historyItem.innerHTML = `
            <span class="history-name">${history.name} (${history.createdAt})</span>
            <button class="rename-button">Rename</button>
        `;
        historyItem.dataset.historyId = history.id;

        // Dodanie klasy 'active' jeśli to aktualnie wybrana historia
        if (history.id === currentHistoryId) {
            historyItem.classList.add('active');
        }

        // Obsługa kliknięcia na nazwę historii
        historyItem.querySelector('.history-name').addEventListener('click', () => {
            selectHistory(history.id);
            closeHistorySidebarFunc();
        });

        // Obsługa kliknięcia na przycisk "Rename"
        historyItem.querySelector('.rename-button').addEventListener('click', () => {
            openRenameModal(history.id, history.name);
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
            data.history.messages.forEach(msg => {
                // Wyświetlaj tylko wiadomości z rolami 'user' i 'assistant'
                if (msg.role === 'user' || msg.role === 'assistant') {
                    if (msg.role === 'assistant' && (currentModel === 'dall-e-2' || currentModel === 'dall-e-3')) {
                        addMessage(msg.role, msg.content, true);
                    } else {
                        addMessage(msg.role, msg.content);
                    }
                }
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
    const newName = prompt('Podaj nazwę nowej historii:', `Chat ${new Date().toISOString().split('T')[0]}`);
    if (newName === null) return; // Anulowano

    try {
        const response = await fetch('/api/histories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
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
        case 'dall-e-2':
            return 'DALL-E 2';
        case 'dall-e-3':
            return 'DALL-E 3';
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

// Funkcja do otwierania modalu renamingu
function openRenameModal(historyId, currentName) {
    historyIdToRename = historyId;
    newHistoryNameInput.value = currentName;
    renameModal.classList.remove('hidden');
    newHistoryNameInput.focus();
}

// Funkcja do zamykania modalu renamingu
function closeRenameModalFunc() {
    renameModal.classList.add('hidden');
    historyIdToRename = null;
}

// Funkcja do zapisania nowej nazwy historii
async function saveHistoryName() {
    const newName = newHistoryNameInput.value.trim();
    if (newName === '') {
        alert('Nazwa nie może być pusta.');
        return;
    }

    try {
        const response = await fetch(`/api/histories/${historyIdToRename}/rename`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newName: newName })
        });
        const data = await response.json();
        if (response.ok) {
            alert('Nazwa historii została zmieniona.');
            loadHistories();
            closeRenameModalFunc();
        } else {
            alert(`Błąd: ${data.error}`);
        }
    } catch (error) {
        console.error('Błąd:', error);
        alert('Wystąpił błąd podczas zmiany nazwy historii.');
    }
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

// Obsługa zamknięcia modalu renamingu
closeRenameModalButton.addEventListener('click', () => {
    closeRenameModalFunc();
});

// Obsługa zapisywania nowej nazwy historii
saveHistoryNameButton.addEventListener('click', () => {
    saveHistoryName();
});

// Zamknięcie modalu po kliknięciu poza jego zawartością
renameModal.addEventListener('click', (e) => {
    if (e.target === renameModal) {
        closeRenameModalFunc();
    }
});

// Inicjalizacja po załadowaniu strony
window.addEventListener('DOMContentLoaded', async () => {
    await loadHistories();
    updateModelButton();
});