/**
 * Shared types used across multiple features.
 * Only extracted here after 3+ features need them (three-feature extraction rule).
 */

import { z } from 'zod'

/**
 * Note frontmatter schema
 */
export const FrontmatterSchema = z
  .object({
    tags: z.array(z.string()).optional().default([]),
    created: z.string().or(z.date()).optional(),
    modified: z.string().or(z.date()).optional(),
    title: z.string().optional(),
    aliases: z.array(z.string()).optional().default([]),
    // Allow any additional custom fields
  })
  .passthrough()

export type Frontmatter = z.infer<typeof FrontmatterSchema>

/**
 * Complete note structure
 */
export interface Note {
  /** Relative path from vault root (e.g., "Projects/note.md") */
  path: string
  /** Note title (from frontmatter or filename) */
  title: string
  /** Markdown content without frontmatter */
  content: string
  /** Parsed frontmatter metadata */
  frontmatter: Frontmatter
  /** Last modified timestamp */
  modified: Date
}

/**
 * Wikilink representation
 */
export interface Wikilink {
  /** Original link text: [[Note Name#Heading|Alias]] */
  raw: string
  /** Target note name: "Note Name" */
  target: string
  /** Optional heading: "Heading" */
  heading?: string
  /** Optional alias: "Alias" */
  alias?: string
}

/**
 * Backlink with context
 */
export interface Backlink {
  /** Source note name that contains the link */
  source: string
  /** Source note path */
  sourcePath: string
  /** Target note name being linked to */
  target: string
  /** Surrounding text context */
  context?: string
}

/**
 * Search result
 */
export interface SearchResult {
  /** Note that matches the search */
  note: Note
  /** Relevance score (0-1) */
  score: number
  /** Matching excerpts with highlights */
  excerpts?: string[]
}

/**
 * Vault configuration
 */
export interface VaultConfig {
  /** Absolute path to Obsidian vault root */
  vaultPath: string
  /** Optional Paddy API URL for semantic search */
  paddyUrl?: string
}
