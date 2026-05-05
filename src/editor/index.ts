import ace, { type Editor } from "ace-builds"
import "ace-builds/src-noconflict/mode-markdown"
import "ace-builds/src-noconflict/theme-github"
import "ace-builds/src-noconflict/theme-github_dark"
import "ace-builds/src-noconflict/keybinding-vscode"

import highlightLightCss from "highlight.js/styles/github.min.css?raw"
import highlightDarkCss from "highlight.js/styles/github-dark.min.css?raw"
import { markHastProcessor } from "../markdown"
import { truncateWithEllipsis } from "../utils"

// テーマのダークモード対応
const media = window.matchMedia("(prefers-color-scheme: dark)")
const getEditorTheme = () =>
  media.matches ? "ace/theme/github_dark" : "ace/theme/github"
const styleElement = document.getElementById("highlight-style")
const importHighlightStyleCss = () => {
  if (!styleElement) return
  styleElement.textContent = media.matches
    ? highlightDarkCss
    : highlightLightCss
}

// Ace Editor のインスタンス
export const editor = ace.edit("editor", {
  mode: "ace/mode/markdown",
  useSoftTabs: true,
  keyboardHandler: "ace/keyboard/vscode",
  theme: getEditorTheme(),
})
importHighlightStyleCss()

// ダークモードの変更検出
const handleThemeChange = () => {
  const theme = getEditorTheme()
  editor.setTheme(theme)
  importHighlightStyleCss()
}

media.addEventListener("change", handleThemeChange)

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    media.removeEventListener("change", handleThemeChange)
  })
}

// コマンド
editor.commands.addCommands([
  {
    name: "saveLocalstorage",
    bindKey: { win: "Ctrl-S", mac: "Command-S" },
    exec: (editor: Editor) => {
      const localStorageContent = localStorage.getItem("content")
      const editorContent = editor.getValue()
      if (editorContent !== localStorageContent) {
        if (localStorageContent !== null) {
          const confirmResult = confirm(
            "ローカルストレージに内容を保存しようとしています。現在のローカルストレージの内容は上書きされますが続行しますか？\n\n現在のローカルストレージの内容:\n" +
              truncateWithEllipsis(localStorageContent),
          )
          if (!confirmResult) {
            return
          }
        }
        localStorage.setItem("content", editorContent)
        alert("内容をローカルストレージに保存しました。")
      }
    },
  },
  {
    name: "loadLocalstorage",
    bindKey: { win: "Ctrl-O", mac: "Command-O" },
    exec: (editor: Editor) => {
      const localStorageContent = localStorage.getItem("content")
      if (localStorageContent !== null) {
        const editorContent = editor.getValue()
        if (editorContent !== "" && editorContent !== localStorageContent) {
          const confirmResult = confirm(
            "ローカルストレージから内容を読み込もうとしています。現在の内容は失われますが続行しますか？\n\n現在のローカルストレージの内容:\n" +
              truncateWithEllipsis(localStorageContent),
          )
          if (!confirmResult) {
            return
          }
        }
        editor.setValue(localStorageContent, -1)
        alert("ローカルストレージから内容を読み込みました。")
      } else {
        alert("ローカルストレージに保存された内容が見つかりません。")
      }
    },
  },
  {
    name: "clearLocalstorage",
    bindKey: { win: "Ctrl-E", mac: "Command-E" },
    exec: () => {
      const localStorageContent = localStorage.getItem("content")
      if (localStorageContent !== null) {
        const confirmResult = confirm(
          "ローカルストレージの内容を削除しようとしています。現在のローカルストレージの内容は失われますが続行しますか？\n\n現在のローカルストレージの内容:\n" +
            truncateWithEllipsis(localStorageContent),
        )
        if (!confirmResult) {
          return
        }
        localStorage.removeItem("content")
        alert("ローカルストレージの内容を削除しました。")
      } else {
        alert("ローカルストレージに保存された内容が見つかりません。")
      }
    },
  },
  {
    name: "newFile",
    bindKey: { win: "Ctrl-M", mac: "Command-M" },
    exec: (editor: Editor) => {
      const editorContent = editor.getValue()
      if (editorContent !== "") {
        const confirmResult = confirm(
          "新しいファイルを作成しようとしています。現在の内容は失われますが続行しますか？",
        )
        if (!confirmResult) {
          return
        }
      }
      editor.setValue("", -1)
    },
  },
  {
    name: "saveFile",
    bindKey: { win: "Ctrl-Shift-S", mac: "Command-Shift-S" },
    exec: async (editor: Editor) => {
      const editorContent = editor.getValue()

      const blob = new Blob([editorContent], { type: "text/markdown" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const hast = await markHastProcessor.process(editorContent)
      const frontmatter = hast.data.matter as
        | Record<string, unknown>
        | undefined
      const title =
        frontmatter?.title && typeof frontmatter.title === "string"
          ? frontmatter.title
          : "untitled"
      a.href = url
      a.download = `${title}.md`
      a.click()
      URL.revokeObjectURL(url)
    },
  },
  {
    name: "loadFile",
    bindKey: { win: "Ctrl-Shift-O", mac: "Command-Shift-O" },
    exec: (editor: Editor) => {
      const input = document.createElement("input")
      input.type = "file"
      input.accept = ".md, .markdown, text/markdown, text/plain"
      input.onchange = (ev) => {
        const target = ev.target
        if (!(target instanceof HTMLInputElement)) return
        const files = target.files
        if (!files || files.length === 0) return
        const file = files[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (ev) => {
          const result = ev.target?.result
          if (typeof result === "string") {
            editor.setValue(result, -1)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    },
  },
])
