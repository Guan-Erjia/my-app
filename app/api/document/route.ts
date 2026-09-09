import { createEditor, type Operation } from "slate";
import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { initialValue } from "@/app/components/initValue";
import { withHistory } from "slate-history";

const DB_PATH = path.join(process.cwd(), "data", "document.json");

async function ensureDocument() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }

    // 第一次没有 document.json，使用初始值
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });

    await fs.writeFile(DB_PATH, JSON.stringify(initialValue, null, 2), "utf-8");

    return initialValue;
  }
}

export async function GET() {
  try {
    const document = await ensureDocument();

    return NextResponse.json(document);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const operations = (await request.json()) as Operation[];

    const document = await ensureDocument();

    const editor = withHistory(createEditor());
    editor.children = document;

    operations.forEach((operation) => {
      editor.apply(operation);
    });

    await fs.writeFile(
      DB_PATH,
      JSON.stringify(editor.children, null, 2),
      "utf-8",
    );

    return NextResponse.json(operations);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
