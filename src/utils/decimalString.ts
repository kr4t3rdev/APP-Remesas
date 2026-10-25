/**
 * Serialización de magnitudes monetarias a decimal-string.
 *
 * Decisión 1.14 del change `native-clients-openapi`: todo valor monetario o
 * de tasa cruza el contrato como **string decimal** ("265.09"), nunca como
 * número JSON, para que ningún cliente pase por floats binarios.
 *
 * En React Native la UI sigue trabajando con `number` (los inputs son texto y
 * los cálculos de pantalla necesitan aritmética), pero la frontera de red
 * (capa `infrastructure`) convierte a decimal-string antes de enviar.
 */

/** Acepta un número o un decimal-string ya canónico. */
export type DecimalInput = number | string;

/**
 * Convierte un valor numérico a decimal-string canónico.
 *
 * - Rechaza `NaN` e `Infinity` (nunca son magnitudes válidas).
 * - Evita notación exponencial: `1e-7` → `"0.0000001"` (el backend exige el
 *   patrón `^\d+(\.\d+)?$`).
 * - Conserva el valor exacto que representa el `number` de JavaScript: usa la
 *   representación más corta que vuelve al mismo `number` (`String(value)`).
 * - Un `string` de entrada se normaliza (trim, coma decimal → punto) y se
 *   valida contra el mismo patrón del backend.
 */
export const toDecimalString = (value: DecimalInput): string => {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new Error("El valor monetario debe ser un número finito");
    }
    if (Number.isInteger(value)) return String(value);

    const asString = String(value);
    if (!asString.includes("e") && !asString.includes("E")) return asString;

    // Notación exponencial: se expande a decimal plano sin perder precisión.
    return expandExponential(asString);
  }

  const normalized = value.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`El valor monetario "${value}" no es un decimal string válido`);
  }
  return normalized;
};

/**
 * Variante tolerante: devuelve `undefined` en vez de lanzar cuando el valor no
 * es convertible (útil para payloads opcionales).
 */
export const toOptionalDecimalString = (
  value: DecimalInput | undefined | null,
): string | undefined => {
  if (value === undefined || value === null) return undefined;
  return toDecimalString(value);
};

/** `1e-7` → `0.0000001`; `1.5e3` → `1500`. */
const expandExponential = (asString: string): string => {
  const [mantissa, exponentPart] = asString.split(/[eE]/);
  const exponent = Number(exponentPart);
  const negative = mantissa.startsWith("-");
  const unsigned = negative ? mantissa.slice(1) : mantissa;
  const [integerPart, fractionPart = ""] = unsigned.split(".");

  const digits = `${integerPart}${fractionPart}`;
  const decimalIndex = integerPart.length + exponent;

  let expanded: string;
  if (decimalIndex <= 0) {
    expanded = `0.${"0".repeat(-decimalIndex)}${digits}`;
  } else if (decimalIndex >= digits.length) {
    expanded = `${digits}${"0".repeat(decimalIndex - digits.length)}`;
  } else {
    expanded = `${digits.slice(0, decimalIndex)}.${digits.slice(decimalIndex)}`;
  }

  return negative ? `-${expanded}` : expanded;
};
