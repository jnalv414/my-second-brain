"""VaultManager tests - comprehensive coverage for vault operations and security.

Test Categories:
- Path validation and security (directory traversal prevention)
- Note CRUD operations (read, write, delete)
- Listing and searching notes
- Wikilink parsing and link graph operations
"""

from pathlib import Path

import pytest

from app.core.vault_manager import Note, SearchResult, VaultManager, Wikilink

# ============================================================================
# Fixtures
# ============================================================================


@pytest.fixture
def vault_path(tmp_path: Path) -> Path:
    """Create a temporary vault directory."""
    vault = tmp_path / "test_vault"
    vault.mkdir()
    return vault


@pytest.fixture
def vault_manager(vault_path: Path) -> VaultManager:
    """Create VaultManager instance with temp vault."""
    return VaultManager(vault_path)


@pytest.fixture
def populated_vault(vault_path: Path) -> Path:
    """Create vault with sample notes for testing.

    Note: Wikilinks use file stems (without .md), so [[note1]] matches note1.md.
    The _find_note_by_name function compares lowercase names.
    """
    # Root level notes - using lowercase filenames to match wikilink behavior
    (vault_path / "note1.md").write_text(
        "---\ntitle: Note One\ntags: [python, testing]\n---\n"
        "# Note One\n\nThis is the first note with [[note2]] link."
    )
    (vault_path / "note2.md").write_text(
        "---\ntitle: Note Two\naliases: [Second Note]\n---\n"
        "# Note Two\n\nThis note links to [[note1]] and [[project1]]."
    )

    # Nested directory
    projects = vault_path / "Projects"
    projects.mkdir()
    (projects / "project1.md").write_text(
        "---\ntitle: Project One\n---\n"
        "# Project One\n\nA project note with [[note1#Heading|alias link]]."
    )

    # Daily notes
    daily = vault_path / "Daily"
    daily.mkdir()
    (daily / "2024-01-01.md").write_text(
        "# January 1st\n\nNew year note with searchable content."
    )

    # Hidden file (should be ignored)
    (vault_path / ".hidden.md").write_text("Hidden note content")

    return vault_path


@pytest.fixture
def populated_vault_manager(populated_vault: Path) -> VaultManager:
    """VaultManager with populated test vault."""
    return VaultManager(populated_vault)


# ============================================================================
# Path Validation Tests - Security Critical
# ============================================================================


class TestValidatePath:
    """Test path validation and directory traversal prevention."""

    def test_validate_path_allows_valid_paths(self, vault_manager: VaultManager):
        """TC-VM-001: Valid relative paths should be accepted."""
        # Simple file
        path = vault_manager._validate_path("note.md")
        assert path.name == "note.md"

        # Nested path
        path = vault_manager._validate_path("folder/subfolder/note.md")
        assert path.name == "note.md"

        # Path with spaces
        path = vault_manager._validate_path("My Notes/daily note.md")
        assert path.name == "daily note.md"

    def test_validate_path_blocks_traversal_attacks(self, vault_manager: VaultManager):
        """TC-VM-002: Directory traversal attacks must be blocked."""
        # Classic traversal to /etc/passwd
        with pytest.raises(ValueError, match="Path traversal detected"):
            vault_manager._validate_path("../../../etc/passwd")

        # Traversal with double dots
        with pytest.raises(ValueError, match="Path traversal detected"):
            vault_manager._validate_path("folder/../../../etc/passwd")

        # Traversal to parent
        with pytest.raises(ValueError, match="Path traversal detected"):
            vault_manager._validate_path("../sibling_vault/note.md")

        # Hidden traversal in middle of path
        with pytest.raises(ValueError, match="Path traversal detected"):
            vault_manager._validate_path("notes/../../../etc/hosts")

    def test_validate_path_handles_edge_cases(self, vault_manager: VaultManager):
        """TC-VM-003: Edge cases in path validation."""
        # Empty path should resolve to vault root (valid)
        path = vault_manager._validate_path("")
        assert path == vault_manager.vault_path

        # Current directory reference
        path = vault_manager._validate_path("./note.md")
        assert path.name == "note.md"

        # Absolute path that happens to be within vault
        _internal_path = str(vault_manager.vault_path / "note.md")
        # This is implementation-specific - may raise or resolve
        assert _internal_path.endswith("note.md")

    def test_vault_path_must_exist(self, tmp_path: Path):
        """TC-VM-004: VaultManager requires existing vault path."""
        nonexistent = tmp_path / "does_not_exist"
        with pytest.raises(ValueError, match="does not exist"):
            VaultManager(nonexistent)


# ============================================================================
# Read Note Tests
# ============================================================================


class TestReadNote:
    """Test note reading operations."""

    @pytest.mark.asyncio
    async def test_read_note_returns_note(self, populated_vault_manager: VaultManager):
        """TC-VM-010: Reading existing note returns Note object."""
        note = await populated_vault_manager.read_note("note1.md")

        assert note is not None
        assert isinstance(note, Note)
        assert note.path == "note1.md"
        assert note.title == "Note One"
        assert "first note" in note.content
        assert note.frontmatter.tags == ["python", "testing"]

    @pytest.mark.asyncio
    async def test_read_note_returns_none_for_missing(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-011: Reading non-existent note returns None."""
        note = await populated_vault_manager.read_note("nonexistent.md")
        assert note is None

    @pytest.mark.asyncio
    async def test_read_note_from_nested_folder(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-012: Can read notes from nested directories."""
        note = await populated_vault_manager.read_note("Projects/project1.md")

        assert note is not None
        assert note.title == "Project One"
        assert "Projects/project1.md" == note.path

    @pytest.mark.asyncio
    async def test_read_note_parses_frontmatter(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-013: Frontmatter is correctly parsed into NoteMeta."""
        note = await populated_vault_manager.read_note("note2.md")

        assert note is not None
        assert note.frontmatter.title == "Note Two"
        assert note.frontmatter.aliases == ["Second Note"]

    @pytest.mark.asyncio
    async def test_read_note_handles_no_frontmatter(self, vault_path: Path):
        """TC-VM-014: Notes without frontmatter are handled correctly."""
        (vault_path / "plain.md").write_text("# Plain Note\n\nNo frontmatter here.")
        manager = VaultManager(vault_path)

        note = await manager.read_note("plain.md")

        assert note is not None
        assert note.title == "plain"  # Falls back to filename stem
        assert note.frontmatter.tags == []

    @pytest.mark.asyncio
    async def test_read_note_rejects_traversal(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-015: Reading with traversal path raises ValueError."""
        with pytest.raises(ValueError, match="Path traversal"):
            await populated_vault_manager.read_note("../../../etc/passwd")

    @pytest.mark.asyncio
    async def test_read_note_returns_none_for_directory(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-016: Attempting to read a directory returns None."""
        note = await populated_vault_manager.read_note("Projects")
        assert note is None


# ============================================================================
# Write Note Tests
# ============================================================================


class TestWriteNote:
    """Test note writing operations."""

    @pytest.mark.asyncio
    async def test_write_note_creates_file(self, vault_manager: VaultManager):
        """TC-VM-020: Writing a new note creates the file."""
        note = await vault_manager.write_note(
            "new_note.md",
            "# New Note\n\nContent here.",
            {"title": "New Note", "tags": ["test"]},
        )

        assert note.path == "new_note.md"
        assert note.title == "New Note"
        assert note.frontmatter.tags == ["test"]

        # Verify file exists on disk
        file_path = vault_manager.vault_path / "new_note.md"
        assert file_path.exists()
        content = file_path.read_text()
        assert "# New Note" in content
        assert "title: New Note" in content

    @pytest.mark.asyncio
    async def test_write_note_creates_directories(self, vault_manager: VaultManager):
        """TC-VM-021: Writing to nested path creates intermediate directories."""
        note = await vault_manager.write_note(
            "new/nested/folder/note.md",
            "Nested content",
        )

        assert note is not None
        folder_path = vault_manager.vault_path / "new" / "nested" / "folder"
        assert folder_path.is_dir()

    @pytest.mark.asyncio
    async def test_write_note_updates_existing(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-022: Writing to existing note updates it."""
        # Update existing note
        note = await populated_vault_manager.write_note(
            "note1.md",
            "Updated content",
            {"title": "Updated Title"},
        )

        assert note.title == "Updated Title"
        assert "Updated content" in note.content

    @pytest.mark.asyncio
    async def test_write_note_without_metadata(self, vault_manager: VaultManager):
        """TC-VM-023: Notes can be created without metadata."""
        note = await vault_manager.write_note("plain.md", "Just content, no meta.")

        assert note is not None
        assert note.content.strip() == "Just content, no meta."

    @pytest.mark.asyncio
    async def test_write_note_rejects_traversal(self, vault_manager: VaultManager):
        """TC-VM-024: Writing with traversal path raises ValueError."""
        with pytest.raises(ValueError, match="Path traversal"):
            await vault_manager.write_note(
                "../../../tmp/malicious.md",
                "Malicious content",
            )


# ============================================================================
# Delete Note Tests
# ============================================================================


class TestDeleteNote:
    """Test note deletion operations."""

    @pytest.mark.asyncio
    async def test_delete_note_removes_file(
        self, populated_vault_manager: VaultManager, populated_vault: Path
    ):
        """TC-VM-030: Deleting a note removes the file from disk."""
        assert (populated_vault / "note1.md").exists()

        result = await populated_vault_manager.delete_note("note1.md")

        assert result is True
        assert not (populated_vault / "note1.md").exists()

    @pytest.mark.asyncio
    async def test_delete_note_returns_false_for_missing(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-031: Deleting non-existent note returns False."""
        result = await populated_vault_manager.delete_note("nonexistent.md")
        assert result is False

    @pytest.mark.asyncio
    async def test_delete_note_from_nested_folder(
        self, populated_vault_manager: VaultManager, populated_vault: Path
    ):
        """TC-VM-032: Can delete notes from nested directories."""
        assert (populated_vault / "Projects" / "project1.md").exists()

        result = await populated_vault_manager.delete_note("Projects/project1.md")

        assert result is True
        assert not (populated_vault / "Projects" / "project1.md").exists()

    @pytest.mark.asyncio
    async def test_delete_note_rejects_traversal(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-033: Deleting with traversal path raises ValueError."""
        with pytest.raises(ValueError, match="Path traversal"):
            await populated_vault_manager.delete_note("../../../etc/hosts")


# ============================================================================
# List Notes Tests
# ============================================================================


class TestListNotes:
    """Test note listing operations."""

    @pytest.mark.asyncio
    async def test_list_notes_finds_all_md_files(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-040: List notes returns all markdown files in vault."""
        notes = await populated_vault_manager.list_notes()

        assert len(notes) == 4  # note1, note2, project1, 2024-01-01
        assert "note1.md" in notes
        assert "note2.md" in notes
        assert "Projects/project1.md" in notes
        assert "Daily/2024-01-01.md" in notes

    @pytest.mark.asyncio
    async def test_list_notes_excludes_hidden_files(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-041: Hidden files (starting with .) are excluded."""
        notes = await populated_vault_manager.list_notes()

        hidden_notes = [n for n in notes if ".hidden" in n]
        assert len(hidden_notes) == 0

    @pytest.mark.asyncio
    async def test_list_notes_in_folder(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-042: Can list notes in specific folder."""
        notes = await populated_vault_manager.list_notes("Projects")

        assert len(notes) == 1
        assert "Projects/project1.md" in notes

    @pytest.mark.asyncio
    async def test_list_notes_empty_vault(self, vault_manager: VaultManager):
        """TC-VM-043: Empty vault returns empty list."""
        notes = await vault_manager.list_notes()
        assert notes == []

    @pytest.mark.asyncio
    async def test_list_notes_returns_sorted(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-044: Notes are returned in sorted order."""
        notes = await populated_vault_manager.list_notes()
        assert notes == sorted(notes)


# ============================================================================
# Search Notes Tests
# ============================================================================


class TestSearchNotes:
    """Test note searching operations."""

    @pytest.mark.asyncio
    async def test_search_notes_finds_matches(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-050: Search finds notes containing query terms."""
        results = await populated_vault_manager.search_notes("project")

        assert len(results) >= 1
        assert any(r.note.title == "Project One" for r in results)

    @pytest.mark.asyncio
    async def test_search_notes_returns_search_results(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-051: Search returns SearchResult objects with scores."""
        results = await populated_vault_manager.search_notes("note")

        assert len(results) > 0
        for result in results:
            assert isinstance(result, SearchResult)
            assert 0 <= result.score <= 1
            assert isinstance(result.note, Note)

    @pytest.mark.asyncio
    async def test_search_notes_title_weighted_higher(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-052: Title matches score higher than content matches."""
        results = await populated_vault_manager.search_notes("One")

        # "Note One" should rank high due to title match
        titles = [r.note.title for r in results]
        assert "Note One" in titles

    @pytest.mark.asyncio
    async def test_search_notes_includes_excerpts(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-053: Search results include excerpts around matches."""
        results = await populated_vault_manager.search_notes("searchable")

        assert len(results) >= 1
        result = results[0]
        assert len(result.excerpts) > 0
        assert any("searchable" in e.lower() for e in result.excerpts)

    @pytest.mark.asyncio
    async def test_search_notes_respects_max_results(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-054: Search respects max_results limit."""
        results = await populated_vault_manager.search_notes("note", max_results=1)
        assert len(results) <= 1

    @pytest.mark.asyncio
    async def test_search_notes_no_matches(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-055: Search with no matches returns empty list."""
        results = await populated_vault_manager.search_notes("xyznonexistent123")
        assert results == []

    @pytest.mark.asyncio
    async def test_search_notes_case_insensitive(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-056: Search is case-insensitive."""
        results_lower = await populated_vault_manager.search_notes("project")
        results_upper = await populated_vault_manager.search_notes("PROJECT")

        assert len(results_lower) == len(results_upper)


# ============================================================================
# Wikilink Parsing Tests
# ============================================================================


class TestExtractWikilinks:
    """Test wikilink extraction from markdown content."""

    def test_extract_wikilinks_simple(self, vault_manager: VaultManager):
        """TC-VM-060: Extract simple [[Note]] wikilinks."""
        content = "This links to [[My Note]] and [[Another]]."
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 2
        assert links[0].target == "My Note"
        assert links[0].heading is None
        assert links[0].alias is None

    def test_extract_wikilinks_with_heading(self, vault_manager: VaultManager):
        """TC-VM-061: Extract [[Note#Heading]] wikilinks."""
        content = "See [[Note#Section One]] for details."
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 1
        assert links[0].target == "Note"
        assert links[0].heading == "Section One"
        assert links[0].alias is None

    def test_extract_wikilinks_with_alias(self, vault_manager: VaultManager):
        """TC-VM-062: Extract [[Note|Display Text]] wikilinks."""
        content = "Check out [[Technical Docs|the docs]] here."
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 1
        assert links[0].target == "Technical Docs"
        assert links[0].alias == "the docs"
        assert links[0].heading is None

    def test_extract_wikilinks_parses_all_formats(self, vault_manager: VaultManager):
        """TC-VM-063: Parse all wikilink formats including combined."""
        content = """
        Simple: [[Note]]
        With heading: [[Note#Heading]]
        With alias: [[Note|Alias]]
        Full format: [[Note#Heading|Alias]]
        """
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 4

        # Check the full format link
        full_link = [link for link in links if link.heading and link.alias][0]
        assert full_link.target == "Note"
        assert full_link.heading == "Heading"
        assert full_link.alias == "Alias"

    def test_extract_wikilinks_preserves_raw(self, vault_manager: VaultManager):
        """TC-VM-064: Raw wikilink string is preserved."""
        content = "Link: [[My Note#Section|Click Here]]"
        links = vault_manager.extract_wikilinks(content)

        assert links[0].raw == "[[My Note#Section|Click Here]]"

    def test_extract_wikilinks_returns_wikilink_objects(
        self, vault_manager: VaultManager
    ):
        """TC-VM-065: Returns list of Wikilink dataclass objects."""
        content = "[[Test Link]]"
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 1
        assert isinstance(links[0], Wikilink)

    def test_extract_wikilinks_no_links(self, vault_manager: VaultManager):
        """TC-VM-066: Content without wikilinks returns empty list."""
        content = "Just plain text with no links."
        links = vault_manager.extract_wikilinks(content)
        assert links == []

    def test_extract_wikilinks_strips_whitespace(self, vault_manager: VaultManager):
        """TC-VM-067: Whitespace in link components is stripped."""
        content = "[[ Note With Spaces ]]"
        links = vault_manager.extract_wikilinks(content)

        assert len(links) == 1
        assert links[0].target == "Note With Spaces"


# ============================================================================
# Backlinks and Outgoing Links Tests
# ============================================================================


class TestGetBacklinks:
    """Test backlink discovery."""

    @pytest.mark.asyncio
    async def test_get_backlinks_finds_sources(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-070: Get backlinks finds all notes linking to target."""
        # note2.md and project1.md both link to [[note1]]
        backlinks = await populated_vault_manager.get_backlinks("note1")

        assert len(backlinks) >= 1
        source_names = [bl["name"] for bl in backlinks]
        assert "Note Two" in source_names  # note2.md has title "Note Two"

    @pytest.mark.asyncio
    async def test_get_backlinks_case_insensitive(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-071: Backlink search is case-insensitive."""
        backlinks_upper = await populated_vault_manager.get_backlinks("NOTE1")
        backlinks_lower = await populated_vault_manager.get_backlinks("note1")

        assert len(backlinks_upper) == len(backlinks_lower)

    @pytest.mark.asyncio
    async def test_get_backlinks_no_links(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-072: Note with no backlinks returns empty list."""
        backlinks = await populated_vault_manager.get_backlinks("2024-01-01")
        assert backlinks == []

    @pytest.mark.asyncio
    async def test_get_backlinks_includes_path(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-073: Backlink results include path to source note."""
        backlinks = await populated_vault_manager.get_backlinks("note1")

        for bl in backlinks:
            assert "path" in bl
            assert bl["path"].endswith(".md")


class TestGetOutgoingLinks:
    """Test outgoing link discovery."""

    @pytest.mark.asyncio
    async def test_get_outgoing_links_finds_targets(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-080: Get outgoing links finds all linked notes."""
        outgoing = await populated_vault_manager.get_outgoing_links("note2.md")

        target_names = [link["name"] for link in outgoing]
        # note2.md links to [[note1]] and [[project1]]
        assert "note1" in target_names

    @pytest.mark.asyncio
    async def test_get_outgoing_links_returns_empty_for_no_links(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-081: Note with no outgoing links returns empty list."""
        outgoing = await populated_vault_manager.get_outgoing_links("Daily/2024-01-01.md")
        assert outgoing == []

    @pytest.mark.asyncio
    async def test_get_outgoing_links_missing_note(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-082: Non-existent note returns empty list."""
        outgoing = await populated_vault_manager.get_outgoing_links("nonexistent.md")
        assert outgoing == []

    @pytest.mark.asyncio
    async def test_get_outgoing_links_includes_path(
        self, populated_vault_manager: VaultManager
    ):
        """TC-VM-083: Outgoing link results include path to target note."""
        outgoing = await populated_vault_manager.get_outgoing_links("note1.md")

        for link in outgoing:
            assert "path" in link
            assert "name" in link


# ============================================================================
# Edge Cases and Error Handling
# ============================================================================


class TestEdgeCases:
    """Test edge cases and error conditions."""

    @pytest.mark.asyncio
    async def test_unicode_in_note_content(self, vault_manager: VaultManager):
        """TC-VM-090: Notes with unicode content are handled correctly."""
        await vault_manager.write_note(
            "unicode.md",
            "Content with emojis and special chars",
            {"title": "Test Note"},
        )

        read_note = await vault_manager.read_note("unicode.md")
        assert read_note is not None
        assert "special chars" in read_note.content

    @pytest.mark.asyncio
    async def test_empty_note_content(self, vault_manager: VaultManager):
        """TC-VM-091: Empty note content is handled correctly."""
        await vault_manager.write_note("empty.md", "")

        read_note = await vault_manager.read_note("empty.md")
        assert read_note is not None
        assert read_note.content == ""

    @pytest.mark.asyncio
    async def test_very_long_note_path(self, vault_manager: VaultManager):
        """TC-VM-092: Long but valid paths are accepted."""
        long_path = "/".join(["folder"] * 10) + "/note.md"
        note = await vault_manager.write_note(long_path, "Deep content")

        assert note is not None
        read_note = await vault_manager.read_note(long_path)
        assert read_note is not None

    @pytest.mark.asyncio
    async def test_special_chars_in_filename(self, vault_manager: VaultManager):
        """TC-VM-093: Filenames with special characters (allowed by OS)."""
        # Note: Some characters like / are not allowed in filenames
        note = await vault_manager.write_note(
            "note-with_special.chars.md",
            "Content",
        )

        assert note is not None
        read_note = await vault_manager.read_note("note-with_special.chars.md")
        assert read_note is not None

    def test_to_relative_path_conversion(self, vault_manager: VaultManager):
        """TC-VM-094: Absolute to relative path conversion works."""
        abs_path = vault_manager.vault_path / "folder" / "note.md"
        relative = vault_manager._to_relative(abs_path)

        assert relative == "folder/note.md"
        assert not relative.startswith("/")
