/* 此文件由 scripts/sync-locales.mjs 生成，请勿手工修改。 */
import locale0 from './zh-CN.json'
import locale1 from './en-US.json'
import locale2 from './ja-JP.json'
import locale3 from './zh-TW.json'

export const LOCALE_MESSAGES = {
  'zh-CN': locale0,
  'en-US': locale1,
  'ja-JP': locale2,
  'zh-TW': locale3,
} as const satisfies Record<string, Record<string, string>>

export type GeneratedLocale = keyof typeof LOCALE_MESSAGES
export const DEFAULT_LOCALE: GeneratedLocale = 'zh-CN'
export const SUPPORTED_LOCALES = Object.keys(LOCALE_MESSAGES) as GeneratedLocale[]
