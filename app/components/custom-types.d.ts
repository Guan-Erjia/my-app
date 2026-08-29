import { Descendant, BaseEditor, BaseRange, Range, Element } from 'slate'
import { ReactEditor } from 'slate-react'
import { HistoryEditor } from 'slate-history'


export type HeadingElement = {
  type: 'heading-one'
  children: Descendant[]
  index: number
}

export type HeadingTwoElement = {
  type: 'heading-two'
  children: Descendant[]
}

export type ParagraphElement = {
  type: 'paragraph'
  children: Descendant[]
}


export type CustomElement = HeadingElement | HeadingTwoElement | ParagraphElement


export type CustomElementType = CustomElement['type']

export type CustomText = {
  bold?: boolean
  italic?: boolean
  code?: boolean
  underline?: boolean
  strikethrough?: boolean
  underlined?: boolean
  blockquote?: boolean
  text: string
}

export type CustomTextKey = keyof Omit<CustomText, 'text'>


export type CustomEditor = BaseEditor &
  ReactEditor &
  HistoryEditor

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor
    Element: CustomElement
    Text: CustomText
    Range: BaseRange & {
      [key: string]: unknown
    }
  }
}