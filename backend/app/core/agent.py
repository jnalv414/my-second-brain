"""Pydantic-AI agent for Obsidian vault operations."""

import os
from dataclasses import dataclass

from pydantic_ai import Agent
from pydantic_ai.models.test import TestModel

from .config import settings
from .vault_manager import VaultManager


@dataclass
class AgentDeps:
    """Dependencies injected into agent tools."""

    vault_manager: VaultManager


def _get_model():
    """Get model - use TestModel if no API key available (for testing)."""
    if os.getenv("ANTHROPIC_API_KEY") or settings.anthropic_api_key:
        return f"anthropic:{settings.llm_model}"
    # Use test model for unit tests
    return TestModel()


# Single agent instance - tools registered via @vault_agent.tool decorator
vault_agent: Agent[AgentDeps, str] = Agent(
    model=_get_model(),
    deps_type=AgentDeps,
    retries=2,
    system_prompt="""You are Paddy, an AI assistant with access to an Obsidian vault.
You can read, write, search, and analyze notes in the vault.

When responding:
- Be concise and helpful
- Reference specific notes by their paths when relevant
- Use wikilinks [[Note Name]] format when mentioning notes
- Provide context from the vault when answering questions

Available capabilities:
- Read notes by path
- Search notes by content or title
- Create and update notes
- Find backlinks (notes linking to a note)
- Find outgoing links (notes a note links to)
""",
)
