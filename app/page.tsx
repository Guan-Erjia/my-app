'use client';
import { createElement, PointerEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Descendant,
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

const renderElement = ({ attributes, children, element }: RenderElementProps) => {
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
    default:
      return (
        <p   {...attributes}>
          {children}
        </p>
      )
  }
}
const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
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
}

export default function RichTextExample() {

  const [initialValue, setInitialValue] = useState<Descendant[] | null>(null)

  const operationsRef = useRef<Operation[]>([])
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useMemo(() => {
    const editor = withHistory(withReact(createEditor()))

    const { apply } = editor

    editor.apply = (operation) => {
      apply(operation)

      operationsRef.current.push(operation)

      // 防抖
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }

      timerRef.current = setTimeout(async () => {
        const batch = operationsRef.current

        if (!batch.length) {
          return
        }

        // 先清空，避免请求期间又产生操作
        operationsRef.current = []

        console.log(
          '发送 Operations:',
          JSON.parse(JSON.stringify(batch))
        )

        try {
          const response = await fetch('/api/document', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(batch),
          })

          if (!response.ok) {
            throw new Error('Failed to save document')
          }

          const document = await response.json()

          console.log('服务端最新文档:', document)
        } catch (error) {
          console.error('保存失败:', error)

          // 如果你希望失败后重试
          operationsRef.current.unshift(...batch)
        }
      }, 1000)
    }

    return editor
  }, [])

  // 获取服务端文档
  useEffect(() => {
    fetch('/api/document')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load document')
        }

        return response.json()
      })
      .then(document => {
        setInitialValue(document)
      })
      .catch(error => {
        console.error('加载文档失败:', error)
      })
  }, [])

  if (!initialValue) {
    return <div>Loading...</div>
  }

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
    >
      <div className="h-full flex">
        <SideBar />

        <div className="h-full flex flex-col">
          <div className="px-6 py-4 border-b mb-5 flex items-center gap-4 border-gray-200 relative">
            <Undo />
            <Redo />

            <MarkButton
              format="bold"
              icon="format_bold"
            />

            <MarkButton
              format="italic"
              icon="format_italic"
            />

            <MarkButton
              format="underline"
              icon="format_underlined"
            />

            <BlockButton
              format="heading"
              level={1}
              icon="looks_one"
            />

            <BlockButton
              format="heading"
              level={2}
              icon="looks_two"
            />
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