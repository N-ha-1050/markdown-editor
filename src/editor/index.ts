import * as monaco from "monaco-editor"
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker"
import { commands } from "./commands"

self.MonacoEnvironment = { getWorker: () => new editorWorker() }

export const createMonacoEditor = (editorDiv: HTMLDivElement) => {
  const editor = monaco.editor.create(editorDiv, {
    language: "markdown",
    automaticLayout: true,
  })

  // コマンドの登録
  commands.forEach(({ keybinding, handler, id, label }) => {
    editor.addAction({
      id,
      label,
      keybindings: [keybinding],
      run: () => handler(editor),
    })
  })

  return editor
}
