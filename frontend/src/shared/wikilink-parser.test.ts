/**
 * Tests for wikilink-parser module
 * Covers: extractWikilinks, getUniqueTargets, convertWikilinksToMarkdown
 */

import { describe, expect, it } from 'vitest'
import {
  convertWikilinksToMarkdown,
  extractWikilinks,
  getUniqueTargets,
} from './wikilink-parser'

describe('wikilink-parser', () => {
  describe('extractWikilinks', () => {
    // TC-001: Simple wikilink
    it('should extract simple wikilink [[Note]]', () => {
      const content = 'Check out [[My Note]] for more info.'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        raw: '[[My Note]]',
        target: 'My Note',
        heading: undefined,
        alias: undefined,
      })
    })

    // TC-002: Wikilink with heading
    it('should extract wikilink with heading [[Note#Section]]', () => {
      const content = 'See [[Documentation#Installation]] for setup.'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        raw: '[[Documentation#Installation]]',
        target: 'Documentation',
        heading: 'Installation',
        alias: undefined,
      })
    })

    // TC-003: Wikilink with alias
    it('should extract wikilink with alias [[Note|Display Text]]', () => {
      const content = 'Visit the [[Home Page|homepage]] to start.'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        raw: '[[Home Page|homepage]]',
        target: 'Home Page',
        heading: undefined,
        alias: 'homepage',
      })
    })

    // TC-004: Full wikilink with heading and alias
    it('should extract full wikilink [[Note#Section|Alias]]', () => {
      const content = 'Read [[User Guide#Getting Started|the guide]] first.'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        raw: '[[User Guide#Getting Started|the guide]]',
        target: 'User Guide',
        heading: 'Getting Started',
        alias: 'the guide',
      })
    })

    // TC-005: Multiple wikilinks in content
    it('should extract multiple wikilinks from content', () => {
      const content = `
        # Project Overview
        See [[Introduction]] for background.
        Check [[Setup#Requirements]] for dependencies.
        More details in [[API Reference|API docs]].
      `
      const result = extractWikilinks(content)

      expect(result).toHaveLength(3)
      expect(result[0].target).toBe('Introduction')
      expect(result[1].target).toBe('Setup')
      expect(result[1].heading).toBe('Requirements')
      expect(result[2].target).toBe('API Reference')
      expect(result[2].alias).toBe('API docs')
    })

    // TC-006: Empty content
    it('should return empty array for empty content', () => {
      const result = extractWikilinks('')
      expect(result).toEqual([])
    })

    // TC-007: No wikilinks in content
    it('should return empty array when no wikilinks present', () => {
      const content =
        'This is regular markdown with [normal links](url) and text.'
      const result = extractWikilinks(content)
      expect(result).toEqual([])
    })

    // TC-008: Whitespace trimming
    it('should trim whitespace from target, heading, and alias', () => {
      const content = '[[  Spaced Note  #  Section Name  |  Display  ]]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0].target).toBe('Spaced Note')
      expect(result[0].heading).toBe('Section Name')
      expect(result[0].alias).toBe('Display')
    })

    // TC-009: Wikilinks on same line
    it('should extract multiple wikilinks on same line', () => {
      const content = 'Compare [[Note A]] with [[Note B]] and [[Note C]].'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(3)
      expect(result.map((l) => l.target)).toEqual([
        'Note A',
        'Note B',
        'Note C',
      ])
    })

    // TC-010: Nested brackets (edge case)
    it('should handle content with single brackets nearby', () => {
      const content = 'Array [0] and [[Note]] and object[key]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0].target).toBe('Note')
    })

    // TC-011: Special characters in note names
    it('should handle special characters in note names', () => {
      const content = 'See [[2024-01-15 Meeting Notes]] and [[Project (v2)]]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(2)
      expect(result[0].target).toBe('2024-01-15 Meeting Notes')
      expect(result[1].target).toBe('Project (v2)')
    })

    // TC-012: Unicode characters
    it('should handle unicode characters in wikilinks', () => {
      const content = 'Check [[Cafe Menu]] and [[Resumes]]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(2)
      expect(result[0].target).toBe('Cafe Menu')
      expect(result[1].target).toBe('Resumes')
    })

    // TC-013: Empty wikilink (malformed)
    it('should not match empty wikilinks [[]]', () => {
      const content = 'Empty [[]] wikilink'
      const result = extractWikilinks(content)

      expect(result).toEqual([])
    })

    // TC-014: Only heading (malformed - no target)
    it('should not match wikilinks with only heading [[#Section]]', () => {
      const content = 'Jump to [[#Section]] in current note'
      const result = extractWikilinks(content)

      // The regex requires at least a target before #
      expect(result).toEqual([])
    })
  })

  describe('getUniqueTargets', () => {
    // TC-015: Deduplication of multiple links to same target
    it('should deduplicate multiple links to same target', () => {
      const content = `
        First mention of [[Project Alpha]].
        Another link to [[Project Alpha#Setup]].
        And [[Project Alpha|the project]] again.
        Also [[Project Beta]].
      `
      const result = getUniqueTargets(content)

      expect(result).toHaveLength(2)
      expect(result).toContain('Project Alpha')
      expect(result).toContain('Project Beta')
    })

    // TC-016: Empty content returns empty array
    it('should return empty array for empty content', () => {
      const result = getUniqueTargets('')
      expect(result).toEqual([])
    })

    // TC-017: Single target
    it('should return single target for one wikilink', () => {
      const content = 'Just [[One Note]] here.'
      const result = getUniqueTargets(content)

      expect(result).toEqual(['One Note'])
    })

    // TC-018: Case sensitivity
    it('should treat different cases as different targets', () => {
      const content = '[[Note]] and [[note]] and [[NOTE]]'
      const result = getUniqueTargets(content)

      expect(result).toHaveLength(3)
      expect(result).toContain('Note')
      expect(result).toContain('note')
      expect(result).toContain('NOTE')
    })

    // TC-019: Order preservation
    it('should preserve order of first occurrence', () => {
      const content = '[[First]] then [[Second]] then [[First]] then [[Third]]'
      const result = getUniqueTargets(content)

      expect(result).toEqual(['First', 'Second', 'Third'])
    })
  })

  describe('convertWikilinksToMarkdown', () => {
    // TC-020: Successful resolution
    it('should convert wikilinks to markdown links when resolved', () => {
      const content = 'Check out [[My Note]] for more.'
      const resolver = (target: string) => {
        if (target === 'My Note') return '/notes/my-note'
        return null
      }

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('Check out [My Note](/notes/my-note) for more.')
    })

    // TC-021: Unresolved links kept as-is
    it('should keep unresolved wikilinks unchanged', () => {
      const content = 'See [[Known Note]] and [[Unknown Note]].'
      const resolver = (target: string) => {
        if (target === 'Known Note') return '/notes/known'
        return null
      }

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe(
        'See [Known Note](/notes/known) and [[Unknown Note]].',
      )
    })

    // TC-022: Preserve alias as display text
    it('should use alias as display text when present', () => {
      const content = 'Visit [[Documentation|the docs]] for help.'
      const resolver = () => '/docs'

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('Visit [the docs](/docs) for help.')
    })

    // TC-023: Include heading anchor in URL
    it('should append heading as anchor to URL', () => {
      const content = 'See [[Guide#Installation]] section.'
      const resolver = () => '/guide'

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('See [Guide](/guide#Installation) section.')
    })

    // TC-024: Full wikilink with heading and alias
    it('should handle full wikilink with heading and alias', () => {
      const content = 'Read [[Manual#Setup|setup instructions]].'
      const resolver = () => '/manual'

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('Read [setup instructions](/manual#Setup).')
    })

    // TC-025: Multiple conversions in content
    it('should convert multiple wikilinks in content', () => {
      const content =
        'Start with [[Intro]], then [[Setup]], finally [[Deploy]].'
      const resolver = (target: string) => `/${target.toLowerCase()}`

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe(
        'Start with [Intro](/intro), then [Setup](/setup), finally [Deploy](/deploy).',
      )
    })

    // TC-026: Empty content
    it('should return empty string for empty content', () => {
      const result = convertWikilinksToMarkdown('', () => '/path')
      expect(result).toBe('')
    })

    // TC-027: No wikilinks - content unchanged
    it('should return content unchanged when no wikilinks present', () => {
      const content = 'Regular markdown with [link](url) and text.'
      const resolver = () => '/path'

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe(content)
    })

    // TC-028: Resolver never called for no wikilinks
    it('should not call resolver when no wikilinks present', () => {
      let callCount = 0
      const resolver = () => {
        callCount++
        return '/path'
      }

      convertWikilinksToMarkdown('No wikilinks here', resolver)
      expect(callCount).toBe(0)
    })

    // TC-029: Whitespace in paths preserved
    it('should handle URLs with encoded spaces from resolver', () => {
      const content = 'See [[My Note]].'
      const resolver = () => '/notes/my%20note'

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('See [My Note](/notes/my%20note).')
    })

    // TC-030: Mixed resolved and unresolved
    it('should handle mix of resolved and unresolved links', () => {
      const content = '[[A]] then [[B]] then [[C]] then [[D]]'
      const resolver = (target: string) => {
        if (target === 'A' || target === 'C') return `/${target.toLowerCase()}`
        return null
      }

      const result = convertWikilinksToMarkdown(content, resolver)
      expect(result).toBe('[A](/a) then [[B]] then [C](/c) then [[D]]')
    })
  })

  describe('edge cases and integration', () => {
    // TC-031: Complex document with all features
    it('should handle complex document with various wikilink formats', () => {
      const content = `
# My Project

See [[Introduction]] for background.
The [[Setup Guide#Prerequisites|prerequisites]] are important.
Check [[API Reference#Authentication]] for security.
Also review [[Best Practices|tips]] and [[FAQ]].
      `

      const links = extractWikilinks(content)
      expect(links).toHaveLength(5)

      const targets = getUniqueTargets(content)
      expect(targets).toHaveLength(5)

      const resolver = (target: string) =>
        `/docs/${target.toLowerCase().replace(/ /g, '-')}`
      const markdown = convertWikilinksToMarkdown(content, resolver)

      expect(markdown).toContain('[Introduction](/docs/introduction)')
      expect(markdown).toContain(
        '[prerequisites](/docs/setup-guide#Prerequisites)',
      )
      expect(markdown).toContain(
        '[API Reference](/docs/api-reference#Authentication)',
      )
      expect(markdown).toContain('[tips](/docs/best-practices)')
      expect(markdown).toContain('[FAQ](/docs/faq)')
    })

    // TC-032: Consecutive wikilinks without space
    it('should handle consecutive wikilinks without separating space', () => {
      const content = '[[A]][[B]][[C]]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(3)
      expect(result.map((l) => l.target)).toEqual(['A', 'B', 'C'])
    })

    // TC-033: Wikilink at start and end of content
    it('should handle wikilinks at content boundaries', () => {
      const content = '[[Start]] middle text [[End]]'
      const result = extractWikilinks(content)

      expect(result).toHaveLength(2)
      expect(result[0].target).toBe('Start')
      expect(result[1].target).toBe('End')
    })

    // TC-034: Very long note names
    it('should handle very long note names', () => {
      const longName = 'A'.repeat(200)
      const content = `[[${longName}]]`
      const result = extractWikilinks(content)

      expect(result).toHaveLength(1)
      expect(result[0].target).toBe(longName)
    })

    // TC-035: Wikilink inside code block (should still extract - parser is content-agnostic)
    it('should extract wikilinks even inside code blocks (parser is content-agnostic)', () => {
      const content = '```\n[[Code Example]]\n```'
      const result = extractWikilinks(content)

      // The parser extracts all wikilinks; filtering code blocks is caller's responsibility
      expect(result).toHaveLength(1)
      expect(result[0].target).toBe('Code Example')
    })
  })
})
