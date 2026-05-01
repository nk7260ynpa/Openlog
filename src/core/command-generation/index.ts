/**
 * Command 產生模組對外匯出。
 */

export type {
  CommandContent,
  GeneratedCommand,
  ToolCommandAdapter,
} from './types.js';

export { CommandAdapterRegistry } from './registry.js';
export { generateCommand, generateCommands } from './generator.js';
export { claudeAdapter, githubCopilotAdapter } from './adapters/index.js';
