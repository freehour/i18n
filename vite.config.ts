import { resolve } from 'path';
import { defineConfig } from 'vite';
import dtsPlugin from 'vite-plugin-dts';
// eslint-disable-next-line import-x/no-rename-default
import tsConfigPaths from 'vite-tsconfig-paths';

import * as packageJson from './package.json';


const dependencies = [...Object.keys(packageJson.dependencies)];

export default defineConfig({
    plugins: [
        tsConfigPaths(),
        dtsPlugin({
            entryRoot: 'lib',
            include: ['lib/index.ts', 'lib/i18n.ts', 'lib/models/i18n.ts'],
            staticImport: true,
            tsconfigPath: './tsconfig.lib.json',
        }),
    ],
    build: {
        minify: true,
        lib: {
            entry: [
                resolve(__dirname, './lib/index.ts'),
            ],
            name: packageJson.name,
            formats: ['es'],
        },
        rollupOptions: {
            external: id => dependencies.some(dep => id.startsWith(dep)),
            output: {
                globals: Object.fromEntries(dependencies.map(dep => [dep, dep])),
                preserveModulesRoot: 'lib',
            },
        },
    },
});
