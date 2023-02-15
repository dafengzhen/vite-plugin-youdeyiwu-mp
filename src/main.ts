import copy from 'rollup-plugin-copy';
import del from 'rollup-plugin-delete';
import fs from 'fs';
import glob from 'glob';
import htmlMinifierTerser from 'html-minifier-terser';
import path from 'path';
import {normalizePath, type PluginOption} from 'vite';
import {type OutputChunk} from 'rollup';

export default function YoudeyiwuMpVitePlugin(
    options = {} as {
        buildDir: string;
        outputDir: string;
        copyPrivateConfigAppid?: boolean;
        copyPrivateConfigUrlCheck?: boolean;
        delFileTargets?: string[];
        minify?: boolean;
    }
): PluginOption {
    let _appid: string;
    let _urlCheck: boolean;
    const delFileTargets = options.delFileTargets ?? [];
    const assets = [] as Array<{ id: string; name: string }>;

    return {
        name: 'vite-plugin-youdeyiwu-mp',
        config: async (config) => {
            if (config.plugins == null || !options.buildDir || !options.outputDir) {
                return config;
            }

            const copyPrivateConfigAppid =
                options.copyPrivateConfigAppid === undefined
                    ? true
                    : options.copyPrivateConfigAppid;
            const copyPrivateConfigUrlCheck =
                options.copyPrivateConfigUrlCheck === undefined
                    ? false
                    : options.copyPrivateConfigUrlCheck;
            const buildPath = normalizePath(options.buildDir);
            const outputPath = normalizePath(options.outputDir);
            const buildParse = path.parse(buildPath);
            const outputParse = path.parse(outputPath);
            const buildDir = buildPath;
            const outputDir = outputPath;
            const files = glob.sync(`${buildDir}/**/*.ts`);
            const scsss = glob.sync(`${buildDir}/**/*.scss`);
            const wxmls = glob
                .sync(`${buildDir}/**/*.wxml`)
                .map((value) => `${value}?raw`);
            const configs = glob
                .sync(`${buildParse.dir}/project.config.json`)
                .map((value) => `${value}?raw`);
            const entry = [...files, ...scsss, ...wxmls, ...configs];
            if (entry.length === 0) {
                return config;
            }

            if (copyPrivateConfigAppid || copyPrivateConfigUrlCheck) {
                try {
                    const projectPrivateConfigJson = JSON.parse(
                        fs.readFileSync(
                            `${buildParse.dir}/project.private.config.json`,
                            'utf-8'
                        )
                    );
                    _appid = projectPrivateConfigJson.appid;
                    if (typeof projectPrivateConfigJson.setting === 'object') {
                        _urlCheck = projectPrivateConfigJson.setting.urlCheck;
                    }
                } catch (e) {
                }
            }

            return {
                ...config,
                build: {
                    ...config.build,
                    minify: options.minify === undefined ? true : options.minify,
                    target: ['esnext', 'ios11', 'chrome66'],
                    cssTarget: ['esnext', 'ios11', 'chrome66'],
                    reportCompressedSize: false,
                    rollupOptions: {
                        ...config.build?.rollupOptions,
                        input: entry,
                        output: {
                            dir: outputDir,
                            format: 'cjs',
                            entryFileNames: (chunkInfo) => {
                                const facadeModuleId = chunkInfo.facadeModuleId;
                                if (!chunkInfo.isEntry || !facadeModuleId) {
                                    throw new Error(facadeModuleId + 'Not Fount');
                                }
                                let ew;
                                if (facadeModuleId.endsWith('.ts')) {
                                    ew = 'js';
                                } else if (facadeModuleId.endsWith('.scss')) {
                                    ew = 'css';
                                } else if (facadeModuleId.includes('.wxml')) {
                                    ew = 'wxml.js';
                                } else if (facadeModuleId.includes('project.config.json')) {
                                    ew = 'project.config.json.js';
                                }
                                const slice = facadeModuleId.slice(
                                    facadeModuleId.indexOf(buildParse.name)
                                );
                                return ew
                                    ? slice.substring(0, slice.lastIndexOf('.') + 1) + ew
                                    : slice;
                            },
                        },
                        plugins: [
                            {
                                ...copy({
                                    hook: 'generateBundle',
                                    targets: [
                                        {
                                            src: buildParse.name,
                                            dest: outputParse.name,
                                        },
                                    ],
                                }),
                                ...del({
                                    hook: 'writeBundle',
                                    targets: [
                                        `${outputParse.name}/${buildParse.name}/**/*.ts`,
                                        `${outputParse.name}/${buildParse.name}/**/*.scss`,
                                        ...delFileTargets,
                                    ],
                                }),
                            },
                        ],
                    },
                },
            };
        },
        transform: async (_code, _id) => {
            if (_id.includes('.wxml')) {
                const file = fs.readFileSync(
                    _id.substring(0, _id.lastIndexOf('?raw')),
                    'utf-8'
                );
                const code = await htmlMinifierTerser.minify(file, {
                    caseSensitive: true,
                    collapseWhitespace: true,
                    keepClosingSlash: true,
                    removeComments: true,
                    removeRedundantAttributes: true,
                    removeScriptTypeAttributes: true,
                    removeStyleLinkTypeAttributes: true,
                    useShortDoctype: true,
                });
                return {
                    code: `console.log(\`'${code}'\`);`,
                    map: null,
                };
            } else if (_id.includes('project.config.json')) {
                return {
                    code: `console.log(\`${_code}\`);`,
                    map: null,
                };
            }
            return null;
        },
        generateBundle: (_options, _bundle) => {
            for (const bundle in _bundle) {
                const bundleElement = _bundle[bundle] as OutputChunk;
                if (bundleElement.type === 'chunk') {
                    if (bundle.endsWith('.wxml.js')) {
                        const fileName = bundleElement.fileName;
                        bundleElement.fileName = fileName.substring(
                            0,
                            fileName.lastIndexOf('.js')
                        );

                        const start = '"use strict";console.log(`\'';
                        let code = bundleElement.code.startsWith(start)
                            ? bundleElement.code.substring(start.length)
                            : bundleElement.code.substring(start.length + 1);
                        code = code.substring(0, code.length - "'`);".length - 1);
                        bundleElement.code = code.replace(/(\r\n|\n|\r)/gm, '');
                    } else if (
                        bundle.includes('project.config.json') &&
                        bundleElement.facadeModuleId
                    ) {
                        const fileName = bundleElement.fileName;
                        bundleElement.fileName = fileName.substring(
                            0,
                            fileName.lastIndexOf('.js')
                        );
                        const data = JSON.parse(
                            fs.readFileSync(
                                bundleElement.facadeModuleId.substring(
                                    0,
                                    bundleElement.facadeModuleId.length - 4
                                ),
                                'utf-8'
                            )
                        );
                        if (_appid) {
                            data.appid = _appid;
                        }
                        if (
                            _urlCheck !== undefined &&
                            _urlCheck !== null &&
                            typeof data.setting === 'object'
                        ) {
                            data.setting.urlCheck = _urlCheck;
                        }
                        bundleElement.code = JSON.stringify(data);
                    } else if (bundle.endsWith('.css')) {
                        assets.push({
                            id: [...(bundleElement.viteMetadata?.importedCss ?? [])][0],
                            name: bundleElement.fileName,
                        });
                    }
                } else if (bundleElement.type === 'asset') {
                    if (bundle.endsWith('.css')) {
                        const find = assets.find((item) => item.id === bundle);
                        if (find) {
                            bundleElement.fileName =
                                find.name.substring(0, find.name.lastIndexOf('css')) + 'wxss';
                        }
                    }
                }
            }
        },
    };
}