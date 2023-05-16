"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mtime = exports.isDirectory = void 0;
const fs_1 = require("fs");
function isDirectory(path) {
    return (0, fs_1.statSync)(path).isDirectory();
}
exports.isDirectory = isDirectory;
function mtime(path) {
    return (0, fs_1.statSync)(path).mtimeMs;
}
exports.mtime = mtime;
