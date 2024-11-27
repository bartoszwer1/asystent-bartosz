// backend/controllers/chatController.js

import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getHistoryById, saveHistory } from '../utils/fileHandler.js';

dotenv.config();

// Konfiguracja OpenAI
const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY']
});

export async function handleChat(req, res) {
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
}