/**
 * Vault path utilities - validate and resolve paths within vault.
 * Prevents directory traversal attacks.
 * Extracted to shared/ after 3+ features needed path validation.
 */

import { access, constants } from 'node:fs/promises'
import { join, relative, resolve } from 'node:path'

/**
 * Validate that a path is within the vault root
 * Throws if path attempts directory traversal
 */
export function validateVaultPath(
  vaultRoot: string,
  relativePath: string,
): string {
  const absolutePath = resolve(vaultRoot, relativePath)
  const normalized = resolve(absolutePath)

  // Ensure the resolved path is within vault
  if (!normalized.startsWith(resolve(vaultRoot))) {
    throw new Error(`Path traversal detected: ${relativePath} is outside vault`)
  }

  return normalized
}

/**
 * Convert absolute path to vault-relative path
 */
export function toVaultPath(vaultRoot: string, absolutePath: string): string {
  return relative(vaultRoot, absolutePath)
}

/**
 * Join paths safely within vault
 */
export function joinVaultPath(vaultRoot: string, ...paths: string[]): string {
  const joined = join(vaultRoot, ...paths)
  return validateVaultPath(vaultRoot, relative(vaultRoot, joined))
}

/**
 * Check if path exists and is within vault
 * Uses Node's fs API for cross-runtime compatibility (Bun/Node/Vitest)
 */
export async function existsInVault(
  vaultRoot: string,
  relativePath: string,
): Promise<boolean> {
  try {
    const absolutePath = validateVaultPath(vaultRoot, relativePath)
    await access(absolutePath, constants.F_OK)
    return true
  } catch {
    return false
  }
}
