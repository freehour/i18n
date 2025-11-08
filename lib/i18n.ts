import type { ZodError, ZodSafeParseError, ZodSafeParseSuccess } from 'zod';

import type { I18nGlossary } from './models/i18n';
import { I18nTemplate, I18nTemplateParam } from './models/i18n';
import type { IntlFormatOptions } from './models/intl';
import { IntlDateTimeFormat, IntlListFormat, IntlNumberFormat, IntlPluralRules, IntlRelativeTimeFormat } from './models/intl';
import { i18nTemplateParams } from './models/regex';
import { getDeepValue } from './utils/deep-value';
import { isString } from './utils/is-type';


function formatValue(
    locale: Intl.Locale,
    value: any,
    intl: IntlFormatOptions,
): ZodSafeParseSuccess<string> | ZodSafeParseError<any> {
    if (intl.$format === 'date-time') {
        const { success, data, error } = IntlDateTimeFormat.safeParse(value);
        return success
            ? {
                success,
                data: new Intl.DateTimeFormat(locale, intl.$options).format(data),
            }
            : {
                success,
                error,
            };
    }

    // not yet included in TypeScript
    // if ($format === 'duration') {
    // }

    if (intl.$format === 'list') {
        const { success, data, error } = IntlListFormat.safeParse(value);
        return success
            ? {
                success,
                data: new Intl.ListFormat(locale, intl.$options).format(data),
            }
            : {
                success,
                error,
            };
    }

    if (intl.$format === 'number') {
        const { success, data, error } = IntlNumberFormat.safeParse(value);
        return success
            ? {
                success,
                data: new Intl.NumberFormat(locale, intl.$options).format(data),
            }
            : {
                success,
                error,
            };
    }

    if (intl.$format === 'plural') {
        const { success, data, error } = IntlPluralRules.safeParse(value);
        if (!success) {
            return {
                success,
                error,
            };
        }

        const rule = new Intl.PluralRules(locale, intl.$options).select(data);
        return {
            success,
            data: intl.$plural?.[rule] ?? rule,
        };
    }

    const { success, data, error } = IntlRelativeTimeFormat.safeParse(value);
    return success
        ? {
            success,
            data: new Intl.RelativeTimeFormat(locale, intl.$options).format(data.value, data.unit),
        }
        : {
            success,
            error,
        };
}


export interface I18nBaseIssue {
    type: string;
    key: string;
}

export interface I18nUnkownKey extends I18nBaseIssue {
    /**
     * The key was not found in the glossary or does not point to a valid translation.
     */
    type: 'unknown-key';
}

export interface I18nInvalidFormat extends I18nBaseIssue {
    /**
     * The value for a template parameter does not match the expected format.
     */
    type: 'invalid-format';
    error: ZodError;
    param: string;
    value: any;
}


export interface I18nMissingParam extends I18nBaseIssue {
    /**
     * A required template parameter was not provided in the arguments.
     */
    type: 'missing-param';
    param: string;
}

export type I18Issue = I18nUnkownKey | I18nInvalidFormat | I18nMissingParam;

export interface I18nResult {
    result: string;
    issues?: I18Issue[];
}

/**
 * Get a translation from the glossary by key.
 * If the key has a template, the parameters are replaced with the values from the given arguments.
 *
 * @param glossary The glossary containing translations.
 * @param key The translation key to look up.
 * @param args The arguments to use to fill the parameters in the translation template (if any).
 * @returns The translated string with parameters replaced by their values.
 * If the key is not found or the template is invalid, the key is returned as is.
 * If a parameter is missing or has invalid format options, the parameter is not replaced.
 */
export function translate(
    glossary: I18nGlossary,
    key: string,
    args: Record<string, any> = {},
): I18nResult {

    const translation = getDeepValue(glossary.$translations, key);
    if (translation === undefined) {
        return {
            result: key,
            issues: [
                {
                    type: 'unknown-key',
                    key,
                },
            ],
        };
    }

    if (isString(translation)) {
        return {
            result: translation,
        };
    }

    const { success, data } = I18nTemplate.safeParse(translation);
    if (!success) {
        return {
            result: key,
            issues: [
                {
                    type: 'unknown-key',
                    key,
                },
            ],
        };
    }

    const { $template, $params } = data;
    const errors: I18Issue[] = [];
    const result = $template.replace(i18nTemplateParams, (match, param) => {

        const p = I18nTemplateParam.parse($params?.[param] ?? {});

        // get the value from args for the parameter, or default value if any
        const value = args[p.$alias ?? param];
        if (value === undefined) {
            if (p.$default !== undefined) {
                return p.$default;
            }
            errors.push({
                type: 'missing-param',
                key,
                param,
            });
            return param;
        }

        // format the value based on the format options
        if (p.$format) {
            const locale = new Intl.Locale(glossary.$locale);
            const formattedValue = formatValue(locale, value, p);
            if (!formattedValue.success) {
                errors.push({
                    type: 'invalid-format',
                    key,
                    error: formattedValue.error,
                    param,
                    value,
                });
                return String(value);
            }
            return formattedValue.data;
        }
        // if no format is specified, return the value as is
        return String(value);
    });

    return {
        result,
        issues: errors.length > 0 ? errors : undefined,
    };
}
