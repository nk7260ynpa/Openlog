import { describe, it, expect } from 'vitest';
import { compareVersions } from '../../src/core/update.js';

describe('compareVersions', () => {
  it('returns 0 for equal versions', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.5.4', '0.5.4')).toBe(0);
  });

  it('returns positive for newer version', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
  });

  it('returns negative for older version', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
    expect(compareVersions('0.9.9', '1.0.0')).toBeLessThan(0);
  });

  it('handles v prefix', () => {
    expect(compareVersions('v1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('v2.0.0', 'v1.0.0')).toBeGreaterThan(0);
  });

  it('ignores pre-release suffix', () => {
    expect(compareVersions('1.0.0-rc.1', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0-beta', '1.0.0-alpha')).toBe(0);
  });

  it('handles different-length version numbers', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBeGreaterThan(0);
  });
});
