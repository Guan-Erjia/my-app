import { Descendant, Element, Text } from "slate";

import { unified } from 'unified'
import remarkParse from 'remark-parse'
import { rawMarkdown } from "./rawMarkdown";


function mdastToSlate(tree: any): Descendant[] {
  return tree.children.flatMap((node: any) => {
    if (node.type === 'paragraph') {
      return [
        {
          type: 'paragraph',
          children: node.children.map((child: any) => ({
            text: child.value ?? ''
          }))
        }
      ]
    }

    if (node.type === 'heading') {
      return [
        {
          type: 'heading',
          level: node.depth,
          children: node.children.map((child: any) => ({
            text: child.value ?? ''
          }))
        }
      ]
    }

    return []
  })
}

export const initialValue: Descendant[] = mdastToSlate(
  unified()
    .use(remarkParse)
    .parse(rawMarkdown)
)


