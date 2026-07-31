export type DecimalInputOptions = {
  min?: number;
  max?: number;
  maxDecimalPlaces?: number;
};

const DECIMAL_INPUT_PATTERN = /^(?:\d+(?:\.\d*)?|\.\d+)$/;

export const parseDecimalInput = (
  input: string,
  options: DecimalInputOptions = {},
): number | null => {
  const normalized = input.trim().replace(',', '.');
  if (!normalized || !DECIMAL_INPUT_PATTERN.test(normalized)) return null;

  const decimalPlaces = normalized.split('.')[1]?.length ?? 0;
  if (options.maxDecimalPlaces !== undefined && decimalPlaces > options.maxDecimalPlaces) {
    return null;
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  if (options.min !== undefined && value < options.min) return null;
  if (options.max !== undefined && value > options.max) return null;
  return value;
};
