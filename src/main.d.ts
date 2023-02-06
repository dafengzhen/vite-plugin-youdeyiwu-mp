import { type PluginOption } from 'vite';
export default function YoudeyiwuMpVitePlugin(options?: {
    buildDir: string;
    outputDir: string;
    copyPrivateConfigAppid?: boolean | undefined;
    minify?: boolean | undefined;
}): PluginOption;
