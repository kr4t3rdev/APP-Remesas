/**
 * API Response Utilities
 * Provides safe defaults for API responses to prevent undefined errors
 */

/**
 * Safe extract of API response data with defaults
 * Prevents undefined errors when API calls fail
 * @param data - The response data from API
 * @param defaultValue - Default value if data is undefined (defaults to null)
 * @returns The data or default value
 */
export const safeData = <T>(data: T | undefined, defaultValue: T | null = null): T | null => {
  return data ?? defaultValue;
};

/**
 * Safe extract for array responses
 * @param data - The response data from API
 * @returns The array or empty array if undefined
 */
export const safeArray = <T>(data: T[] | undefined): T[] => {
  return data ?? [];
};

/**
 * Safe extract for object responses with provided shape
 * @param data - The response data from API
 * @param defaults - Default object shape
 * @returns The data or defaults object if undefined
 */
export const safeObject = <T extends object>(data: T | undefined, defaults: T): T => {
  return data ?? defaults;
};

/**
 * Safe extract of nested property
 * @param data - The response data from API
 * @param path - Property path (e.g., 'user.profile.name')
 * @param defaultValue - Default value if path doesn't exist
 * @returns The value at path or default
 */
export const safePath = <T>(
  data: any,
  path: string,
  defaultValue: T | null = null
): T | null => {
  const keys = path.split('.');
  let value = data;
  
  for (const key of keys) {
    if (value == null) return defaultValue;
    value = value[key];
  }
  
  return value ?? defaultValue;
};
