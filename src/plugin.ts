import type * as BabelCoreNamespace from '@babel/core'
import type { PluginObj } from '@babel/core'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

import { isDirectory, mtime } from "./utils"
import { loadModule } from './loadModule'

type API = typeof BabelCoreNamespace
const TOML = require('@ltd/j-toml')

export type Options = {
  moduleName: string
  configDir: string
  locale: string
  fallbacks: boolean
}

function trackDependency(api: API, trackPath: string) {
    // @ts-ignore
   api.cache.using(() => {
     return mtime(trackPath)
   })
   
   // @ts-ignore
   api.addExternalDependency(path.resolve(trackPath))
 }
 
 function addDependencies(api: API, sources: string[]) {
  for (const source of sources) {
    if (isDirectory(source)) {
      const files = readdirSync(source, { recursive: true, encoding: 'utf-8' })
      const subSources: string[] = []
      for (let file of files) {
        subSources.push(path.join(source, file))
      }

      addDependencies(api, subSources)
    } else {
      if (source.endsWith('.toml')) {
        trackDependency(api, source)
      }
    }
  }
}

function loadI18nDir(api: typeof BabelCoreNamespace, source: string) {
    let obj = {}
    if (isDirectory(source)) {
        const files = readdirSync(source)
        for (const file of files) {
            const subSource = path.join(source, file)
            const subKey = path.basename(source)
            const subVal = loadI18nDir(api, subSource)
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
        const fileVal = loadI18nFile(api, source)
        if (fileVal) {
            // @ts-ignore 
            obj = Object.assign(obj, fileVal)
        }
    }

    return obj
}

function loadI18nFile(api: typeof BabelCoreNamespace, fullPath: string) {
    if (fullPath.endsWith('.toml')) {
        const fileContents = readFileSync(fullPath, 'utf-8')
        return TOML.parse((fileContents))
    }

    return null
}

function validateOptions(options: Options) {
  if (!options.configDir) {
    throw new Error('"configDir" field cannot be empty, path to i18n directory')
  }

  if (!isDirectory(options.configDir)) {
    throw new Error('"configDir" must be a directory');
  }
}

export const Plugin = function (api: API, options: Options): PluginObj {
  if (options.moduleName === undefined) {
    options.moduleName = '@i18n'
  }

  if (options.locale === undefined) {
    options.locale = 'en'
  }

  if (options.fallbacks === undefined) {
    options.fallbacks = true
  }

  validateOptions(options)
  addDependencies(api, [options.configDir])

  return {
    name: 'i18-with-toml', 
    visitor: {
      ImportDeclaration(p, state) {
        const messages = loadI18nDir(api, path.resolve(options.configDir))
        // @ts-ignore 
        const translations = messages[path.basename(options.configDir)]
        if (p.node.source.value === options.moduleName) {
          loadModule(api.types, p, state, options, translations)
        }
      }
    },
  }
}