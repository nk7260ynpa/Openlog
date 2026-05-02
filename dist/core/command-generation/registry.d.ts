/**
 * Central registry of per-tool command adapters, looked up by toolId during init.
 */
import type { ToolCommandAdapter } from './types.js';
export declare class CommandAdapterRegistry {
    private static readonly adapters;
    static register(adapter: ToolCommandAdapter): void;
    static get(toolId: string): ToolCommandAdapter | undefined;
    static getAll(): ToolCommandAdapter[];
    static has(toolId: string): boolean;
}
//# sourceMappingURL=registry.d.ts.map