/**
 * Apply a partial configuration to a target object.
 * Only updates properties that are explicitly defined in the source.
 *
 * @param target - The target object to update
 * @param source - The partial source configuration
 * @param keys - The keys to apply from source to target
 */
export function applyPartialConfig<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
  keys: (keyof T)[]
): void {
  keys.forEach((key) => {
    if (source[key] !== undefined) {
      target[key] = source[key] as T[keyof T]
    }
  })
}

/**
 * Helper to clamp a numeric value between min and max.
 * Returns fallback if the value is not a finite number.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fallback - Fallback value if input is invalid
 */
export function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

/**
 * Helper to clamp an integer value between min and max.
 * Rounds the value to the nearest integer before clamping.
 * Returns fallback if the value is not a finite number.
 *
 * @param value - The value to clamp
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @param fallback - Fallback value if input is invalid
 */
export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  const rounded = Math.round(n)
  return Math.max(min, Math.min(max, rounded))
}
