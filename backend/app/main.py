"""
My Second Brain - FastAPI Backend
Primary: Obsidian vault integration with AI agent (Paddy)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Register vault tools with agent (side-effect import)
import app.core.tool_registry  # noqa: F401
from app.features.chat.routes import router as chat_router
from app.features.webhooks.routes import router as webhooks_router

app = FastAPI(
    title="My Second Brain",
    description="Obsidian as Claude's persistent memory",
    version="0.1.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(webhooks_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "my-second-brain"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.get("/health/ready")
async def health_ready():
    return {"status": "ready"}
