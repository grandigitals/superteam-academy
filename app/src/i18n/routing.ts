import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
    locales: ['en', 'pt-BR', 'es'],
    defaultLocale: 'en',
    localePrefix: 'always', // Always show locale in URL to prevent auto-switching
    localeDetection: false, // Disable automatic browser locale detection
})
