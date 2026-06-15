# Contributing to CareerPilot AI

We follow strict engineering standards to build a premium, enterprise-grade AI-powered career platform. Please review these guidelines before submitting code.

## 🤝 Git Workflow

We use a Git-flow inspired workflow with structured branches and commits:

1. **Branch Naming Conventions:**
   - `feature/CP-[ticket-number]-short-description`
   - `bugfix/CP-[ticket-number]-short-description`
   - `hotfix/CP-[ticket-number]-short-description`
   - `docs/short-description`

2. **Commit Message Guidelines (Conventional Commits):**
   - Format: `<type>(<scope>): <subject>`
   - Types:
     - `feat`: A new feature
     - `fix`: A bug fix
     - `docs`: Documentation changes
     - `style`: Formatting, missing semi-colons, etc. (no production code change)
     - `refactor`: Refactoring production code (no new features or bug fixes)
     - `test`: Adding missing tests, refactoring tests (no production code change)
     - `chore`: Updating build tasks, package manager configs, etc.
   - Example: `feat(api/resume): add async parser repository and validation schema`

## 🛠️ Code Conventions

### TypeScript & Frontend

- **Strict Mode:** Always enabled. Avoid `any`. Use custom types, interfaces, or generics.
- **Component Anatomy:** Ensure components are functional, stateless where possible, and located in their respective `features/` directory unless they are generic `ui/` elements.
- **Form Handling:** Always wrap forms in React Hook Form + Zod validation schema.
- **Data Fetching:** Use TanStack Query hooks. Avoid putting `useEffect` for data fetching.

### Python & Backend

- **Type Hints:** Required everywhere. Every function parameter and return type must be typed.
- **Asynchronous Code:** Use `async/await` for database operations, HTTP client calls, and network requests.
- **Architecture Layers:**
  - `Router` (endpoints) -> `Service` (business logic orchestration) -> `Repository` (database interaction)
- **Validation:** Enforce validation rules strictly inside Pydantic v2 schemas.

## 🧪 Testing Policy

- **Coverage Goal:** Minimum 85% coverage for business logic.
- **Unit Tests:** Mandatory for all new services, repositories, schemas, and utility functions.
- **API Tests:** Write integration tests in pytest for all new endpoints using `httpx.AsyncClient`.
- **E2E Tests:** Ensure critical user paths (auth, resume upload, roadmap generation) are covered via Playwright tests in `tests/`.
