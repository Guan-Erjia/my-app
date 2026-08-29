import { Editor, Node } from 'slate'
import { useSlate } from 'slate-react'

export default function SideBar() {
    const editor = useSlate()
    const headers = Array.from(Editor.nodes(editor, {
        at: [],
        match: n => Node.isElement(n) && n.type === 'heading-one',
    }))

    return <div className="w-60 h-full overflow-y-auto shrink-0">
        {
            headers.map(([node, path]) => (
                <a className="text-black py-4 block" key={path.toString()} href={`#${node.index}`}>
                    {`第${node.index}集`}</a>
            ))
        }
    </div>
}