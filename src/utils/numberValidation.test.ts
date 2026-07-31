import { parseDecimalInput } from './numberValidation';

describe('parseDecimalInput', () => {
  it('accepts decimal-pad commas and preserves zero', () => {
    expect(parseDecimalInput('12,34', { min: 0, maxDecimalPlaces: 2 })).toBe(12.34);
    expect(parseDecimalInput('0', { min: 0, maxDecimalPlaces: 2 })).toBe(0);
  });

  it('rejects non-finite, malformed, out-of-range, and over-precise values', () => {
    const options = { min: 0.01, max: 9999999999999.99, maxDecimalPlaces: 2 };
    expect(parseDecimalInput('abc', options)).toBeNull();
    expect(parseDecimalInput('1e3', options)).toBeNull();
    expect(parseDecimalInput('0.001', options)).toBeNull();
    expect(parseDecimalInput('10000000000000', options)).toBeNull();
  });
});
