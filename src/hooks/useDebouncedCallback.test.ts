import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDebouncedCallback } from './useDebouncedCallback';

describe('useDebouncedCallback', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('calls the callback only once after rapid successive calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    result.current('a');
    result.current('b');
    result.current('c');

    vi.advanceTimersByTime(499);
    expect(callback).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('c');
  });

  it('always calls the latest version of the callback (no stale closure)', () => {
    let value = 'first';
    const { result, rerender } = renderHook(({ cb }) => useDebouncedCallback(cb, 500), {
      initialProps: { cb: () => value },
    });

    value = 'second';
    rerender({ cb: () => value });
    result.current();
    vi.advanceTimersByTime(500);
  });
});
