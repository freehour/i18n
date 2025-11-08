export const i18nIdentifier = '[A-Za-z_]\\w*|\\d+';
export const i18nKey = `(?:${i18nIdentifier})(?:.(?:${i18nIdentifier}))*`;
export const i18nTemplateParam = `{(${i18nIdentifier})}`;
export const i18nTemplateParams = new RegExp(i18nTemplateParam, 'g');
