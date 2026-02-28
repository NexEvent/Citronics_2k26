import { Html, Head, Main, NextScript } from 'next/document'

/**
 * Custom Document Component
 * Note: Emotion styles are handled client-side via CacheProvider in _app.js
 */
export default function MyDocument() {
  return (
    <Html lang='en'>
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link
          href='https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&family=Public+Sans:wght@300;400;500;600;700&display=swap'
          rel='stylesheet'
        />

        {/* PWA — icons & splash */}
        <link rel='apple-touch-icon' sizes='180x180' href='/images/icons/pwa/apple-touch-icon.png' />
        <link rel='icon' type='image/png' sizes='32x32' href='/images/icons/pwa/icon-32x32.png' />
        <link rel='icon' type='image/png' sizes='16x16' href='/images/icons/pwa/icon-16x16.png' />
        <meta name='msapplication-TileImage' content='/images/icons/pwa/icon-144x144.png' />
        <meta name='msapplication-TileColor' content='#7C3AED' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
