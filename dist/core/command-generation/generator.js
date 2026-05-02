/**
 * Convert tool-neutral `CommandContent` into final file content via an adapter.
 */
export function generateCommand(content, adapter) {
    return {
        path: adapter.getFilePath(content.id),
        fileContent: adapter.formatFile(content),
    };
}
export function generateCommands(contents, adapter) {
    return contents.map((content) => generateCommand(content, adapter));
}
//# sourceMappingURL=generator.js.map