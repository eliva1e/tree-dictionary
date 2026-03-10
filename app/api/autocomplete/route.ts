import { NextRequest, NextResponse } from "next/server";
import { getTrie } from "@/lib/trie";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "";

  if (!prefix.trim()) {
    return NextResponse.json([]);
  }

  const trie = getTrie();
  const autocompleteResults = trie.search(prefix.trim().toLowerCase());

  return NextResponse.json(autocompleteResults);
}
