# vite-plugin-youdeyiwu-mp

vite-plugin-youdeyiwu-mp 尤得一物-小程序插件

使用 vite + typescript + sass 构建编译微信小程序

# 1. 相关

尤得一物-小程序 [youdeyiwu-mp](https://github.com/dafengzhen/youdeyiwu-mp)

# 2. 安装

- npm

```bash
npm install -D @youdeyiwu/vite-plugin-mp
```

- yarn

```bash
yarn add -D @youdeyiwu/vite-plugin-mp
```

# 3. 使用

- 编辑 vite.config.ts 文件添加插件

```typescript
import {defineConfig} from 'vite';
import path from "path";
import youdeyiwuMp from '@youdeyiwu/vite-plugin-mp';

export default defineConfig({
    plugins: [
        youdeyiwuMp({
            buildDir: path.resolve(__dirname, 'miniprogram'),
            outputDir: path.resolve(__dirname, 'dist')
        })
    ]
})
```

- 构建编译小程序

```bash
yarn build
```

![example](https://s1.ax1x.com/2023/02/04/pSyrhAU.png "example")

# 4. 配置

- buildDir 编译小程序的代码目录
- outputDir 输出编译小程序的代码目录

# 5. 其它

注意构建需要安装前置依赖

```bash
yarn add -D sass glob html-minifier-terser rollup-plugin-copy rollup-plugin-delete
```

# 6. License

[MIT](https://opensource.org/licenses/MIT)

