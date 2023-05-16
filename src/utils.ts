import { statSync } from 'fs'

export function isDirectory(path: string): boolean {
  return statSync(path).isDirectory()
}

export function mtime(path: string) {
  return statSync(path).mtimeMs
}