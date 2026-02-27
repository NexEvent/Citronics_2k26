/**
 * Intent Engine — Citro
 *
 * Deterministic rule-based intent detection.
 * Matches normalized text against the intent dataset using:
 *   1. Exact phrase matching
 *   2. Token overlap scoring (lightweight similarity)
 *   3. Entity extraction from $variable patterns
 *   4. Event name fuzzy matching via knowledge base
 *
 * No ML, no AI APIs — pure string logic.
 */
import INTENTS from './intent-dataset'
import { normalizeForIntent } from './normalizer'
import { findEvent, getDepartmentCode } from './event-knowledge'

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

  // Minimum confidence required — matches below this are treated as UNKNOWN
  const MIN_INTENT_CONFIDENCE = 0.5

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

  // ── Event name fallback ─────────────────────────────────────────────────
  // If no strong intent matched but the text might be an event name,
  // try to find it in the knowledge base and treat as EVENT_DETAILS
  if (bestMatch.confidence < MIN_INTENT_CONFIDENCE) {
    const eventMatch = findEvent(cleaned)
    if (eventMatch && eventMatch.confidence >= 0.5) {
      return {
        intent: 'EVENT_DETAILS',
        entities: { name: eventMatch.event.name },
        confidence: eventMatch.confidence * 0.85,
        action: { type: 'reply' }
      }
    }
  }

  // Reject low-confidence matches — return UNKNOWN instead
  if (bestMatch.confidence < MIN_INTENT_CONFIDENCE) {
    return { intent: 'UNKNOWN', entities: {}, confidence: 0, action: null }
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
 * matchWithEntities — handles patterns like "register for $name" or "find $name event"
 *
 * Fixed tokens must match in order; $tokens extract entity values.
 * When a $ token has a trailing fixed token in the pattern, it captures only
 * the words up to (not including) that next fixed token — not the entire rest
 * of input. When no trailing fixed token exists, it falls back to consuming
 * all remaining input words.
 *
 * Input is consumed sequentially to prevent a single word from satisfying
 * multiple pattern tokens.
 */
function matchWithEntities(inputWords, patternWords, entityNames, entities) {
  let inputIdx = 0
  let matchedFixed = 0
  let totalFixed = 0

  for (let i = 0; i < patternWords.length; i++) {
    const pw = patternWords[i]

    if (pw.startsWith('$')) {
      const entityKey = pw.substring(1)

      // Look ahead in patternWords for the next fixed (non-$) token
      let nextFixedToken = null
      for (let j = i + 1; j < patternWords.length; j++) {
        if (!patternWords[j].startsWith('$')) {
          nextFixedToken = patternWords[j]
          break
        }
      }

      if (nextFixedToken) {
        // Find where the next fixed token appears in the remaining input
        let boundaryIdx = -1
        for (let k = inputIdx; k < inputWords.length; k++) {
          if (inputWords[k] === nextFixedToken) {
            boundaryIdx = k
            break
          }
        }

        if (boundaryIdx > inputIdx) {
          // Capture words between current position and the boundary
          entities[entityKey] = inputWords.slice(inputIdx, boundaryIdx).join(' ')
          inputIdx = boundaryIdx // leave boundary word for the fixed-token loop
        } else if (boundaryIdx === inputIdx) {
          // Entity would be empty — next fixed token is right here, skip entity
        } else {
          // Trailing fixed token not found in input — consume rest as entity
          const remaining = inputWords.slice(inputIdx).join(' ')
          if (remaining) {
            entities[entityKey] = remaining
            inputIdx = inputWords.length
          }
        }
      } else {
        // No trailing fixed token — consume all remaining input
        const remaining = inputWords.slice(inputIdx).join(' ')
        if (remaining) {
          entities[entityKey] = remaining
          inputIdx = inputWords.length
        }
      }
    } else {
      totalFixed++

      // Scan forward from current position to find this fixed token (preserving order)
      let found = false
      while (inputIdx < inputWords.length) {
        if (inputWords[inputIdx] === pw) {
          matchedFixed++
          inputIdx++
          found = true
          break
        }
        inputIdx++ // consume non-matching word so it can't be reused
      }
      // If not found, this required token is missing — matchedFixed stays the same
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
