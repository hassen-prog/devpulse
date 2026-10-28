import { parse } from 'jsonc-parser';
export const NEST_CLI_CONFIG_FILES = ['nest-cli.json', '.nest-cli.json'];
export function findNestCliConfigPath(tree) {
    return NEST_CLI_CONFIG_FILES.find((candidate) => tree.exists(candidate));
}
const LEGACY_NEST_CLI_CONFIG_FILES = ['.nestcli.json', 'nest.json'];
export function warnAboutLegacyNestCliConfig(tree, context) {
    if (findNestCliConfigPath(tree)) {
        return;
    }
    const legacyFile = LEGACY_NEST_CLI_CONFIG_FILES.find((candidate) => tree.exists(candidate));
    if (legacyFile) {
        context.logger.warn(`The Nest CLI does not load "${legacyFile}", so this schematic ignores it. Move its configuration to "nest-cli.json".`);
    }
}
export function readJsonFile(tree, path) {
    const buffer = tree.read(path);
    if (!buffer) {
        return null;
    }
    try {
        return parse(buffer.toString('utf-8'));
    }
    catch {
        return null;
    }
}
