"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const utils_1 = require("./utils");
const loadModule_1 = require("./loadModule");
const TOML = require('@ltd/j-toml');
const defModuleName = '@i18n';
function trackDependency(api, options, src) {
    // @ts-ignore
    api.cache.using(() => {
        return (0, utils_1.mtime)(src);
    });
    // @ts-ignore
    api.addExternalDependency(src);
}
function addDependencies(api, options, sources) {
    for (const source of sources) {
        if ((0, utils_1.isDirectory)(source)) {
            const files = (0, fs_1.readdirSync)(source, { recursive: true, encoding: 'utf-8' });
            const subSources = [];
            for (let file of files) {
                subSources.push(path_1.default.join(source, file));
            }
            addDependencies(api, options, subSources);
        }
        else {
            if (source.endsWith('.toml')) {
                trackDependency(api, options, source);
            }
        }
    }
}
function validateOptions(options) {
    if (!options.configDir) {
        throw new Error('"configDir" field cannot be empty, path to i18n directory');
    }
    if (!(0, utils_1.isDirectory)(options.configDir)) {
        throw new Error('"configDir" must be a directory');
    }
}
function loadI18nDir(source) {
    let obj = {};
    if ((0, utils_1.isDirectory)(source)) {
        const files = (0, fs_1.readdirSync)(source);
        for (const file of files) {
            const subSource = path_1.default.join(source, file);
            const subKey = path_1.default.basename(source);
            const subVal = loadI18nDir(subSource);
            if (subVal) {
                // @ts-ignore 
                if (obj[subKey]) {
                    // @ts-ignore 
                    obj[subKey] = Object.assign(obj[subKey], subVal);
                }
                else {
                    // @ts-ignore 
                    obj[subKey] = subVal;
                }
            }
        }
    }
    else {
        const fileVal = loadI18nFile(source);
        if (fileVal) {
            // @ts-ignore 
            obj = Object.assign(obj, fileVal);
        }
    }
    return obj;
}
function loadI18nFile(fullPath) {
    if (fullPath.endsWith('.toml')) {
        const fileContents = (0, fs_1.readFileSync)(fullPath, 'utf-8');
        return TOML.parse((fileContents));
    }
    return null;
}
const Plugin = function (api, options) {
    validateOptions(options);
    let sources = [options.configDir];
    sources = sources.map(s => (0, utils_1.resolvePath)(s, process.cwd()));
    addDependencies(api, options, sources);
    if (!options.moduleName) {
        options.moduleName = defModuleName;
    }
    if (!options.locale) {
        options.locale = 'en';
    }
    if (!options.fallbacks) {
        options.fallbacks = true;
    }
    const messages = loadI18nDir((0, utils_1.resolvePath)(options.configDir, process.cwd()));
    // @ts-ignore 
    const translations = messages[path_1.default.basename(options.configDir)];
    return {
        name: 'i18-with-toml',
        visitor: {
            ImportDeclaration(p, state) {
                if (p.node.source.value === options.moduleName) {
                    (0, loadModule_1.loadModule)(api.types, p, state, options, translations);
                }
            }
        },
    };
};
exports.Plugin = Plugin;
