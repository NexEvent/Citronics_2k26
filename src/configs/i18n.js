/**
 * i18n Configuration
 * English-only for now. To add a language later:
 *  1. Add its folder under public/locales/<lang>/
 *  2. Add the locale key to the `resources` map below
 *  3. Add it to themeConfig.supportedLocales
 */
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Static imports keep the bundle self-contained (no HTTP fetch at runtime)
import commonEn   from '../../public/locales/en/common.json'
import eventsEn   from '../../public/locales/en/events.json'
import ticketsEn  from '../../public/locales/en/tickets.json'
import speakersEn from '../../public/locales/en/speakers.json'
import venuesEn   from '../../public/locales/en/venues.json'
import authEn     from '../../public/locales/en/auth.json'

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: { escapeValue: false },
    resources: {
      en: {
        common:   commonEn,
        events:   eventsEn,
        tickets:  ticketsEn,
        speakers: speakersEn,
        venues:   venuesEn,
        auth:     authEn
      }
    },
    ns: ['common', 'events', 'tickets', 'speakers', 'venues', 'auth'],
    defaultNS: 'common'
  })

export default i18n
