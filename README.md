# Currency Converter Suite

Production‑quality currency converter with a Spring Boot backend and two UI experiences.

## Repository

- GitHub: https://github.com/gpdhanush/loop-stream-assignment.git
- Frontend demo: https://gp.prasowlabs.in/cc/

## Repository Layout

- `backend/` — Spring Boot (Thymeleaf UI + REST API + DB caching)
- `frontend/` — Standalone frontend demo (Vue 3, static)
- `db.sql` — MySQL table script

## Core Features

- **Thymeleaf UI** with searchable currency dropdowns, flags, and names
- **REST API** for conversion with strict validation
- **DB caching** for rates (per source/target, 60‑minute TTL)
- **Currency code list** loaded from local JSON at startup
- **Unit tests** for caching, API fetch, and validation

## Tech Stack (Java App)

- Java 17, Spring Boot 3.x
- Spring Web, Spring Data JPA, Thymeleaf
- MySQL
- JUnit5 + Mockito

## Tech Stack (Frontend Demo)

- Vue 3 (CDN)
- Tailwind CSS (CDN)

## External APIs Used

- **CurrencyBeacon API**  
  Base: `https://api.currencybeacon.com/v1`  
  Endpoint: `GET /latest?api_key=XXX&base=AUD&symbols=INR`

## Run Locally (Java App)

```bash
cd backend
mvn spring-boot:run
```

App: `http://localhost:8080`

## Helpful Commands

```bash
# Build
cd backend
mvn clean package

# Run tests
mvn test

# Run the app
mvn spring-boot:run
```

## Run Locally (Frontend Demo)

Start the backend, then open `frontend/index.html` in a browser (demo calls backend `/api/*`).

## REST API

**POST** `/api/convert`

Request:
```json
{
  "sourceCurrency": "AUD",
  "targetCurrency": "INR",
  "amount": 1325
}
```

Response:
```json
{
  "sourceCurrency": "AUD",
  "targetCurrency": "INR",
  "amount": 1325,
  "rate": 55.54,
  "convertedAmount": 73594.50,
  "fromCache": true,
  "fetchedAt": "2026-01-21T01:14:27"
}
```

**GET** `/api/currencies`  
Returns currency list (code, name, flag).

**GET** `/api/latest?base=USD`  
Returns latest rates for the given base currency.

## MySQL

- Update connection settings in `backend/src/main/resources/application.properties`
- Run the schema script in `db.sql` to create `conversion_rates`

## Notes

- Currency codes are loaded from `backend/src/main/resources/currency_codes.json`.
- The UI formats input with thousand separators and displays:
  `The <TARGET> amount for <SOURCE> <AMOUNT> is <TARGET> <RESULT>`

