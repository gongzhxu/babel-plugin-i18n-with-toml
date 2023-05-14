import * as path from 'path'
import { statSync } from 'fs'

export function fixPath(p: string): string {
  p = path.normalize(p)
  if (p.endsWith('/')) {
    return p.slice(0, -1)
  } else if (p.endsWith('\\')) {
    return p.slice(0, -1)
  }
  return p
}

export function resolvePath(p: string, dirPath: string) {
  if (p.startsWith('.')) {
    return fixPath(path.join(dirPath, p))
  }

  return fixPath(require.resolve(p))
}

export function isDirectory(path: string): boolean {
  return statSync(path).isDirectory()
}

export function mtime(path: string) {
  return statSync(path).mtimeMs
}