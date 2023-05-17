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
function trackDependency(api, trackPath) {
    // @ts-ignore
    api.cache.using(() => {
        return (0, utils_1.mtime)(trackPath);
    });
    // @ts-ignore
    api.addExternalDependency(path_1.default.resolve(trackPath));
}
function addDependencies(api, sources) {
    for (const source of sources) {
        if ((0, utils_1.isDirectory)(source)) {
            const files = (0, fs_1.readdirSync)(source, { recursive: true, encoding: 'utf-8' });
            const subSources = [];
            for (let file of files) {
                subSources.push(path_1.default.join(source, file));
            }
            addDependencies(api, subSources);
        }
        else {
            if (source.endsWith('.toml')) {
                trackDependency(api, source);
            }
        }
    }
}
function loadI18nDir(api, source) {
    let obj = {};
    if ((0, utils_1.isDirectory)(source)) {
        const files = (0, fs_1.readdirSync)(source);
        for (const file of files) {
            const subSource = path_1.default.join(source, file);
            const subKey = path_1.default.basename(source);
            const subVal = loadI18nDir(api, subSource);
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
        const fileVal = loadI18nFile(api, source);
        if (fileVal) {
            // @ts-ignore 
            obj = Object.assign(obj, fileVal);
        }
    }
    return obj;
}
function loadI18nFile(api, fullPath) {
    if (fullPath.endsWith('.toml')) {
        const fileContents = (0, fs_1.readFileSync)(fullPath, 'utf-8');
        return TOML.parse((fileContents));
    }
    return null;
}
function validateOptions(options) {
    if (!options.configDir) {
        throw new Error('"configDir" field cannot be empty, path to i18n directory');
    }
    if (!(0, utils_1.isDirectory)(options.configDir)) {
        throw new Error('"configDir" must be a directory');
    }
}
const Plugin = function (api, options) {
    if (options.moduleName === undefined) {
        options.moduleName = '@i18n';
    }
    if (options.locale === undefined) {
        options.locale = 'en';
    }
    if (options.fallbacks === undefined) {
        options.fallbacks = true;
    }
    validateOptions(options);
    addDependencies(api, [options.configDir]);
    return {
        name: 'i18-with-toml',
        visitor: {
            ImportDeclaration(p, state) {
                const messages = loadI18nDir(api, path_1.default.resolve(options.configDir));
                // @ts-ignore 
                const translations = messages[path_1.default.basename(options.configDir)];
                if (p.node.source.value === options.moduleName) {
                    (0, loadModule_1.loadModule)(api.types, p, state, options, translations);
                }
            }
        },
    };
};
exports.Plugin = Plugin;
