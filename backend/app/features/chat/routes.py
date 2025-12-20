"""Chat routes - HTTP interface to vault agent."""

import structlog
from fastapi import APIRouter, Depends, HTTPException

from app.core.agent import AgentDeps, vault_agent
from app.core.config import settings
from app.core.vault_manager import VaultManager

from .models import ChatRequest, ChatResponse

logger = structlog.get_logger()

router = APIRouter(prefix="/chat", tags=["chat"])


def get_vault_manager() -> VaultManager:
    """Dependency to get VaultManager instance."""
    return VaultManager(settings.vault_path)


@router.post("", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    vault_manager: VaultManager = Depends(get_vault_manager),
) -> ChatResponse:
    """Send a message to the vault agent and get a response.

    The agent has access to vault tools:
    - read_note: Read a note by path
    - write_note: Create or update a note
    - delete_note: Delete a note
    - search_notes: Search across notes
    - list_notes: List notes in vault
    - get_backlinks: Find notes linking to a note
    - get_outgoing_links: Find notes a note links to
    """
    logger.info("chat.request.started", message_length=len(request.message))

    try:
        deps = AgentDeps(vault_manager=vault_manager)

        result = await vault_agent.run(
            request.message,
            deps=deps,
        )

        # Extract tool call names from result
        tool_calls = []
        for message in result.all_messages():
            if hasattr(message, "parts"):
                for part in message.parts:
                    if hasattr(part, "tool_name"):
                        tool_calls.append(part.tool_name)

        logger.info(
            "chat.request.completed",
            response_length=len(result.data),
            tool_calls=tool_calls,
        )

        return ChatResponse(
            response=result.data,
            tool_calls=tool_calls,
        )

    except Exception as e:
        logger.error("chat.request.failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Agent error: {e}")


@router.get("/health")
async def chat_health():
    """Check if chat endpoint is ready."""
    return {"status": "ready", "model": settings.llm_model}
