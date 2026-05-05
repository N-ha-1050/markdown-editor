import type { Data, Node } from "unist"

// 自作の画像属性抽出プラグイン
export default function remarkImageAttributes() {
  return (tree: Node) => {
    const visitWithParent = (
      node: Node,
      handler: (
        node: Node & {
          data?: Data & { hProperties?: Record<string, unknown> }
          alt?: string
        },
        parent: Node | null,
        index: number,
      ) => void,
    ) => {
      if (node.type === "image") handler(node, null, -1)
      if (
        node &&
        typeof node === "object" &&
        "children" in node &&
        Array.isArray(node.children)
      ) {
        node.children.forEach((child, index) => {
          if (child.type === "image") {
            handler(child, node, index)
          } else {
            visitWithParent(child, handler)
          }
        })
      }
    }

    visitWithParent(tree, (node, parent, index) => {
      let attributeString = null

      if (
        parent &&
        index >= 0 &&
        "children" in parent &&
        Array.isArray(parent.children)
      ) {
        const nextNode = parent.children[index + 1]
        if (nextNode && nextNode.type === "text") {
          const match = nextNode.value.match(/^\s*{([^}]+)}\s*/)
          if (match) {
            attributeString = match[1]
            nextNode.value = nextNode.value.slice(match[0].length)
            if (nextNode.value.length === 0) {
              parent.children.splice(index + 1, 1)
            }
          }
        }
      }

      if (attributeString) {
        const widthMatch = attributeString.match(/width\s*=\s*(\S+)/)
        const heightMatch = attributeString.match(/height\s*=\s*(\S+)/)

        if (widthMatch || heightMatch) {
          node.data = node.data || {}
          node.data.hProperties = node.data.hProperties || {}

          if (widthMatch) {
            node.data.hProperties.width = widthMatch[1]
          }
          if (heightMatch) {
            node.data.hProperties.height = heightMatch[1]
          }
          return
        }
      }

      const alt = "alt" in node && node.alt ? String(node.alt) : ""
      const widthMatch = alt.match(/width\s*:\s*(\S+)/)
      const heightMatch = alt.match(/height\s*:\s*(\S+)/)

      if (widthMatch || heightMatch) {
        node.data = node.data || {}
        node.data.hProperties = node.data.hProperties || {}

        if (widthMatch) {
          node.data.hProperties.width = widthMatch[1]
          node.alt = alt.replace(widthMatch[0], "").trim()
        }
        if (heightMatch) {
          node.data.hProperties.height = heightMatch[1]
          node.alt = alt.replace(heightMatch[0], "").trim()
        }
      }
    })
  }
}
