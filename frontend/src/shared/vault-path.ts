/**
 * Vault path utilities - validate and resolve paths within vault.
 * Prevents directory traversal attacks.
 * Extracted to shared/ after 3+ features needed path validation.
 */

import { resolve, relative, join } from "node:path";

/**
 * Validate that a path is within the vault root
 * Throws if path attempts directory traversal
 */
export function validateVaultPath(vaultRoot: string, relativePath: string): string {
  const absolutePath = resolve(vaultRoot, relativePath);
  const normalized = resolve(absolutePath);

  // Ensure the resolved path is within vault
  if (!normalized.startsWith(resolve(vaultRoot))) {
    throw new Error(
      `Path traversal detected: ${relativePath} is outside vault`
    );
  }

  return normalized;
}

/**
 * Convert absolute path to vault-relative path
 */
export function toVaultPath(vaultRoot: string, absolutePath: string): string {
  return relative(vaultRoot, absolutePath);
}

/**
 * Join paths safely within vault
 */
export function joinVaultPath(vaultRoot: string, ...paths: string[]): string {
  const joined = join(vaultRoot, ...paths);
  return validateVaultPath(vaultRoot, relative(vaultRoot, joined));
}

/**
 * Check if path exists and is within vault
 */
export async function existsInVault(
  vaultRoot: string,
  relativePath: string
): Promise<boolean> {
  try {
    const absolutePath = validateVaultPath(vaultRoot, relativePath);
    const file = Bun.file(absolutePath);
    return await file.exists();
  } catch {
    return false;
  }
}
