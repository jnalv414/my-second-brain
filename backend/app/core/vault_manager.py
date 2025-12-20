"""VaultManager - Obsidian vault operations with path security."""

import re
from dataclasses import dataclass, field
from pathlib import Path
from typing import AsyncIterator

import aiofiles
import frontmatter
import structlog

logger = structlog.get_logger()


@dataclass
class NoteMeta:
    """Note metadata from frontmatter."""

    tags: list[str] = field(default_factory=list)
    aliases: list[str] = field(default_factory=list)
    created: str | None = None
    modified: str | None = None
    title: str | None = None
    extra: dict = field(default_factory=dict)


@dataclass
class Note:
    """Complete note with content and metadata."""

    path: str  # Relative path from vault root
    title: str
    content: str  # Markdown content without frontmatter
    frontmatter: NoteMeta
    modified: float  # Unix timestamp


@dataclass
class Wikilink:
    """Parsed wikilink from markdown content."""

    raw: str  # Original: [[Note#Heading|Alias]]
    target: str  # Note name
    heading: str | None = None
    alias: str | None = None


@dataclass
class SearchResult:
    """Search result with relevance score."""

    note: Note
    score: float  # 0-1 relevance
    excerpts: list[str] = field(default_factory=list)


class VaultManager:
    """Manage Obsidian vault operations with path security."""

    WIKILINK_PATTERN = re.compile(r"\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]")

    def __init__(self, vault_path: Path):
        self.vault_path = vault_path.resolve()
        if not self.vault_path.exists():
            raise ValueError(f"Vault path does not exist: {self.vault_path}")

    def _validate_path(self, relative_path: str) -> Path:
        """Validate path is within vault (prevent directory traversal)."""
        absolute = (self.vault_path / relative_path).resolve()
        if not str(absolute).startswith(str(self.vault_path)):
            raise ValueError(f"Path traversal detected: {relative_path}")
        return absolute

    def _to_relative(self, absolute_path: Path) -> str:
        """Convert absolute path to vault-relative string."""
        return str(absolute_path.relative_to(self.vault_path))

    async def read_note(self, relative_path: str) -> Note | None:
        """Read a note by relative path.

        Args:
            relative_path: Path relative to vault root (e.g., "Projects/note.md")

        Returns:
            Note object or None if not found
        """
        try:
            abs_path = self._validate_path(relative_path)
            if not abs_path.exists() or not abs_path.is_file():
                return None

            async with aiofiles.open(abs_path, "r", encoding="utf-8") as f:
                raw_content = await f.read()

            # Parse frontmatter
            post = frontmatter.loads(raw_content)
            meta = NoteMeta(
                tags=post.metadata.get("tags", []),
                aliases=post.metadata.get("aliases", []),
                created=post.metadata.get("created"),
                modified=post.metadata.get("modified"),
                title=post.metadata.get("title"),
                extra={
                    k: v
                    for k, v in post.metadata.items()
                    if k not in ("tags", "aliases", "created", "modified", "title")
                },
            )

            return Note(
                path=relative_path,
                title=meta.title or abs_path.stem,
                content=post.content,
                frontmatter=meta,
                modified=abs_path.stat().st_mtime,
            )

        except ValueError:
            raise
        except Exception as e:
            logger.error("vault.read_note.failed", path=relative_path, error=str(e))
            return None

    async def write_note(
        self,
        relative_path: str,
        content: str,
        metadata: dict | None = None,
    ) -> Note:
        """Write or update a note.

        Args:
            relative_path: Path relative to vault root
            content: Markdown content (without frontmatter)
            metadata: Optional frontmatter metadata

        Returns:
            Created/updated Note object
        """
        abs_path = self._validate_path(relative_path)
        abs_path.parent.mkdir(parents=True, exist_ok=True)

        # Build frontmatter
        post = frontmatter.Post(content, **(metadata or {}))
        raw_content = frontmatter.dumps(post)

        async with aiofiles.open(abs_path, "w", encoding="utf-8") as f:
            await f.write(raw_content)

        logger.info("vault.write_note.completed", path=relative_path)

        # Return the written note
        note = await self.read_note(relative_path)
        if note is None:
            raise RuntimeError(f"Failed to read note after writing: {relative_path}")
        return note

    async def delete_note(self, relative_path: str) -> bool:
        """Delete a note by relative path.

        Args:
            relative_path: Path relative to vault root

        Returns:
            True if deleted, False if not found
        """
        abs_path = self._validate_path(relative_path)
        if not abs_path.exists():
            return False

        abs_path.unlink()
        logger.info("vault.delete_note.completed", path=relative_path)
        return True

    async def list_notes(self, folder: str = "") -> list[str]:
        """List all markdown files in a folder.

        Args:
            folder: Relative folder path (empty for root)

        Returns:
            List of relative paths to markdown files
        """
        if folder:
            search_path = self._validate_path(folder)
        else:
            search_path = self.vault_path

        notes = []
        for md_file in search_path.rglob("*.md"):
            if md_file.name.startswith("."):
                continue
            notes.append(self._to_relative(md_file))

        return sorted(notes)

    async def search_notes(
        self,
        query: str,
        max_results: int = 10,
    ) -> list[SearchResult]:
        """Full-text search across vault notes.

        Args:
            query: Search query string
            max_results: Maximum number of results

        Returns:
            List of SearchResult sorted by relevance
        """
        query_lower = query.lower()
        query_terms = query_lower.split()
        results: list[SearchResult] = []

        async for note in self._iter_notes():
            # Calculate score based on term matches
            content_lower = note.content.lower()
            title_lower = note.title.lower()

            title_matches = sum(1 for term in query_terms if term in title_lower)
            content_matches = sum(1 for term in query_terms if term in content_lower)

            if title_matches == 0 and content_matches == 0:
                continue

            # Score: title matches worth more than content
            score = (title_matches * 2 + content_matches) / (len(query_terms) * 3)
            score = min(score, 1.0)

            # Extract excerpts around matches
            excerpts = self._extract_excerpts(note.content, query_terms)

            results.append(SearchResult(note=note, score=score, excerpts=excerpts))

        # Sort by score descending
        results.sort(key=lambda r: r.score, reverse=True)
        return results[:max_results]

    def _extract_excerpts(
        self,
        content: str,
        terms: list[str],
        context_chars: int = 100,
    ) -> list[str]:
        """Extract text excerpts around matching terms."""
        excerpts = []
        content_lower = content.lower()

        for term in terms:
            idx = content_lower.find(term)
            if idx != -1:
                start = max(0, idx - context_chars)
                end = min(len(content), idx + len(term) + context_chars)
                excerpt = content[start:end]
                if start > 0:
                    excerpt = "..." + excerpt
                if end < len(content):
                    excerpt = excerpt + "..."
                excerpts.append(excerpt)

        return excerpts[:3]  # Max 3 excerpts

    async def _iter_notes(self) -> AsyncIterator[Note]:
        """Iterate over all notes in vault."""
        for path in await self.list_notes():
            note = await self.read_note(path)
            if note:
                yield note

    def extract_wikilinks(self, content: str) -> list[Wikilink]:
        """Extract all wikilinks from markdown content."""
        links = []
        for match in self.WIKILINK_PATTERN.finditer(content):
            raw = match.group(0)
            target = match.group(1)
            heading = match.group(2)
            alias = match.group(3)
            links.append(
                Wikilink(
                    raw=raw,
                    target=target.strip(),
                    heading=heading.strip() if heading else None,
                    alias=alias.strip() if alias else None,
                )
            )
        return links

    async def get_backlinks(self, note_name: str) -> list[dict]:
        """Get all notes that link to the specified note.

        Args:
            note_name: Target note name (without .md extension)

        Returns:
            List of {"name": str, "path": str} for linking notes
        """
        note_name_lower = note_name.lower()
        backlinks = []

        async for note in self._iter_notes():
            links = self.extract_wikilinks(note.content)
            for link in links:
                if link.target.lower() == note_name_lower:
                    backlinks.append({
                        "name": note.title,
                        "path": note.path,
                    })
                    break  # Only count each note once

        return backlinks

    async def get_outgoing_links(self, relative_path: str) -> list[dict]:
        """Get all notes that a note links to.

        Args:
            relative_path: Path to source note

        Returns:
            List of {"name": str, "path": str} for target notes
        """
        note = await self.read_note(relative_path)
        if not note:
            return []

        links = self.extract_wikilinks(note.content)
        outgoing = []

        for link in links:
            # Try to find the target note
            target_path = await self._find_note_by_name(link.target)
            if target_path:
                outgoing.append({
                    "name": link.target,
                    "path": target_path,
                })

        return outgoing

    async def _find_note_by_name(self, name: str) -> str | None:
        """Find note path by name (case-insensitive)."""
        name_lower = name.lower()
        for path in await self.list_notes():
            stem = Path(path).stem.lower()
            if stem == name_lower:
                return path
        return None
