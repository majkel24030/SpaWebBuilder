# WindoorConfig - System Konfiguracji Ofert

Profesjonalny system webowy typu SPA (Single Page Application) do tworzenia, konfigurowania i generowania ofert PDF dla firm zajmujących się stolarką okienną i drzwiową.

## Funkcje systemu

1. Tworzenie ofert zawierających wiele pozycji produktów (okna, drzwi)
2. Dynamiczna konfiguracja każdej pozycji (wymiary + opcje)
3. Automatyczne przeliczanie ceny (netto, VAT, brutto)
4. Generowanie profesjonalnego PDF oferty
5. Historia ofert użytkownika z możliwością ich edycji i ponownego pobrania
6. System logowania i ról (admin, użytkownik)
7. Panel administratora do zarządzania opcjami, użytkownikami i cennikami

## Technologie

### Frontend
- React 18 + TypeScript + Vite
- TailwindCSS
- React Hook Form
- Axios
- React Router
- Zustand (do globalnego stanu)

### Backend
- FastAPI
- PostgreSQL
- SQLAlchemy (ORM)
- Jinja2 + WeasyPrint (do generowania PDF)
- JWT (python-jose)
- Passlib (hashowanie haseł)

## Uruchomienie projektu

### Wymagania
- Node.js i npm
- Python 3.8+
- PostgreSQL

### Backend

1. Utwórz wirtualne środowisko Python:
```bash
python -m venv venv
source venv/bin/activate  # W Windows: venv\Scripts\activate
