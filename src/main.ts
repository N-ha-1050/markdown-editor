import "./styles/main.css"

import "@fontsource-variable/noto-sans/wght.css"
import "@fontsource-variable/noto-sans-jp/wght.css"
import "@fontsource-variable/noto-serif/wght.css"
import "@fontsource-variable/noto-serif-jp/wght.css"
import "@fontsource-variable/noto-sans-mono/wght.css"
import "@fontsource-variable/noto-emoji/wght.css"

import "monaco-editor/esm/vs/nls/lang/ja.js"
import * as monaco from "monaco-editor"

import reporter from "vfile-reporter"
import { createMonacoEditor } from "./editor"
import {
  handleEditorDragoverAndDrop,
  handleEditorDrop,
} from "./editor/drag-and-drop"
import { getEditorTheme } from "./editor/theme"
import { markHastProcessor, markTextProcessor } from "./markdown"
import { getHighlightStyle } from "./markdown/highlight-style"
import { buildTocDom } from "./markdown/toc"
import { DragAndDropEventNames, debounce, getTypedElementById } from "./utils"

function setInfoPositionText(
  editor: monaco.editor.IStandaloneCodeEditor,
  infoPositionButton: HTMLButtonElement,
) {
  const cursorPosition = editor.getPosition()
  if (!cursorPosition) return
  infoPositionButton.textContent = `行: ${cursorPosition.lineNumber}, 列: ${cursorPosition.column}`
}

function handleModalPositionDialogClose(
  editor: monaco.editor.IStandaloneCodeEditor,
  ev: Event,
) {
  const dialog = ev.currentTarget
  if (!(dialog instanceof HTMLDialogElement)) return

  const returnValue = dialog.returnValue
  if (!returnValue) {
    editor.focus()
    return
  }

  const parts = returnValue
    .split(":")
    .map((value) => parseInt(value.trim(), 10))

  const validPosition = (value: unknown): number =>
    typeof value === "number" && !Number.isNaN(value) && value > 0 ? value : 1

  const position: monaco.IPosition = {
    lineNumber: validPosition(parts[0]),
    column: validPosition(parts[1]),
  }
  editor.setPosition(position)
  editor.revealPositionInCenterIfOutsideViewport(
    position,
    monaco.editor.ScrollType.Smooth,
  )
  editor.focus()
}

function setInfoTabText(
  editor: monaco.editor.IStandaloneCodeEditor,
  infoTabButton: HTMLButtonElement,
  dialogTabInput: HTMLInputElement,
  dialogCheckInput: HTMLInputElement,
) {
  const model = editor.getModel()
  if (!model) return

  const { tabSize, insertSpaces: useSoftTabs } = model.getOptions()

  infoTabButton.textContent = `${useSoftTabs ? "スペース" : "タブ"}: ${tabSize}`
  dialogTabInput.value = tabSize.toString()
  dialogCheckInput.checked = useSoftTabs
}

function handleModalTabDialogClose(
  editor: monaco.editor.IStandaloneCodeEditor,
  ev: Event,
) {
  const dialog = ev.currentTarget
  if (!(dialog instanceof HTMLDialogElement)) return

  const returnValue = dialog.returnValue
  if (!returnValue) {
    editor.focus()
    return
  }

  const [useSoftTabsValue, tabSizeValue] = returnValue
    .split(":")
    .map((value) => value.trim())

  const useSoftTabs = useSoftTabsValue === "true"
  const tabSize = parseInt(tabSizeValue, 10)

  const model = editor.getModel()
  if (!model) return

  if (!Number.isNaN(tabSize) && tabSize > 0) {
    model.updateOptions({ tabSize: tabSize, insertSpaces: useSoftTabs })
  } else {
    model.updateOptions({ insertSpaces: useSoftTabs })
  }

  editor.focus()
}

async function renderWithElements(
  editor: monaco.editor.IStandaloneCodeEditor,
  previewDiv: HTMLDivElement,
  panelLintTextarea: HTMLTextAreaElement,
  panelMetadataTextarea: HTMLTextAreaElement,
  panelPlaintextTextarea: HTMLTextAreaElement,
  tocListDiv: HTMLDivElement,
) {
  const markdown = editor.getValue()

  const hast = await markHastProcessor.process(markdown)
  const textVFile = await markTextProcessor.process(markdown)

  const html = hast.toString()
  const text = textVFile.toString()

  previewDiv.innerHTML = html
  panelLintTextarea.value = reporter(hast)
  panelMetadataTextarea.value = JSON.stringify(hast.data.matter, null, 2)
  panelPlaintextTextarea.value = text
  tocListDiv.replaceChildren(buildTocDom(hast.data.toc))
}

function main() {
  const editorDiv = getTypedElementById("div", "editor")
  if (!editorDiv) return

  const infoPositionButton = getTypedElementById("button", "info-position")
  if (!infoPositionButton) return
  const modalPositionDialog = getTypedElementById("dialog", "modal-position")
  if (!modalPositionDialog) return
  const modalPositionSubmitButton = getTypedElementById(
    "button",
    "modal-position-submit",
  )
  if (!modalPositionSubmitButton) return
  const modalPositionInput = getTypedElementById(
    "input",
    "modal-position-input",
  )
  if (!modalPositionInput) return

  const infoTabButton = getTypedElementById("button", "info-tab")
  if (!infoTabButton) return
  const modalTabDialog = getTypedElementById("dialog", "modal-tab")
  if (!modalTabDialog) return
  const modalTabSubmitButton = getTypedElementById("button", "modal-tab-submit")
  if (!modalTabSubmitButton) return
  const modalTabInput = getTypedElementById("input", "modal-tab-input")
  if (!modalTabInput) return
  const modalTabCheckInput = getTypedElementById("input", "modal-tab-check")
  if (!modalTabCheckInput) return

  const previewDiv = getTypedElementById("div", "preview")
  if (!previewDiv) return
  const panelLintTextarea = getTypedElementById("textarea", "panel-lint")
  if (!panelLintTextarea) return
  const panelMetadataTextarea = getTypedElementById(
    "textarea",
    "panel-metadata",
  )
  if (!panelMetadataTextarea) return
  const panelPlaintextTextarea = getTypedElementById(
    "textarea",
    "panel-plaintext",
  )
  if (!panelPlaintextTextarea) return
  const tocListDiv = getTypedElementById("div", "toc-list")
  if (!tocListDiv) return

  const highlightStyle = getTypedElementById("style", "highlight-style")
  if (!highlightStyle) return

  // エディタの初期化
  const editor = createMonacoEditor(editorDiv)

  // ドラッグアンドドロップ対応
  DragAndDropEventNames.forEach((eventName) => {
    editorDiv.addEventListener(eventName, handleEditorDragoverAndDrop)
  })
  editorDiv.addEventListener("drop", (ev: DragEvent) =>
    handleEditorDrop(editor, ev),
  )

  // カーソル位置表示と移動
  setInfoPositionText(editor, infoPositionButton)
  infoPositionButton.addEventListener("click", () =>
    modalPositionDialog.showModal(),
  )
  editor.onDidChangeCursorPosition(() =>
    setInfoPositionText(editor, infoPositionButton),
  )
  modalPositionDialog.addEventListener("close", (ev: Event) =>
    handleModalPositionDialogClose(editor, ev),
  )
  modalPositionSubmitButton.addEventListener("click", (ev) => {
    ev.preventDefault()
    modalPositionDialog.close(modalPositionInput.value)
    modalPositionInput.value = ""
  })

  // インデント表示と設定
  setInfoTabText(editor, infoTabButton, modalTabInput, modalTabCheckInput)
  editor.onDidChangeModelOptions(() =>
    setInfoTabText(editor, infoTabButton, modalTabInput, modalTabCheckInput),
  )
  infoTabButton.addEventListener("click", () => modalTabDialog.showModal())
  modalTabDialog.addEventListener("close", (ev: Event) =>
    handleModalTabDialogClose(editor, ev),
  )
  modalTabSubmitButton.addEventListener("click", (ev) => {
    ev.preventDefault()
    const useSoftTabs = modalTabCheckInput.checked
    const tabSize = modalTabInput.value
    modalTabDialog.close(`${useSoftTabs}:${tabSize}`)
  })

  // ダークモード対応
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const setTheme = (mediaMatch: boolean) => {
    monaco.editor.setTheme(getEditorTheme(mediaMatch))
    highlightStyle.textContent = getHighlightStyle(mediaMatch)
  }
  setTheme(media.matches)
  const handleThemeChange = (ev: MediaQueryListEvent) => setTheme(ev.matches)
  media.addEventListener("change", handleThemeChange)

  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      media.removeEventListener("change", handleThemeChange)
    })
  }

  // レンダリング
  const render = () => {
    renderWithElements(
      editor,
      previewDiv,
      panelLintTextarea,
      panelMetadataTextarea,
      panelPlaintextTextarea,
      tocListDiv,
    )
  }
  const debouncedRender = debounce(render, 700)

  editor.onDidChangeModelContent(debouncedRender)
  render()
}

main()
