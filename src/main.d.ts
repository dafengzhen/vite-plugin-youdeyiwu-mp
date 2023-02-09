import { type PluginOption } from 'vite';
export default function YoudeyiwuMpVitePlugin(options?: {
    buildDir: string;
    outputDir: string;
    copyPrivateConfigAppid?: boolean | undefined;
    copyPrivateConfigUrlCheck?: boolean | undefined;
    delFileTargets?: string[] | undefined;
    minify?: boolean | undefined;
}): PluginOption;
