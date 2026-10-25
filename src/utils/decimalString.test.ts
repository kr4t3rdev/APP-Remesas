import { toDecimalString, toOptionalDecimalString } from './decimalString';

describe('toDecimalString', () => {
  it('convierte enteros a decimal-string', () => {
    expect(toDecimalString(100)).toBe('100');
    expect(toDecimalString(0)).toBe('0');
  });

  it('convierte decimales a decimal-string', () => {
    expect(toDecimalString(265.09)).toBe('265.09');
    expect(toDecimalString(0.05)).toBe('0.05');
  });

  it('normaliza un decimal-string de entrada', () => {
    expect(toDecimalString('  100.50 ')).toBe('100.50');
    expect(toDecimalString('100,50')).toBe('100.50');
  });

  it('rechaza formatos no decimales', () => {
    expect(() => toDecimalString('abc')).toThrow();
    expect(() => toDecimalString('1e3')).toThrow();
    expect(() => toDecimalString('-1')).toThrow();
  });

  it('rechaza valores no finitos', () => {
    expect(() => toDecimalString(NaN)).toThrow();
    expect(() => toDecimalString(Infinity)).toThrow();
  });

  it('expande la notación exponencial a decimal plano', () => {
    expect(toDecimalString(1e-7)).toBe('0.0000001');
    expect(toDecimalString(1.5e3)).toBe('1500');
  });

  it('devuelve undefined para valores opcionales ausentes', () => {
    expect(toOptionalDecimalString(undefined)).toBeUndefined();
    expect(toOptionalDecimalString(null)).toBeUndefined();
    expect(toOptionalDecimalString(12.5)).toBe('12.5');
  });
});
