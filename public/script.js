// public/script.js

// Elementy DOM
const sendButton = document.getElementById('sendButton');
const userInput = document.getElementById('userInput');
const conversation = document.getElementById('conversation');
const container = document.querySelector('.container'); // Kontener główny
// const loading = document.getElementById('loading');

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

// Kontener dla parametrów generowania obrazów
const imageParameters = document.getElementById('imageParameters');

function showTypingIndicator() {
    const typingIndicator = document.createElement('div');
    typingIndicator.classList.add('typing-indicator');
    typingIndicator.innerHTML = `
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
    `;
    conversation.appendChild(typingIndicator);
    conversation.scrollTop = conversation.scrollHeight;
    return typingIndicator;
}

function removeTypingIndicator(indicator) {
    if (indicator) {
        indicator.remove();
    }
}

// // Przycisk przełączania trybu
// const toggleThemeButton = document.getElementById('toggleTheme');

// // Funkcja do przełączania trybu
// function toggleTheme() {
//     document.body.classList.toggle('light-mode');
//     // Zapisz preferencje użytkownika w localStorage
//     if (document.body.classList.contains('light-mode')) {
//         localStorage.setItem('theme', 'light');
//     } else {
//         localStorage.setItem('theme', 'dark');
//     }
// }

// // Event Listener dla przycisku przełączania trybu
// toggleThemeButton.addEventListener('click', toggleTheme);

// // Inicjalizacja motywu na podstawie zapisanych preferencji
// window.addEventListener('DOMContentLoaded', () => {
//     const savedTheme = localStorage.getItem('theme');
//     if (savedTheme === 'light') {
//         document.body.classList.add('light-mode');
//     }
// });

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

// Modal do wyboru opcji dodania obrazu
const imageUploadModal = document.createElement('div');
imageUploadModal.id = 'imageUploadModal';
imageUploadModal.classList.add('image-upload-modal', 'hidden');
imageUploadModal.innerHTML = `
    <div class="image-upload-modal-content">
        <h2>Dodaj Obraz</h2>
        <div class="option">
            <input type="radio" id="addFromDisk" name="imageOption" value="disk" checked>
            <label for="addFromDisk">Dodaj obraz z dysku</label>
        </div>
        <div class="option">
            <input type="radio" id="addFromLink" name="imageOption" value="link">
            <label for="addFromLink">Wstaw link do obrazka</label>
        </div>
        <div class="modal-buttons">
            <button id="cancelImageUpload">Anuluj</button>
            <button id="confirmImageUpload">OK</button>
        </div>
    </div>
`;
document.body.appendChild(imageUploadModal);

// Funkcje do otwierania i zamykania modalu dodawania obrazu
function openImageUploadModal() {
    imageUploadModal.classList.remove('hidden');
    imageUploadModal.classList.add('visible');
}

function closeImageUploadModal() {
    imageUploadModal.classList.remove('visible');
    imageUploadModal.classList.add('hidden');
}

// Event Listeners dla przycisków modalu dodawania obrazu
document.getElementById('cancelImageUpload').addEventListener('click', () => {
    closeImageUploadModal();
});

document.getElementById('confirmImageUpload').addEventListener('click', () => {
    const selectedOption = document.querySelector('input[name="imageOption"]:checked').value;
    closeImageUploadModal();
    if (selectedOption === 'disk') {
        openFileSelection();
    } else if (selectedOption === 'link') {
        openLinkInput();
    }
});

// Funkcja do otwierania okna wyboru pliku
function openFileSelection() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    fileInput.id = 'finalFileInput';
    document.body.appendChild(fileInput);

    fileInput.click();

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            displaySelectedImage(file);
        }
        fileInput.remove();
    });
}

// Funkcja do otwierania okna wprowadzania linku
function openLinkInput() {
    const linkInputModal = document.createElement('div');
    linkInputModal.id = 'linkInputModal';
    linkInputModal.classList.add('image-upload-modal', 'hidden');
    linkInputModal.innerHTML = `
        <div class="image-upload-modal-content">
            <h2>Wstaw Link do Obrazka</h2>
            <input type="text" id="imageLinkInput" placeholder="Wklej URL obrazka..." />
            <div class="modal-buttons">
                <button id="cancelLinkInput">Anuluj</button>
                <button id="confirmLinkInput">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(linkInputModal);
    linkInputModal.classList.remove('hidden');

    // Event Listeners dla przycisków modalu wstawiania linku
    document.getElementById('cancelLinkInput').addEventListener('click', () => {
        linkInputModal.remove();
    });

    document.getElementById('confirmLinkInput').addEventListener('click', () => {
        const link = document.getElementById('imageLinkInput').value.trim();
        if (link) {
            displaySelectedLink(link);
        } else {
            alert('Proszę wprowadzić poprawny URL.');
        }
        linkInputModal.remove();
    });
}

// Funkcja do wyświetlania wybranego obrazu z dysku
function displaySelectedImage(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const imageURL = e.target.result;

        // Usuń istniejący kontener, jeśli istnieje
        const existingContainer = document.getElementById('selectedImageContainer');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Stwórz nowy kontener
        const selectedImageContainer = document.createElement('div');
        selectedImageContainer.id = 'selectedImageContainer';

        selectedImageContainer.innerHTML = `
            <div class="image-info">
                <img src="${imageURL}" alt="${file.name}">
                <span>${file.name}</span>
            </div>
            <button id="sendSelectedImage">Wyślij Obraz</button>
        `;

        // Dodaj do input-area
        document.querySelector('.input-area').appendChild(selectedImageContainer);

        // Event Listener dla przycisku wysyłania obrazu
        document.getElementById('sendSelectedImage').addEventListener('click', () => {
            sendImage(file, true);
            // Usuń kontener po wysłaniu
            selectedImageContainer.remove();
            // Przywróć przycisk +
            restoreAddImageButton();
        });
    };
    reader.readAsDataURL(file);
}

// Funkcja do wyświetlania wprowadzonego linku
function displaySelectedLink(link) {
    // Usuń istniejący kontener, jeśli istnieje
    const existingContainer = document.getElementById('selectedImageContainer');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Stwórz nowy kontener
    const selectedImageContainer = document.createElement('div');
    selectedImageContainer.id = 'selectedImageContainer';

    selectedImageContainer.innerHTML = `
        <div class="image-info">
            <img src="${link}" alt="Obrazek z linku">
            <span>${link}</span>
        </div>
        <button id="sendSelectedImage">Wyślij Obraz</button>
    `;

    // Dodaj do input-area
    document.querySelector('.input-area').appendChild(selectedImageContainer);

    // Event Listener dla przycisku wysyłania obrazu
    document.getElementById('sendSelectedImage').addEventListener('click', () => {
        sendImage(link, false);
        // Usuń kontener po wysłaniu
        selectedImageContainer.remove();
        // Przywróć przycisk +
        restoreAddImageButton();
    });
}

// Funkcja do przywracania przycisku dodawania obrazu
function restoreAddImageButton() {
    // Usuń istniejący kontener z wybranym obrazem lub linkiem, jeśli istnieje
    const selectedImageContainer = document.getElementById('selectedImageContainer');
    if (selectedImageContainer) {
        selectedImageContainer.remove();
    }

    // Dodaj przycisk +
    if (!document.getElementById('addImageButton')) {
        const addImageButton = document.createElement('button');
        addImageButton.id = 'addImageButton';
        addImageButton.textContent = '+';
        addImageButton.style.flex = '1'; // Zajmuje całą szerokość
        addImageButton.style.padding = '10px';
        addImageButton.style.margin = '0';
        addImageButton.style.backgroundColor = '#3a3ab8'; /* Ciemny fioletowy */
        addImageButton.style.color = '#ffffff';
        addImageButton.style.border = 'none';
        addImageButton.style.borderRadius = '4px';
        addImageButton.style.cursor = 'pointer';
        addImageButton.style.fontSize = '1.2em';
        addImageButton.style.transition = 'background-color 0.3s ease';

        addImageButton.addEventListener('mouseenter', () => {
            addImageButton.style.backgroundColor = '#5a5ad8';
        });

        addImageButton.addEventListener('mouseleave', () => {
            addImageButton.style.backgroundColor = '#3a3ab8';
        });

        addImageButton.addEventListener('click', openImageUploadModal);

        document.querySelector('.input-area').appendChild(addImageButton);
    }
}

const closeRenameModalButton = renameModal.querySelector('.close');
const saveHistoryNameButton = renameModal.querySelector('#saveHistoryName');
const newHistoryNameInput = renameModal.querySelector('#newHistoryName');

// Aktualny wybrany historyId
let currentHistoryId = null;

// Aktualny wybrany model
let currentModel = "gpt-4o"; // Domyślny model

// Przechowywanie ID historii, którą zmieniamy nazwę
let historyIdToRename = null;

// Przechowywanie wybranych parametrów dla DALL-E
let imageParametersSelected = {
    resolution: "1024x1024",
    quality: "standard",
    style: "vivid",
    n: 1, // Dla DALL-E 2
};

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
    if (sender === 'system') return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    // Avatar
    const avatar = document.createElement('img');
    avatar.classList.add('avatar');
    if (sender === 'user') {
        avatar.src = '/avatars/user.png'; // Ścieżka do avatara użytkownika
        avatar.alt = 'User Avatar';
    } else {
        avatar.src = '/avatars/assistant.png'; // Ścieżka do avatara asystenta
        avatar.alt = 'Assistant Avatar';
    }

    // Dodaj avatar przed lub po wiadomości w zależności od nadawcy
    if (sender === 'assistant') {
        messageDiv.appendChild(avatar);
    }

    const textDiv = document.createElement('div');
    textDiv.classList.add('text');

    // Dodaj timestamp
    const timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    const now = new Date();
    timestamp.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isImage) {
        const anchor = document.createElement('a');
        anchor.href = text;
        anchor.target = "_blank";
        const img = document.createElement('img');
        img.src = text;
        img.alt = 'Generated Image';
        img.classList.add('generated-image');
        anchor.appendChild(img);
        textDiv.appendChild(anchor);

        // Przycisk "Pobierz"
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Pobierz';
        downloadButton.classList.add('download-button');
        downloadButton.addEventListener('click', async () => {
            try {
                const proxyUrl = '/api/proxy-image?url=' + encodeURIComponent(text);
                const response = await fetch(proxyUrl);

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Nie udało się pobrać obrazka.');
                }

                const contentType = response.headers.get('Content-Type') || 'application/octet-stream';
                if (!contentType.startsWith('image/')) {
                    throw new Error('Otrzymano niepoprawny typ pliku.');
                }

                const blob = await response.blob();
                const blobURL = window.URL.createObjectURL(blob);

                // Generowanie dynamicznej nazwy pliku
                const now = new Date();
                const timestampStr = now.toISOString().replace(/[:.]/g, '-');
                const mimeType = blob.type; // np. 'image/png', 'image/jpeg'
                const extension = mimeType.split('/')[1] || 'png'; // Fallback do 'png'

                const fileName = `generated_image_${timestampStr}.${extension}`;

                // Tworzenie linku do pobrania
                const downloadLink = document.createElement('a');
                downloadLink.href = blobURL;
                downloadLink.download = fileName;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Zwolnij URL blob po pobraniu
                window.URL.revokeObjectURL(blobURL);
            } catch (error) {
                console.error('Błąd podczas pobierania obrazka:', error);
                alert(`Wystąpił błąd podczas pobierania obrazka: ${error.message}`);
            }
        });

        // Przycisk "Kopiuj Link"
        const copyLinkButton = document.createElement('button');
        copyLinkButton.textContent = 'Kopiuj Link';
        copyLinkButton.classList.add('copy-link-button');
        copyLinkButton.addEventListener('click', () => {
            navigator.clipboard.writeText(text)
                .then(() => {
                    alert('Link skopiowany do schowka!');
                })
                .catch(err => {
                    console.error('Błąd kopiowania:', err);
                });
        });

        // Tworzenie kontenera na timestamp i przycisk
        const footerDiv = document.createElement('div');
        footerDiv.classList.add('message-footer'); // Nowa klasa

        footerDiv.appendChild(timestamp);
        footerDiv.appendChild(downloadButton);
        footerDiv.appendChild(copyLinkButton);

        textDiv.appendChild(footerDiv);
    } else if (sender === 'assistant') {
        const dirtyHTML = marked.parse(text);
        const cleanHTML = DOMPurify.sanitize(dirtyHTML);
        textDiv.innerHTML = cleanHTML;
        textDiv.appendChild(timestamp);
    } else {
        textDiv.textContent = text;
        textDiv.appendChild(timestamp);
    }

    messageDiv.appendChild(textDiv);

    if (sender === 'user') {
        messageDiv.appendChild(avatar);
    }

    // Dodaj klasę animacji
    messageDiv.classList.add('fade-in');

    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
}

async function sendMessage(message) {
    if (!currentHistoryId) {
        alert('Proszę utworzyć lub wybrać historię czatu.');
        return;
    }

    if (currentModel === 'interpretacja-zdjec') {
        // Dla modelu Interpretacja zdjęć, nie wysyłamy tekstu
        return;
    }

    addMessage('user', message);
    const typingIndicator = showTypingIndicator();

    // loading.classList.remove('hidden'); // Pokazanie ładowania

    // Przygotowanie danych do wysłania
    const payload = {
        historyId: currentHistoryId,
        message: message,
        model: currentModel
    };

    // Dodanie dodatkowych parametrów dla DALL-E
    if (currentModel === 'dall-e-2' || currentModel === 'dall-e-3') {
        payload.resolution = imageParametersSelected.resolution;
        payload.quality = imageParametersSelected.quality;
        payload.style = imageParametersSelected.style;
        if (currentModel === 'dall-e-2') {
            payload.n = imageParametersSelected.n;
        }
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (response.ok) {
            if (currentModel === 'dall-e-2' || currentModel === 'dall-e-3') {
                if (currentModel === 'dall-e-2') {
                    // DALL-E 2 może generować wiele obrazów
                    result.image_urls.forEach(url => {
                        addMessage('assistant', url, true);
                    });
                } else {
                    // DALL-E 3 generuje tylko jeden obraz
                    addMessage('assistant', result.image_url, true);
                }
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
        removeTypingIndicator(typingIndicator);
    }
}

// Funkcja do wysyłania obrazu do backendu
async function sendImage(imageData, isFile = true) {
    if (!currentHistoryId) {
        alert('Proszę utworzyć lub wybrać historię czatu.');
        return;
    }

    const typingIndicator = showTypingIndicator();

    const formData = new FormData();
    formData.append('historyId', currentHistoryId);
    formData.append('model', currentModel);

    if (isFile) {
        formData.append('image', imageData);
    } else {
        formData.append('imageUrl', imageData);
    }

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();
        if (response.ok) {
            addMessage('user', isFile ? `Załadowano obraz: ${imageData.name}` : `Załadowano obraz z linku: ${imageData}`);

            if (currentModel === 'interpretacja-zdjec') {
                addMessage('assistant', result.reply);
            } else {
                // Obsługa innych modeli, jeśli są
            }
        } else {
            addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
        }

    } catch (error) {
        console.error('Błąd:', error);
        addMessage('assistant', 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej prośby.');
    } finally {
        // Przywróć przycisk dodawania obrazu po wysłaniu
        restoreAddImageButton();
        removeTypingIndicator(typingIndicator);
    }
}

// Funkcja do otwierania okna dodawania obrazu
function openImageUpload() {
    const imageInputContainer = document.createElement('div');
    imageInputContainer.id = 'imageInputContainer';
    imageInputContainer.style.marginTop = '10px';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.id = 'fileInput';
    fileInput.style.display = 'block';
    fileInput.style.marginBottom = '10px';

    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = 'Wklej link do obrazka...';
    urlInput.id = 'urlInput';
    urlInput.style.display = 'block';
    urlInput.style.marginBottom = '10px';

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Wyślij Obraz';
    sendButton.id = 'sendImageButton';
    sendButton.style.padding = '10px 20px';
    sendButton.style.backgroundColor = '#3a3ab8';
    sendButton.style.color = '#ffffff';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '4px';
    sendButton.style.cursor = 'pointer';
    sendButton.style.transition = 'background-color 0.3s ease';

    sendButton.addEventListener('mouseenter', () => {
        sendButton.style.backgroundColor = '#5a5ad8';
    });

    sendButton.addEventListener('mouseleave', () => {
        sendButton.style.backgroundColor = '#3a3ab8';
    });

    sendButton.addEventListener('click', () => {
        const file = fileInput.files[0];
        const url = urlInput.value.trim();

        if (file) {
            sendImage(file, true);
        } else if (url) {
            sendImage(url, false);
        } else {
            alert('Proszę dodać plik graficzny lub wprowadzić link.');
        }
    });

    imageInputContainer.appendChild(fileInput);
    imageInputContainer.appendChild(urlInput);
    imageInputContainer.appendChild(sendButton);

    // Jeśli już istnieje, usuń
    const existingContainer = document.getElementById('imageInputContainer');
    if (existingContainer) {
        existingContainer.remove();
    }

    document.querySelector('.input-area').appendChild(imageInputContainer);
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
            <span class="history-name">${history.name} (${new Date(history.createdAt).toLocaleDateString()})</span>
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
                    if (msg.role === 'assistant' && isImageURL(msg.content)) {
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

// Funkcja do sprawdzania, czy tekst jest URL-em obrazu
function isImageURL(url) {
    return /\.(jpeg|jpg|gif|png|svg|webp|bmp)$/.test(url.toLowerCase());
}

// Search History Function
function searchHistories(query) {
    const historyItems = document.querySelectorAll('.history-item');
    historyItems.forEach(item => {
        const name = item.querySelector('.history-name').textContent.toLowerCase();
        if (name.includes(query.toLowerCase())) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Event Listener for Search Input
document.getElementById('searchHistory').addEventListener('input', (e) => {
    const query = e.target.value;
    searchHistories(query);
});

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
    modelModal.classList.add('visible');
}

function closeModelModalFunc() {
    modelModal.classList.remove('visible');
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
        case 'interpretacja-zdjec':
            return 'Interpretacja zdjęć'; // Nowa nazwa
        default:
            return 'GPT-4o';
    }
}

// Funkcja do otwierania modalu renamingu
function openRenameModal(historyId, currentName) {
    historyIdToRename = historyId;
    newHistoryNameInput.value = currentName;
    renameModal.classList.remove('hidden');
    renameModal.classList.add('visible');
    newHistoryNameInput.focus();
}

// Funkcja do zamykania modalu renamingu
function closeRenameModalFunc() {
    renameModal.classList.remove('visible');
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

// Funkcja do aktualizacji UI parametrów obrazu
function updateImageParametersUI() {
    // Czyścimy aktualne parametry
    imageParameters.innerHTML = '';

    if (currentModel === 'dall-e-2' || currentModel === 'dall-e-3') {
        imageParameters.classList.remove('hidden');

        // Opcje rozdzielczości
        const resolutionLabel = document.createElement('label');
        resolutionLabel.textContent = 'Rozdzielczość:';
        resolutionLabel.classList.add('parameter-label');

        const resolutionSelect = document.createElement('select');
        resolutionSelect.id = 'resolutionSelect';
        resolutionSelect.classList.add('parameter-select');

        let resolutions = [];
        if (currentModel === 'dall-e-3') {
            resolutions = ['1024x1024', '1024x1792', '1792x1024'];
        } else if (currentModel === 'dall-e-2') {
            resolutions = ['1024x1024', '512x512', '256x256'];
        }

        resolutions.forEach(res => {
            const option = document.createElement('option');
            option.value = res;
            option.textContent = res;
            if (res === imageParametersSelected.resolution) {
                option.selected = true;
            }
            resolutionSelect.appendChild(option);
        });

        imageParameters.appendChild(resolutionLabel);
        imageParameters.appendChild(resolutionSelect);

        // Opcje jakości
        const qualityLabel = document.createElement('label');
        qualityLabel.textContent = 'Jakość:';
        qualityLabel.classList.add('parameter-label');

        const qualitySelect = document.createElement('select');
        qualitySelect.id = 'qualitySelect';
        qualitySelect.classList.add('parameter-select');

        const qualities = ['standard', 'hd'];
        qualities.forEach(q => {
            const option = document.createElement('option');
            option.value = q;
            option.textContent = q.toUpperCase();
            if (q === imageParametersSelected.quality) {
                option.selected = true;
            }
            qualitySelect.appendChild(option);
        });

        imageParameters.appendChild(qualityLabel);
        imageParameters.appendChild(qualitySelect);

        // Opcje stylu
        const styleLabel = document.createElement('label');
        styleLabel.textContent = 'Styl:';
        styleLabel.classList.add('parameter-label');

        const styleSelect = document.createElement('select');
        styleSelect.id = 'styleSelect';
        styleSelect.classList.add('parameter-select');

        const styles = ['vivid', 'natural'];
        styles.forEach(s => {
            const option = document.createElement('option');
            option.value = s;
            option.textContent = s.charAt(0).toUpperCase() + s.slice(1);
            if (s === imageParametersSelected.style) {
                option.selected = true;
            }
            styleSelect.appendChild(option);
        });

        imageParameters.appendChild(styleLabel);
        imageParameters.appendChild(styleSelect);

        if (currentModel === 'dall-e-2') {
            // Opcje ilości obrazów
            const numberLabel = document.createElement('label');
            numberLabel.textContent = 'Ilość obrazów:';
            numberLabel.classList.add('parameter-label');

            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.id = 'numberInput';
            numberInput.min = 1;
            numberInput.max = 5;
            numberInput.value = imageParametersSelected.n;
            numberInput.classList.add('parameter-input');

            imageParameters.appendChild(numberLabel);
            imageParameters.appendChild(numberInput);

            // Obsługa zmiany ilości obrazów
            numberInput.addEventListener('change', (e) => {
                let value = parseInt(e.target.value);
                if (isNaN(value) || value < 1) value = 1;
                if (value > 5) value = 5;
                e.target.value = value;
                imageParametersSelected.n = value;
            });
        }

        // Obsługa zmiany rozdzielczości
        resolutionSelect.addEventListener('change', (e) => {
            imageParametersSelected.resolution = e.target.value;
        });

        // Obsługa zmiany jakości
        qualitySelect.addEventListener('change', (e) => {
            imageParametersSelected.quality = e.target.value;
        });

        // Obsługa zmiany stylu
        styleSelect.addEventListener('change', (e) => {
            imageParametersSelected.style = e.target.value;
        });

    } else {
        imageParameters.classList.add('hidden');
    }
}

// Funkcja do aktualizacji UI w zależności od wybranego modelu
function updateUIForModel() {
    if (currentModel === 'interpretacja-zdjec') {
        // Ukryj pole tekstowe i przycisk wysyłania
        userInput.style.display = 'none';
        sendButton.style.display = 'none';

        // Dodaj przycisk do dodawania obrazu, jeśli jeszcze nie istnieje
        if (!document.getElementById('addImageButton')) {
            const addImageButton = document.createElement('button');
            addImageButton.id = 'addImageButton';
            addImageButton.textContent = '+';
            addImageButton.style.flex = '1'; // Zajmuje całą szerokość
            addImageButton.style.padding = '10px';
            addImageButton.style.margin = '0';
            addImageButton.style.backgroundColor = '#3a3ab8'; /* Ciemny fioletowy */
            addImageButton.style.color = '#ffffff';
            addImageButton.style.border = 'none';
            addImageButton.style.borderRadius = '4px';
            addImageButton.style.cursor = 'pointer';
            addImageButton.style.fontSize = '1.2em';
            addImageButton.style.transition = 'background-color 0.3s ease';

            addImageButton.addEventListener('mouseenter', () => {
                addImageButton.style.backgroundColor = '#5a5ad8';
            });

            addImageButton.addEventListener('mouseleave', () => {
                addImageButton.style.backgroundColor = '#3a3ab8';
            });

            addImageButton.addEventListener('click', openImageUploadModal);

            document.querySelector('.input-area').appendChild(addImageButton);
        }
    } else {
        // Pokaż pole tekstowe i przycisk wysyłania
        userInput.style.display = 'block';
        sendButton.style.display = 'block';

        // Usuń przycisk do dodawania obrazu, jeśli istnieje
        const addImageButton = document.getElementById('addImageButton');
        if (addImageButton) {
            addImageButton.remove();
        }

        // Usuń kontener z inputem obrazu, jeśli istnieje
        const imageInputContainer = document.getElementById('imageInputContainer');
        if (imageInputContainer) {
            imageInputContainer.remove();
        }

        // Usuń kontener z wybranym obrazem lub linkiem, jeśli istnieje
        const selectedImageContainer = document.getElementById('selectedImageContainer');
        if (selectedImageContainer) {
            selectedImageContainer.remove();
        }
    }
}

// Funkcja do obsługi wyboru modelu
function handleModelSelection(model) {
    currentModel = model;
    updateModelButton();
    closeModelModalFunc();
    updateUIForModel();
    updateImageParametersUI();
}

// Event Listener dla wyboru modelu
modelOptions.forEach(option => {
    option.addEventListener('click', () => {
        const selectedModel = option.getAttribute('data-model');
        handleModelSelection(selectedModel);
    });
});

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
    updateUIForModel();
    updateImageParametersUI();
});