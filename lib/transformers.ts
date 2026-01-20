/**
 * Transform snake_case string to camelCase
 * Handles edge cases like leading underscores and consecutive underscores
 *
 * @param str - The snake_case string to convert
 * @returns The camelCase version of the string
 *
 * @example
 * snakeToCamel('user_id') // 'userId'
 * snakeToCamel('created_at') // 'createdAt'
 * snakeToCamel('_private_field') // '_privateField'
 */
export function snakeToCamel(str: string): string {
  // Handle empty string
  if (!str) return str;

  // Handle leading underscore (private fields)
  const hasLeadingUnderscore = str.startsWith('_');
  const cleanStr = hasLeadingUnderscore ? str.slice(1) : str;

  // Convert snake_case to camelCase
  const camelCase = cleanStr.replace(/_+(.)/g, (_, char) => char.toUpperCase());

  // Restore leading underscore if present
  return hasLeadingUnderscore ? '_' + camelCase : camelCase;
}

/**
 * Recursively transform all object keys from snake_case to camelCase
 * Handles nested objects, arrays, and primitive values
 *
 * @param data - The data to transform (object, array, or primitive)
 * @returns The transformed data with camelCase keys
 *
 * @example
 * transformKeys({ user_id: '123', created_at: '2024-01-01' })
 * // { userId: '123', createdAt: '2024-01-01' }
 *
 * transformKeys({ user: { display_name: 'John' } })
 * // { user: { displayName: 'John' } }
 *
 * transformKeys([{ user_id: '1' }, { user_id: '2' }])
 * // [{ userId: '1' }, { userId: '2' }]
 */
export function transformKeys(data: any): any {
  // Handle null and undefined
  if (data === null || data === undefined) {
    return data;
  }

  // Handle Date objects - return as-is
  if (data instanceof Date) {
    return data;
  }

  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => transformKeys(item));
  }

  // Handle objects
  if (typeof data === 'object') {
    const transformed: any = {};

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const camelKey = snakeToCamel(key);
        const value = data[key];

        // Recursively transform nested objects and arrays
        transformed[camelKey] = transformKeys(value);
      }
    }

    return transformed;
  }

  // Handle primitives (string, number, boolean)
  return data;
}
