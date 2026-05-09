import { editor } from "."

export function handleEditorDragoverAndDrop(ev: DragEvent) {
  ev.preventDefault()
  ev.stopPropagation()
}

export function handleEditorDrop(ev: DragEvent) {
  const files = ev.dataTransfer?.files
  if (!files) return
  Array.from(files).forEach((file) => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result !== "string") return

        const markdownImage = `\n![${file.name}](${result})\n`

        const cursorPosition = editor.getCursorPosition()
        editor.session.insert(cursorPosition, markdownImage)
      }
      reader.readAsDataURL(file)
    } else if (file.type.startsWith("text/")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result !== "string") return

        const markdownText = `\n${result}\n`

        const cursorPosition = editor.getCursorPosition()
        editor.session.insert(cursorPosition, markdownText)
      }
      reader.readAsText(file)
    }
  })
}
