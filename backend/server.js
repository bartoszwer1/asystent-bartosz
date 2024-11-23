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
app.use(express.static(path.join(__dirname, '../public')));

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

// Endpoint API
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // Poprawiona nazwa modelu
            messages: [
                { 
                    role: "system", 
                    content: "You are a code master." 
                },
                { 
                    role: "user", 
                    content: userMessage 
                },
            ],
        });

        const assistantMessage = completion.choices[0].message.content //completion.data.choices[0].message.content.trim();
        
        res.json({ reply: assistantMessage });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Wystąpił błąd podczas przetwarzania żądania.' });
    }
});

// Obsługa wszystkich innych tras (serwowanie index.html)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Uruchomienie serwera
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});