'use client';
import { PointerEvent, useCallback, useMemo } from 'react'
import {
  Descendant,
  Editor,
  Node,
  Operation,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'
import {
  Editable,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  useSlate,
  withReact,
} from 'slate-react'
import { Button, Icon, } from './components/index'
import {
  CustomEditor,
  CustomElementType,
  CustomTextKey,
} from './components/custom-types.d'
import SideBar from './components/SideBar';
import { Redo, Undo } from './components/UndoRedo';


const toggleBlock = (editor: CustomEditor, format: CustomElementType) => {
  const isActive = isBlockActive(
    editor,
    format,
  )
  const newProperties = {
    type: isActive ? 'paragraph' : format,
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

}

const toggleMark = (editor: CustomEditor, format: CustomTextKey) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const isBlockActive = (
  editor: CustomEditor,
  format: CustomElementType,
) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (Node.isElement(n)) {
          return n.type === format
        }
        return false
      },
    })
  )

  return !!match
}

const isMarkActive = (editor: CustomEditor, format: CustomTextKey) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}


const BlockButton = ({ format, icon }: {
  format: CustomElementType
  icon: string
}) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
      )}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleBlock(editor, format)}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}


const MarkButton = ({ format, icon }: {
  format: CustomTextKey
  icon: string
}) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleMark(editor, format)}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}


const initialValue: Descendant[] = Array.from({ length: 30 }, (item, index) => ([
  {
    type: 'heading-one',
    children: [{ text: `Episode ${index + 1}: The Beginning` }],
    index: index + 1
  },
  {
    type: 'heading-two',
    children: [{ text: `sub title` }],
  },
  {
    type: 'paragraph',
    children: [
      {
        text: 'Emma arrives in a quiet coastal town, hoping to start a new life after leEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindEmma arrives in a quiet coastal town, hoping to start a new life after leaving the city behindaving the city behind.',
      },
    ],
  },
] as Descendant[])).flat()


export default function RichTextExample() {
  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      switch (element.type) {
        case 'heading-one':
          return (
            <h1 {...attributes} id={element.index + ''}>
              {children}
            </h1>
          )
        case 'heading-two':
          return (
            <h2   {...attributes}>
              {children}
            </h2>
          )
        default:
          return (
            <p   {...attributes}>
              {children}
            </p>
          )
      }
    },
    []
  )
  const renderLeaf = useCallback(
    ({ attributes, children, leaf }: RenderLeafProps) => {
      if (leaf.bold) {
        children = <strong>{children}</strong>
      }

      if (leaf.code) {
        children = <code>{children}</code>
      }

      if (leaf.italic) {
        children = <em>{children}</em>
      }

      if (leaf.underline) {
        children = <u>{children}</u>
      }

      return <span {...attributes}>{children}</span>
    },
    []
  )

  const editor = useMemo(() => withHistory(withReact(createEditor())), [])
  const operations: Operation[] = []
  let timer: ReturnType<typeof setTimeout>

  const { apply } = editor

  editor.apply = (operation) => {
    // Slate 立即执行
    apply(operation)

    // 不保存 selection
    if (operation.type === 'set_selection') return

    // 收集 operation
    operations.push(operation)

    // 防抖
    clearTimeout(timer)
    timer = setTimeout(() => {
      const batch = operations
      console.log('发送 Operations:', JSON.parse(JSON.stringify(batch)))
      operations.length = 0
    }, 4000)
  }


  return (
    <Slate editor={editor} initialValue={initialValue} >
      <div className="h-full flex">
        <SideBar />
        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b mb-5 flex items-center gap-4 border-gray-200 relative">
            <Undo />
            <Redo />
            <MarkButton format="bold" icon="format_bold" />
            <MarkButton format="italic" icon="format_italic" />
            <MarkButton format="underline" icon="format_underlined" />
            <BlockButton format="heading-one" icon="looks_one" />
            <BlockButton format="heading-two" icon="looks_two" />
          </div>
          <Editable
            className="min-h-0 p-4 grow overflow-y-auto"
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Enter some rich text…"
            spellCheck
            autoFocus
          />
        </div>
      </div>
    </Slate>
  )
}
