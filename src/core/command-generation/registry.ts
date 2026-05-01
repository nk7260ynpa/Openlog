/**
 * Central registry of per-tool command adapters, looked up by toolId during init.
 */

import type { ToolCommandAdapter } from './types.js';
import { claudeAdapter } from './adapters/claude.js';
import { githubCopilotAdapter } from './adapters/github-copilot.js';

export class CommandAdapterRegistry {
  private static readonly adapters: Map<string, ToolCommandAdapter> = new Map();

  static {
    CommandAdapterRegistry.register(claudeAdapter);
    CommandAdapterRegistry.register(githubCopilotAdapter);
  }

  static register(adapter: ToolCommandAdapter): void {
    CommandAdapterRegistry.adapters.set(adapter.toolId, adapter);
  }

  static get(toolId: string): ToolCommandAdapter | undefined {
    return CommandAdapterRegistry.adapters.get(toolId);
  }

  static getAll(): ToolCommandAdapter[] {
    return Array.from(CommandAdapterRegistry.adapters.values());
  }

  static has(toolId: string): boolean {
    return CommandAdapterRegistry.adapters.has(toolId);
  }
}
