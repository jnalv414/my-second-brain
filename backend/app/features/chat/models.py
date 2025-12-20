"""Chat models - request/response schemas."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Request to chat with the vault agent."""

    message: str = Field(..., min_length=1, description="User message to the agent")


class ChatResponse(BaseModel):
    """Response from the vault agent."""

    response: str = Field(..., description="Agent's response")
    tool_calls: list[str] = Field(
        default_factory=list,
        description="Tools that were called during response",
    )
