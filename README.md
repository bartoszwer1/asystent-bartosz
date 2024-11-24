# Asystent Bartosz

<!-- ![Asystent Bartosz Logo](https://via.placeholder.com/150) -->

Asystent Bartosz to wszechstronna aplikacja czatu zaprojektowana do ułatwienia interakcji z zaawansowanymi modelami AI. Niezależnie od tego, czy jesteś deweloperem poszukującym pomocy, czy użytkownikiem szukającym inteligentnego partnera do rozmów, Asystent Bartosz oferuje solidną i przyjazną dla użytkownika platformę, która spełni Twoje potrzeby.

## Spis Treści

- [Funkcje](#funkcje)
- [Technologie](#technologie)
- [Instalacja](#instalacja)
  - [Wymagania](#wymagania)
  - [Klonowanie Repozytorium](#klonowanie-repozytorium)
  - [Konfiguracja Backend](#konfiguracja-backend)
    - [Instrukcje dla macOS](#instrukcje-dla-macos)
    - [Instrukcje dla Windows](#instrukcje-dla-windows)
  - [Konfiguracja Frontend](#konfiguracja-frontend)
  - [Zmienne Środowiskowe](#zmienne-środowiskowe)
  - [Uruchomienie Aplikacji](#uruchomienie-aplikacji)
- [Użytkowanie](#użytkowanie)
  - [Tworzenie Nowej Historii Czatów](#tworzenie-nowej-historii-czatów)
  - [Wybór Modelu](#wybór-modelu)
  - [Wysyłanie Wiadomości](#wysyłanie-wiadomości)
  - [Zmiana Nazwy Historii Czatów](#zmiana-nazwy-historii-czatów)
  - [Usuwanie Wszystkich Historii](#usuwanie-wszystkich-historii)
- [Przegląd Funkcjonalności](#przegląd-funkcjonalności)
- [Struktura Projektu](#struktura-projektu)
- [Wkład](#wkład)
- [Licencja](#licencja)
- [Podziękowania](#podziękowania)

## Funkcje

- **Wielokrotne Historie Czatów:** Twórz, zarządzaj, zmieniaj nazwy i usuwaj wiele historii czatów.
- **Wybór Modelu:** Wybieraj spośród różnych modeli AI (`gpt-4o`, `o1-mini`, `o1-preview`), aby dostosować doświadczenie konwersacyjne.
- **Przyjazny Interfejs Użytkownika:** Intuicyjny interfejs umożliwiający płynną interakcję i zarządzanie czatami.
- **Bezpieczna Integracja API:** Wykorzystuje API OpenAI w sposób bezpieczny z zarządzaniem zmiennymi środowiskowymi.
- **Wsparcie dla Różnych Platform:** Łatwe ustawienie i uruchomienie na systemach macOS i Windows.

## Technologie

- **Backend:**
  - [Node.js](https://nodejs.org/)
  - [Express](https://expressjs.com/)
  - [OpenAI API](https://openai.com/api/)
  - [dotenv](https://github.com/motdotla/dotenv)
- **Frontend:**
  - HTML, CSS, JavaScript
  - [Marked.js](https://marked.js.org/) do parsowania Markdown
  - [DOMPurify](https://github.com/cure53/DOMPurify) do sanitizacji HTML
- **Inne:**
  - [CORS](https://github.com/expressjs/cors) do obsługi Cross-Origin Resource Sharing
  - [fs/promises](https://nodejs.org/api/fs.html#fspromises) do operacji na systemie plików

## Instalacja

### Wymagania

Przed rozpoczęciem instalacji upewnij się, że masz zainstalowane na swoim systemie:

- **Node.js:** [Pobierz i zainstaluj Node.js](https://nodejs.org/) (zalecana wersja v14 lub nowsza)
- **npm:** Jest dostarczany razem z Node.js

### Klonowanie Repozytorium

1. Otwórz terminal (macOS) lub wiersz poleceń (Windows).
2. Przejdź do katalogu, w którym chcesz sklonować projekt.
3. Sklonuj repozytorium za pomocą poniższego polecenia:

```bash
git clone https://github.com/twojanazwa/asystent-bartosz.git
```

4. Wejdź do katalogu projektu:

```bash
cd asystent-bartosz
```

### Konfiguracja Backend

1. Przejdź do katalogu `backend`:

```bash
cd backend
```

2. Zainstaluj wymagane zależności:

```bash
npm install
```

#### Instrukcje dla macOS

- Upewnij się, że masz zainstalowane wszystkie wymagane narzędzia (Node.js, npm).
- Postępuj zgodnie z powyższymi krokami, aby sklonować repozytorium i skonfigurować backend.

#### Instrukcje dla Windows

- Upewnij się, że masz zainstalowane Node.js i npm.
- Otwórz PowerShell lub Wiersz Poleceń jako Administrator.
- Przejdź do katalogu, w którym chcesz sklonować projekt.
- Wykonaj kroki klonowania i konfiguracji backendu zgodnie z powyższymi instrukcjami.

### Konfiguracja Frontend

1. Otwórz nową kartę lub okno terminala.
2. Przejdź do katalogu `public`:

```bash
cd asystent-bartosz/public
```

3. Ponieważ frontend korzysta z plików statycznych, dodatkowa konfiguracja nie jest wymagana.

### Zmienne Środowiskowe

1. W katalogu `backend` utwórz plik `.env`:

```bash
touch .env
```

2. Otwórz plik `.env` w ulubionym edytorze tekstu i dodaj swój klucz API OpenAI:

```
OPENAI_API_KEY=twoj_klucz_api_openai
```

> **Uwaga:** Zastąp `twoj_klucz_api_openai` swoim rzeczywistym kluczem API OpenAI. Upewnij się, że plik `.env` jest dodany do `.gitignore`, aby nie był śledzony przez system kontroli wersji.

### Uruchomienie Aplikacji

1. **Uruchomienie Serwera Backend:**

   W katalogu `backend` uruchom:

```bash
npm start
```

   Powinieneś zobaczyć komunikat wskazujący, że serwer działa:

   ```
   Serwer działa na http://localhost:3000
   ```

2. **Dostęp do Frontendu:**

   Otwórz przeglądarkę internetową i przejdź do `http://localhost:3000`, aby uzyskać dostęp do Asystenta Bartosz.

## Użytkowanie

### Tworzenie Nowej Historii Czatów

1. Otwórz Asystenta Bartosz w przeglądarce.
2. Kliknij przycisk "Nowy Czat".
3. Wprowadź nazwę dla nowej historii czatu i potwierdź.
4. Nowa historia czatu zostanie utworzona i automatycznie wybrana.

### Wybór Modelu

1. Kliknij przycisk "Model", aby otworzyć modal wyboru modelu.
2. Wybierz żądany model AI z dostępnych opcji (`GPT-4o`, `o1-mini`, `o1-preview`).
3. Wybrany model zostanie zastosowany do bieżącej i przyszłych konwersacji.

### Wysyłanie Wiadomości

1. Wybierz aktywną historię czatu z bocznego panelu.
2. Wpisz wiadomość w polu input na dole okna czatu.
3. Naciśnij "Enter" lub kliknij przycisk "Wyślij".
4. Asystent odpowie na Twoją wiadomość w oparciu o wybrany model.

### Zmiana Nazwy Historii Czatów

1. Otwórz boczny panel historii, klikając przycisk "☰".
2. Znajdź historię czatu, którą chcesz zmienić.
3. Kliknij przycisk "Rename" obok nazwy historii.
4. Wprowadź nową nazwę i potwierdź.
5. Historia czatu zostanie zaktualizowana z nową nazwą.

### Usuwanie Wszystkich Historii

> **Ostrzeżenie:** Ta akcja usunie wszystkie historie czatów na stałe.

1. Otwórz boczny panel historii, klikając przycisk "☰".
2. Kliknij przycisk "Delete All Histories".
3. Potwierdź usunięcie, gdy zostaniesz o to poproszony.
4. Wszystkie historie czatów zostaną usunięte z aplikacji.

## Przegląd Funkcjonalności

Asystent Bartosz działa na architekturze klient-serwer, gdzie frontend komunikuje się z backendem za pomocą RESTful API. Oto krótki przegląd działania projektu:

1. **Zarządzanie Historiami Czatów:**
   - **Tworzenie:** Użytkownicy mogą tworzyć wiele historii czatów w celu organizacji swoich rozmów.
   - **Wybór:** Użytkownicy mogą przełączać się między różnymi historiami czatów, aby kontynuować poprzednie rozmowy.
   - **Zmiana Nazwy:** Historie czatów mogą być zmieniane w celu lepszej organizacji.
   - **Usuwanie:** Użytkownicy mogą usuwać wszystkie historie czatów, usuwając wszystkie przechowywane rozmowy.

2. **Wybór Modelu:**
   - Użytkownicy mogą wybierać między różnymi modelami AI (`gpt-4o`, `o1-mini`, `o1-preview`), aby dostosować odpowiedzi asystenta.
   - Rola `system` jest używana wyłącznie dla modelu `gpt-4o` do ustawienia kontekstu, podczas gdy inne modele wykorzystują tylko role `user` i `assistant`.

3. **Wysyłanie Wiadomości:**
   - Wiadomości są wysyłane z frontend do backend za pomocą endpointu `/api/chat`.
   - Backend przetwarza wiadomość, dodaje niezbędne instrukcje w zależności od wybranego modelu i komunikuje się z API OpenAI w celu wygenerowania odpowiedzi.
   - Odpowiedź asystenta jest następnie wysyłana z powrotem do frontend i wyświetlana użytkownikowi.

4. **Bezpieczeństwo:**
   - Klucze API są zarządzane bezpiecznie za pomocą zmiennych środowiskowych.
   - Dane wejściowe użytkownika są sanitizowane, aby zapobiec lukom bezpieczeństwa, takim jak Cross-Site Scripting (XSS).

## Struktura Projektu

```
asystent-bartosz/
├── backend/
│   ├── histories/
│   │   └── .../*.json
│   ├── migrateHistories.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── public/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── ...inne zasoby
├── README.md
└── .gitignore
```

- **backend/**: Zawiera kod serwera, w tym endpointy API i zarządzanie historiami czatów.
- **public/**: Zawiera kod klienta, w tym pliki HTML, CSS i JavaScript.
- **README.md**: Ten plik, dostarczający kompleksowych informacji o projekcie.
- **.gitignore**: Określa pliki i katalogi, które mają być ignorowane przez Git, takie jak `node_modules` i `.env`.

## Wkład

Wkład jest mile widziany! Postępuj zgodnie z poniższymi krokami, aby przyczynić się do rozwoju Asystenta Bartosz:

1. Forkuj repozytorium.
2. Utwórz nową gałąź dla swojej funkcji lub poprawki błędu:

```bash
git checkout -b feature/NazwaTwojejFunkcji
```

3. Zatwierdź swoje zmiany z czytelnymi komunikatami:

```bash
git commit -m "Dodaj nową funkcję"
```

4. Wypchnij zmiany do swojego forkowanego repozytorium:

```bash
git push origin feature/NazwaTwojejFunkcji
```

5. Otwórz Pull Request opisujący swoje zmiany.

## Licencja

Ten projekt jest licencjonowany na podstawie [Licencji MIT](LICENSE).

## Podziękowania

- [OpenAI](https://openai.com/) za dostarczanie potężnych modeli AI.
- [Express.js](https://expressjs.com/) za solidny framework backendowy.
- [Marked.js](https://marked.js.org/) i [DOMPurify](https://github.com/cure53/DOMPurify) za obsługę i sanitizację treści Markdown.
- Społeczność open-source za nieocenione zasoby i wsparcie.

---

*Nie wahaj się skontaktować w razie pytań lub uwag!*

---

© 2024 Bartosz Wermiński. Wszelkie prawa zastrzeżone.

---