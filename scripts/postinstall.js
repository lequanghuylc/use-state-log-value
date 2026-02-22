#!/usr/bin/env node

/**
 * Postinstall script to copy use-state-log-value.mdc rule to .cursor/rules/
 * This helps Cursor and other AI agents understand how to use use-state-log-value
 */

const fs = require('fs');
const path = require('path');

// Find the package directory (works when installed as dependency or local)
// __dirname will be something like: /path/to/project/node_modules/use-state-log-value/scripts
let packageDir = path.resolve(__dirname, '..');
try {
  // Resolve symlinks so we have a canonical path (helps with pnpm, yarn, and linked installs)
  packageDir = fs.realpathSync(packageDir);
} catch (e) {
  // keep packageDir as-is if realpath fails
}
const sourceFile = path.join(packageDir, 'use-state-log-value.mdc');

// Check if source file exists
if (!fs.existsSync(sourceFile)) {
  // Silently exit if source doesn't exist (might be during build or in different context)
  process.exit(0);
}

/**
 * Find the project root by walking up from the package directory
 * When installed via yarn/npm, the package is in node_modules/use-state-log-value
 * So we walk up from there to find the project root
 */
function findProjectRoot() {
  // Start from the package directory (which is in node_modules when installed)
  let dir = packageDir;
  const root = path.parse(dir).root;

  // Walk up the directory tree
  while (dir !== root) {
    // Check if we've reached a directory that contains node_modules
    // The project root is the parent of node_modules
    if (path.basename(dir) === 'node_modules') {
      const projectRoot = path.dirname(dir);
      // Verify it has a package.json
      const packageJsonPath = path.join(projectRoot, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          // Make sure it's not the use-state-log-value package itself
          if (packageJson.name !== 'use-state-log-value') {
            return projectRoot;
          }
        } catch (e) {
          // If we can't read package.json, use it anyway
          return projectRoot;
        }
      }
    }

    // Also check if current directory has package.json and is not use-state-log-value
    const packageJsonPath = path.join(dir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        // If this is NOT the use-state-log-value package itself, this might be the project root
        if (packageJson.name !== 'use-state-log-value') {
          // But make sure we're not still inside node_modules
          if (!dir.includes(path.sep + 'node_modules' + path.sep) &&
              !dir.endsWith(path.sep + 'node_modules')) {
            return dir;
          }
        }
      } catch (e) {
        // If we can't read package.json, continue searching
      }
    }

    // Move up one directory
    const parentDir = path.dirname(dir);
    if (parentDir === dir) {
      // Reached filesystem root
      break;
    }
    dir = parentDir;
  }

  // Fallback: if we're in node_modules, project root is the parent of the topmost node_modules
  // (use lastIndexOf so pnpm paths like .../project/node_modules/.pnpm/.../node_modules/use-state-log-value resolve to project)
  const normalizedPackageDir = path.normalize(packageDir);
  const parts = normalizedPackageDir.split(path.sep);
  let lastNodeModulesIndex = -1;
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] === 'node_modules') {
      lastNodeModulesIndex = i;
      break;
    }
  }
  if (lastNodeModulesIndex > 0) {
    return path.resolve(parts.slice(0, lastNodeModulesIndex).join(path.sep));
  }

  // Last resort: use process.cwd()
  return process.cwd();
}

const projectRoot = path.resolve(findProjectRoot());
const targetDir = path.join(projectRoot, '.cursor', 'rules');
const targetFile = path.join(targetDir, 'use-state-log-value.mdc');

// Double-check: don't install in use-state-log-value's own directory
const projectPackageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(projectPackageJsonPath)) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(projectPackageJsonPath, 'utf8'));
    if (packageJson.name === 'use-state-log-value') {
      // This is the use-state-log-value package itself, skip
      process.exit(0);
    }
  } catch (e) {
    // If we can't read package.json, continue anyway
  }
}

try {
  // Create .cursor then .cursor/rules so we always have a clean path
  const cursorDir = path.join(projectRoot, '.cursor');
  if (!fs.existsSync(cursorDir)) {
    fs.mkdirSync(cursorDir, { recursive: true });
  }
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy the rule file
  fs.copyFileSync(sourceFile, targetFile);
  console.log(`✓ use-state-log-value: Rule file installed to ${targetFile}`);
} catch (error) {
  // Don't fail the install if rule copy fails
  // Log error for debugging but don't fail
  console.error('use-state-log-value postinstall error:', error.message);
  process.exit(0);
}
