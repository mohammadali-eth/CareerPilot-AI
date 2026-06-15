# 🏛️ CareerPilot AI - Enterprise Clean Architecture & Design Document

This document provides a comprehensive view of the CareerPilot AI system design, folder structure, coding conventions, architectural reasoning, and scaling strategies.

---

## 1. Directory Tree Overview

Below is the complete folder tree of the CareerPilot AI monorepo. This structure is designed to isolate concerns, enable modular scaling, and allow multiple teams to work in parallel.

```text
careerpilot-ai/
├── apps/
│   ├── web/                              # Next.js 15 App Router Frontend
│   │   ├── app/                          # App Router Pages & Layouts
│   │   │   ├── (auth)/                   # Group: Login, Signup, Reset Password
│   │   │   ├── (dashboard)/              # Group: Core logged-in portal pages
│   │   │   │   ├── profile/              # User Profile Management page
│   │   │   │   ├── resumes/              # Resume Upload & Scanning page
│   │   │   │   ├── roadmap/              # Roadmap Builder & Milestones page
│   │   │   │   ├── recommendations/      # Job/Skill recommendations page
│   │   │   │   ├── simulator/            # Interview Simulator page
│   │   │   │   └── analytics/            # Skill gap and progress analytics
│   │   │   │   └── layout.tsx            # Authenticated sidebar layout
│   │   │   ├── layout.tsx                # Global html/body shell
│   │   │   └── page.tsx                  # Landing page
│   │   ├── components/                   # Shared UI & layout components
│   │   │   ├── ui/                       # shadcn primitive components (button, input, etc.)
│   │   │   ├── layout/                   # Global header, footer, sidebars
│   │   │   └── feedback/                 # Modals, snackbars, loading states
│   │   ├── features/                     # Feature-specific modular directories
│   │   │   ├── auth/                     # Auth login form, register form, auth-specific state
│   │   │   ├── resumes/                  # Resume parser dashboard, PDF viewer, target-job matches
│   │   │   ├── roadmaps/                 # Node-based interactive roadmap trees, progress nodes
│   │   │   ├── simulator/                # Live voice/text response simulators, AI grading interface
│   │   │   └── analytics/                # SVG/Canvas skill charts, time-series metrics
│   │   ├── hooks/                        # Global reusable React hooks
│   │   ├── services/                     # API client definitions (using Axios/Fetch & React Query)
│   │   ├── providers/                    # Global React context providers (theme, auth, query-client)
│   │   ├── store/                        # Zustand global state slices
│   │   ├── schemas/                      # Client-side form validations (Zod)
│   │   ├── types/                        # TypeScript type definitions and interfaces
│   │   ├── lib/                          # Third-party wrappers (Apollo, Supabase, Tailwind Merge)
│   │   ├── constants/                    # Application config and styling constants
│   │   ├── styles/                       # Global CSS, themes, tailwind base configs
│   │   ├── assets/                       # Static assets (images, vectors, fonts)
│   │   ├── package.json                  # Frontend manifest
│   │   ├── tsconfig.json                 # Frontend TS configuration
│   │   └── tailwind.config.ts            # Tailwind CSS configuration
│   │
│   └── api/                              # FastAPI Backend
│       ├── api/                          # REST API router layer
│       │   ├── v1/                       # API version 1 routers
│       │   │   ├── auth.py               # Authentication (JWT validation, user registration)
│       │   │   ├── profiles.py           # Profile management endpoints
│       │   │   ├── resumes.py            # Resume analysis, parsing & extraction
│       │   │   ├── roadmaps.py           # Skill-gap roadmaps generation
│       │   │   ├── recommendations.py    # Career recommendations endpoints
│       │   │   ├── simulator.py          # Mock-interview simulator sockets/REST
│       │   │   └── analytics.py          # Dashboard analytics metrics aggregation
│       │   ├── middleware/               # CORS, logging, Sentry error handlers
│       │   ├── dependencies/             # FastAPI injectables (DB session, current user)
│       │   └── exceptions/               # Custom API exception overrides
│       ├── core/                         # Project core settings & security controls
│       │   ├── config.py                 # Env variables validator (Pydantic Settings)
│       │   ├── security.py               # JWT tokens, password hashing utilities
│       │   ├── logging.py                # Structured JSON logging configs
│       │   └── database.py               # Database connections setup
│       ├── models/                       # SQLAlchemy models (declarative base)
│       ├── schemas/                      # Pydantic schemas (request/response models)
│       ├── repositories/                 # Repository layer (Data access isolation)
│       ├── services/                     # Service layer (Business logic orchestration)
│       ├── database/                     # DB Session hooks & Alembic migrations setup
│       ├── validators/                   # Custom business rules & data validations
│       ├── utils/                        # Shared utility helpers (date conversions, string utilities)
│       ├── ai/                           # AI provider interfaces & prompt managers
│       │   ├── providers.py              # LLM wrapper integrations (OpenAI, Gemini)
│       │   ├── prompts.py                # System/User Prompt templates registry
│       │   ├── memory.py                 # Chat history memory stores
│       │   └── rag.py                    # Vector search, document chunking & retrieval pipelines
│       ├── ml/                           # Local Machine Learning model processing
│       │   ├── processing.py             # NLP parsing & entity matching (spaCy)
│       │   ├── classifier.py             # Skill classification engine
│       │   └── ranker.py                 # Recommendation ranking model (scikit-learn)
│       ├── tasks/                        # Celery tasks (asynchronous workers)
│       │   ├── resume_parse.py           # Deep resume analysis (async parsing & vector index)
│       │   ├── recommendation_build.py   # Bulk matching engine processing
│       │   └── report_generate.py        # PDF report generator job
│       ├── main.py                       # FastAPI application entrypoint
│       └── alembic/                      # Database migrations scripts
│
├── packages/                             # Shared monorepo packages
│   ├── tsconfig/                         # Base tsconfig extensions
│   ├── eslint-config/                    # Shared code style configuration
│   └── types/                            # Shared type representations
│
├── infrastructure/                       # Deployment and System IaC
│   ├── docker/                           # Production/staging Dockerfiles
│   │   ├── api.Dockerfile                # Python web backend image
│   │   ├── worker.Dockerfile             # Celery worker image
│   │   └── web.Dockerfile                # Next.js static/SSR image
│   └── terraform/                        # Infrastructure blueprints
│       ├── rds.tf                        # PostgreSQL configurations
│       ├── elasticache.tf                # Redis cluster configs
│       └── provider.tf                   # Terraform cloud providers
│
├── docs/                                 # Centralized Documentation
│   ├── architecture.md                   # This core document
│   ├── db-schema.md                      # DB design & tables
│   ├── ai-ml-architecture.md             # LLM/ML pipeline workflows
│   ├── security.md                       # Security architecture policies
│   └── testing-devops.md                 # CI/CD and Testing guides
│
├── scripts/                              # Utility CLI scripts
│   ├── db_seed.py                        # Populate dev databases
│   └── check_env.sh                      # Verify system pre-requisites
│
└── tests/                                # Global E2E / Integration tests
    ├── e2e/                              # Playwright frontend/backend integration tests
    └── load/                             # Locust testing scripts
```

---

## 2. Architectural Reasoning

CareerPilot AI follows **Clean Architecture** principles and **Domain-Driven Design (DDD)** to create decoupled, easily testable components.

### Separation of Concerns

1. **The Core / Entities (Models Layer):** The SQL Alchemy models define the structural data schemas. They do not know about endpoints, protocols, or storage frameworks.
2. **Use Case Layer (Services):** Orchestrates the data flow between entities, AI pipelines, and repositories. Services contain pure business requirements (e.g., "calculate skill gap score") and do not directly access the database, maintaining high modularity.
3. **Interface Adapters (Repositories, Schemas, Routers):** Translates data from database representation to external APIs.
   - **Repository Pattern:** Isolates database CRUD queries. If we switch databases or update SQLAlchemy versions, only this layer is touched.
   - **Pydantic Schemas:** Translates JSON inputs/outputs.
   - **Routers:** Expose API contracts, map URL parameters, and handle HTTP response status codes.

### SOLID Principles

- **Single Responsibility Principle (SRP):** Each route handler only directs HTTP traffic; each service class only coordinates one business domain; each repository handles one model.
- **Dependency Inversion Principle (DIP):** Routers inject services, services inject repositories, and repositories inject database sessions using FastAPI's dependency injection container (`Depends`), making testing trivial via mocks.
- **Open-Closed Principle (OCP):** AI provider integrations use abstract interfaces. Introducing Google Gemini or Anthropic alongside OpenAI only requires creating a new provider implementing the abstract interface class.

---

## 3. Scaling Considerations

To support rapid growth and peak load demands, CareerPilot AI implements a stateless, horizontally autoscaling architecture:

### 1. Database Scaling & vector Search

- PostgreSQL handles transactional data with read-replicas.
- **Vector Search (pgvector):** User profile vectors and resume embedding indices are stored in PostgreSQL using the HNSW index type for $O(\log N)$ similarity query performance.

### 2. Queueing & Asynchronous Processing

- Heavy operations (such as processing complex multi-page PDFs, building large RAG context windows, and generating personalized career roadmaps) are offloaded to **Celery workers** using Redis as the transport broker.
- Keeps FastAPI main event loops unblocked, ensuring high throughput and sub-50ms API responses for general traffic.

### 3. Stateless REST Controllers

- Backend APIs run fully stateless. Session validation is token-based (JWT with Redis-backed blocklists).
- Allows containers to scale instantly using auto-scaling groups on Render or AWS ECS.

---

## 4. Security Considerations

We apply defense-in-depth across the entire stack:

1. **Least Privilege access:** Database connections are isolated. API keys and passwords are hashed using bcrypt.
2. **Rate Limiting:** IP-based and user-based limits are configured via FastAPI middleware using a Redis token bucket algorithm.
3. **Role-Based Access Control (RBAC):** Users, Premium Users, and Administrators are strictly checked using route-level FastAPI dependencies.
4. **Input Sanitization & Validation:** Strict typing on the frontend (Zod) and validation on the backend (Pydantic v2) prevents common injection exploits (SQL injection, XSS).

---

## 5. Future Extensibility Considerations

The architecture anticipates platform updates:

- **Plug-and-Play AI Models:** Models can be swapped globally by updating a configuration flag (e.g., swapping `gpt-4o` with `gemini-1.5-pro`).
- **Feature Flagging:** The modular feature-based structure (`apps/web/features/*` and `apps/api/api/v1/*`) allows clean environment-based feature gates (e.g., enabling "Voice Interview Simulator" only for selected beta users).
- **Extending to Microservices:** If any sub-feature (like Resume Parsing or ML Recommendation Engines) requires specialized resources (like GPU acceleration), its repository/service boundaries allow it to be easily decoupled into a standalone service without changing other parts of the monorepo.
