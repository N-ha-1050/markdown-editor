import rehypeKatex from "rehype-katex"
import rehypeStringify from "rehype-stringify"
import { remark } from "remark"
import remarkBreaks from "remark-breaks"
import remarkFrontmatter from "remark-frontmatter"
import remarkGfm from "remark-gfm"
import remarkGithub from "remark-github"
import remarkMath from "remark-math"
import remarkPresetLintConsistent from "remark-preset-lint-consistent"
import remarkPresetLintMarkdownStyleGuide from "remark-preset-lint-markdown-style-guide"
import remarkPresetLintRecommended from "remark-preset-lint-recommended"
import remarkRehype from "remark-rehype"
import remarkToc from "remark-toc"
import stripMarkdown from "strip-markdown"
import "katex/dist/katex.min.css"
import rehypeHighlight from "rehype-highlight"
import rehypeHighlightLines from "rehype-highlight-code-lines"
import rehypeMermaid from "rehype-mermaid"
import rehypePreLanguage from "rehype-pre-language"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeSlug from "rehype-slug"
import remarkCjkFriendly from "remark-cjk-friendly"
import remarkCjkFriendlyGfmStrikethrough from "remark-cjk-friendly-gfm-strikethrough"
import remarkCodeTitle from "remark-code-title"
import remarkDefinitionList, {
  defListHastHandlers,
} from "remark-definition-list"
import remarkFlexibleToc from "remark-flexible-toc"
import remarkHandlingYamlMatter from "./plugins/remark-handling-yaml-matter"
import remarkImageAttributes from "./plugins/remark-image-attributes"

const markMdastProcessor = remark()
  .use(remarkPresetLintRecommended)
  .use(remarkPresetLintConsistent)
  .use(remarkPresetLintMarkdownStyleGuide)
  .use(remarkFrontmatter)
  .use(remarkHandlingYamlMatter)
  .use(remarkGfm)
  .use(remarkGithub, {
    repository: "N-ha-1050/N-ha-1050",
  })
  .use(remarkToc, { heading: "目次", prefix: "user-content-" })
  .use(remarkBreaks)
  .use(remarkDefinitionList)
  .use(remarkCodeTitle)
  .use(remarkMath)
  .use(remarkCjkFriendly)
  .use(remarkCjkFriendlyGfmStrikethrough)
  .use(remarkFlexibleToc, { prefix: "user-content-" })
  .use(remarkImageAttributes)

export const markHastProcessor = markMdastProcessor()
  .use(remarkRehype, {
    handler: { ...defListHastHandlers },
    footnoteLabel: "脚注",
  })
  .use(rehypeSlug, { prefix: "user-content-" })
  .use(rehypePreLanguage, "data-language")
  .use(rehypeSanitize, {
    ...defaultSchema,
    attributes: {
      ...defaultSchema.attributes,
      // The `language-*` regex is allowed by default.
      code: [["className", /^language-./, "math-inline", "math-display"]],
      pre: [["data-language"]],
      div: [["className"]],
    },
    // プロトコル（スキーム）の許可リストに 'data' を追加
    protocols: {
      ...defaultSchema.protocols,
      src: [...(defaultSchema.protocols?.src || []), "data"],
    },
    clobberPrefix: "",
  })
  .use(rehypeKatex)
  .use(rehypeMermaid)
  .use(rehypeHighlight)
  .use(rehypeHighlightLines)
  .use(rehypeStringify)

export const markTextProcessor = markMdastProcessor().use(stripMarkdown)
