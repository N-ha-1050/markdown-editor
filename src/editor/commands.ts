import * as monaco from "monaco-editor"
import { markHastProcessor } from "../markdown"
import { truncateWithEllipsis } from "../utils"

// コマンド
export const commands: {
  id: string
  label: string
  keybinding: number
  handler: (editor: monaco.editor.ICodeEditor) => void
}[] = [
  {
    id: "saveLocalstorage",
    label: "Save to LocalStorage",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
    handler: (editor: monaco.editor.ICodeEditor) => {
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
    id: "loadLocalstorage",
    label: "Load from LocalStorage",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyO,
    handler: (editor: monaco.editor.ICodeEditor) => {
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
        editor.setValue(localStorageContent)
        alert("ローカルストレージから内容を読み込みました。")
      } else {
        alert("ローカルストレージに保存された内容が見つかりません。")
      }
    },
  },
  {
    id: "clearLocalstorage",
    label: "Clear LocalStorage",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE,
    handler: () => {
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
    id: "newFile",
    label: "Create New File",
    keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM,
    handler: (editor: monaco.editor.ICodeEditor) => {
      const editorContent = editor.getValue()
      if (editorContent !== "") {
        const confirmResult = confirm(
          "新しいファイルを作成しようとしています。現在の内容は失われますが続行しますか？",
        )
        if (!confirmResult) {
          return
        }
      }
      editor.setValue("")
    },
  },
  {
    id: "saveFile",
    label: "Save File",
    keybinding:
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyS,
    handler: async (editor: monaco.editor.ICodeEditor) => {
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
    id: "loadFile",
    label: "Load File",
    keybinding:
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyO,
    handler: (editor: monaco.editor.ICodeEditor) => {
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
            editor.setValue(result)
          }
        }
        reader.readAsText(file)
      }
      input.click()
    },
  },
]
