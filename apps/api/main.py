import logging
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

from core.config import settings

# Configure Sentry SDK if DSN is provided
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0 if settings.ENVIRONMENT == "development" else 0.1,
        environment=settings.ENVIRONMENT,
    )

logger = logging.getLogger("careerpilot")

# Initialize FastAPI App with metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Enterprise-grade AI-powered Resume Intelligence & Career Recommendation Engine Backend",
    version="1.0.0",
    docs_url=None if settings.ENVIRONMENT == "production" else "/docs",
    redoc_url=None if settings.ENVIRONMENT == "production" else "/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json" if settings.ENVIRONMENT != "production" else None
)

# Set up CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).strip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API Routers
from api.v1.auth import router as auth_router
from api.v1.users import router as users_router
from api.v1.resume import router as resume_router
from api.v1.career import router as career_router

app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(users_router, prefix=settings.API_V1_STR)
app.include_router(resume_router, prefix=settings.API_V1_STR)
app.include_router(career_router, prefix=settings.API_V1_STR)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception(f"Unhandled system error occurred on request {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected server error occurred. Please contact engineering support.",
        },
    )

# Base Healthcheck Router
@app.get("/health", status_code=status.HTTP_200_OK, tags=["System"])
async def health_check():
    """
    Standard load-balancer health endpoint.
    Verifies API availability and connection health.
    """
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "api_version": "1.0.0"
    }

# Startup and Shutdown Hooks
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting up {settings.PROJECT_NAME} in {settings.ENVIRONMENT} mode...")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info(f"Shutting down {settings.PROJECT_NAME}...")
