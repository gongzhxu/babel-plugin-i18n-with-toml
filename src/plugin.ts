import type * as BabelCoreNamespace from '@babel/core'
import type { PluginObj } from '@babel/core'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import { resolvePath, isDirectory, mtime } from "./utils"
import { loadModule } from './loadModule'

type API = typeof BabelCoreNamespace
const TOML = require('@ltd/j-toml')
const defModuleName = '@i18n'

export type Options = {
  moduleName: string
  configDir: string
  locale: string
  fallbacks: boolean
}

function trackDependency(api: API, options: Options, src: string) {
   // @ts-ignore
  api.cache.using(() => {
    return mtime(src)
  })
  
  // @ts-ignore
  api.addExternalDependency(src)
}

function addDependencies(api: API, options: Options, sources: string[]) {
  for (const source of sources) {
    if (isDirectory(source)) {
      const files = readdirSync(source, { recursive: true, encoding: 'utf-8' })
      const subSources = []
      for (let file of files) {
        subSources.push(path.join(source, file))
      }

      addDependencies(api, options, subSources)
    } else {
      if (source.endsWith('.toml')) {
        trackDependency(api, options, source)
      }
    }
  }
}

function validateOptions(options: Options) {
  if (!options.configDir) {
    throw new Error('"configDir" field cannot be empty, path to i18n directory')
  }

  if (!isDirectory(options.configDir)) {
    throw new Error('"configDir" must be a directory');
  }
}

function loadI18nDir(source: string) {
  let obj = {}
  if (isDirectory(source)) {
      const files = readdirSync(source)
      for (const file of files) {
          const subSource = path.join(source, file)
          const subKey = path.basename(source)
          const subVal = loadI18nDir(subSource)
          if (subVal) {
              // @ts-ignore 
              if (obj[subKey]) {
                  // @ts-ignore 
                  obj[subKey] = Object.assign(obj[subKey], subVal)
              } else {
                  // @ts-ignore 
                  obj[subKey] = subVal
              }
          }
      }
  } else {
      const fileVal = loadI18nFile(source)
      if (fileVal) {
          // @ts-ignore 
          obj = Object.assign(obj, fileVal)
      }
  }

  return obj
}

function loadI18nFile(fullPath: string) {
  if (fullPath.endsWith('.toml')) {
      const fileContents = readFileSync(fullPath, 'utf-8')
      return TOML.parse((fileContents))
  }

  return null
}

export const Plugin = function (api: API, options: Options): PluginObj {
  validateOptions(options)
  let sources = [options.configDir]
  sources = sources.map(s => resolvePath(s, process.cwd()))

  addDependencies(api, options, sources) 
  if (!options.moduleName) {
    options.moduleName = defModuleName
  }

  if (!options.locale) {
    options.locale = 'en'
  }

  if (!options.fallbacks) {
    options.fallbacks = true
  }

  const messages = loadI18nDir(resolvePath(options.configDir, process.cwd()))
  // @ts-ignore 
  const translations = messages[path.basename(options.configDir)]

  return {
    name: 'i18-with-toml',
    visitor: {
      ImportDeclaration(p, state) {
        if (p.node.source.value === options.moduleName) {
          loadModule(api.types, p, state, options, translations)
        }        
      }
    },
  }
}