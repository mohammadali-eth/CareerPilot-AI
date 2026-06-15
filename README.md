# CareerPilot AI — Enterprise Architecture & Project Foundation

CareerPilot AI is an AI-powered Career Mentor, Resume Intelligence Platform, Career Recommendation Engine, Skill Gap Analyzer, Roadmap Generator, Interview Simulator, Analytics Platform, and Learning Assistant.

This project is built using a clean monorepo architecture, enforcing strict separation of concerns, strong typing, domain-driven design, and repository/service patterns to ensure it scales cleanly from day one.

---

## 🚀 Technology Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **UI & Styling:** React 19, TypeScript (Strict Mode), Tailwind CSS, shadcn/ui
- **State & Queries:** TanStack Query (React Query) v5, Zustand (Global State)
- **Forms & Validation:** React Hook Form, Zod

### Backend

- **Framework:** FastAPI (Python 3.12+)
- **Database & ORM:** PostgreSQL (with `pgvector`), SQLAlchemy 2.0 (Async), Alembic (Migrations)
- **Validation:** Pydantic v2
- **Task Queue:** Celery with Redis broker

### AI & Machine Learning

- **AI Orchestration:** LangChain, OpenAI API, Google Gemini API
- **NLP & Embeddings:** spaCy, Sentence Transformers, Scikit-learn

### Testing & Quality Assurance

- **Frontend Testing:** Vitest, React Testing Library
- **Backend Testing:** Pytest, Pytest-asyncio
- **Code Quality:** Ruff (Linting/Formatting), Mypy (Static Typing)

---

## 📁 Monorepo Folder Structure

```text
careerpilot-ai/
├── apps/
│   ├── web/                     # Next.js 15 Frontend
│   └── api/                     # FastAPI Backend & Worker
├── packages/
│   ├── tsconfig/                # Shared TypeScript configurations
│   ├── eslint-config/           # Shared ESLint/Ruff configuration rules
│   └── types/                   # Shared TypeScript type definitions
├── infrastructure/
│   ├── docker/                  # Dockerfiles for all environments
│   └── terraform/               # IaC for Vercel, Render, AWS, RDS
├── docs/                        # Complete System Documentation
│   ├── architecture.md          # Architectural decisions & layers
│   ├── db-schema.md             # DB modules, indexes, & relations
│   ├── ai-ml-architecture.md    # Prompt pipelines, embeddings, RAG, and ML models
│   ├── security.md              # Auth, RBAC, encryption & auditing
│   └── testing-devops.md        # Test suite layout, Docker setups, CI/CD pipelines
├── scripts/                     # Shell scripts for setup & seeding
├── tests/                       # Global E2E tests (Playwright)
├── package.json                 # Monorepo root manifest
├── pnpm-workspace.yaml          # PNPM workspaces configuration
├── turbo.json                   # Turborepo task pipeline
├── pyproject.toml               # Python project configuration (Ruff/Pytest)
└── docker-compose.yml           # Local multi-container development environment
```

---

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [PNPM](https://pnpm.io/) v9+
- [Python](https://www.python.org/) v3.12+
- [Docker](https://www.docker.com/) & Docker Compose

### Initial Setup

1. **Clone the repository:**

   ```bash
   git clone <repo-url> careerpilot-ai
   cd careerpilot-ai
   ```

2. **Install frontend/monorepo dependencies:**

   ```bash
   pnpm install
   ```

3. **Install Python backend dependencies:**
   It is recommended to use a virtual environment in the `apps/api` directory:

   ```bash
   cd apps/api
   python3 -m venv .venv
   source .venv/bin/activate
   pip install poetry
   poetry install
   ```

4. **Setup Environment Variables:**

   ```bash
   cp .env.example .env
   ```

5. **Start Infrastructure Services:**
   Spin up PostgreSQL (with pgvector) and Redis:

   ```bash
   docker compose up -d postgres redis
   ```

6. **Run Database Migrations:**

   ```bash
   cd apps/api
   alembic upgrade head
   ```

7. **Start Development Servers:**
   From the root directory, start both frontend and backend concurrently via Turborepo:
   ```bash
   pnpm dev
   ```

---

## 📝 Coding Standards & Conventions

- **Frontend:** Strict TypeScript, component modularity (feature-based folders), declarative UI via tailwind/shadcn. Avoid prop-drilling by utilizing Zustand stores or context providers.
- **Backend:** Clean Architecture. Routers handle HTTP request parsing/response formats, services orchestrate business logic, and repositories interface with database models. All database interactions should be asynchronous.
- **Linters:** Enforced via pre-commit hooks. Ruff is used for Python formatting and linting, and ESLint is used for JavaScript/TypeScript.
