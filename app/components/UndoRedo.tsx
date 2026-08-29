import { useSlate } from 'slate-react'

export const Undo = () => {
  const editor = useSlate()
  return (
    <button
      onClick={() => editor.undo()}
      disabled={!editor.history.undos.length}
    >
      Undo
    </button>
  )
}

export const Redo = () => {
  const editor = useSlate()
  return (
    <button
      onClick={() => editor.redo()}
      disabled={!editor.history.redos.length}
    >
      Redo
    </button>
  )
}