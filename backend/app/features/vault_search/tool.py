"""Search notes tool - full-text search across vault."""

import structlog
from pydantic_ai import RunContext

from app.core.agent import AgentDeps, vault_agent

logger = structlog.get_logger()


@vault_agent.tool
async def search_notes(
    ctx: RunContext[AgentDeps],
    query: str,
    max_results: int = 10,
) -> str:
    """Search for notes matching a query in the Obsidian vault.

    Use this when: User asks to find notes about a topic, search for content,
    or locate information across the vault.

    Do NOT use for: Reading a specific note (use read_note if you know the path),
    listing all notes, or when query is empty.

    Args:
        query: Natural language search query
        max_results: Maximum number of results to return (default 10)

    Returns:
        Formatted list of matching notes with excerpts.
    """
    if not query.strip():
        return "Please provide a search query."

    logger.info("vault.search.started", query=query, max_results=max_results)

    try:
        results = await ctx.deps.vault_manager.search_notes(
            query=query,
            max_results=max_results,
        )

        if not results:
            logger.info("vault.search.no_results", query=query)
            return f"No notes found matching: {query}"

        # Format results
        output_lines = [f"Found {len(results)} notes matching '{query}':\n"]

        for i, result in enumerate(results, 1):
            score_pct = int(result.score * 100)
            output_lines.append(f"## {i}. {result.note.title}")
            output_lines.append(f"**Path:** {result.note.path}")
            output_lines.append(f"**Relevance:** {score_pct}%")

            if result.excerpts:
                output_lines.append("**Excerpts:**")
                for excerpt in result.excerpts:
                    # Clean up excerpt for display
                    clean = excerpt.replace("\n", " ").strip()
                    output_lines.append(f"> {clean}")

            output_lines.append("")

        logger.info("vault.search.completed", query=query, results_count=len(results))
        return "\n".join(output_lines)

    except Exception as e:
        logger.error("vault.search.failed", query=query, error=str(e))
        return f"Error searching notes: {e}"


@vault_agent.tool
async def list_notes(
    ctx: RunContext[AgentDeps],
    folder: str = "",
) -> str:
    """List all notes in the vault or a specific folder.

    Use this when: User asks to see all notes, list notes in a folder,
    or get an overview of vault contents.

    Do NOT use for: Searching (use search_notes), reading specific notes,
    or finding notes by content.

    Args:
        folder: Relative folder path (empty for entire vault)

    Returns:
        List of note paths organized by folder.
    """
    logger.info("vault.list.started", folder=folder or "(root)")

    try:
        notes = await ctx.deps.vault_manager.list_notes(folder=folder)

        if not notes:
            if folder:
                return f"No notes found in folder: {folder}"
            return "No notes found in vault."

        # Group by folder
        by_folder: dict[str, list[str]] = {}
        for path in notes:
            parts = path.rsplit("/", 1)
            if len(parts) == 2:
                folder_name, filename = parts
            else:
                folder_name, filename = "(root)", parts[0]

            if folder_name not in by_folder:
                by_folder[folder_name] = []
            by_folder[folder_name].append(filename)

        # Format output
        output_lines = [f"Found {len(notes)} notes:\n"]

        for folder_name in sorted(by_folder.keys()):
            output_lines.append(f"**{folder_name}/**")
            for filename in sorted(by_folder[folder_name]):
                output_lines.append(f"  - {filename}")
            output_lines.append("")

        logger.info("vault.list.completed", folder=folder or "(root)", count=len(notes))
        return "\n".join(output_lines)

    except ValueError as e:
        logger.error("vault.list.path_error", folder=folder, error=str(e))
        return f"Invalid folder path: {e}"
    except Exception as e:
        logger.error("vault.list.failed", folder=folder, error=str(e))
        return f"Error listing notes: {e}"
