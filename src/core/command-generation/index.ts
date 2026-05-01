/**
 * Public exports for the command generation module.
 */

export type {
  CommandContent,
  GeneratedCommand,
  ToolCommandAdapter,
} from './types.js';

export { CommandAdapterRegistry } from './registry.js';
export { generateCommand, generateCommands } from './generator.js';
export { claudeAdapter, githubCopilotAdapter } from './adapters/index.js';
