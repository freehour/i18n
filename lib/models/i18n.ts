import z from 'zod';

import { IntlFormatOptions } from './intl';
import { i18nIdentifier, i18nKey, i18nTemplateParam } from './regex';

/**
 * A semantic version string.
 * Follows the format: major.minor.patch.
 * @example: 2.1.3
 */
export const I18nVersion = z.templateLiteral([
    z
        .number()
        .int()
        .nonnegative()
        .describe('major version'),
    z
        .literal('.'),
    z
        .number()
        .int()
        .nonnegative()
        .describe('minor version'),
    z
        .literal('.'),
    z
        .number()
        .int()
        .nonnegative()
        .describe('patch version'),
]);
export type I18nVersion = z.infer<typeof I18nVersion>;


export const I18nIdentifier = z.stringFormat(
    'i18n-identifier',
    new RegExp(`^${i18nIdentifier}$`),
);
export type I18nIdentifier = z.infer<typeof I18nIdentifier>;


export const I18nKey = z.stringFormat(
    'i18n-key',
    new RegExp(`^${i18nKey}$`),
);
export type I18nKey = z.infer<typeof I18nKey>;


export const I18nParamToken = z.stringFormat(
    'i18n-param-tokem',
    new RegExp(`^${i18nTemplateParam}$`),
);
export type I18nParamToken = z.infer<typeof I18nParamToken>;


const I18nTemplateParamBase = z.object({
    $alias: I18nKey.optional(),
    $default: z.string().optional(),
});
export const I18nTemplateParam = z.union([
    I18nTemplateParamBase.and(z.object({ $format: z.undefined().optional() })),
    I18nTemplateParamBase.and(IntlFormatOptions),
]);
export type I18nTemplateParam = z.infer<typeof I18nTemplateParam>;


export const I18nTemplate = z.object({
    $template: z.string(),
    $params: z.record(I18nIdentifier, I18nTemplateParam).optional(),
});
export type I18nTemplate = z.infer<typeof I18nTemplate>;


export const I18nTranslation = z.union(
    [
        z.string(),
        I18nTemplate,
    ],
);
export type I18nTranslation = z.infer<typeof I18nTranslation>;


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type I18nTranslationMap = {
    [key: I18nIdentifier]: I18nTranslationMap | I18nTranslation;
};
export const I18nTranslationMap: z.ZodType<I18nTranslationMap> = z.record(
    I18nIdentifier,
    z.union([
        I18nTranslation,
        z.lazy(() => I18nTranslationMap),
    ]),
);


export const I18nLocale = z.custom<Intl.UnicodeBCP47LocaleIdentifier>();
export type I18nLocale = z.infer<typeof I18nLocale>;


export const I18nGlossary = z.object({
    $version: I18nVersion.optional(),
    $locale: I18nLocale,
    $translations: I18nTranslationMap,
});
export type I18nGlossary = z.infer<typeof I18nGlossary>;

