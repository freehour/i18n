import z from 'zod';


export const IntlFormat = z.enum([
    'date-time',
    // 'duration', // Not yet included in TypeScript https://github.com/microsoft/TypeScript/issues/60608
    'list',
    'number',
    'plural',
    'relative-time',
]);
export type IntlFormat = z.infer<typeof IntlFormat>;


export const IntlFormatOptions = z.discriminatedUnion('$format', [
    z.object({ $format: z.literal('date-time'), $options: z.custom<Intl.DateTimeFormatOptions>().optional() }),
    // z.object({ $format: z.literal('duration'), $options: z.custom<Intl.DurationFormatOptions>().optional() }), // Not yet included in TypeScript https://github.com/microsoft/TypeScript/issues/60608
    z.object({ $format: z.literal('list'), $options: z.custom<Intl.ListFormatOptions>().optional() }),
    z.object({ $format: z.literal('number'), $options: z.custom<Intl.NumberFormatOptions>().optional() }),
    z.object({ $format: z.literal('plural'), $options: z.custom<Intl.PluralRulesOptions>().optional() }),
    z.object({ $format: z.literal('relative-time'), $options: z.custom<Intl.RelativeTimeFormatOptions>().optional() }),
]);
export type IntlFormatOptions = z.infer<typeof IntlFormatOptions>;


export const IntlDateTimeFormat = z.union([
    z.number(),
    z.instanceof(Date),
]);
export type IntlDateTimeFormat = z.infer<typeof IntlDateTimeFormat>;


export const IntlListFormat = z.array(z.string());
export type IntlListFormat = z.infer<typeof IntlListFormat>;


export const IntlNumberFormat = z.union([
    z.coerce.number(),
    z.enum(['Infinity', '-Infinity', '+Infinity']),
]);
export type IntlNumberFormat = z.infer<typeof IntlNumberFormat>;


export const IntlPluralRules = z.number();
export type IntlPluralRules = z.infer<typeof IntlPluralRules>;


export const IntlRelativeTimeFormat = z.object({
    value: z.number(),
    unit: z.enum([
        'year',
        'years',
        'quarter',
        'quarters',
        'month',
        'months',
        'week',
        'weeks',
        'day',
        'days',
        'hour',
        'hours',
        'minute',
        'minutes',
        'second',
        'seconds',
    ]),
});
export type IntlRelativeTimeFormat = z.infer<typeof IntlRelativeTimeFormat>;
