#!/usr/bin/env python3
"""
Lightweight backlink resolver for Obsidian vault.
Scans markdown files for [[wikilinks]] and builds bidirectional link graph.

Usage:
    python backlink_resolver.py --vault /path/to/vault --note "Note Name"
    python backlink_resolver.py --vault /path/to/vault --scan-all
"""

import argparse
import json
import re
from pathlib import Path
from typing import Dict, List, Set


class BacklinkResolver:
    """Resolve bidirectional links in Obsidian vault."""

    def __init__(self, vault_path: str):
        self.vault_path = Path(vault_path)
        self.wikilink_pattern = re.compile(r'\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]')

    def extract_wikilinks(self, content: str) -> List[str]:
        """Extract all [[wikilinks]] from markdown content.

        Examples:
            [[Note]] -> "Note"
            [[Note#Heading]] -> "Note"
            [[Note|Alias]] -> "Note"
            [[Note#Heading|Alias]] -> "Note"
        """
        matches = self.wikilink_pattern.findall(content)
        return [match.strip() for match in matches]

    def find_note_path(self, note_name: str) -> Path | None:
        """Find absolute path for note by name (without .md extension)."""
        # Try exact match first
        candidates = list(self.vault_path.rglob(f"{note_name}.md"))
        if candidates:
            return candidates[0]

        # Try case-insensitive match
        for md_file in self.vault_path.rglob("*.md"):
            if md_file.stem.lower() == note_name.lower():
                return md_file

        return None

    def scan_vault(self) -> Dict[str, Dict[str, any]]:
        """Scan entire vault and build link graph.

        Returns:
            {
                "Note Name": {
                    "path": "relative/path/to/note.md",
                    "outgoing_links": ["Target 1", "Target 2"],
                    "backlinks": ["Source 1", "Source 2"]
                }
            }
        """
        graph: Dict[str, Dict[str, any]] = {}

        # First pass: collect all notes and outgoing links
        for md_file in self.vault_path.rglob("*.md"):
            if md_file.name.startswith("."):
                continue

            note_name = md_file.stem
            relative_path = md_file.relative_to(self.vault_path)

            try:
                content = md_file.read_text(encoding="utf-8")
                outgoing_links = self.extract_wikilinks(content)

                graph[note_name] = {
                    "path": str(relative_path),
                    "outgoing_links": outgoing_links,
                    "backlinks": []
                }
            except Exception as e:
                print(f"Error reading {md_file}: {e}")
                continue

        # Second pass: build backlinks
        for note_name, data in graph.items():
            for target in data["outgoing_links"]:
                # Find target in graph (case-insensitive)
                target_key = None
                for key in graph.keys():
                    if key.lower() == target.lower():
                        target_key = key
                        break

                if target_key:
                    graph[target_key]["backlinks"].append(note_name)

        return graph

    def get_backlinks(self, note_name: str) -> List[Dict[str, str]]:
        """Get all notes that link to the specified note.

        Returns:
            [{"name": "Source Note", "path": "path/to/source.md"}, ...]
        """
        graph = self.scan_vault()

        # Find note in graph (case-insensitive)
        note_key = None
        for key in graph.keys():
            if key.lower() == note_name.lower():
                note_key = key
                break

        if not note_key:
            return []

        backlinks = []
        for source_name in graph[note_key]["backlinks"]:
            backlinks.append({
                "name": source_name,
                "path": graph[source_name]["path"]
            })

        return backlinks

    def get_outgoing_links(self, note_name: str) -> List[Dict[str, str]]:
        """Get all notes that this note links to.

        Returns:
            [{"name": "Target Note", "path": "path/to/target.md"}, ...]
        """
        graph = self.scan_vault()

        # Find note in graph (case-insensitive)
        note_key = None
        for key in graph.keys():
            if key.lower() == note_name.lower():
                note_key = key
                break

        if not note_key:
            return []

        outgoing = []
        for target_name in graph[note_key]["outgoing_links"]:
            # Find target in graph
            for key in graph.keys():
                if key.lower() == target_name.lower():
                    outgoing.append({
                        "name": key,
                        "path": graph[key]["path"]
                    })
                    break

        return outgoing


def main():
    parser = argparse.ArgumentParser(description="Resolve backlinks in Obsidian vault")
    parser.add_argument("--vault", required=True, help="Path to Obsidian vault")
    parser.add_argument("--note", help="Note name to find backlinks for")
    parser.add_argument("--scan-all", action="store_true", help="Scan entire vault and output graph")
    parser.add_argument("--outgoing", action="store_true", help="Show outgoing links instead of backlinks")
    parser.add_argument("--format", choices=["json", "text"], default="text", help="Output format")

    args = parser.parse_args()

    resolver = BacklinkResolver(args.vault)

    if args.scan_all:
        graph = resolver.scan_vault()
        if args.format == "json":
            print(json.dumps(graph, indent=2))
        else:
            print(f"Found {len(graph)} notes in vault")
            for note_name, data in graph.items():
                print(f"\n{note_name}")
                print(f"  Path: {data['path']}")
                print(f"  Outgoing: {len(data['outgoing_links'])} links")
                print(f"  Backlinks: {len(data['backlinks'])} links")

    elif args.note:
        if args.outgoing:
            links = resolver.get_outgoing_links(args.note)
            link_type = "Outgoing links"
        else:
            links = resolver.get_backlinks(args.note)
            link_type = "Backlinks"

        if args.format == "json":
            print(json.dumps(links, indent=2))
        else:
            print(f"{link_type} for '{args.note}': {len(links)}")
            for link in links:
                print(f"  - {link['name']} ({link['path']})")

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
