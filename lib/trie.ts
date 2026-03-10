export class TrieNode {
  children: Record<string, TrieNode>;
  isEndOfWord: boolean;

  constructor() {
    this.children = {};
    this.isEndOfWord = false;
  }
}

export interface VizNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  isHighlighted: boolean;
  children: VizNode[];
}

export class Trie {
  root: TrieNode;
  
  constructor() {
    this.root = new TrieNode();
  }

  insert(word: string): void {
    let current = this.root;
    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      if (!current.children[char]) {
        current.children[char] = new TrieNode();
      }
      current = current.children[char];
    }
    current.isEndOfWord = true;
  }

  search(prefix: string): string[] {
    let current = this.root;
    for (let i = 0; i < prefix.length; i++) {
      const char = prefix[i];
      if (!current.children[char]) {
        return [];
      }
      current = current.children[char];
    }

    const results: string[] = [];
    this.collectWords(current, prefix, results);
    return results;
  }

  private collectWords(node: TrieNode, prefix: string, results: string[]) {
    if (node.isEndOfWord) {
      results.push(prefix);
    }
    for (const char in node.children) {
      this.collectWords(node.children[char], prefix + char, results);
    }
  }

  // Visualizes the trie. The 'prefix' parameter is used to highlight nodes
  // that are part of the path described by the prefix.
  visualize(prefix: string = ""): VizNode {
    return this.visualizeNode(this.root, "", "root", prefix);
  }

  private visualizeNode(
    node: TrieNode,
    char: string,
    id: string,
    prefixToHighlight: string,
    currentPath: string = ""
  ): VizNode {
    // A node is highlighted if the current path is a prefix of the search prefix,
    // or if the search prefix is a prefix of the current path (i.e. we are inside the matched subtree).
    // Specifically, if the user types "a", then "a" is highlighted.
    // If the user types "ab", the root is highlighted (path ""), "a" is highlighted (path "a"), and "b" is highlighted (path "ab").
    let isHighlighted = false;
    
    if (prefixToHighlight.length > 0) {
      if (prefixToHighlight.startsWith(currentPath)) {
        isHighlighted = true;
      } else if (currentPath.startsWith(prefixToHighlight)) {
        // If we want to highlight all branches starting with the prefix:
        isHighlighted = true;
      }
    }

    const childrenList = Object.keys(node.children)
      .sort() // lexicographical sorting for visualization
      .map((childChar) =>
        this.visualizeNode(
          node.children[childChar],
          childChar,
          `${id}-${childChar}`,
          prefixToHighlight,
          currentPath + childChar
        )
      );

    return {
      id,
      char: char || "Root",
      isEndOfWord: node.isEndOfWord,
      isHighlighted,
      children: childrenList,
    };
  }
}

// Global instance for in-memory storage during dev/runtime.
declare global {
  // eslint-disable-next-line no-var
  var globalTrie: Trie | undefined;
}

export const getTrie = () => {
  if (!globalThis.globalTrie) {
    globalThis.globalTrie = new Trie();
    // Optional: add some initial words
    globalThis.globalTrie.insert("apple");
    globalThis.globalTrie.insert("app");
    globalThis.globalTrie.insert("banana");
    globalThis.globalTrie.insert("band");
    globalThis.globalTrie.insert("bandana");
  }
  return globalThis.globalTrie;
};
