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

/**
 * タグ名とIDを指定して要素を取得し、型を自動推論する関数
 */
export function getTypedElementById<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  id: string,
): HTMLElementTagNameMap[K] | null {
  // 実行時は文字列として結合して検索
  return document.querySelector<HTMLElementTagNameMap[K]>(`${tagName}#${id}`)
}
