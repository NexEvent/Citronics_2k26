/**
 * Theme Configuration
 * Central configuration for the Citronics platform
 */
const themeConfig = {
  // ** App Identity
  templateName: 'Citronics',
  appLogo: '/images/logo.png',
  appLogoInvert: '/images/logo-invert.png',
  defaultAvatar: '/images/avatars/default-avatar.png',

  // ** Layout Configs
  layout: 'vertical', // vertical | horizontal
  mode: 'light', // light | dark
  direction: 'ltr', // ltr | rtl
  skin: 'default', // default | bordered
  contentWidth: 'full', // full | boxed
  footer: 'static', // fixed | static | hidden

  // ** Routing Configs
  routingLoader: true,

  // ** Navigation (Menu) Configs
  navHidden: false,
  menuTextTruncate: true,
  navCollapsed: false,
  navigationSize: 268,
  collapsedNavigationSize: 68,

  // ** AppBar Configs
  appBar: 'fixed', // fixed | static | hidden
  appBarBlur: true,

  // ** Other Configs
  responsiveFontSizes: true,
  disableRipple: false,
  toastPosition: 'bottom-right',

  // ** Localization (English only; extend here when adding more languages)
  defaultLocale: 'en',
  supportedLocales: ['en'],

  // ** Event Platform
  maxFileUploadMB: 10,
  defaultTimezone: 'UTC',
  dateFormat: 'MMM DD, YYYY',
  timeFormat: 'hh:mm A'
}

export default themeConfig
