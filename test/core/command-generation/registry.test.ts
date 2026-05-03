import { describe, it, expect } from 'vitest';
import { CommandAdapterRegistry } from '../../../src/core/command-generation/registry.js';

describe('CommandAdapterRegistry', () => {
  it('包含 claude adapter', () => {
    expect(CommandAdapterRegistry.has('claude')).toBe(true);
    const adapter = CommandAdapterRegistry.get('claude');
    expect(adapter).toBeDefined();
    expect(adapter!.toolId).toBe('claude');
  });

  it('包含 github-copilot adapter', () => {
    expect(CommandAdapterRegistry.has('github-copilot')).toBe(true);
    const adapter = CommandAdapterRegistry.get('github-copilot');
    expect(adapter).toBeDefined();
    expect(adapter!.toolId).toBe('github-copilot');
  });

  it('查詢不存在的 adapter 回傳 undefined', () => {
    expect(CommandAdapterRegistry.get('nonexistent')).toBeUndefined();
    expect(CommandAdapterRegistry.has('nonexistent')).toBe(false);
  });

  it('getAll 回傳所有已註冊的 adapters', () => {
    const all = CommandAdapterRegistry.getAll();
    expect(all.length).toBeGreaterThanOrEqual(2);
    const ids = all.map((a) => a.toolId);
    expect(ids).toContain('claude');
    expect(ids).toContain('github-copilot');
  });
});
