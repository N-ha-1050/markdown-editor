import "./styles/main.css"

import "@fontsource-variable/noto-sans/wght.css"
import "@fontsource-variable/noto-sans-jp/wght.css"
import "@fontsource-variable/noto-serif/wght.css"
import "@fontsource-variable/noto-serif-jp/wght.css"
import "@fontsource-variable/noto-sans-mono/wght.css"
import "@fontsource-variable/noto-emoji/wght.css"

import reporter from "vfile-reporter"
import { editor } from "./editor"
import {
  handleEditorDragoverAndDrop,
  handleEditorDrop,
} from "./editor/drag-and-drop"
import { getEditorTheme } from "./editor/theme"
import { markHastProcessor, markTextProcessor } from "./markdown"
import { getHighlightStyle } from "./markdown/highlight-style"
import { buildTocDom } from "./markdown/toc"
import { DragAndDropEventNames, debounce, getTypedElementById } from "./utils"

function setInfoPositionText(infoPositionButton: HTMLButtonElement) {
  const cursorPosition = editor.getCursorPosition()
  infoPositionButton.textContent = `行: ${cursorPosition.row + 1}, 列: ${
    cursorPosition.column + 1
  }`
}

function handleModalPositionDialogClose(ev: Event) {
  const dialog = ev.currentTarget
  if (!(dialog instanceof HTMLDialogElement)) return

  const returnValue = dialog.returnValue
  if (!returnValue) {
    editor.focus()
    return
  }

  const parts = returnValue
    .split(":")
    .map((value) => parseInt(value.trim(), 10) - 1)

  const row = parts[0] && !Number.isNaN(parts[0]) ? parts[0] : 0
  const column = parts[1] && !Number.isNaN(parts[1]) ? parts[1] : 0

  editor.gotoLine(row + 1, column, true)
  editor.focus()
}

function setInfoTabText(
  infoTabButton: HTMLButtonElement,
  dialogTabInput: HTMLInputElement,
  dialogCheckInput: HTMLInputElement,
) {
  const tabSize = editor.session.getTabSize()
  const useSoftTabs = editor.session.getUseSoftTabs()
  infoTabButton.textContent = `${useSoftTabs ? "スペース" : "タブ"}: ${tabSize}`
  dialogTabInput.value = tabSize.toString()
  dialogCheckInput.checked = useSoftTabs
}

function handleModalTabDialogClose(ev: Event) {
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
  editor.session.setUseSoftTabs(useSoftTabs)

  const tabSize = parseInt(tabSizeValue, 10)
  if (!Number.isNaN(tabSize) && tabSize > 0) {
    editor.session.setTabSize(tabSize)
  }

  editor.focus()
}

async function renderWithElements(
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

  // ドラッグアンドドロップ対応
  DragAndDropEventNames.forEach((eventName) => {
    editorDiv.addEventListener(eventName, handleEditorDragoverAndDrop)
  })
  editorDiv.addEventListener("drop", handleEditorDrop)

  // カーソル位置表示と移動
  setInfoPositionText(infoPositionButton)
  infoPositionButton.addEventListener("click", () =>
    modalPositionDialog.showModal(),
  )
  editor.session.selection.on("changeCursor", () => {
    setInfoPositionText(infoPositionButton)
  })
  modalPositionDialog.addEventListener("close", handleModalPositionDialogClose)
  modalPositionSubmitButton.addEventListener("click", (ev) => {
    ev.preventDefault()
    modalPositionDialog.close(modalPositionInput.value)
    modalPositionInput.value = ""
  })

  // インデント表示と設定
  setInfoTabText(infoTabButton, modalTabInput, modalTabCheckInput)
  editor.session.on("changeTabSize", () => {
    setInfoTabText(infoTabButton, modalTabInput, modalTabCheckInput)
  })
  infoTabButton.addEventListener("click", () => modalTabDialog.showModal())
  modalTabDialog.addEventListener("close", handleModalTabDialogClose)
  modalTabDialog.addEventListener("close", (ev) => {
    const dialog = ev.currentTarget
    if (!(dialog instanceof HTMLDialogElement)) return
    const returnValue = dialog.returnValue
    if (!returnValue) return
    setInfoTabText(infoTabButton, modalTabInput, modalTabCheckInput)
  })
  modalTabSubmitButton.addEventListener("click", (ev) => {
    ev.preventDefault()
    const useSoftTabs = modalTabCheckInput.checked
    const tabSize = modalTabInput.value
    modalTabDialog.close(`${useSoftTabs}:${tabSize}`)
  })

  // ダークモード対応
  const media = window.matchMedia("(prefers-color-scheme: dark)")
  const setTheme = (mediaMatch: boolean) => {
    editor.setTheme(getEditorTheme(mediaMatch))
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
      previewDiv,
      panelLintTextarea,
      panelMetadataTextarea,
      panelPlaintextTextarea,
      tocListDiv,
    )
  }
  const debouncedRender = debounce(render, 700)

  editor.session.on("change", debouncedRender)
  render()
}

main()
