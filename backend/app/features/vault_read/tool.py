"""Read note tool - retrieves note content by path."""

import structlog
from pydantic_ai import RunContext

from app.core.agent import AgentDeps, vault_agent

logger = structlog.get_logger()


@vault_agent.tool
async def read_note(ctx: RunContext[AgentDeps], path: str) -> str:
    """Read a note from the Obsidian vault by its path.

    Use this when: User asks to see a specific note, wants to read content,
    or you need to retrieve note details.

    Do NOT use for: Searching (use search_notes), finding notes by topic,
    or when you don't know the exact path.

    Args:
        path: Relative path from vault root (e.g., "Projects/my-note.md")

    Returns:
        Note content with frontmatter metadata, or error message if not found.
    """
    logger.info("vault.read.started", path=path)

    try:
        note = await ctx.deps.vault_manager.read_note(path)

        if note is None:
            logger.info("vault.read.not_found", path=path)
            return f"Note not found: {path}"

        # Format response with metadata
        tags = ", ".join(note.frontmatter.tags) if note.frontmatter.tags else "none"
        aliases = ", ".join(note.frontmatter.aliases) if note.frontmatter.aliases else "none"

        response = f"""# {note.title}

**Path:** {note.path}
**Tags:** {tags}
**Aliases:** {aliases}

---

{note.content}"""

        logger.info("vault.read.completed", path=path, title=note.title)
        return response

    except ValueError as e:
        logger.error("vault.read.path_error", path=path, error=str(e))
        return f"Invalid path: {e}"
    except Exception as e:
        logger.error("vault.read.failed", path=path, error=str(e))
        return f"Error reading note: {e}"
