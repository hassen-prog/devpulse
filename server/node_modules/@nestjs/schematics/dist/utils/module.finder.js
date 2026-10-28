import { join } from '@angular-devkit/core';
export class ModuleFinder {
    tree;
    constructor(tree) {
        this.tree = tree;
    }
    find(options) {
        const generatedDirectoryPath = options.path;
        const generatedDirectory = this.tree.getDir(generatedDirectoryPath);
        const namedModuleFilename = options.name
            ? generatedDirectory.subfiles.find((filename) => filename === `${options.name}.module.ts` ||
                filename === `${options.name}.module.js`)
            : undefined;
        return namedModuleFilename !== undefined
            ? join(generatedDirectory.path, namedModuleFilename.valueOf())
            : this.findIn(generatedDirectory);
    }
    findIn(directory) {
        if (!directory) {
            return null;
        }
        const moduleFilename = directory.subfiles.find((filename) => /\.module\.(t|j)s$/.test(filename));
        return moduleFilename !== undefined
            ? join(directory.path, moduleFilename.valueOf())
            : this.findIn(directory.parent);
    }
}
