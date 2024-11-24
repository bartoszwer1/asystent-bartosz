// backend/migrateHistories.js

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historiesDir = path.join(__dirname, 'histories');

async function migrateHistories() {
    try {
        const files = await fs.readdir(historiesDir);
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filePath = path.join(historiesDir, file);
                const data = await fs.readFile(filePath, 'utf-8');
                const history = JSON.parse(data);
                
                // Sprawdź, czy plik już ma wiadomość systemową
                if (history.messages && history.messages.length > 0 && history.messages[0].role === 'system') {
                    console.log(`Historia ${file} już zawiera wiadomość systemową. Pomijanie.`);
                    continue;
                }

                // Dodanie wiadomości systemowej
                history.messages.unshift({
                    role: 'system',
                    content: 'Masz na imię bartosz. i jesteś asystentem opartyn o sztyczną inteligencję. Jesteś specjalista w programowaniu.'
                });

                await fs.writeFile(filePath, JSON.stringify(history, null, 2));
                console.log(`Migracja historii ${file} zakończona.`);
            }
        }
        console.log('Migracja wszystkich historii zakończona.');
    } catch (error) {
        console.error('Błąd podczas migracji historii:', error);
    }
}

migrateHistories();