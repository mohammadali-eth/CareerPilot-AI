# 🧪 Testing, CI/CD, and DevOps Guide

This document describes the testing architectures, continuous integration configs, Docker setups, deployment pipelines, and system monitoring strategies for CareerPilot AI.

---

## 1. Testing Architecture

Our testing strategy covers unit validation, api integration, and full end-to-end user paths.

```text
tests/
├── e2e/                           # Playwright system-wide E2E tests
│   ├── auth.spec.ts               # Registration & Login validation
│   ├── resume.spec.ts             # Upload -> Parse -> Vector match flow
│   └── roadmap.spec.ts            # Roadmap step tracking and completion
├── apps/
│   ├── web/                       # Frontend tests (Vitest + React Testing Library)
│   │   ├── components/            # UI components rendering tests
│   │   ├── features/              # Feature state transition & interaction tests
│   │   └── hooks/                 # Custom react hook behavior tests
│   │
│   └── api/                       # Backend tests (Pytest + Pytest-asyncio)
│       ├── unit/
│       │   ├── services/          # Business logic tests with mocked repositories
│       │   ├── repositories/      # Query builder tests using SQLite memory database
│       │   └── schemas/           # Pydantic parsing and validation edge cases
│       ├── integration/
│       │   └── api/               # Router tests using HTTPX AsyncClient
│       └── ai/                    # Mocks for LangChain, OpenAI, and Gemini
```

### 1.1 Mocking AI Providers

To prevent API token consumption and ensure deterministic test runs:

- We mock the `BaseLLMProvider` using Pytest fixtures.
- System prompts and parser validation tests use static text fixtures that mimic actual JSON outputs from the LLMs.

---

## 2. DevOps & Infrastructure

### 2.1 Docker Configurations

We maintain split Docker targets for Development, Staging, and Production under `infrastructure/docker/`:

- **Development:** Uses local source mounting to enable hot-reloading (FastAPI reload and Next.js HMR).
- **Production (`api.Dockerfile`):**
  - Uses multi-stage builds.
  - Installs lightweight Python runtime packages (`python:3.12-slim`).
  - Runs as a non-root user (`appuser`) for enhanced security.
- **Production (`web.Dockerfile`):**
  - Next.js standalone build configuration to minimize image footprint.

---

### 2.2 CI/CD Pipelines (GitHub Actions)

We automate checks on every Pull Request and deploy directly to production upon merges to `main`.

#### CI Pipeline (`.github/workflows/ci.yml`)

1. **Linting & Formatting:** Enforces Code style rules.
   - Runs `ruff check .` and `ruff format --check .` for Python.
   - Runs `eslint` and `prettier --check` for TypeScript/React.
2. **Frontend Tests:** Runs `pnpm test` via Vitest.
3. **Backend Tests:** Runs `pytest --cov=apps/api` using a temporary test Postgres container.

#### CD Pipeline (`.github/workflows/cd.yml`)

- **Trigger:** Merge to `main`.
- **Target Platforms:**
  - **Vercel:** Deploys the static Next.js build.
  - **Render:** Rebuilds and deploys the FastAPI container and Celery worker.
  - **Database Migration:** Executes `alembic upgrade head` inside the new API release task runner before switching traffic.

---

## 3. Production Monitoring & Logging

### 3.1 Sentry Integration

- Sentry SDK is initialized in both `main.py` (FastAPI) and `layout.tsx` (Next.js client-side error boundary).
- Error boundaries capture uncaught exceptions, inject request traces (allowing tracing from frontend to API calls), and alert the engineering team.

### 3.2 Structured Logging

- The FastAPI application formats logs as single-line JSON structures using the Python `json-logging` module.
- Structured logs make it trivial for log aggregators (e.g., Datadog, AWS CloudWatch, Axiom) to parse levels, status codes, user IDs, and duration metrics.

---

## 4. Database Backup & Retention Policy

- **Automated Backups:** Daily snapshots of the production RDS database are executed automatically.
- **Retention:** Stored securely in AWS S3 (with KMS encryption enabled) for 30 days.
- **Disaster Recovery:** Automated failover to a Multi-AZ standby replica database instance to guarantee $99.99\%$ database availability.
