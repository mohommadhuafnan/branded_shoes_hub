/** Parse JSON stored in TEXT columns (Aurora DSQL has no JSONB). */
export function parseJsonArray(value, fallback = []) {
  if (value == null || value === '') return [...fallback];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const v = JSON.parse(value);
      return Array.isArray(v) ? v : [...fallback];
    } catch {
      return [...fallback];
    }
  }
  return [...fallback];
}

export function parseJsonObject(value, fallback = {}) {
  if (value == null || value === '') return { ...fallback };
  if (typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) return value;
  if (typeof value === 'string') {
    try {
      const v = JSON.parse(value);
      return v && typeof v === 'object' && !Array.isArray(v) ? v : { ...fallback };
    } catch {
      return { ...fallback };
    }
  }
  return { ...fallback };
}
