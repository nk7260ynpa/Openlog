/**
 * Central registry of per-tool command adapters, looked up by toolId during init.
 */
import { claudeAdapter } from './adapters/claude.js';
import { githubCopilotAdapter } from './adapters/github-copilot.js';
export class CommandAdapterRegistry {
    static adapters = new Map();
    static {
        CommandAdapterRegistry.register(claudeAdapter);
        CommandAdapterRegistry.register(githubCopilotAdapter);
    }
    static register(adapter) {
        CommandAdapterRegistry.adapters.set(adapter.toolId, adapter);
    }
    static get(toolId) {
        return CommandAdapterRegistry.adapters.get(toolId);
    }
    static getAll() {
        return Array.from(CommandAdapterRegistry.adapters.values());
    }
    static has(toolId) {
        return CommandAdapterRegistry.adapters.has(toolId);
    }
}
//# sourceMappingURL=registry.js.map