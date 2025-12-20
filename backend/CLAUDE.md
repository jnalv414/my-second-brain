# CLAUDE.md - Backend

FastAPI backend with pydantic-ai agent (Paddy) for Obsidian vault operations.

## Quick Start

```bash
# Install dependencies
uv sync --all-extras

# Run server
uv run uvicorn app.main:app --reload

# Run tests
uv run pytest -v

# Lint
uv run ruff check .
```

## Architecture

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── core/                   # Core infrastructure
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── agent.py            # Pydantic-AI agent (Paddy)
│   │   ├── vault_manager.py    # Obsidian vault operations
│   │   ├── tool_registry.py    # Side-effect imports to register tools
│   │   └── tests/              # Core component tests
│   └── features/               # Vertical Slice Architecture
│       ├── webhooks/           # GitHub webhook integration
│       ├── chat/               # Chat API (agent interface)
│       ├── vault_read/         # @vault_agent.tool read_note
│       ├── vault_write/        # @vault_agent.tool write_note, delete_note
│       ├── vault_search/       # @vault_agent.tool search_notes, list_notes
│       └── vault_links/        # @vault_agent.tool get_backlinks, get_outgoing_links
└── pyproject.toml
```

## Agent Pattern

Single agent instance with tools registered via decorators:

```python
# core/agent.py
vault_agent: Agent[AgentDeps, str] = Agent(
    model=f"anthropic:{settings.llm_model}",
    deps_type=AgentDeps,
    retries=2,
)

@dataclass
class AgentDeps:
    vault_manager: VaultManager
```

### Tool Registration

Tools are registered via side-effect imports in `tool_registry.py`:

```python
# core/tool_registry.py - import at app startup
import app.features.vault_read.tool      # noqa: F401
import app.features.vault_write.tool     # noqa: F401
import app.features.vault_search.tool    # noqa: F401
import app.features.vault_links.tool     # noqa: F401
```

### Writing Tools

Follow this pattern for new tools:

```python
# features/my_tool/tool.py
from pydantic_ai import RunContext
from app.core.agent import vault_agent, AgentDeps

@vault_agent.tool
async def my_tool(ctx: RunContext[AgentDeps], param: str) -> str:
    """One-line description for LLM.

    Use this when: User asks to...
    Do NOT use for: Other operations...

    Args:
        param: Description

    Returns:
        Result description
    """
    return await ctx.deps.vault_manager.some_operation(param)
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/chat` | Send message to Paddy agent |
| GET | `/chat/health` | Chat endpoint health check |
| POST | `/webhook` | GitHub webhook receiver |
| GET | `/health` | Server health check |

### Chat API

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Search for notes about Python"}'
```

Response:
```json
{
  "response": "Found 3 notes matching 'Python'...",
  "tool_calls": ["search_notes"]
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `read_note` | Read note by path |
| `write_note` | Create/update note with content and metadata |
| `delete_note` | Delete note by path |
| `search_notes` | Full-text search across vault |
| `list_notes` | List all notes in vault or folder |
| `get_backlinks` | Find notes linking to a target |
| `get_outgoing_links` | Find notes a source links to |

## VaultManager

Core class for Obsidian vault operations with security:

```python
from app.core.vault_manager import VaultManager

vm = VaultManager(Path("/path/to/vault"))

# Read note
note = await vm.read_note("Projects/note.md")

# Write note
note = await vm.write_note("new-note.md", "Content", {"tags": ["test"]})

# Search
results = await vm.search_notes("python", max_results=10)

# Links
backlinks = await vm.get_backlinks("Note Name")
outgoing = await vm.get_outgoing_links("Projects/note.md")
```

### Security

All paths validated against directory traversal:

```python
# Raises ValueError
vm._validate_path("../../../etc/passwd")
```

## Configuration

Environment variables (or `.env` file):

| Variable | Default | Description |
|----------|---------|-------------|
| `VAULT_PATH` | `~/Documents/Obsidian` | Obsidian vault path |
| `LLM_MODEL` | `claude-sonnet-4-20250514` | Anthropic model |
| `ANTHROPIC_API_KEY` | - | API key (required for production) |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `DEBUG` | `false` | Debug mode |
| `GITHUB_WEBHOOK_SECRET` | - | Webhook signature secret |

## Testing

```bash
# All tests
uv run pytest -v

# Specific module
uv run pytest app/core/tests/test_vault_manager.py -v

# With coverage
uv run pytest --cov=app

# Watch mode (requires pytest-watch)
uv run ptw
```

### Test Structure

| Directory | Tests |
|-----------|-------|
| `app/core/tests/` | VaultManager, Config (82 tests) |
| `app/features/webhooks/tests/` | Webhook routes (5 tests) |

## Structured Logging

Format: `{domain}.{component}.{action}_{state}`

```python
import structlog
logger = structlog.get_logger()

logger.info("vault.read.started", path=path)
logger.info("vault.read.completed", path=path, title=note.title)
logger.error("vault.read.failed", path=path, error=str(e))
```

## Adding New Features

1. Create feature directory: `app/features/my_feature/`
2. Add files:
   - `__init__.py`
   - `tool.py` (with `@vault_agent.tool` decorator)
   - `models.py` (Pydantic schemas if needed)
   - `service.py` (business logic)
3. Add import to `core/tool_registry.py`
4. Write tests in `my_feature/tests/`

## Dependencies

Key packages:
- `fastapi` - Web framework
- `pydantic-ai` - AI agent framework
- `pydantic-settings` - Configuration
- `structlog` - Structured logging
- `aiofiles` - Async file operations
- `python-frontmatter` - YAML frontmatter parsing
