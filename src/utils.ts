export const truncateWithEllipsis = (text: string, maxLength = 100) => {
  return text.substring(0, maxLength) + (text.length > maxLength ? "..." : "")
}

export function debounce<T extends unknown[]>(
  func: (...args: T) => void,
  timeout: number,
) {
  let timeoutId: number | undefined
  return (...args: T) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), timeout)
  }
}

export const DragAndDropEventNames = [
  "dragover",
  "drop",
] as const satisfies (keyof HTMLElementEventMap)[]
