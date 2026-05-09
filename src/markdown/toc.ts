import type { TocItem } from "remark-flexible-toc"

function isTocItem(item: unknown): item is TocItem {
  if (!item || typeof item !== "object") return false

  const candidate = item as Partial<TocItem>
  const validDepth =
    candidate.depth === 1 ||
    candidate.depth === 2 ||
    candidate.depth === 3 ||
    candidate.depth === 4 ||
    candidate.depth === 5 ||
    candidate.depth === 6
  const validParent =
    candidate.parent === "root" ||
    candidate.parent === "blockquote" ||
    candidate.parent === "footnoteDefinition" ||
    candidate.parent === "listItem" ||
    candidate.parent === "container" ||
    candidate.parent === "mdxJsxFlowElement"

  return (
    typeof candidate.value === "string" &&
    typeof candidate.href === "string" &&
    validDepth &&
    Array.isArray(candidate.numbering) &&
    candidate.numbering.every((num) => typeof num === "number") &&
    validParent
  )
}

function normalizeTocHref(href: string) {
  return href.startsWith("#") ? href : "#"
}

export function buildTocDom(tocItems: unknown) {
  const fragment = document.createDocumentFragment()

  if (!Array.isArray(tocItems)) return fragment

  const validTocItems = tocItems.filter(isTocItem)
  if (validTocItems.length === 0) return fragment

  const rootList = document.createElement("ul")
  fragment.append(rootList)

  const listStack: HTMLUListElement[] = [rootList]

  validTocItems.forEach(({ value, href, depth }) => {
    while (listStack.length < depth) {
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

    while (listStack.length > depth) {
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
