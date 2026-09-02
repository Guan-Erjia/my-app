import { Editor, Node, Element } from 'slate'
import { useSlate } from 'slate-react'

export default function SideBar() {
    const editor = useSlate()
    const headers = Array.from(Editor.nodes(editor, {
        at: [],
        match: n => Node.isElement(n) && n.type === 'heading' && n.level === 1,
    }))

    return <div className="w-60 h-full overflow-y-auto shrink-0">
        {
            headers.map(([node, path], index) => {
                const stringified = Element.isElement(node) ? node.children.map(child => Node.string(child)).join('') : ''
                return (
                    <a className="text-black py-4 block" key={path.toString()} href={`#${stringified}`}>
                        {stringified}
                    </a>
                )
            })
        }
    </div>
}