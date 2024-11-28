// backend/server.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";
import dotenv from 'dotenv';
import fs from 'fs/promises';
import multer from 'multer'; // Import multer
import fetch from 'node-fetch'; // Dodaj ten import na początku pliku

// Konfiguracja zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Konfiguracja multer do przechowywania plików w pamięci
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Konfiguracja ścieżki do plików statycznych
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historiesDir = path.join(__dirname, 'histories');

// Funkcja do tworzenia katalogu historii, jeśli nie istnieje
async function ensureHistoriesDir() {
    try {
        await fs.access(historiesDir);
    } catch (error) {
        await fs.mkdir(historiesDir);
    }
}

// Funkcja do generowania unikalnej nazwy historii
function generateHistoryName() {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, '_'); // YYYY_MM_DD
    return `chat_${datePart}`;
}

// Funkcja do generowania unikalnego identyfikatora historii
async function createUniqueHistoryName() {
    let baseName = generateHistoryName();
    let index = 1;
    let historyName = baseName;
    while (true) {
        const filePath = path.join(historiesDir, `${historyName}.json`);
        try {
            await fs.access(filePath);
            // Jeśli plik istnieje, zwiększ indeks
            historyName = `${baseName}_${index}`;
            index++;
        } catch (error) {
            // Jeśli plik nie istnieje, można go użyć
            return historyName;
        }
    }
}

// Funkcja do pobierania listy historii
async function getAllHistories() {
    try {
        const files = await fs.readdir(historiesDir);
        const histories = [];
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(historiesDir, file);
                const data = await fs.readFile(filePath, 'utf-8');
                const history = JSON.parse(data);
                histories.push({
                    id: path.basename(file, '.json'),
                    name: history.name || `Chat ${path.basename(file, '.json')}`,
                    createdAt: new Date(history.createdAt).toLocaleString(),
                });
            }
        }
        return histories;
    } catch (error) {
        console.error('Błąd odczytu historii:', error);
        return [];
    }
}

// Funkcja do tworzenia nowej historii bez wiadomości systemowej
async function createNewHistory(name = null) {
    const historyName = await createUniqueHistoryName();
    const filePath = path.join(historiesDir, `${historyName}.json`);
    const now = new Date().toISOString();
    const initialContent = {
        name: name || `Chat ${now.split('T')[0]}`,
        createdAt: now,
        messages: [] // Brak wiadomości systemowej
    };
    await fs.writeFile(filePath, JSON.stringify(initialContent, null, 2));
    return historyName;
}

// Funkcja do pobierania konkretnej historii
async function getHistoryById(historyId) {
    const filePath = path.join(historiesDir, `${historyId}.json`);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Błąd odczytu historii ${historyId}:`, error);
        return null;
    }
}

// Funkcja do zapisywania historii
async function saveHistory(historyId, historyData) {
    const filePath = path.join(historiesDir, `${historyId}.json`);
    try {
        await fs.writeFile(filePath, JSON.stringify(historyData, null, 2));
    } catch (error) {
        console.error(`Błąd zapisu historii ${historyId}:`, error);
    }
}

// Konfiguracja OpenAI
const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

// Endpoint API: Proxy do pobierania obrazów
app.get('/api/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    console.log(`Proxy request received for URL: ${imageUrl}`);
    if (!imageUrl) {
        console.log('No URL provided.');
        return res.status(400).json({ error: 'Brak parametru URL.' });
    }

    try {
        const response = await fetch(imageUrl);
        console.log(`Fetch response status: ${response.status}`);

        if (!response.ok) {
            const responseText = await response.text();
            console.log(`Fetch failed with status ${response.status}: ${responseText}`);
            throw new Error('Nie udało się pobrać obrazka.');
        }

        const buffer = await response.buffer();
        const contentType = response.headers.get('content-type') || 'image/png';
        console.log(`Fetched image with Content-Type: ${contentType}`);
        res.set('Content-Type', contentType);
        res.send(buffer);
    } catch (error) {
        console.error('Błąd proxy:', error);
        res.status(500).json({ error: 'Nie udało się pobrać obrazka.' });
    }
});

// Endpoint API: Pobieranie listy historii
app.get('/api/histories', async (req, res) => {
    const histories = await getAllHistories();
    res.json({ histories });
});

// Endpoint API: Tworzenie nowej historii
app.post('/api/histories', async (req, res) => {
    const { name } = req.body;
    const historyId = await createNewHistory(name);
    res.json({ historyId });
});

// Endpoint API: Pobieranie konkretnej historii bez wiadomości systemowych (nie ma systemowych)
app.get('/api/histories/:id', async (req, res) => {
    const historyId = req.params.id;
    const history = await getHistoryById(historyId);
    if (history) {
        // Filtrujemy wiadomości, aby wykluczyć te z rolą 'system' (brak)
        const filteredMessages = history.messages.filter(msg => msg.role !== 'system');
        res.json({ history: { ...history, messages: filteredMessages } });
    } else {
        res.status(404).json({ error: 'Historia nie znaleziona.' });
    }
});

// Endpoint API: Usuwanie wszystkich historii
app.delete('/api/histories', async (req, res) => {
    try {
        const files = await fs.readdir(historiesDir);
        const deletePromises = files.map(file => fs.unlink(path.join(historiesDir, file)));
        await Promise.all(deletePromises);
        res.json({ message: 'Wszystkie historie zostały usunięte.' });
    } catch (error) {
        console.error('Błąd usuwania historii:', error);
        res.status(500).json({ error: 'Błąd podczas usuwania historii.' });
    }
});

// Endpoint API: Zmiana nazwy historii
app.put('/api/histories/:id/rename', async (req, res) => {
    const historyId = req.params.id;
    const { newName } = req.body;

    if (!newName) {
        return res.status(400).json({ error: 'Brak nowej nazwy.' });
    }

    const history = await getHistoryById(historyId);
    if (!history) {
        return res.status(404).json({ error: 'Historia nie znaleziona.' });
    }

    history.name = newName;
    await saveHistory(historyId, history);
    res.json({ message: 'Nazwa historii została zmieniona.', name: newName });
});

// Endpoint API: Obsługa czatu i generowania obrazów
app.post('/api/chat', upload.single('image'), async (req, res) => {
    const { historyId, message, model, imageUrl } = req.body;
    const imageFile = req.file;

    if (!historyId || !model) {
        return res.status(400).json({ error: 'Brak historyId lub modelu.' });
    }

    const history = await getHistoryById(historyId);
    if (!history) {
        return res.status(404).json({ error: 'Historia nie znaleziona.' });
    }

    if (model === 'interpretacja-zdjec') {
        // Obsługa interpretacji zdjęć
        let imageData = '';

        if (imageFile) {
            // Obsługa przesłanego pliku graficznego
            imageData = imageFile.buffer.toString('base64');
        } else if (imageUrl) {
            // Obsługa linku do grafiki
            imageData = imageUrl;
        } else {
            return res.status(400).json({ error: 'Brak obrazu do interpretacji.' });
        }

        try {
            const promptText = message || "Co jest na zdjęciu? Jaki prompt mógł zostać uyty do wygenerowania takiej grafiki?";

            const messages = [
                {
                    role: "user",
                    content: [
                        { type: "text", text: promptText }
                    ]
                }
            ];

            if (imageFile) {
                messages[0].content.push({
                    type: "image_url",
                    image_url: {
                        url: `data:image/jpeg;base64,${imageData}`
                    },
                });
            } else if (imageUrl) {
                messages[0].content.push({
                    type: "image_url",
                    image_url: {
                        url: imageData,
                    },
                });
            }

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: messages,
            });

            const assistantMessage = completion.choices[0].message.content.trim();

            // Dodanie wiadomości użytkownika i asystenta do historii
            history.messages.push({ role: 'user', content: promptText });
            history.messages.push({ role: 'assistant', content: assistantMessage });

            // Zapisanie zaktualizowanej historii
            await saveHistory(historyId, history);

            res.json({ reply: assistantMessage });
        } catch (error) {
            console.error('Błąd podczas interpretacji zdjęcia:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas interpretacji zdjęcia.' });
        }
    } else if (model === 'dall-e-2' || model === 'dall-e-3') {
        // Obsługa generowania obrazów
        try {
            const generateOptions = {
                model: model,
                prompt: message,
                size: req.body.resolution || "1024x1024",
                style: req.body.style || "vivid",
                quality: req.body.quality || (model === 'dall-e-3' ? "hd" : undefined)
            };

            if (model === 'dall-e-2') {
                generateOptions.n = req.body.n && req.body.n <= 5 ? req.body.n : 1;
            } else if (model === 'dall-e-3') {
                generateOptions.n = 1;
            }

            const response = await openai.images.generate(generateOptions);

            if (model === 'dall-e-2') {
                const image_urls = response.data.map(img => img.url);
                // Dodanie wiadomości użytkownika
                history.messages.push({ role: 'user', content: message });

                // Dodanie wiadomości asystenta z URL obrazów
                image_urls.forEach(url => {
                    history.messages.push({ role: 'assistant', content: url });
                });

                // Zapisanie zaktualizowanej historii
                await saveHistory(historyId, history);

                res.json({ image_urls });
            } else if (model === 'dall-e-3') {
                const image_url = response.data[0].url;

                // Dodanie wiadomości użytkownika
                history.messages.push({ role: 'user', content: message });

                // Dodanie wiadomości asystenta z URL obrazu
                history.messages.push({ role: 'assistant', content: image_url });

                // Zapisanie zaktualizowanej historii
                await saveHistory(historyId, history);

                res.json({ image_url });
            }

        } catch (error) {
            console.error('Error generating image:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas generowania obrazu.' });
        }
    } else {
        // Obsługa czatu
        // Dodanie wiadomości użytkownika do historii
        history.messages.push({ role: 'user', content: message });

        // Przygotowanie wiadomości do wysłania do OpenAI
        let messagesForAI = [...history.messages];

        // Dodanie instrukcji tylko dla modelu 'gpt-4o'
        if (model === 'gpt-4o') {
            messagesForAI = [
                {
                    role: 'system',
                    content: 'Masz na imię Bartosz i jesteś sztuczną inteligencją. Jesteś specjalistą w programowaniu.'
                },
                ...messagesForAI
            ];
        }

        try {
            const completion = await openai.chat.completions.create({
                model: model || "gpt-4o", // Użyj wybranego modelu lub domyślnego
                messages: messagesForAI,
            });

            const assistantMessage = completion.choices[0].message.content.trim();

            // Dodanie odpowiedzi asystenta do historii
            history.messages.push({ role: 'assistant', content: assistantMessage });

            // Zapisanie zaktualizowanej historii
            await saveHistory(historyId, history);

            res.json({ reply: assistantMessage });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania żądania.' });
        }
    }
});

// Serwowanie plików statycznych poprawnie
app.use(express.static(path.join(__dirname, '../public')));

// Obsługa wszystkich innych tras (serwowanie index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Inicjalizacja katalogu historii i uruchomienie serwera
ensureHistoriesDir().then(() => {
    app.listen(PORT, () => {
        console.log(`Serwer działa na http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Błąd podczas tworzenia katalogu historii:', error);
});