import { createEditor, type Operation } from 'slate'
import { promises as fs } from 'fs'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { initialValue } from '@/app/components/initValue'
import { withHistory } from 'slate-history'

const DB_PATH = path.join(process.cwd(), 'data', 'document.json')

async function ensureDocument() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8')
        return JSON.parse(data)
    } catch (error: any) {
        if (error.code !== 'ENOENT') {
            throw error
        }

        // 第一次没有 document.json，使用初始值
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true })

        await fs.writeFile(
            DB_PATH,
            JSON.stringify(initialValue, null, 2),
            'utf-8'
        )

        return initialValue
    }
}

export async function GET() {
    try {
        const document = await ensureDocument()

        return NextResponse.json(document)
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const operations = await request.json() as Operation[]

        const document = await ensureDocument()

        const editor = withHistory(createEditor())
        editor.children = document

        for (const [index, operation] of operations.entries()) {
            try {
                console.log(`Applying operation ${index}:`)
                console.log(JSON.stringify(operation, null, 2))

                editor.apply(operation)
            } catch (error) {
                console.error(`❌ Failed at operation ${index}`)
                console.error(JSON.stringify(operation, null, 2))
                throw error
            }
        }
        for (const operation of operations) {
            editor.apply(operation)
        }

        await fs.writeFile(
            DB_PATH,
            JSON.stringify(editor.children, null, 2),
            'utf-8'
        )

        return NextResponse.json(editor.children)
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}