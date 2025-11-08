import z from 'zod';

import { getDeepValue } from '@/utils/deep-value';

import { IntlFormatOptions } from './intl';
import { i18nIdentifier, i18nTranslationParamKey, i18nTranslationParamKeys } from './regex';

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


export const I18nTranslationParamKey = z.stringFormat(
    'i18n-translation-param-key',
    new RegExp(`^${i18nTranslationParamKey}$`),
);
export type I18nTranslationParamKey = z.infer<typeof I18nTranslationParamKey>;


const I18nTranslationParameterDefault = z.object({
    $default: z.string().optional(),
});
export const I18nTranslationParameter = z.union([
    I18nTranslationParameterDefault.and(z.object({ $format: z.undefined().optional() })),
    I18nTranslationParameterDefault.and(IntlFormatOptions),
]);
export type I18nTranslationParameter = z.infer<typeof I18nTranslationParameter>;


// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type I18nTranslationParams = {
    [key: I18nIdentifier]: I18nTranslationParameter | I18nTranslationParams;
};
export const I18nTranslationParams: z.ZodType<I18nTranslationParams> = z.record(
    I18nIdentifier,
    z.union([
        I18nTranslationParameter,
        z.lazy(() => I18nTranslationParams),
    ]),
);


export const I18nTranslationTemplate = z.object({
    $template: z.string(),
    $params: I18nTranslationParams,
}).superRefine(({ $template, $params }, ctx) => {
    const matches = $template.matchAll(i18nTranslationParamKeys);
    matches.forEach(match => {
        const [, key] = match;
        const param = getDeepValue($params, key);
        const { success } = I18nTranslationParameter.safeParse(param);
        if (!success) {
            ctx.addIssue({
                code: 'custom',
                message: `Unkown template parameter: ${key}`,
                input: $template,
            });
        }
    });
});
export type I18nTranslationTemplate = z.infer<typeof I18nTranslationTemplate>;


export const I18nTranslation = z.union(
    [
        z.string(),
        I18nTranslationTemplate,
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

