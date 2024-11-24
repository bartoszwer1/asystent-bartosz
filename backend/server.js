// backend/server.js

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Konfiguracja zmiennych środowiskowych
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

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

// Funkcja do tworzenia nowej historii
async function createNewHistory(name = null) {
    const historyName = await createUniqueHistoryName();
    const filePath = path.join(historiesDir, `${historyName}.json`);
    const now = new Date().toISOString();
    const initialContent = {
        name: name || `Chat ${now.split('T')[0]}`,
        createdAt: now,
        messages: [
            {
                role: 'system',
                content: 'Masz na imię bartosz. i jesteś asystentem opartyn o sztyczną inteligencję. Jesteś specjalista w programowaniu.'
            }
        ]
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

// Endpoint API: Pobieranie konkretnej historii
app.get('/api/histories/:id', async (req, res) => {
    const historyId = req.params.id;
    const history = await getHistoryById(historyId);
    if (history) {
        // Filtrujemy wiadomości, aby wykluczyć te z rolą 'system'
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

// Endpoint API: Obsługa czatu
app.post('/api/chat', async (req, res) => {
    const { historyId, message, model } = req.body;

    if (!historyId || !message) {
        return res.status(400).json({ error: 'Brak historyId lub wiadomości.' });
    }

    const history = await getHistoryById(historyId);
    if (!history) {
        return res.status(404).json({ error: 'Historia nie znaleziona.' });
    }

    // Dodanie wiadomości użytkownika do historii
    history.messages.push({ role: 'user', content: message });

    // Sprawdzenie, czy pierwsza wiadomość jest rolą systemową
    if (history.messages.length === 1 || history.messages[0].role !== 'system') {
        history.messages.unshift({
            role: 'system',
            content: 'Masz na imię bartosz. i jesteś asystentem opartyn o sztyczną inteligencję. Jesteś specjalista w programowaniu.'
        });
    }

    try {
        const completion = await openai.chat.completions.create({
            model: model || "gpt-4o", // Użyj wybranego modelu lub domyślnego
            messages: history.messages,
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