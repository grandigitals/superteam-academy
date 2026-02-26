import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
    let locale = await requestLocale

    // Validate locale against supported list
    if (!locale || !routing.locales.includes(locale as 'en' | 'pt-BR' | 'es')) {
        locale = routing.defaultLocale
    }

    const messages = (await import(`./messages/${locale}.json`)).default as Record<string, unknown>

    return {
        locale,
        messages,
    }
})
