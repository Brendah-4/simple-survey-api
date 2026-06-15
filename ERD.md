# Entity Relationship Diagram — sky_survey_db

## Tables

### surveys
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | |
| status | ENUM('draft','active','closed') | DEFAULT 'draft' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

### questions
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| survey_id | INT FK → surveys.id | ON DELETE CASCADE |
| type | ENUM('text','textarea','email','multiple_choice','checkbox','rating','file') | NOT NULL |
| title | VARCHAR(500) | NOT NULL |
| description | TEXT | |
| required | TINYINT(1) | DEFAULT 0 |
| sort_order | INT | DEFAULT 0 |
| options | JSON | For choice types |
| choice_config | JSON | min/max selections |
| file_config | JSON | allowed_types, max_size_mb, max_files |
| created_at | TIMESTAMP | |

### responses
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| survey_id | INT FK → surveys.id | ON DELETE CASCADE |
| submitted_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| certificate_path | VARCHAR(500) | Optional certificate file path |

### response_answers
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| response_id | INT FK → responses.id | ON DELETE CASCADE |
| question_id | INT FK → questions.id | ON DELETE CASCADE |
| answer_text | TEXT | |

### response_answer_files
| Column | Type | Notes |
|---|---|---|
| id | INT PK AUTO_INCREMENT | |
| response_answer_id | INT FK → response_answers.id | ON DELETE CASCADE |
| file_path | VARCHAR(500) | Server file path |
| original_name | VARCHAR(255) | Original filename |
| mime_type | VARCHAR(100) | |
| size_bytes | INT | |
| created_at | TIMESTAMP | |

## Relationships

```
surveys ──< questions          (one survey has many questions)
surveys ──< responses          (one survey has many responses)
responses ──< response_answers (one response has many answers)
response_answers ──< response_answer_files (one answer may have many uploaded files)
questions }──── response_answers (question referenced by answers)
```

## ERD Diagram (text)

```
┌──────────────┐       ┌────────────────────┐
│   surveys    │  1    │    questions       │
│──────────────│──────<│────────────────────│
│ id (PK)      │       │ id (PK)            │
│ title        │       │ survey_id (FK)     │
│ description  │       │ type               │
│ status       │       │ title              │
│ created_at   │       │ description        │
│ updated_at   │       │ required           │
└──────────────┘       │ sort_order         │
        │              │ options (JSON)     │
        │ 1            │ choice_config(JSON)│
        │              │ file_config (JSON) │
        ▼              └────────────────────┘
┌──────────────┐
│  responses   │       ┌──────────────────────────┐
│──────────────│──────<│    response_answers      │
│ id (PK)      │  1    │──────────────────────────│
│ survey_id(FK)│       │ id (PK)                  │
│ submitted_at │       │ response_id (FK)          │
│ cert_path    │       │ question_id (FK)          │
└──────────────┘       │ answer_text               │
                       └──────────────────────────┘
                                    │ 1
                                    ▼
                       ┌──────────────────────────────┐
                       │   response_answer_files      │
                       │──────────────────────────────│
                       │ id (PK)                      │
                       │ response_answer_id (FK)      │
                       │ file_path                    │
                       │ original_name                │
                       │ mime_type                    │
                       │ size_bytes                   │
                       └──────────────────────────────┘
```
