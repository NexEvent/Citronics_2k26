/**
 * Converts a hex colour string to an rgba() string.
 * @param {string} hex  Hex colour — e.g. "#7C3AED" or "#fff"
 * @param {number} opacity  Alpha value between 0 and 1
 * @returns {string} rgba() CSS value
 */
export const hexToRGBA = (hex, opacity) => {
  const h = hex.replace('#', '')
  const fullHex =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h

  const r = parseInt(fullHex.substring(0, 2), 16)
  const g = parseInt(fullHex.substring(2, 4), 16)
  const b = parseInt(fullHex.substring(4, 6), 16)

  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}
