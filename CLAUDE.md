# CLAUDE.md - My Second Brain

Obsidian vault integration with AI agent (Paddy). Read, write, and query notes programmatically.

## Core Principles

1. **Three-Feature Extraction Rule**: Only extract shared code after 3+ features need it
2. **Type-Driven Design**: Zod/Pydantic schemas for runtime validation
3. **Security First**: All vault paths validated against directory traversal
4. **TDD**: Write tests FIRST, then implementation

## Tech Stack

**Frontend (TypeScript/Bun)**
- Runtime: Bun | Validation: Zod v4 | Linting: Biome | Testing: Vitest

**Backend (Python/Paddy Agent)**
- Framework: FastAPI | Agent: pydantic-ai | Validation: Pydantic v2
- Database: Supabase (optional) | Package Manager: uv | Python: 3.12+

## Architecture

```
backend/app/
  features/tool_name/        # Vertical Slice Architecture
    tool_name.py             # @vault_agent.tool decorator
    tool_name_service.py     # Business logic (TEST THIS!)
    tool_name_models.py      # Pydantic schemas
    tests/
  core/
    agent.py                 # Single agent instance
    tool_registry.py         # Side-effect imports
```

## Agent Architecture

```python
# Single agent instance pattern (core/agent.py)
vault_agent: Agent[AgentDeps, str] = Agent(
    model=f"anthropic:{settings.llm_model}",
    deps_type=AgentDeps,
    retries=2,
)

@dataclass
class AgentDeps:
    vault_manager: VaultManager
    settings: Settings
    supabase_client: Client | None = None
```

## Tool Registration Pattern

```python
# tool_registry.py - import for side effects to register tools
import app.features.obsidian_query_vault_tool.obsidian_query_vault_tool
import app.features.obsidian_create_note_tool.obsidian_create_note_tool
```

## LLM-Optimized Tool Docstrings

```python
@vault_agent.tool
async def query_vault(ctx: RunContext[AgentDeps], query: str) -> str:
    """Search the Obsidian vault for notes matching a query.

    Use this when: User asks about note contents, searches for topics
    Do NOT use for: Creating/modifying notes, listing all notes

    Args:
        query: Natural language search query

    Returns:
        Matching notes with relevant excerpts
    """
```

## Structured Logging

Format: `{domain}.{component}.{action}_{state}`
States: `_started`, `_completed`, `_failed`

```python
logger.info("vault.query.search_started", query=query)
logger.info("vault.query.search_completed", results_count=len(results))
logger.error("vault.query.search_failed", error=str(e))
```

## Testing (TDD)

**Key Rule**: Test the SERVICE function, not the tool decorator

```python
# tests/test_query_vault_service.py
@pytest.mark.asyncio
async def test_query_vault_returns_matching_notes():
    result = await query_vault_service(vault_manager, "test query")
    assert len(result.notes) > 0
```

**Commands**
```bash
uv run pytest -v              # All tests
uv run mypy app/              # Type checking
uv run ruff check .           # Linting
cd frontend && bun test       # Frontend tests
```

## Key Types

| Type | Purpose |
|------|---------|
| `Note` | Complete note with path, title, content, frontmatter |
| `AgentDeps` | Dependency injection for vault_agent tools |
| `VaultManager` | Obsidian vault operations |
