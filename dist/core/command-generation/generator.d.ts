/**
 * Convert tool-neutral `CommandContent` into final file content via an adapter.
 */
import type { CommandContent, GeneratedCommand, ToolCommandAdapter } from './types.js';
export declare function generateCommand(content: CommandContent, adapter: ToolCommandAdapter): GeneratedCommand;
export declare function generateCommands(contents: CommandContent[], adapter: ToolCommandAdapter): GeneratedCommand[];
//# sourceMappingURL=generator.d.ts.map