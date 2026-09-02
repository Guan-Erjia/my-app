'use client';
import { createElement, PointerEvent, useCallback, useMemo } from 'react'
import {
  Editor,
  Node,
  Operation,
  Path,
  Element as SlateElement,
  Transforms,
  createEditor,
} from 'slate'
import { withHistory } from 'slate-history'
import {
  Editable,
  ReactEditor,
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
import { initialValue } from './components/initValue';
import { DOMEditor } from 'slate-dom';


const toggleBlock = (editor: CustomEditor, format: CustomElementType, level?: number) => {
  const isActive = isBlockActive(
    editor,
    format,
    level
  )
  const newProperties = {
    type: isActive ? 'paragraph' : format,
    ...(level !== undefined ? { level } : {}),
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
  level?: number
) => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n => {
        if (Node.isElement(n)) {
          if (n.type === 'heading') {
            return n.type === format && (level === undefined || 'level' in n && n.level === level)
          } else {
            return n.type === format
          }
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


const BlockButton = ({ format, icon, level }: {
  format: CustomElementType
  icon: string,
  level?: number
}) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        level
      )}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) =>
        event.preventDefault()
      }
      onClick={() => toggleBlock(editor, format, level)}
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

export default function RichTextExample() {
  const renderElement = useCallback(
    ({ attributes, children, element }: RenderElementProps) => {
      switch (element.type) {
        case 'heading':

          return createElement(
            `h${element.level}`,
            {
              ...attributes,
              id: element.children.map(child => Node.string(child)).join(''),
            },
            children
          )
        case 'paragraph':
          return (
            <p {...attributes}>
              {children}
            </p>
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
            <BlockButton format="heading" level={1} icon="looks_one" />
            <BlockButton format="heading" level={2} icon="looks_two" />
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
