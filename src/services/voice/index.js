/**
 * Voice Service — Citro (Citronics Voice Assistant)
 *
 * Facade entry point for the deterministic voice pipeline.
 * All voice commands flow through here:
 *   normalizer → intent-engine → command-resolver → response-templates
 *
 * Called exclusively from the API layer (src/pages/api/voice/process.js).
 * Never imported directly in Views or Components.
 */
import { normalize } from './normalizer'
import { detectIntent } from './intent-engine'
import { resolveCommand } from './command-resolver'
import { buildResponse } from './response-templates'

/**
 * processCommand — main pipeline entry
 *
 * @param {string} transcript  Raw speech text from browser STT
 * @param {object} context     { currentPage, userId?, role?, isAuthenticated? } from API layer
 * @returns {object}           { reply, speakText, action, data, intent, confidence }
 *
 * Confidence gates:
 *   - Intent engine rejects matches below 0.6 (returns UNKNOWN)
 *   - This facade rejects UNKNOWN intents with a friendly LOW_CONFIDENCE reply
 */
export async function processCommand(transcript, context = {}) {
  // Step 1: Normalize speech → canonical English
  const normalized = normalize(transcript)

  // Step 2: Detect intent + extract entities (gate: MIN_INTENT_CONFIDENCE = 0.6)
  const { intent, entities, confidence } = detectIntent(normalized)

  // Step 3: Confidence gate — UNKNOWN means intent engine found nothing reliable
  if (intent === 'UNKNOWN') {
    return buildResponse('LOW_CONFIDENCE', { transcript: normalized, currentPage: context.currentPage })
  }

  // Step 4: Resolve command → execute business logic via existing services
  const result = await resolveCommand(intent, entities, context)

  // Step 5: Build deterministic response — include currentPage for context-aware replies
  return buildResponse(intent, {
    ...result,
    entities,
    confidence,
    currentPage: context.currentPage
  })
}

export default { processCommand }
