import copy from "rollup-plugin-copy";
import {defineConfig, type PluginOption} from 'vite';
import {resolve} from "path";

export default defineConfig(({mode}) => {
    const plugins = [] as PluginOption[];
    if (mode === 'production') {
        plugins.push({
            ...copy({
                hook: 'writeBundle',
                targets: [
                    {
                        src: 'src/main.d.ts',
                        dest: 'dist',
                    },
                ],
            }),
        })
    }

    return {
        build: {
            lib: {
                entry: resolve(__dirname, 'src/main.ts'),
                name: 'YwMp',
                fileName: '[name]',
            },
            rollupOptions: {
                external: ['vite', 'path', 'fs', 'glob', 'html-minifier-terser', 'rollup-plugin-copy', "rollup-plugin-delete"],
                output: {
                    globals: {
                        'vite': 'vite',
                        'path': 'path',
                        'fs': 'fs',
                        'glob': 'glob',
                        'html-minifier-terser': 'htmlMinifierTerser',
                        'rollup-plugin-copy': 'copy',
                        'rollup-plugin-delete': 'del',
                    },
                }
            },
        },
        plugins
    }
})

