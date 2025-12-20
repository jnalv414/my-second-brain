"""
Pytest fixtures for backlink_resolver tests.
Provides temporary vault structures for testing.
"""

import pytest
from pathlib import Path


@pytest.fixture
def temp_vault(tmp_path):
    """Create a basic test vault with interconnected notes."""
    # Create root-level notes
    note1 = tmp_path / "Note1.md"
    note1.write_text("# Note1\nThis links to [[Note2]] and [[Note3]]")

    note2 = tmp_path / "Note2.md"
    note2.write_text("# Note2\nThis links back to [[Note1]]")

    note3 = tmp_path / "Note3.md"
    note3.write_text("# Note3\nNo outgoing links here.")

    return tmp_path


@pytest.fixture
def temp_vault_with_subdirs(tmp_path):
    """Create a vault with notes in subdirectories."""
    # Root level
    root_note = tmp_path / "Index.md"
    root_note.write_text("# Index\nWelcome! See [[Daily Notes/2024-01-01]] and [[Projects/MyProject]]")

    # Daily Notes folder
    daily_folder = tmp_path / "Daily Notes"
    daily_folder.mkdir()
    daily_note = daily_folder / "2024-01-01.md"
    daily_note.write_text("# 2024-01-01\nWorked on [[Projects/MyProject]] today. See [[Index]].")

    # Projects folder
    projects_folder = tmp_path / "Projects"
    projects_folder.mkdir()
    project_note = projects_folder / "MyProject.md"
    project_note.write_text("# MyProject\nProject documentation. Related: [[Index]]")

    return tmp_path


@pytest.fixture
def temp_vault_case_sensitive(tmp_path):
    """Create a vault to test case-insensitive matching."""
    note_upper = tmp_path / "MyNote.md"
    note_upper.write_text("# MyNote\nLinks to [[ANOTHER]]")

    note_another = tmp_path / "Another.md"
    note_another.write_text("# Another\nLinks to [[mynote]]")

    return tmp_path


@pytest.fixture
def temp_vault_complex_links(tmp_path):
    """Create a vault with complex wikilink formats."""
    note1 = tmp_path / "Source.md"
    note1.write_text("""# Source

Simple link: [[Target]]
Link with heading: [[Target#Section1]]
Link with alias: [[Target|My Alias]]
Link with heading and alias: [[Target#Section2|Another Alias]]
Multiple on same line: [[Note1]] and [[Note2]]
""")

    target = tmp_path / "Target.md"
    target.write_text("# Target\n\n## Section1\nContent\n\n## Section2\nMore content")

    note1_file = tmp_path / "Note1.md"
    note1_file.write_text("# Note1\nContent")

    note2_file = tmp_path / "Note2.md"
    note2_file.write_text("# Note2\nContent")

    return tmp_path


@pytest.fixture
def empty_vault(tmp_path):
    """Create an empty vault directory."""
    return tmp_path


@pytest.fixture
def temp_vault_orphan(tmp_path):
    """Create a vault with an orphan note (no incoming or outgoing links)."""
    connected = tmp_path / "Connected.md"
    connected.write_text("# Connected\nLinks to [[Other]]")

    other = tmp_path / "Other.md"
    other.write_text("# Other\nLinks back to [[Connected]]")

    orphan = tmp_path / "Orphan.md"
    orphan.write_text("# Orphan\nThis note has no links.")

    return tmp_path


@pytest.fixture
def temp_vault_circular(tmp_path):
    """Create a vault with circular references."""
    note_a = tmp_path / "NoteA.md"
    note_a.write_text("# NoteA\nLinks to [[NoteB]]")

    note_b = tmp_path / "NoteB.md"
    note_b.write_text("# NoteB\nLinks to [[NoteC]]")

    note_c = tmp_path / "NoteC.md"
    note_c.write_text("# NoteC\nLinks back to [[NoteA]]")

    return tmp_path
