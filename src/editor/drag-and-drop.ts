import type * as monaco from "monaco-editor"

export function handleEditorDragoverAndDrop(ev: DragEvent) {
  ev.preventDefault()
  ev.stopPropagation()
}

function editorInsertText(
  editor: monaco.editor.IStandaloneCodeEditor,
  text: string,
) {
  const cursorPosition = editor.getPosition()
  if (!cursorPosition) return
  const model = editor.getModel()
  if (!model) return

  // Apply edit via Monaco editor API to preserve undo/redo and selection.
  const range = {
    startLineNumber: cursorPosition.lineNumber,
    startColumn: cursorPosition.column,
    endLineNumber: cursorPosition.lineNumber,
    endColumn: cursorPosition.column,
  }

  editor.pushUndoStop()
  editor.executeEdits("drop", [{ range, text, forceMoveMarkers: true }])
  editor.pushUndoStop()
}

export function handleEditorDrop(
  editor: monaco.editor.IStandaloneCodeEditor,
  ev: DragEvent,
) {
  const files = ev.dataTransfer?.files
  if (!files) return
  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result !== "string") return

        const markdownImage = `\n![${file.name}](${result})\n`

        editorInsertText(editor, markdownImage)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result !== "string") return

        const markdownText = `\n${result}\n`

        editorInsertText(editor, markdownText)
      }
      reader.readAsText(file)
    }
  })
}
