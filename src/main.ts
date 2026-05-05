import "./style.css"

import "@fontsource-variable/noto-sans/wght.css"
import "@fontsource-variable/noto-sans-jp/wght.css"
import "@fontsource-variable/noto-serif/wght.css"
import "@fontsource-variable/noto-serif-jp/wght.css"
import "@fontsource-variable/noto-sans-mono/wght.css"
import "@fontsource-variable/noto-emoji/wght.css"

import reporter from "vfile-reporter"
import { editor } from "./editor"
import { markHastProcessor, markTextProcessor } from "./markdown"
import { DragAndDropEventNames, debounce } from "./utils"

const editorDiv = document.getElementById("editor")

function setEditorDragAndDrop() {
  if (!editorDiv) return

  DragAndDropEventNames.forEach((eventName) => {
    editorDiv.addEventListener(
      eventName,
      (ev) => {
        ev.preventDefault()
        ev.stopPropagation()
      },
      false,
    )
  })

  editorDiv.addEventListener(
    "drop",
    (ev) => {
      const files = ev.dataTransfer?.files
      if (!files || files.length === 0) return

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (ev) => {
            const result = ev.target?.result
            if (typeof result !== "string") return

            const markdownImageSyntax = `\n![${file.name}](${result})\n`

            const cursorPosition = editor.getCursorPosition()
            editor.session.insert(cursorPosition, markdownImageSyntax)
          }
          reader.readAsDataURL(file)
        } else if (file.type.startsWith("text/")) {
          const reader = new FileReader()
          reader.onload = (ev) => {
            const result = ev.target?.result
            if (typeof result !== "string") return

            const markdownText = `\n${result}\n`

            const cursorPosition = editor.getCursorPosition()
            editor.session.insert(cursorPosition, markdownText)
          }
          reader.readAsText(file)
        }
      })
    },
    false,
  )
}

setEditorDragAndDrop()

const infoPositionButton = document.getElementById("info-position")
const dialogPositionDialog = document.getElementById("dialog-position")

const getInfoPositionText = () => {
  const position = editor.getCursorPosition()
  return `行: ${position.row + 1}, 列: ${position.column + 1}`
}

const handleInfoPositionButtonClick = () => {
  if (!(dialogPositionDialog instanceof HTMLDialogElement)) return
  dialogPositionDialog.showModal()
}

function setInfoPositionButton() {
  if (!infoPositionButton) return

  infoPositionButton.textContent = getInfoPositionText()
  infoPositionButton.addEventListener("click", handleInfoPositionButtonClick)
}

setInfoPositionButton()

function handleChangeCursor() {
  if (!infoPositionButton) return

  infoPositionButton.textContent = getInfoPositionText()
}

editor.session.selection.on("changeCursor", handleChangeCursor)

const handleDialogPositionDialogClose = () => {
  if (!(dialogPositionDialog instanceof HTMLDialogElement)) return

  const returnValue = dialogPositionDialog.returnValue

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

function setDialogPositionDialog() {
  if (!(dialogPositionDialog instanceof HTMLDialogElement)) return

  dialogPositionDialog.addEventListener(
    "close",
    handleDialogPositionDialogClose,
  )
}

setDialogPositionDialog()

const dialogPositionSubmitButton = document.getElementById(
  "dialog-position-submit",
)
const dialogPositionInput = document.getElementById("dialog-position-input")

const handleDialogPositionSubmitButtonClick = (ev: PointerEvent) => {
  if (!(dialogPositionDialog instanceof HTMLDialogElement)) return
  if (!(dialogPositionInput instanceof HTMLInputElement)) return

  ev.preventDefault()
  dialogPositionDialog.close(dialogPositionInput.value)
  dialogPositionInput.value = ""
}

function setDialogPositionSubmitButton() {
  if (!dialogPositionSubmitButton) return

  dialogPositionSubmitButton.addEventListener(
    "click",
    handleDialogPositionSubmitButtonClick,
  )
}

setDialogPositionSubmitButton()

const infoTabButton = document.getElementById("info-tab")
const dialogTabCheck = document.getElementById("dialog-tab-check")
const dialogTabInput = document.getElementById("dialog-tab-input")

const handleTabSizeChange = () => {
  if (!(infoTabButton instanceof HTMLButtonElement)) return
  if (!(dialogTabCheck instanceof HTMLInputElement)) return
  if (!(dialogTabInput instanceof HTMLInputElement)) return

  const tabSize = editor.session.getTabSize()
  const useSoftTabs = editor.session.getUseSoftTabs()
  infoTabButton.textContent = `${useSoftTabs ? "スペース" : "タブ"}: ${tabSize}`
  dialogTabInput.value = tabSize.toString()
  dialogTabCheck.checked = useSoftTabs
}
editor.session.on("changeTabSize", handleTabSizeChange)

const dialogTabDialog = document.getElementById("dialog-tab")

const handleDialogTabDialogClose = () => {
  if (!(dialogTabDialog instanceof HTMLDialogElement)) return
  if (!(dialogTabInput instanceof HTMLInputElement)) return
  if (!(dialogTabCheck instanceof HTMLInputElement)) return
  if (!(infoTabButton instanceof HTMLButtonElement)) return

  const returnValue = dialogTabDialog.returnValue

  if (!returnValue) {
    editor.focus()
    return
  }

  const [useSoftTabsValue, tabSizeValue] = returnValue.split(":")
  const useSoftTabs = useSoftTabsValue.trim() === "true"
  editor.session.setUseSoftTabs(useSoftTabs)

  const tabSize = parseInt(tabSizeValue.trim(), 10)
  if (!Number.isNaN(tabSize) && tabSize > 0) {
    editor.session.setTabSize(tabSize)
  }

  editor.focus()

  infoTabButton.textContent = `${useSoftTabs ? "スペース" : "タブ"}: ${tabSize}`
  dialogTabInput.value = tabSize.toString()
  dialogTabCheck.checked = useSoftTabs
}

function setDialogTabDialog() {
  if (!(dialogTabDialog instanceof HTMLDialogElement)) return

  dialogTabDialog.addEventListener("close", handleDialogTabDialogClose)
}

setDialogTabDialog()

const handleInfoTabButtonClick = () => {
  if (!(dialogTabDialog instanceof HTMLDialogElement)) return
  dialogTabDialog.showModal()
}

function setInfoTabButton() {
  if (!infoTabButton) return

  const tabSize = editor.session.getTabSize()
  const useSoftTabs = editor.session.getUseSoftTabs()
  infoTabButton.textContent = `${useSoftTabs ? "スペース" : "タブ"}: ${tabSize}`

  infoTabButton.addEventListener("click", handleInfoTabButtonClick)
}

setInfoTabButton()

function setDialogTabInput() {
  if (!(dialogTabInput instanceof HTMLInputElement)) return

  const tabSize = editor.session.getTabSize()
  dialogTabInput.value = tabSize.toString()
}

setDialogTabInput()

function setDialogTabCheck() {
  if (!(dialogTabCheck instanceof HTMLInputElement)) return

  const useSoftTabs = editor.session.getUseSoftTabs()
  dialogTabCheck.checked = useSoftTabs
}

setDialogTabCheck()

const dialogTabSubmitButton = document.getElementById("dialog-tab-submit")

const handleDialogTabSubmitButtonClick = (ev: PointerEvent) => {
  if (!(dialogTabDialog instanceof HTMLDialogElement)) return
  if (!(dialogTabInput instanceof HTMLInputElement)) return
  if (!(dialogTabCheck instanceof HTMLInputElement)) return

  ev.preventDefault()
  const useSoftTabs = dialogTabCheck.checked
  const tabSize = dialogTabInput.value
  dialogTabDialog.close(`${useSoftTabs}:${tabSize}`)
}

function setDialogTabSubmitButton() {
  if (!dialogTabSubmitButton) return

  dialogTabSubmitButton.addEventListener(
    "click",
    handleDialogTabSubmitButtonClick,
  )
}

setDialogTabSubmitButton()

const previewDiv = document.getElementById("preview")
const panelLintTextarea = document.getElementById("panel-lint")
const panelMetadataTextarea = document.getElementById("panel-metadata")
const panelPlaintextTextarea = document.getElementById("panel-plaintext")
const tocListDiv = document.getElementById("toc-list")

type TocItem = {
  value: string
  href: string
  depth: number
}

function isTocItem(item: unknown): item is TocItem {
  if (!item || typeof item !== "object") return false

  const candidate = item as Partial<TocItem>
  return (
    typeof candidate.value === "string" &&
    typeof candidate.href === "string" &&
    typeof candidate.depth === "number"
  )
}

function normalizeTocHref(href: string) {
  return href.startsWith("#") ? href : "#"
}

function buildTocDom(tocItems: unknown) {
  const fragment = document.createDocumentFragment()

  if (!Array.isArray(tocItems)) return fragment

  const validTocItems = tocItems.filter(isTocItem)
  if (validTocItems.length === 0) return fragment

  const rootList = document.createElement("ul")
  fragment.append(rootList)

  const listStack: HTMLUListElement[] = [rootList]

  validTocItems.forEach(({ value, href, depth }) => {
    const targetDepth = Math.max(1, Math.floor(depth))

    while (listStack.length < targetDepth) {
      const currentList = listStack[listStack.length - 1]
      let parentLi = currentList.lastElementChild

      if (!(parentLi instanceof HTMLLIElement)) {
        parentLi = document.createElement("li")
        currentList.append(parentLi)
      }

      const childList = document.createElement("ul")
      parentLi.append(childList)
      listStack.push(childList)
    }

    while (listStack.length > targetDepth) {
      listStack.pop()
    }

    const li = document.createElement("li")
    const anchor = document.createElement("a")

    anchor.textContent = value
    anchor.setAttribute("href", normalizeTocHref(href))

    li.append(anchor)
    listStack[listStack.length - 1].append(li)
  })

  return fragment
}

async function render() {
  if (!(previewDiv instanceof HTMLDivElement)) return
  if (!(panelLintTextarea instanceof HTMLTextAreaElement)) return
  if (!(panelMetadataTextarea instanceof HTMLTextAreaElement)) return
  if (!(panelPlaintextTextarea instanceof HTMLTextAreaElement)) return
  if (!(tocListDiv instanceof HTMLDivElement)) return

  const markdown = editor.getValue()
  const hast = await markHastProcessor.process(markdown)
  const textVFile = await markTextProcessor.process(markdown)
  const html = hast.toString()
  previewDiv.innerHTML = html
  panelLintTextarea.value = reporter(hast)
  panelMetadataTextarea.value = JSON.stringify(hast.data.matter, null, 2)
  panelPlaintextTextarea.value = textVFile.toString()
  tocListDiv.replaceChildren(buildTocDom(hast.data.toc))
}

const debouncedRender = debounce(render, 700)

editor.session.on("change", debouncedRender)
render()
