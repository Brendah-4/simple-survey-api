# simple-survey-api

REST API for the Simple Survey platform — built with **Node.js**, **Express**, and **MySQL**. All responses are returned in **XML** format.

## Prerequisites

- Node.js v18 or higher
- MySQL 8.0 or higher
- npm

## Technologies Used

- Node.js + Express
- MySQL (hosted on Railway)
- `xmlbuilder2` for XML responses
- `multer` for file uploads
- `mysql2/promise` connection pool

## Live API

```
https://simple-survey-api-production.up.railway.app/api
```

## Getting Started

```bash
git clone https://github.com/symonmwangi/simple-survey-api.git
cd simple-survey-api
npm install
cp .env.example .env   # fill in your DB credentials
npm start
```

### Environment Variables

```
DB_HOST=
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_NAME=sky_survey_db
PORT=3000
```

## API Endpoints

All responses are XML. Base path: `/api`

### Surveys

| Method | Path | Description |
|--------|------|-------------|
| GET | `/surveys` | List all surveys |
| GET | `/surveys/:id` | Get survey by ID |
| POST | `/surveys` | Create survey |
| PUT | `/surveys/:id` | Update survey |
| DELETE | `/surveys/:id` | Delete survey |

### Questions (nested under survey)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/surveys/:surveyId/questions` | List questions |
| POST | `/surveys/:surveyId/questions` | Create question |
| PUT | `/questions/:id` | Update question |
| DELETE | `/questions/:id` | Delete question |

**Question types:** `text`, `textarea`, `email`, `multiple_choice`, `checkbox`, `rating`, `file`

### Responses (nested under survey)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/surveys/:surveyId/responses` | List responses (paginated) |
| POST | `/surveys/:surveyId/responses` | Submit response |

**Query parameters for listing:**
- `page` — page number (default: 1)
- `pageSize` — results per page (default: 10, max: 100)
- `email` — filter by respondent email

### Files & Certificates

| Method | Path | Description |
|--------|------|-------------|
| GET | `/files/certificate/:responseId` | Download certificate for a response |
| GET | `/certificates/:fileId` | Download uploaded file by ID |

## Database

Schema: `src/db/schema.sql` — runs automatically on startup via `scripts/migrate.js`.

See [ERD.md](ERD.md) for the full entity relationship diagram.

## Postman Collection

Import `postman_collection.json` into Postman to test all endpoints.

## Assumptions Made

- No authentication or role-based access control is implemented. All endpoints are publicly accessible as the spec did not require it.
- Survey status values are `draft`, `published`, and `closed`. A survey must be set to `published` for it to appear in the available surveys list.
- The `email` question type was added in addition to the spec's listed types to support email-based response filtering.
- The `rating` question type was added as an extra feature beyond the spec requirements.
- File uploads are stored on the Railway server filesystem. In a production system these would be stored on cloud storage (e.g. AWS S3).
- Certificates are auto-generated as PDFs upon response submission using the pdfkit library.
- Pagination defaults to page 1 with 10 results per page if not specified in the query string.
