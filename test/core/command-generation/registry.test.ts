import { describe, it, expect } from 'vitest';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';

describe('CommandAdapterRegistry', () => {
  it('includes claude adapter', () => {
    expect(CommandAdapterRegistry.has('claude')).toBe(true);
    const adapter = CommandAdapterRegistry.get('claude');
    expect(adapter).toBeDefined();
    expect(adapter!.toolId).toBe('claude');
  });

  it('includes github-copilot adapter', () => {
    expect(CommandAdapterRegistry.has('github-copilot')).toBe(true);
    const adapter = CommandAdapterRegistry.get('github-copilot');
    expect(adapter).toBeDefined();
    expect(adapter!.toolId).toBe('github-copilot');
  });

  it('returns undefined for non-existent adapter', () => {
    expect(CommandAdapterRegistry.get('nonexistent')).toBeUndefined();
    expect(CommandAdapterRegistry.has('nonexistent')).toBe(false);
  });

  it('getAll returns all registered adapters', () => {
    const all = CommandAdapterRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
    const ids = all.map((a) => a.toolId);
    expect(ids).toContain('claude');
    expect(ids).toContain('github-copilot');
  });
});
