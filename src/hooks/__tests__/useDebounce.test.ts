import { renderHook } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 500));
    expect(result.current).toBe('test');
  });

  it('should not update immediately on value change', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });

    // Should still return the initial value immediately after change
    expect(result.current).toBe('initial');
  });

  it('should update after delay expires', () => {
    const { result, rerender } = renderHook(
      (props: { value: string }) => useDebounce(props.value, 500),
      { initialProps: { value: 'initial' } }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    jest.advanceTimersByTime(500);

    // After the delay, we need to check on next render
    rerender({ value: 'updated' });
    // The debounced value should eventually update
    expect(result.current).toBe('updated');
  });

  it('should have correct hook existence and type', () => {
    const { result } = renderHook(() => useDebounce<string>('test', 500));
    
    // Should return a string
    expect(typeof result.current).toBe('string');
    expect(result.current).toBe('test');
  });

  it('should work with empty strings', () => {
    const { result } = renderHook(() => useDebounce('', 500));
    expect(result.current).toBe('');
  });

  it('should work with numbers', () => {
    const { result } = renderHook(() => useDebounce(0, 500));
    expect(result.current).toBe(0);
  });

  it('should cleanup on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(globalThis, 'clearTimeout');
    const { unmount } = renderHook(() => useDebounce('test', 500));
    
    unmount();
    
    // Should have called clearTimeout during unmount
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
