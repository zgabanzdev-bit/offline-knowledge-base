import { describe, it, expect } from 'vitest';
import { simpleHash } from './hash';

describe('simpleHash', () => {
  it('returns identical hashes for identical input', () => {
    expect(simpleHash('hello world')).toBe(simpleHash('hello world'));
  });

  it('returns different hashes for different input', () => {
    expect(simpleHash('hello')).not.toBe(simpleHash('world'));
  });

  it('handles empty string without throwing', () => {
    expect(() => simpleHash('')).not.toThrow();
  });
});
