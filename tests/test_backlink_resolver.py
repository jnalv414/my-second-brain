"""
Comprehensive tests for BacklinkResolver module.

Test Coverage:
- extract_wikilinks: Simple, with heading, with alias, multiple links
- find_note_path: Exact match, case-insensitive, not found
- scan_vault: Graph structure, backlinks, outgoing links
- get_backlinks: Correct source notes
- get_outgoing_links: Correct target notes

Test Techniques Applied:
- Equivalence Partitioning: Valid/invalid inputs, different link formats
- Boundary Value Analysis: Empty content, single link, many links
- Error Guessing: Case sensitivity, missing files, malformed links
"""

import pytest
from pathlib import Path
import sys

# Add project root to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backlink_resolver import BacklinkResolver


# =============================================================================
# TC-001 through TC-010: extract_wikilinks Tests
# =============================================================================

class TestExtractWikilinks:
    """Test cases for BacklinkResolver.extract_wikilinks method."""

    def test_extract_wikilinks_simple(self):
        """TC-001: Extract simple wikilink [[Note]]"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "Hello [[World]]"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["World"]

    def test_extract_wikilinks_with_heading(self):
        """TC-002: Extract wikilink with heading [[Note#Section]]"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "See [[MyNote#Introduction]] for details"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["MyNote"]

    def test_extract_wikilinks_with_alias(self):
        """TC-003: Extract wikilink with alias [[Note|Alias]]"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "Check out [[Documentation|the docs]]"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["Documentation"]

    def test_extract_wikilinks_with_heading_and_alias(self):
        """TC-004: Extract wikilink with both heading and alias [[Note#Section|Alias]]"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "See [[Guide#Setup|setup instructions]]"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["Guide"]

    def test_extract_wikilinks_multiple(self):
        """TC-005: Extract multiple wikilinks from content"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "Links: [[Note1]], [[Note2#Heading]], [[Note3|Alias]]"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["Note1", "Note2", "Note3"]

    def test_extract_wikilinks_empty_content(self):
        """TC-006: Handle empty content gracefully"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = ""

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == []

    def test_extract_wikilinks_no_links(self):
        """TC-007: Handle content without any wikilinks"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "This is plain text without any links."

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == []

    def test_extract_wikilinks_with_spaces(self):
        """TC-008: Extract wikilink with spaces in note name"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "See [[My Important Note]] for info"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["My Important Note"]

    def test_extract_wikilinks_multiline(self):
        """TC-009: Extract wikilinks from multiline content"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = """# My Note

First paragraph with [[Link1]].

Second paragraph with [[Link2#Section]] reference.

- List item [[Link3|alias]]
"""

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        assert links == ["Link1", "Link2", "Link3"]

    def test_extract_wikilinks_duplicate_handling(self):
        """TC-010: Handle duplicate wikilinks in content"""
        # Arrange
        resolver = BacklinkResolver("/tmp")
        content = "First [[Note]] and again [[Note]] and [[Note#Section]]"

        # Act
        links = resolver.extract_wikilinks(content)

        # Assert
        # Should return all occurrences (including duplicates)
        assert links == ["Note", "Note", "Note"]


# =============================================================================
# TC-011 through TC-016: find_note_path Tests
# =============================================================================

class TestFindNotePath:
    """Test cases for BacklinkResolver.find_note_path method."""

    def test_find_note_path_exact_match(self, temp_vault):
        """TC-011: Find note with exact name match"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        result = resolver.find_note_path("Note1")

        # Assert
        assert result is not None
        assert result.name == "Note1.md"
        assert result.exists()

    def test_find_note_path_case_insensitive(self, temp_vault_case_sensitive):
        """TC-012: Find note with case-insensitive match"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_case_sensitive))

        # Act
        result = resolver.find_note_path("mynote")  # lowercase search

        # Assert
        assert result is not None
        assert result.stem.lower() == "mynote"

    def test_find_note_path_not_found(self, temp_vault):
        """TC-013: Return None when note is not found"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        result = resolver.find_note_path("NonExistentNote")

        # Assert
        assert result is None

    def test_find_note_path_in_subdirectory(self, temp_vault_with_subdirs):
        """TC-014: Find note located in subdirectory"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_with_subdirs))

        # Act
        result = resolver.find_note_path("2024-01-01")

        # Assert
        assert result is not None
        assert result.name == "2024-01-01.md"
        assert "Daily Notes" in str(result)

    def test_find_note_path_empty_vault(self, empty_vault):
        """TC-015: Handle empty vault gracefully"""
        # Arrange
        resolver = BacklinkResolver(str(empty_vault))

        # Act
        result = resolver.find_note_path("AnyNote")

        # Assert
        assert result is None

    def test_find_note_path_with_spaces(self, tmp_path):
        """TC-016: Find note with spaces in name"""
        # Arrange
        note_with_spaces = tmp_path / "My Important Note.md"
        note_with_spaces.write_text("# My Important Note\nContent here")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        result = resolver.find_note_path("My Important Note")

        # Assert
        assert result is not None
        assert result.name == "My Important Note.md"


# =============================================================================
# TC-017 through TC-023: scan_vault Tests
# =============================================================================

class TestScanVault:
    """Test cases for BacklinkResolver.scan_vault method."""

    def test_scan_vault_structure(self, temp_vault):
        """TC-017: Verify graph has correct structure with required keys"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "Note1" in graph
        assert "path" in graph["Note1"]
        assert "outgoing_links" in graph["Note1"]
        assert "backlinks" in graph["Note1"]

    def test_scan_vault_outgoing_links(self, temp_vault):
        """TC-018: Verify outgoing links are correctly captured"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "Note2" in graph["Note1"]["outgoing_links"]
        assert "Note3" in graph["Note1"]["outgoing_links"]

    def test_scan_vault_backlinks(self, temp_vault):
        """TC-019: Verify backlinks are correctly built"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        graph = resolver.scan_vault()

        # Assert
        # Note2 should have Note1 as a backlink
        assert "Note1" in graph["Note2"]["backlinks"]
        # Note3 should have Note1 as a backlink
        assert "Note1" in graph["Note3"]["backlinks"]

    def test_scan_vault_relative_paths(self, temp_vault):
        """TC-020: Verify paths are relative to vault root"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert graph["Note1"]["path"] == "Note1.md"

    def test_scan_vault_with_subdirectories(self, temp_vault_with_subdirs):
        """TC-021: Scan vault with notes in subdirectories"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_with_subdirs))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "Index" in graph
        assert "2024-01-01" in graph
        assert "MyProject" in graph
        # Check path includes directory
        assert "Daily Notes" in graph["2024-01-01"]["path"]

    def test_scan_vault_empty(self, empty_vault):
        """TC-022: Handle empty vault gracefully"""
        # Arrange
        resolver = BacklinkResolver(str(empty_vault))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert graph == {}

    def test_scan_vault_circular_references(self, temp_vault_circular):
        """TC-023: Handle circular references correctly"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_circular))

        # Act
        graph = resolver.scan_vault()

        # Assert
        # Verify circular chain: A -> B -> C -> A
        assert "NoteB" in graph["NoteA"]["outgoing_links"]
        assert "NoteC" in graph["NoteB"]["outgoing_links"]
        assert "NoteA" in graph["NoteC"]["outgoing_links"]
        # Verify backlinks
        assert "NoteC" in graph["NoteA"]["backlinks"]
        assert "NoteA" in graph["NoteB"]["backlinks"]
        assert "NoteB" in graph["NoteC"]["backlinks"]


# =============================================================================
# TC-024 through TC-028: get_backlinks Tests
# =============================================================================

class TestGetBacklinks:
    """Test cases for BacklinkResolver.get_backlinks method."""

    def test_get_backlinks_returns_sources(self, temp_vault):
        """TC-024: Get backlinks returns correct source notes"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        backlinks = resolver.get_backlinks("Note2")

        # Assert
        assert len(backlinks) == 1
        assert backlinks[0]["name"] == "Note1"
        assert backlinks[0]["path"] == "Note1.md"

    def test_get_backlinks_multiple_sources(self, temp_vault_circular):
        """TC-025: Get backlinks when note has multiple sources"""
        # Arrange - Add another link to NoteA
        note_d = temp_vault_circular / "NoteD.md"
        note_d.write_text("# NoteD\nAlso links to [[NoteA]]")
        resolver = BacklinkResolver(str(temp_vault_circular))

        # Act
        backlinks = resolver.get_backlinks("NoteA")

        # Assert
        names = [bl["name"] for bl in backlinks]
        assert "NoteC" in names
        assert "NoteD" in names

    def test_get_backlinks_case_insensitive(self, temp_vault_case_sensitive):
        """TC-026: Get backlinks with case-insensitive note name"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_case_sensitive))

        # Act - Search with different case
        backlinks = resolver.get_backlinks("MYNOTE")

        # Assert
        names = [bl["name"] for bl in backlinks]
        assert "Another" in names

    def test_get_backlinks_no_backlinks(self, tmp_path):
        """TC-027: Return empty list when note has no backlinks"""
        # Arrange - Create a note that links out but nothing links to it
        isolated_note = tmp_path / "Isolated.md"
        isolated_note.write_text("# Isolated\nThis links to [[Other]]")
        other_note = tmp_path / "Other.md"
        other_note.write_text("# Other\nNo links here.")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        backlinks = resolver.get_backlinks("Isolated")

        # Assert
        assert backlinks == []

    def test_get_backlinks_note_not_found(self, temp_vault):
        """TC-028: Return empty list when note does not exist"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        backlinks = resolver.get_backlinks("NonExistentNote")

        # Assert
        assert backlinks == []


# =============================================================================
# TC-029 through TC-033: get_outgoing_links Tests
# =============================================================================

class TestGetOutgoingLinks:
    """Test cases for BacklinkResolver.get_outgoing_links method."""

    def test_get_outgoing_links_returns_targets(self, temp_vault):
        """TC-029: Get outgoing links returns correct target notes"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        outgoing = resolver.get_outgoing_links("Note1")

        # Assert
        names = [link["name"] for link in outgoing]
        assert "Note2" in names
        assert "Note3" in names

    def test_get_outgoing_links_with_paths(self, temp_vault):
        """TC-030: Outgoing links include correct paths"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        outgoing = resolver.get_outgoing_links("Note1")

        # Assert
        for link in outgoing:
            assert "name" in link
            assert "path" in link
            assert link["path"].endswith(".md")

    def test_get_outgoing_links_case_insensitive(self, temp_vault_case_sensitive):
        """TC-031: Get outgoing links with case-insensitive search"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_case_sensitive))

        # Act - Search with different case
        outgoing = resolver.get_outgoing_links("mynote")

        # Assert
        names = [link["name"] for link in outgoing]
        assert "Another" in names

    def test_get_outgoing_links_no_links(self, temp_vault):
        """TC-032: Return empty list when note has no outgoing links"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        outgoing = resolver.get_outgoing_links("Note3")

        # Assert
        assert outgoing == []

    def test_get_outgoing_links_note_not_found(self, temp_vault):
        """TC-033: Return empty list when note does not exist"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault))

        # Act
        outgoing = resolver.get_outgoing_links("NonExistentNote")

        # Assert
        assert outgoing == []


# =============================================================================
# TC-034 through TC-038: Edge Cases and Integration Tests
# =============================================================================

class TestEdgeCases:
    """Edge case and integration tests."""

    def test_orphan_note_detection(self, temp_vault_orphan):
        """TC-034: Identify orphan notes (no incoming or outgoing links)"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_orphan))

        # Act
        graph = resolver.scan_vault()

        # Assert
        orphan_data = graph["Orphan"]
        assert orphan_data["outgoing_links"] == []
        assert orphan_data["backlinks"] == []

    def test_complex_wikilink_formats(self, temp_vault_complex_links):
        """TC-035: Handle various wikilink formats in single file"""
        # Arrange
        resolver = BacklinkResolver(str(temp_vault_complex_links))

        # Act
        graph = resolver.scan_vault()

        # Assert
        source_links = graph["Source"]["outgoing_links"]
        # Target appears multiple times with different formats
        target_count = source_links.count("Target")
        assert target_count == 4  # Simple, #heading, |alias, #heading|alias
        assert "Note1" in source_links
        assert "Note2" in source_links

    def test_hidden_files_excluded(self, tmp_path):
        """TC-036: Hidden files (starting with .) are excluded from scan"""
        # Arrange
        visible_note = tmp_path / "VisibleNote.md"
        visible_note.write_text("# Visible\nContent")
        hidden_note = tmp_path / ".HiddenNote.md"
        hidden_note.write_text("# Hidden\nContent")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "VisibleNote" in graph
        assert ".HiddenNote" not in graph

    def test_broken_link_handling(self, tmp_path):
        """TC-037: Handle links to non-existent notes gracefully"""
        # Arrange
        note = tmp_path / "NoteWithBrokenLink.md"
        note.write_text("# Note\nLinks to [[NonExistent]] note")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        graph = resolver.scan_vault()
        outgoing = resolver.get_outgoing_links("NoteWithBrokenLink")

        # Assert
        # The link is captured in outgoing_links
        assert "NonExistent" in graph["NoteWithBrokenLink"]["outgoing_links"]
        # But get_outgoing_links only returns existing notes
        assert outgoing == []

    def test_special_characters_in_note_name(self, tmp_path):
        """TC-038: Handle special characters in note names"""
        # Arrange
        note = tmp_path / "Note-With_Special.Characters.md"
        note.write_text("# Special\nContent")
        note2 = tmp_path / "Linker.md"
        note2.write_text("Link to [[Note-With_Special.Characters]]")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "Note-With_Special.Characters" in graph


# =============================================================================
# TC-039 through TC-040: Performance and Stress Tests
# =============================================================================

class TestPerformance:
    """Performance and stress tests."""

    def test_large_vault(self, tmp_path):
        """TC-039: Handle vault with many notes"""
        # Arrange - Create 100 interconnected notes
        for i in range(100):
            note = tmp_path / f"Note{i}.md"
            # Each note links to next 3 notes
            links = " ".join([f"[[Note{(i+j) % 100}]]" for j in range(1, 4)])
            note.write_text(f"# Note{i}\n{links}")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert len(graph) == 100
        # Each note should have exactly 3 outgoing links
        for i in range(100):
            assert len(graph[f"Note{i}"]["outgoing_links"]) == 3
            # Each note should have 3 backlinks (from 3 previous notes)
            assert len(graph[f"Note{i}"]["backlinks"]) == 3

    def test_deeply_nested_directories(self, tmp_path):
        """TC-040: Handle deeply nested directory structure"""
        # Arrange - Create nested structure
        deep_path = tmp_path / "Level1" / "Level2" / "Level3" / "Level4"
        deep_path.mkdir(parents=True)
        deep_note = deep_path / "DeepNote.md"
        deep_note.write_text("# DeepNote\nLinks to [[RootNote]]")
        root_note = tmp_path / "RootNote.md"
        root_note.write_text("# RootNote\nLinks to [[DeepNote]]")
        resolver = BacklinkResolver(str(tmp_path))

        # Act
        graph = resolver.scan_vault()

        # Assert
        assert "DeepNote" in graph
        assert "RootNote" in graph
        assert "Level1" in graph["DeepNote"]["path"]
        assert "DeepNote" in graph["RootNote"]["outgoing_links"]
