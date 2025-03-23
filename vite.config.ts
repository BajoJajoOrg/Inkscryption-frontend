import path from 'path';
import { createLogger, defineConfig } from 'vite';

import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { createHtmlPlugin } from 'vite-plugin-html';
import { visualizer } from 'rollup-plugin-visualizer';

import { compilerOptions } from './tsconfig.paths.json';
import { version } from './package.json';

function convertAlias() {
    const result: { [key: string]: string } = {};
    let key: keyof typeof compilerOptions.paths;

    for (key in compilerOptions.paths) {
        result[key] = path.resolve(__dirname, compilerOptions.paths[key][0]);
    }
    return result;
}

const logger = createLogger();

const loggerWarn = logger.warn;
logger.warn = (msg, options) => {
    // Ignore empty CSS files warning
    if (msg.includes('vite:css') && msg.includes(' is empty')) return;
    loggerWarn(msg, options);
};

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
    customLogger: logger,
    clearScreen: false,
    resolve: {
        alias: {
            ...convertAlias(),
        },
    },
    build: {
        outDir: './build',
        assetsDir: 'assets',
    },
    plugins: [
        react(),
        svgr({
            svgrOptions: {},
        }),
        visualizer({
            filename: './build/assets/stats.html',
            open: true,
        }),
        createHtmlPlugin({
            inject: {
                data: {
                    appVersion: version,
                },
            },
        }),
    ],
    base: '/',
});
