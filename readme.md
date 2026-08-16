---
title: "README"
author: "N_ha"
---

## (自分用)新規環境構築手順

0. プロジェクトディレクトリの作成と移動、Git の初期化

   `mkdir markdown-editor && cd markdown-editor && git init`

1. pnpm のインストール

   <https://pnpm.io/ja/installation>

   `pnpm -v` で確認

2. vite プロジェクトの作成

   <https://ja.vite.dev/guide/>

   `pnpm create vite .`

   - `Select a framework:` : `Vanilla`
   - `Select a variant:` : `TypeScript`
   - `Install with pnpm and start now?` : `Yes`

3. Lefthook のインストールと設定

   <https://lefthook.dev/installation/node/>

   `pnpm add -D lefthook`

   `pnpm-workspace.yaml` を作成して、以下の内容を追加

   ```yaml
   onlyBuiltDependencies:
     - lefthook
   ```

   `package.json` を編集
   - `pnpm.onlyBuiltDependencies` : `["lefthook"]`

4. Biome のインストールと設定

   <https://biomejs.dev/ja/guides/getting-started/>

   `pnpm add -D -E @biomejs/biome`

   `pnpx @biomejs/biome init`

   設定

   - 設定ファイル

     <https://biomejs.dev/ja/guides/configure-biome/>

     <https://biomejs.dev/ja/reference/configuration/>

     `biome.json` を編集
     - `formatter.indentStyle` : `space`
     - `javascript.formatter.semicolon` : `asNeeded`
     - `html.formatter.enabled` : `true`

   - VSCode 拡張機能

     <https://biomejs.dev/ja/reference/vscode/>

     `.vscode/settings.json` を作成して、以下の内容を追加

     ```json
     {
       "biome.enabled": true,
       "editor.formatOnSave": true,
       "editor.codeActionsOnSave": {
         "source.fixAll.biome": "explicit",
         "source.organizeImports.biome": "explicit"
       },
       "[typescript]": {
         "editor.defaultFormatter": "biomejs.biome"
       },
       "[typescriptreact]": {
         "editor.defaultFormatter": "biomejs.biome"
       },
       "[css]": {
         "editor.defaultFormatter": "biomejs.biome"
       },
       "[html]": {
         "editor.defaultFormatter": "biomejs.biome"
       },
       "[json]": {
         "editor.defaultFormatter": "biomejs.biome"
       }
     }
     ```

   - 継続的インテグレーション

     <https://biomejs.dev/ja/recipes/continuous-integration/>

     `.github/workflows/pull_request.yml` を作成して、以下の内容を追加

     ```yaml
     name: Code quality

     on:
       push:
       pull_request:

     jobs:
       quality:
         runs-on: ubuntu-latest
         permissions:
           contents: read
         steps:
           - name: Checkout
             uses: actions/checkout@v5
             with:
               persist-credentials: false
           - name: Setup Biome
             uses: biomejs/setup-biome@v2
             with:
               version: latest
           - name: Run Biome
             run: biome ci .
     ```

   - Git Hooks の設定

     <https://biomejs.dev/ja/recipes/git-hooks/>

     `lefthook.yml` を作成して、以下の内容を追加

     ```yaml
     pre-commit:
       commands:
         check:
           glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
           run: npx @biomejs/biome check --write --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {staged_files}
           stage_fixed: true
     pre-push:
       commands:
         check:
           glob: "*.{js,ts,cjs,mjs,d.cts,d.mts,jsx,tsx,json,jsonc}"
           run: npx @biomejs/biome check --no-errors-on-unmatched --files-ignore-unknown=true --colors=off {push_files}
     ```

     `pnpm lefthook install` を実行

5. GitHub Pages へのデプロイ設定

   <https://ja.vite.dev/guide/static-deploy#github-pages>

   `vite.config.ts` を作成して、以下の内容を追加

   ```ts
   import type { UserConfig } from 'vite'

   export default {
     base: "/"
   } satisfies UserConfig
   ```

   `.github/workflows/deploy.yml` を作成して、以下の内容を追加

   ```yaml
   # Simple workflow for deploying static content to GitHub Pages
   name: Deploy static content to Pages

   on:
     # Runs on pushes targeting the default branch
     push:
       branches: ['main']

     # Allows you to run this workflow manually from the Actions tab
     workflow_dispatch:

   # Sets the GITHUB_TOKEN permissions to allow deployment to GitHub Pages
   permissions:
     contents: read
     pages: write
     id-token: write

   # Allow one concurrent deployment
   concurrency:
     group: 'pages'
     cancel-in-progress: true

   jobs:
     # Single deploy job since we're just deploying
     deploy:
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v6
         - name: Install pnpm
           uses: pnpm/action-setup@v6
           with:
             version: 10
         - name: Set up Node
           uses: actions/setup-node@v6
           with:
             node-version: lts/*
             cache: 'pnpm'
         - name: Install dependencies
           run: pnpm install
         - name: Build
           run: pnpm build
         - name: Setup Pages
           uses: actions/configure-pages@v6
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v4
           with:
             # Upload dist folder
             path: './dist'
         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v5
   ```

6. Fontsource のインストールと設定

   <https://fontsource.org/docs/getting-started/install>

   `pnpm add @fontsource-variable/noto-sans`

   `pnpm add @fontsource-variable/noto-sans-jp`

   `pnpm add @fontsource-variable/noto-serif`

   `pnpm add @fontsource-variable/noto-serif-jp`

   `pnpm add @fontsource-variable/noto-sans-mono`

   `pnpm add @fontsource-variable/noto-emoji`

7. Monaco Editor のインストール

   <https://github.com/microsoft/monaco-editor>

   `pnpm add monaco-editor`

8. Remark 関連のインストール

   `pnpm add remark remark-rehype rehype-stringify @types/unist remark-frontmatter vfile vfile-matter strip-markdown remark-gfm remark-toc remark-preset-lint-consistent remark-preset-lint-markdown-style-guide remark-preset-lint-recommended vfile-reporter remark-github remark-breaks remark-math rehype-katex katex rehype-slug remark-definition-list remark-code-title remark-cjk-friendly remark-cjk-friendly-gfm-strikethrough remark-flexible-toc rehype-pre-language rehype-sanitize rehype-mermaid rehype-highlight rehype-highlight-code-lines highlight.js`

   - <https://github.com/remarkjs/remark>
   - <https://github.com/remarkjs/remark-rehype>
   - <https://github.com/rehypejs/rehype/tree/main/packages/rehype-stringify>
   - <https://github.com/syntax-tree/unist>
   - <https://github.com/remarkjs/remark-frontmatter>
   - <https://github.com/vfile/vfile>
   - <https://github.com/vfile/vfile-matter>
   - <https://github.com/remarkjs/strip-markdown>
   - <https://github.com/remarkjs/remark-gfm>
   - <https://github.com/remarkjs/remark-toc>
   - <https://github.com/remarkjs/remark-lint/tree/main/packages/remark-preset-lint-consistent>
   - <https://github.com/remarkjs/remark-lint/tree/main/packages/remark-preset-lint-markdown-style-guide>
   - <https://github.com/remarkjs/remark-lint/tree/main/packages/remark-preset-lint-recommended>
   - <https://github.com/vfile/vfile-reporter>
   - <https://github.com/remarkjs/remark-github>
   - <https://github.com/remarkjs/remark-breaks>
   - <https://github.com/remarkjs/remark-math/tree/main/packages/remark-math>
   - <https://github.com/remarkjs/remark-math/tree/main/packages/rehype-katex>
   - <https://katex.org/docs/node>
   - <https://github.com/rehypejs/rehype-slug>
   - <https://github.com/wataru-chocola/remark-definition-list>
   - <https://github.com/kevinzunigacuellar/remark-code-title>
   - <https://github.com/tats-u/markdown-cjk-friendly>
   - <https://github.com/tats-u/markdown-cjk-friendly/tree/main/packages/remark-cjk-friendly-gfm-strikethrough>
   - <https://github.com/tats-u/markdown-cjk-friendly/tree/main/packages/remark-cjk-friendly-gfm-strikethrough>
   - <https://github.com/ipikuka/remark-flexible-toc>
   - <https://github.com/ipikuka/rehype-pre-language>
   - <https://github.com/rehypejs/rehype-sanitize>
   - <https://github.com/remcohaszing/rehype-mermaid>
   - <https://github.com/rehypejs/rehype-highlight>
   - <https://github.com/ipikuka/rehype-highlight-code-lines>
