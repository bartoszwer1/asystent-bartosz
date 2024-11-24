# Asystent bartosz.

![bartosz. Logo](https://via.placeholder.com/150)

bartosz. to wszechstronna aplikacja czatu zaprojektowana do ułatwienia interakcji z zaawansowanymi modelami AI. Niezależnie od tego, czy jesteś deweloperem poszukującym pomocy, czy użytkownikiem szukającym inteligentnego partnera do rozmów, bartosz. oferuje solidną i przyjazną dla użytkownika platformę, która spełni Twoje potrzeby.

## Spis Treści

- [Funkcje](#funkcje)
- [Technologie](#technologie)
- [Instalacja](#instalacja)
  - [Wymagania](#wymagania)
  - [Klonowanie Repozytorium](#klonowanie-repozytorium)
  - [Konfiguracja Backend](#konfiguracja-backend)
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

1. Otwórz terminal lub wiersz poleceń.
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

1. Przejdź do katalogu backend:

   ```bash
   cd backend
   ```

2. Zainstaluj wymagane zależności:

   ```bash
   npm install
   ```