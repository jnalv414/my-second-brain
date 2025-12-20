"""Links tool - find backlinks and outgoing links."""

import structlog
from pydantic_ai import RunContext

from app.core.agent import AgentDeps, vault_agent

logger = structlog.get_logger()


@vault_agent.tool
async def get_backlinks(ctx: RunContext[AgentDeps], note_name: str) -> str:
    """Find all notes that link to a specific note.

    Use this when: User asks what links to a note, wants to understand
    connections, or explore the knowledge graph.

    Do NOT use for: Finding links FROM a note (use get_outgoing_links),
    or searching note content.

    Args:
        note_name: Name of the note (without .md extension)

    Returns:
        List of notes that contain [[note_name]] wikilinks.
    """
    logger.info("vault.backlinks.started", note_name=note_name)

    try:
        backlinks = await ctx.deps.vault_manager.get_backlinks(note_name)

        if not backlinks:
            logger.info("vault.backlinks.none_found", note_name=note_name)
            return f"No notes link to [[{note_name}]]"

        output_lines = [f"Found {len(backlinks)} notes linking to [[{note_name}]]:\n"]

        for link in backlinks:
            output_lines.append(f"- **{link['name']}** ({link['path']})")

        logger.info(
            "vault.backlinks.completed",
            note_name=note_name,
            count=len(backlinks),
        )
        return "\n".join(output_lines)

    except Exception as e:
        logger.error("vault.backlinks.failed", note_name=note_name, error=str(e))
        return f"Error finding backlinks: {e}"


@vault_agent.tool
async def get_outgoing_links(ctx: RunContext[AgentDeps], path: str) -> str:
    """Find all notes that a specific note links to.

    Use this when: User asks what a note links to, wants to explore
    related notes, or understand note connections.

    Do NOT use for: Finding links TO a note (use get_backlinks),
    or reading note content.

    Args:
        path: Relative path to the note (e.g., "Projects/note.md")

    Returns:
        List of notes that are linked via [[wikilinks]] in the source note.
    """
    logger.info("vault.outgoing.started", path=path)

    try:
        outgoing = await ctx.deps.vault_manager.get_outgoing_links(path)

        if not outgoing:
            logger.info("vault.outgoing.none_found", path=path)
            return f"Note at {path} has no outgoing links."

        output_lines = [f"Found {len(outgoing)} outgoing links from {path}:\n"]

        for link in outgoing:
            output_lines.append(f"- **[[{link['name']}]]** ({link['path']})")

        logger.info("vault.outgoing.completed", path=path, count=len(outgoing))
        return "\n".join(output_lines)

    except ValueError as e:
        logger.error("vault.outgoing.path_error", path=path, error=str(e))
        return f"Invalid path: {e}"
    except Exception as e:
        logger.error("vault.outgoing.failed", path=path, error=str(e))
        return f"Error finding outgoing links: {e}"
