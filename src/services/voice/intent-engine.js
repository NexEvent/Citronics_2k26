/**
 * Intent Engine — Citro
 *
 * Deterministic rule-based intent detection.
 * Matches normalized text against the intent dataset using:
 *   1. Exact phrase matching
 *   2. Token overlap scoring (lightweight similarity)
 *   3. Entity extraction from $variable patterns
 *
 * No ML, no AI APIs — pure string logic.
 */
import INTENTS from './intent-dataset'
import { normalizeForIntent } from './normalizer'

/**
 * detectIntent — main export
 *
 * @param {string} normalizedText  Already-normalized English text
 * @returns {{ intent: string, entities: object, confidence: number, action: object }}
 */
export function detectIntent(normalizedText) {
  const cleaned = normalizeForIntent(normalizedText)
  if (!cleaned) {
    return { intent: 'UNKNOWN', entities: {}, confidence: 0, action: null }
  }

  let bestMatch = { intent: 'UNKNOWN', entities: {}, confidence: 0, action: null }

  for (const intentDef of INTENTS) {
    for (const pattern of intentDef.patterns) {
      const { score, entities } = matchPattern(cleaned, pattern, intentDef.entities || [])

      if (score > bestMatch.confidence) {
        bestMatch = {
          intent: intentDef.id,
          entities,
          confidence: score,
          action: intentDef.action
        }
      }

      // Perfect match — short-circuit
      if (score >= 1.0) return bestMatch
    }
  }

  return bestMatch
}

// ── Pattern Matching ──────────────────────────────────────────────────────────

/**
 * matchPattern — compares input against a single pattern string.
 *
 * Supports $variable placeholders for entity extraction.
 * Returns a confidence score (0..1) and extracted entities.
 */
function matchPattern(input, pattern, entityNames) {
  const inputWords = input.split(' ')
  const patternWords = pattern.split(' ')
  const entities = {}

  // Check for entity placeholders ($name, $date, etc.)
  const hasEntities = patternWords.some(w => w.startsWith('$'))

  if (hasEntities) {
    return matchWithEntities(inputWords, patternWords, entityNames, entities)
  }

  // Simple token overlap matching
  return { score: tokenOverlapScore(inputWords, patternWords), entities }
}

/**
 * matchWithEntities — handles patterns like "register for $name"
 *
 * Fixed tokens must match; $tokens consume remaining words as entity value.
 */
function matchWithEntities(inputWords, patternWords, entityNames, entities) {
  let inputIdx = 0
  let matchedFixed = 0
  let totalFixed = 0

  for (let i = 0; i < patternWords.length; i++) {
    const pw = patternWords[i]

    if (pw.startsWith('$')) {
      // Grab everything remaining as the entity value
      const entityKey = pw.substring(1)
      const remaining = inputWords.slice(inputIdx).join(' ')

      if (remaining) {
        entities[entityKey] = remaining
        inputIdx = inputWords.length
      }
    } else {
      totalFixed++

      if (inputIdx < inputWords.length && inputWords[inputIdx] === pw) {
        matchedFixed++
        inputIdx++
      }
    }
  }

  if (totalFixed === 0) return { score: 0, entities }

  const fixedScore = matchedFixed / totalFixed
  const hasEntity = Object.keys(entities).length > 0
  const score = hasEntity ? fixedScore * 0.9 : fixedScore * 0.5

  return { score: Math.min(score, 1.0), entities }
}

/**
 * tokenOverlapScore — Jaccard-like similarity between two word arrays.
 */
function tokenOverlapScore(inputWords, patternWords) {
  const inputSet = new Set(inputWords)
  const patternSet = new Set(patternWords)

  let matches = 0

  for (const word of patternSet) {
    if (inputSet.has(word)) matches++
  }

  // Score based on how many pattern words appear in input
  const coverage = matches / patternSet.size

  // Penalize if input is much longer (noisy input)
  const lengthPenalty = patternSet.size / Math.max(inputSet.size, patternSet.size)

  return coverage * (0.7 + 0.3 * lengthPenalty)
}
