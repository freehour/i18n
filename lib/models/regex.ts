export const i18nIdentifier = '[A-Za-z_]w*|d+';
export const i18nTranslationParamKey = `$\{((?:${i18nIdentifier})(?:.(?:${i18nIdentifier}))*)}`;
export const i18nTranslationParamKeys = new RegExp(i18nTranslationParamKey, 'g');
