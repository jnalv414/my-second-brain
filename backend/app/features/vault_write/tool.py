"""Write note tool - creates or updates notes."""

import structlog
from pydantic_ai import RunContext

from app.core.agent import AgentDeps, vault_agent

logger = structlog.get_logger()


@vault_agent.tool
async def write_note(
    ctx: RunContext[AgentDeps],
    path: str,
    content: str,
    tags: list[str] | None = None,
    title: str | None = None,
) -> str:
    """Create or update a note in the Obsidian vault.

    Use this when: User asks to create a new note, save information,
    update existing note content, or add notes to the vault.

    Do NOT use for: Reading notes (use read_note), searching,
    or when user hasn't provided content to write.

    Args:
        path: Relative path for the note (e.g., "Projects/new-note.md")
        content: Markdown content for the note (without frontmatter)
        tags: Optional list of tags to add to frontmatter
        title: Optional title (defaults to filename)

    Returns:
        Confirmation message with note details.
    """
    logger.info("vault.write.started", path=path)

    try:
        # Build frontmatter metadata
        metadata: dict = {}
        if tags:
            metadata["tags"] = tags
        if title:
            metadata["title"] = title

        note = await ctx.deps.vault_manager.write_note(
            relative_path=path,
            content=content,
            metadata=metadata if metadata else None,
        )

        logger.info("vault.write.completed", path=path, title=note.title)
        return f"Successfully wrote note: {note.path}\nTitle: {note.title}"

    except ValueError as e:
        logger.error("vault.write.path_error", path=path, error=str(e))
        return f"Invalid path: {e}"
    except Exception as e:
        logger.error("vault.write.failed", path=path, error=str(e))
        return f"Error writing note: {e}"


@vault_agent.tool
async def delete_note(ctx: RunContext[AgentDeps], path: str) -> str:
    """Delete a note from the Obsidian vault.

    Use this when: User explicitly asks to delete or remove a note.

    Do NOT use for: Any operation other than permanent deletion.
    Always confirm with user before deleting.

    Args:
        path: Relative path to the note to delete

    Returns:
        Confirmation message.
    """
    logger.info("vault.delete.started", path=path)

    try:
        deleted = await ctx.deps.vault_manager.delete_note(path)

        if deleted:
            logger.info("vault.delete.completed", path=path)
            return f"Successfully deleted note: {path}"
        else:
            logger.info("vault.delete.not_found", path=path)
            return f"Note not found: {path}"

    except ValueError as e:
        logger.error("vault.delete.path_error", path=path, error=str(e))
        return f"Invalid path: {e}"
    except Exception as e:
        logger.error("vault.delete.failed", path=path, error=str(e))
        return f"Error deleting note: {e}"
