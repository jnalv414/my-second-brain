/**
 * Tests for vault-path utilities
 * Covers path validation, traversal prevention, and file existence checks
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  existsInVault,
  joinVaultPath,
  toVaultPath,
  validateVaultPath,
} from './vault-path'

describe('vault-path', () => {
  // Temporary test vault for file existence tests
  let testVaultRoot: string
  let testFilePath: string
  let nestedFilePath: string

  beforeAll(async () => {
    // Create a temporary vault directory for testing
    testVaultRoot = await mkdtemp(join(tmpdir(), 'vault-test-'))

    // Create test files
    testFilePath = join(testVaultRoot, 'test-note.md')
    await writeFile(testFilePath, '# Test Note\n\nThis is a test note.')

    // Create nested directory with file
    const nestedDir = join(testVaultRoot, 'notes', 'daily')
    await mkdir(nestedDir, { recursive: true })
    nestedFilePath = join(nestedDir, 'today.md')
    await writeFile(nestedFilePath, "# Daily Note\n\nToday's entry.")
  })

  afterAll(async () => {
    // Clean up temporary vault
    await rm(testVaultRoot, { recursive: true, force: true })
  })

  describe('validateVaultPath', () => {
    it('should validate valid relative path', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = 'notes/my-note.md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/notes/my-note.md')
    })

    it('should validate simple filename', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = 'readme.md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/readme.md')
    })

    it('should throw on path traversal attack with ../../../etc/passwd', () => {
      const vaultRoot = '/home/user/vault'
      const maliciousPath = '../../../etc/passwd'

      expect(() => validateVaultPath(vaultRoot, maliciousPath)).toThrow(
        'Path traversal detected: ../../../etc/passwd is outside vault',
      )
    })

    it('should throw on single parent directory traversal', () => {
      const vaultRoot = '/home/user/vault'
      const maliciousPath = '../secret.txt'

      expect(() => validateVaultPath(vaultRoot, maliciousPath)).toThrow(
        'Path traversal detected',
      )
    })

    it('should throw on traversal hidden in middle of path', () => {
      const vaultRoot = '/home/user/vault'
      const maliciousPath = 'notes/../../../etc/passwd'

      expect(() => validateVaultPath(vaultRoot, maliciousPath)).toThrow(
        'Path traversal detected',
      )
    })

    it('should validate nested valid path', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = 'notes/2024/december/my-note.md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/notes/2024/december/my-note.md')
    })

    it('should validate deeply nested path', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = 'a/b/c/d/e/f/g/h.txt'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/a/b/c/d/e/f/g/h.txt')
    })

    it('should allow relative navigation within vault', () => {
      const vaultRoot = '/home/user/vault'
      // This goes into notes, then back up, then into docs - still within vault
      const relativePath = 'notes/../docs/file.md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/docs/file.md')
    })

    it('should handle empty relative path', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = ''

      const result = validateVaultPath(vaultRoot, relativePath)

      // Empty path resolves to vault root
      expect(result).toBe('/home/user/vault')
    })

    it('should handle path with dot (current directory)', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = './notes/file.md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/notes/file.md')
    })

    it('should handle paths with special characters', () => {
      const vaultRoot = '/home/user/vault'
      const relativePath = 'notes/my note (2024).md'

      const result = validateVaultPath(vaultRoot, relativePath)

      expect(result).toBe('/home/user/vault/notes/my note (2024).md')
    })

    it('should throw on symlink-style traversal attempt', () => {
      const vaultRoot = '/home/user/vault'
      // Attempt to access root via multiple traversals
      const maliciousPath = '../../../../../../../../etc/passwd'

      expect(() => validateVaultPath(vaultRoot, maliciousPath)).toThrow(
        'Path traversal detected',
      )
    })
  })

  describe('toVaultPath', () => {
    it('should convert absolute path to relative', () => {
      const vaultRoot = '/home/user/vault'
      const absolutePath = '/home/user/vault/notes/my-note.md'

      const result = toVaultPath(vaultRoot, absolutePath)

      expect(result).toBe('notes/my-note.md')
    })

    it('should convert vault root to empty string', () => {
      const vaultRoot = '/home/user/vault'
      const absolutePath = '/home/user/vault'

      const result = toVaultPath(vaultRoot, absolutePath)

      expect(result).toBe('')
    })

    it('should handle deeply nested absolute paths', () => {
      const vaultRoot = '/home/user/vault'
      const absolutePath = '/home/user/vault/notes/2024/december/daily/note.md'

      const result = toVaultPath(vaultRoot, absolutePath)

      expect(result).toBe('notes/2024/december/daily/note.md')
    })

    it('should handle paths outside vault with ..', () => {
      const vaultRoot = '/home/user/vault'
      const absolutePath = '/home/user/other/file.md'

      const result = toVaultPath(vaultRoot, absolutePath)

      // Relative returns path with .. for paths outside
      expect(result).toBe('../other/file.md')
    })

    it('should handle trailing slashes consistently', () => {
      const vaultRoot = '/home/user/vault/'
      const absolutePath = '/home/user/vault/notes/file.md'

      const result = toVaultPath(vaultRoot, absolutePath)

      expect(result).toBe('notes/file.md')
    })
  })

  describe('joinVaultPath', () => {
    it('should join multiple segments safely', () => {
      const vaultRoot = '/home/user/vault'

      const result = joinVaultPath(vaultRoot, 'notes', 'daily', 'today.md')

      expect(result).toBe('/home/user/vault/notes/daily/today.md')
    })

    it('should join single segment', () => {
      const vaultRoot = '/home/user/vault'

      const result = joinVaultPath(vaultRoot, 'readme.md')

      expect(result).toBe('/home/user/vault/readme.md')
    })

    it('should throw on traversal in segments', () => {
      const vaultRoot = '/home/user/vault'

      expect(() =>
        joinVaultPath(vaultRoot, 'notes', '..', '..', 'etc', 'passwd'),
      ).toThrow('Path traversal detected')
    })

    it('should throw when segment causes traversal outside vault', () => {
      const vaultRoot = '/home/user/vault'

      expect(() => joinVaultPath(vaultRoot, '../../../etc/passwd')).toThrow(
        'Path traversal detected',
      )
    })

    it('should allow safe relative navigation within segments', () => {
      const vaultRoot = '/home/user/vault'

      // notes/../docs stays within vault
      const result = joinVaultPath(vaultRoot, 'notes', '..', 'docs', 'file.md')

      expect(result).toBe('/home/user/vault/docs/file.md')
    })

    it('should handle empty segments array', () => {
      const vaultRoot = '/home/user/vault'

      const result = joinVaultPath(vaultRoot)

      expect(result).toBe('/home/user/vault')
    })

    it('should handle segments with spaces', () => {
      const vaultRoot = '/home/user/vault'

      const result = joinVaultPath(
        vaultRoot,
        'My Notes',
        'Daily Journal',
        'entry.md',
      )

      expect(result).toBe('/home/user/vault/My Notes/Daily Journal/entry.md')
    })
  })

  describe('existsInVault', () => {
    it('should return true for existing file', async () => {
      const result = await existsInVault(testVaultRoot, 'test-note.md')

      expect(result).toBe(true)
    })

    it('should return true for existing nested file', async () => {
      const result = await existsInVault(testVaultRoot, 'notes/daily/today.md')

      expect(result).toBe(true)
    })

    it('should return false for non-existing file', async () => {
      const result = await existsInVault(testVaultRoot, 'does-not-exist.md')

      expect(result).toBe(false)
    })

    it('should return false for non-existing nested path', async () => {
      const result = await existsInVault(
        testVaultRoot,
        'nonexistent/path/file.md',
      )

      expect(result).toBe(false)
    })

    it('should return false on traversal attempt (catches error)', async () => {
      const result = await existsInVault(testVaultRoot, '../../../etc/passwd')

      // Should catch the traversal error and return false
      expect(result).toBe(false)
    })

    it('should return false on hidden traversal attempt', async () => {
      const result = await existsInVault(testVaultRoot, 'notes/../../..')

      expect(result).toBe(false)
    })

    it('should return true for vault root directory (path exists)', async () => {
      const result = await existsInVault(testVaultRoot, '')

      // Using Node's fs.access(), directories exist too
      expect(result).toBe(true)
    })

    it('should return true for subdirectory (path exists)', async () => {
      const result = await existsInVault(testVaultRoot, 'notes/daily')

      // Using Node's fs.access(), directories exist too
      expect(result).toBe(true)
    })

    it('should handle paths with special characters', async () => {
      // Create a file with special characters for this test
      const specialFile = join(testVaultRoot, 'note (draft).md')
      await writeFile(specialFile, '# Draft')

      const result = await existsInVault(testVaultRoot, 'note (draft).md')

      expect(result).toBe(true)
    })
  })

  describe('edge cases and security', () => {
    it('should throw on null-byte injection attempt', () => {
      const vaultRoot = '/home/user/vault'
      // Null byte injection attempt - the null byte acts as string terminator
      // causing 'file.md\x00...' to be treated as 'file.md ' followed by traversal
      const maliciousPath = 'file.md\x00../../../etc/passwd'

      // Node.js path functions may interpret null bytes in unexpected ways
      // The important thing is that this either throws or stays within vault
      // In this case, it throws because the path resolution escapes the vault
      expect(() => validateVaultPath(vaultRoot, maliciousPath)).toThrow(
        'Path traversal detected',
      )
    })

    it('should handle encoded traversal attempt', () => {
      const vaultRoot = '/home/user/vault'
      // URL-encoded ../ - already decoded by the time it reaches the function
      // This tests the literal string %2e%2e
      const encodedPath = '%2e%2e/%2e%2e/etc/passwd'

      const result = validateVaultPath(vaultRoot, encodedPath)

      // Literal %2e is not special, should be treated as a filename
      expect(result).toBe('/home/user/vault/%2e%2e/%2e%2e/etc/passwd')
    })

    it('should handle Windows-style path separators', () => {
      const vaultRoot = '/home/user/vault'
      // Backslash on Unix is part of filename, not separator
      const windowsPath = 'notes\\file.md'

      const result = validateVaultPath(vaultRoot, windowsPath)

      // On Unix, backslash is treated as part of the filename
      expect(result).toBe('/home/user/vault/notes\\file.md')
    })

    it('should handle double slashes', () => {
      const vaultRoot = '/home/user/vault'
      const doublePath = 'notes//file.md'

      const result = validateVaultPath(vaultRoot, doublePath)

      // Node path.resolve normalizes double slashes
      expect(result).toBe('/home/user/vault/notes/file.md')
    })

    it('should handle Unicode paths', () => {
      const vaultRoot = '/home/user/vault'
      const unicodePath = 'notes/2024/December.md'

      const result = validateVaultPath(vaultRoot, unicodePath)

      expect(result).toBe('/home/user/vault/notes/2024/December.md')
    })

    it('should handle emoji in paths', () => {
      const vaultRoot = '/home/user/vault'
      const emojiPath = 'notes/ideas.md'

      const result = validateVaultPath(vaultRoot, emojiPath)

      expect(result).toBe('/home/user/vault/notes/ideas.md')
    })
  })
})
