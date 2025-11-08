import { describe, expect, it } from 'bun:test';
import { prettifyError, treeifyError } from 'zod';

import { translate } from '../lib/i18n';
import { I18nGlossary } from '../lib/models/i18n';

import glossaryJson from './glossary.json' assert { type: 'json' };


const parsed = I18nGlossary.safeParse(glossaryJson);
if (!parsed.success) {
    console.error(parsed.error);
    console.error(treeifyError(parsed.error));
    console.error(prettifyError(parsed.error));
    throw new Error('glossary.json does not match I18nGlossary schema');
}

const glossary = parsed.data;

describe('translate()', () => {
    it('translates simple string keys', () => {
        const { result, issues } = translate(glossary, 'app.title');
        expect(result).toBe('Welcome to our application');
        expect(issues).toBeUndefined();
    });

    it('translates nested template with default param', () => {
        const { result } = translate(glossary, 'nested.templateWithDefault');
        expect(result).toBe('Hello User, welcome back!');
    });

    it('translates greeting template with provided params', () => {
        const { result } = translate(glossary, 'user.greeting', {
            name: ['John', 'Jane'],
            date: new Date('2025-01-01'),
        });
        expect(result).toBe('Hello John or Jane, today is Wednesday, January 1, 2025!');
    });

    it('handles plural and number formatting', () => {
        const one = translate(glossary, 'user.notifications', { count: 1 });
        expect(one.result).toBe('You have 1 notification.');

        const many = translate(glossary, 'user.notifications', { count: 5 });
        expect(many.result).toBe('You have 5 notifications.');
    });

    it('handles currency number formatting', () => {
        const { result } = translate(glossary, 'user.balance', { amount: 1234.56 });
        expect(result).toMatch(/\$1,234\.56/);
    });

    it('handles list conjunction', () => {
        const { result } = translate(glossary, 'user.friends', {
            friends: ['Alice', 'Bob', 'Charlie'],
        });
        expect(result).toBe('You have Alice, Bob, and Charlie in your list.');
    });

    it('handles relative-time formatting', () => {
        const { result } = translate(glossary, 'user.lastLogin', {
            lastLogin: { value: -1, unit: 'day' },
        });
        expect(result).toMatch(/You last logged in (?:yesterday|1 day ago)\./i);
    });

    it('returns unknown-key issue for invalid key', () => {
        const { result, issues } = translate(glossary, 'does.not.exist');
        expect(result).toBe('does.not.exist');
        expect(issues?.[0]).toEqual(
            expect.objectContaining({ type: 'unknown-key' }),
        );
    });

    it('returns missing-param issue for templates missing required parameters', () => {
        const result = translate(glossary, 'user.notifications', {});
        expect(result.issues?.some(i => i.type === 'missing-param')).toBe(true);
    });

    it('returns invalid-format issue for wrong parameter type', () => {
        const result = translate(glossary, 'user.balance', { amount: 'not a number' });
        const invalid = result.issues?.find(i => i.type === 'invalid-format');
        expect(invalid?.param).toBe('amount');
    });
});
