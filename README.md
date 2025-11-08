## 🌍 i18n Translation Library

A lightweight, strongly-typed internationalization (i18n) system for translations.
It supports nested translation maps, parameterized templates, formatting via the Intl API, and runtime validation.

## Under active development
__This library is currently under active development. Things may change.__


### 🧱 Installation

```bash
npm install @freehour/i18n
```

### 📘 Glossary Structure

Each locale is defined in an I18nGlossary structure. Below is an example using a JSON format:

```json
// en-US.json
{
    "$version": "1.0.0", // optional
    "$locale": "en-US",
    "$translations": {
        "greeting": "Hello!"
    }
}
```

Or the equivalent TypeScript format:
```typescript
import { I18nGlossary } from '@freehour/i18n';

const glossary: I18nGlossary = {
    $version: "1.0.0",
    $locale: "en-US",
    $translations: {
        greeting: "Hello!"
    }
};
```

You can use `I18nGlossary.parse()` to convert a JSON into an I18nGlossary object:
```typescript
import { I18nGlossary } from '@freehour/i18n';

import glossaryJson from './glossary.json' assert { type: 'json' };

const glossary = I18nGlossary.parse(glossaryJson);
```


### 🛠️ Usage

```typescript
import { translate } from '@freehour/i18n';

const {result} = translate(glossary, 'greeting');
console.log(result); // Outputs: "Hello!"
```

### 📜 Translation Keys

You can nest translations using dot notation:

```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "user": {
            "greeting": "Hello!",
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'user.greeting');
console.log(result); // Outputs: "Hello!"
```

### 🧩 Parameterized Templates

You can use parameterized templates for dynamic translations:

```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "greeting": {
            "$template": "Hello {name}, today is {date}!"
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'greeting', {
    name: 'John',
    date: '2025-01-01'
});
console.log(result); // Outputs: "Hello John, today is 2025-01-01!"
```

#### Default Parameters
You can define default values for parameters in the glossary:
```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "greeting": {
            "$template": "Hello {name}!",
            "$params": {
                "name": {
                    "$default": "Guest"
                },
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'greeting');
console.log(result); // Outputs: "Hello Guest!"
```

### 📊 Formatting

You can use the [Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl) API for formatting parameter values:

```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "greeting": {
            "$template": "Hello {name}, today is {date}!",
            "$params": {
                "date": {
                    "$format": "date-time",
                    "$options": {
                        "dateStyle": "full"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'greeting', {
    name: 'John',
    date: new Date('2025-01-01')
});
console.log(result); // Outputs: "Hello John, today is Wednesday, January 1, 2025!"
```


#### Alias Formats
You can use aliases for parameters to apply different formats to the same value:
```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "greeting": {
            "$template": "Hello {name}, today is {date} ({shortDate})!",
            "$params": {
                "name": {
                    "$alias": "userName"
                },
                "date": {
                    "$format": "date-time",
                    "$options": {
                        "dateStyle": "full"
                    }
                },
                "shortDate": {
                    "$alias": "date",
                    "$format": "date-time",
                    "$options": {
                        "dateStyle": "short"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'greeting', {
    userName: 'John',
    date: new Date('2025-01-01')
});
console.log(result); // Outputs: "Hello John, today is Wednesday, January 1, 2025 (1/1/25)!"
```

#### Formats

The following formats are supported:

- `date-time`: Formats a date and time. uses the `Intl.DateTimeFormat` API.
- `list`: Formats a list of items. uses the `Intl.ListFormat` API.
- `number`: Formats a number. uses the `Intl.NumberFormat` API.
- `plural`: Formats a number with plural rules. uses the `Intl.PluralRules` API.
- `relative-time`: Formats a relative time. uses the `Intl.RelativeTimeFormat` API


#### List Formatting
You can format lists using the `list` format:

```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "items": {
            "$template": "Items: {items}",
            "$params": {
                "items": {
                    "$format": "list",
                    "$options": {
                        "type": "conjunction",
                        "style": "long"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'items', {
    items: ['apple', 'banana', 'cherry']
});
console.log(result); // Outputs: "Items: apple, banana, and cherry"
```

#### Number Formatting
You can format numbers using the `number` format:
```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "price": {
            "$template": "Price: {price}",
            "$params": {
                "price": {
                    "$format": "number",
                    "$options": {
                        "style": "currency",
                        "currency": "USD"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'price', {
    price: 19.99
});
console.log(result); // Outputs: "Price: $19.99"
```

#### Plural Formatting
You can format numbers with plural rules using the `plural` format:
```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "notificationCount": {
            "$template": "You have {count} {notifications}",
            "$params": {
                "count": {
                    "$format": "number",
                    "$options": {
                        "style": "decimal"
                    }
                },
                "notifications": {
                    "$alias": "count",
                    "$format": "plural",
                    "$options": {
                        "one": "notification",
                        "other": "notifications"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'notificationCount', {
    count: 5
});
console.log(result); // Outputs: "You have 5 notifications"

const {result} = translate(glossary, 'notificationCount', {
    count: 1
});
console.log(result); // Outputs: "You have 1 notification"
```

#### Relative Time Formatting
You can format relative times using the `relative-time` format:
```json
// en-US.json
{
    "$locale": "en-US",
    "$translations": {
        "lastLogin": {
            "$template": "You last logged in {lastLogin}",
            "$params": {
                "lastLogin": {
                    "$format": "relative-time",
                    "$options": {
                        "numeric": "auto",
                        "style": "long"
                    }
                }
            }
        }
    }
}
```
```typescript
// index.ts
const {result} = translate(glossary, 'lastLogin', { value: -1, unit: 'day' });
console.log(result); // Outputs: "You last logged in yesterday"
```

For more details on the available options for each format, refer to the [MDN documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl).


### 🚨 Error Handling
If a translation key is not found, the result includes an issue object with the type `unknown-key`.
The result will be the translation key itself.

```typescript
const result = translate(glossary, 'non.existent.key');
console.log(result);
// Outputs: {
//      result: 'non.existent.key',
//      issues: [{ type: 'unknown-key', key: 'non.existent.key' }]
// }
```

If a template is missing a required parameter, the result includes an issue object with the type `missing-param`.
Missing parameters will not be replaced in the result.

```typescript
const result = translate(glossary, 'greeting', { name: 'John' });
console.log(result);
// Outputs: {
//      result: 'Hello John, today is {date}!',
//      issues: [{ type: 'missing-param', key: 'greeting', param: 'date' }]
// }
```

If a parameter value does not match the expected format, the result includes an issue object with the type `invalid-format`.
```typescript
const result = translate(glossary, 'greeting', { name: 'John', date: 'invalid-date' });
console.log(result);
// Outputs: {
//      result: 'Hello John, today is {date}!',
//      issues: [{
//          type: 'invalid-format',
//          key: 'greeting',
//          param: 'date',
//          value: 'invalid-date',
//          error: '✖ Invalid input: expected number or date'
//      }]
// }
```
