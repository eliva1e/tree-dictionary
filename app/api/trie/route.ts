import { NextRequest, NextResponse } from "next/server";
import { getTrie } from "@/lib/trie";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "";

  const trie = getTrie();
  // Get visualization structure of the trie, highlighting paths that match the prefix
  const visualization = trie.visualize(prefix);

  return NextResponse.json(visualization);
}

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json();
    if (typeof word !== "string" || word.trim() === "") {
      return NextResponse.json(
        { error: "Invalid word" },
        { status: 400 }
      );
    }

    const trie = getTrie();
    trie.insert(word.trim().toLowerCase());

    return NextResponse.json({ success: true, word });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
