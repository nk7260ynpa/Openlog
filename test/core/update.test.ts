import { describe, it, expect } from 'vitest';
import { compareVersions } from '../../src/core/update.js';

describe('compareVersions', () => {
  it('相同版本回傳 0', () => {
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('0.5.4', '0.5.4')).toBe(0);
  });

  it('較新版本回傳正數', () => {
    expect(compareVersions('2.0.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.1.0', '1.0.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.1', '1.0.0')).toBeGreaterThan(0);
  });

  it('較舊版本回傳負數', () => {
    expect(compareVersions('1.0.0', '2.0.0')).toBeLessThan(0);
    expect(compareVersions('0.9.9', '1.0.0')).toBeLessThan(0);
  });

  it('處理 v prefix', () => {
    expect(compareVersions('v1.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('v2.0.0', 'v1.0.0')).toBeGreaterThan(0);
  });

  it('忽略 pre-release suffix', () => {
    expect(compareVersions('1.0.0-rc.1', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0-beta', '1.0.0-alpha')).toBe(0);
  });

  it('不同長度的版本號', () => {
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.0.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBeGreaterThan(0);
  });
});
