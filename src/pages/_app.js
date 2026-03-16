import Head from 'next/head'
import { useEffect } from 'react'
import { Router } from 'next/router'
import { Provider, useDispatch } from 'react-redux'
import { SessionProvider } from 'next-auth/react'
import { CacheProvider } from '@emotion/react'
import NProgress from 'nprogress'
import { Toaster } from 'react-hot-toast'
// i18n config
import 'src/configs/i18n'

// Store
import { store } from 'src/store'

// Config
import themeConfig from 'src/configs/themeConfig'
import { defaultACLObj } from 'src/configs/acl'

// Theme
import AppThemeProvider from 'src/theme/AppThemeProvider'

// Components
import UserLayout from 'src/layouts/UserLayout'
import AuthGuard from 'src/components/guards/AuthGuard'
import GuestGuard from 'src/components/guards/GuestGuard'
import AclGuard from 'src/components/guards/AclGuard'
import Spinner from 'src/components/Spinner'
// import ScrollToTop from 'src/components/ScrollToTop'
import PWAPrompts from 'src/components/PWAPrompts'
import ThemeCustomizer from 'src/components/ThemeCustomizer'
import MobileBottomNav from 'src/components/MobileBottomNav'
import dynamic from 'next/dynamic'
const VoiceAssistant = dynamic(() => import('src/components/VoiceAssistant'), { ssr: false })

// Context
import { SettingsConsumer, SettingsProvider } from 'src/context/SettingsContext'

// Utils
import { createEmotionCache } from 'src/lib/emotionCache'

// Cart
import { hydrateCart } from 'src/store/slices/cartSlice'

// Styles
import 'react-perfect-scrollbar/dist/css/styles.css'

// Client-side emotion cache
const clientSideEmotionCache = createEmotionCache()

// ── Progress bar ──────────────────────────────────────────────────────────────
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => NProgress.start())
  Router.events.on('routeChangeError', () => NProgress.done())
  Router.events.on('routeChangeComplete', () => NProgress.done())
}

/**
 * Guard wrapper — selects the right auth guard
 */
const Guard = ({ children, authGuard, guestGuard }) => {
  if (guestGuard) return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  if (!guestGuard && !authGuard) return <>{children}</>
  return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
}

/** Hydrate cart from localStorage once on mount */
const CartHydrator = () => {
  const dispatch = useDispatch()
  useEffect(() => { dispatch(hydrateCart()) }, [dispatch])
  return null
}

/**
 * App — root component
 */
const App = props => {
  const {
    Component,
    emotionCache = clientSideEmotionCache,
    pageProps: { session, ...pageProps }
  } = props

  const contentHeightFixed = Component.contentHeightFixed ?? false
  const getLayout =
    Component.getLayout ?? (page => <UserLayout contentHeightFixed={contentHeightFixed}>{page}</UserLayout>)
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <SessionProvider session={session}>
      <Provider store={store}>
        <CartHydrator />
        <CacheProvider value={emotionCache}>
          <Head>
            {/*
             * Global fallback <Head> — individual pages override these via <SEOHead>.
             * Only meta that must be present on every single render lives here.
             */}
            <meta name='viewport' content='initial-scale=1, width=device-width' />

            {/* PWA meta */}
            <meta name='application-name' content='Citronics 2026' />
            <meta name='apple-mobile-web-app-capable' content='yes' />
            <meta name='apple-mobile-web-app-status-bar-style' content='default' />
            <meta name='apple-mobile-web-app-title' content='Citronics 2026' />
            <meta name='format-detection' content='telephone=no' />
            <meta name='mobile-web-app-capable' content='yes' />
            <meta name='theme-color' content='#7C3AED' />
            <link rel='manifest' href='/manifest.json' />
          </Head>

          <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
            <SettingsConsumer>
              {({ settings }) => (
                <AppThemeProvider settings={settings}>
                  <Guard authGuard={authGuard} guestGuard={guestGuard}>
                    <AclGuard aclAbilities={aclAbilities} guestGuard={guestGuard} authGuard={authGuard}>
                      {getLayout(<Component {...pageProps} />)}
                    </AclGuard>
                  </Guard>

                  {/* Global utilities */}
                  <ThemeCustomizer />
                  <MobileBottomNav />
                  {/* <ScrollToTop /> */}
                  <PWAPrompts />
                  <VoiceAssistant />
                  <Toaster position={settings.toastPosition || themeConfig.toastPosition} />
                </AppThemeProvider>
              )}
            </SettingsConsumer>
          </SettingsProvider>
        </CacheProvider>
      </Provider>
    </SessionProvider>
  )
}

export default App
