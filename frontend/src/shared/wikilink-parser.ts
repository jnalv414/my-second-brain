/**
 * Wikilink parser - extracts and parses [[wikilinks]] from markdown content.
 * Extracted to shared/ after 3+ features needed wikilink parsing.
 */

import type { Wikilink } from './types'

/**
 * Regex pattern for wikilinks: [[Note Name#Heading|Alias]]
 * Supports:
 * - [[Note Name]]
 * - [[Note Name#Heading]]
 * - [[Note Name|Alias]]
 * - [[Note Name#Heading|Alias]]
 */
const WIKILINK_REGEX = /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g

/**
 * Extract all wikilinks from markdown content
 */
export function extractWikilinks(content: string): Wikilink[] {
  const links: Wikilink[] = []
  const matches = content.matchAll(WIKILINK_REGEX)

  for (const match of matches) {
    const [raw, target, heading, alias] = match
    links.push({
      raw,
      target: target.trim(),
      heading: heading?.trim(),
      alias: alias?.trim(),
    })
  }

  return links
}

/**
 * Get unique note names from wikilinks (for backlink resolution)
 */
export function getUniqueTargets(content: string): string[] {
  const links = extractWikilinks(content)
  const targets = new Set(links.map((link) => link.target))
  return Array.from(targets)
}

/**
 * Replace wikilinks in content with markdown links
 * Useful for rendering or exporting
 */
export function convertWikilinksToMarkdown(
  content: string,
  resolver: (target: string) => string | null,
): string {
  return content.replace(WIKILINK_REGEX, (match, target, heading, alias) => {
    const path = resolver(target.trim())
    if (!path) return match // Keep original if not found

    const displayText = alias?.trim() || target.trim()
    const anchor = heading ? `#${heading.trim()}` : ''
    return `[${displayText}](${path}${anchor})`
  })
}
