export enum NodeColor {
  RED = "RED",
  BLACK = "BLACK",
}

export interface VizNode {
  id: string;
  char: string;
  isEndOfWord: boolean;
  isHighlighted: boolean;
  color: NodeColor;
  children: VizNode[];
}

class RBNode {
  char: string;
  color: NodeColor;
  isEndOfWord: boolean;
  left: RBNode | null = null;
  right: RBNode | null = null;
  parent: RBNode | null = null;
  childTree: RBTree | null = null;

  constructor(char: string) {
    this.char = char;
    this.color = NodeColor.RED;
    this.isEndOfWord = false;
  }
}

class RBTree {
  root: RBNode | null = null;

  insert(char: string): RBNode {
    const node = new RBNode(char);
    if (!this.root) {
      node.color = NodeColor.BLACK;
      this.root = node;
      return node;
    }

    let current: RBNode | null = this.root;
    let parent: RBNode | null = null;

    while (current !== null) {
      parent = current;
      if (char === current.char) {
        return current; // Узел с такой буквой уже есть на этом уровне
      } else if (char < current.char) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    node.parent = parent;
    if (parent !== null) {
      if (char < parent.char) {
        parent.left = node;
      } else {
        parent.right = node;
      }
    }

    this.fixInsert(node);
    return node;
  }

  search(char: string): RBNode | null {
    let current = this.root;
    while (current) {
      if (char === current.char) return current;
      if (char < current.char) current = current.left;
      else current = current.right;
    }
    return null;
  }

  private leftRotate(x: RBNode): void {
    const y = x.right;
    if (!y) return;
    x.right = y.left;
    if (y.left !== null) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === null) this.root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else x.parent.right = y;
    y.left = x;
    x.parent = y;
  }

  private rightRotate(y: RBNode): void {
    const x = y.left;
    if (!x) return;
    y.left = x.right;
    if (x.right !== null) x.right.parent = y;
    x.parent = y.parent;
    if (y.parent === null) this.root = x;
    else if (y === y.parent.right) y.parent.right = x;
    else y.parent.left = x;
    x.right = y;
    y.parent = x;
  }

  private fixInsert(k: RBNode): void {
    while (k.parent !== null && k.parent.color === NodeColor.RED) {
      if (k.parent.parent === null) break;

      if (k.parent === k.parent.parent.left) {
        const u = k.parent.parent.right;
        if (u !== null && u.color === NodeColor.RED) {
          k.parent.color = NodeColor.BLACK;
          u.color = NodeColor.BLACK;
          k.parent.parent.color = NodeColor.RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.right) {
            k = k.parent;
            this.leftRotate(k);
          }
          if (k.parent !== null) {
            k.parent.color = NodeColor.BLACK;
            if (k.parent.parent !== null) {
              k.parent.parent.color = NodeColor.RED;
              this.rightRotate(k.parent.parent);
            }
          }
        }
      } else {
        const u = k.parent.parent.left;
        if (u !== null && u.color === NodeColor.RED) {
          k.parent.color = NodeColor.BLACK;
          u.color = NodeColor.BLACK;
          k.parent.parent.color = NodeColor.RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.left) {
            k = k.parent;
            this.rightRotate(k);
          }
          if (k.parent !== null) {
            k.parent.color = NodeColor.BLACK;
            if (k.parent.parent !== null) {
              k.parent.parent.color = NodeColor.RED;
              this.leftRotate(k.parent.parent);
            }
          }
        }
      }
    }
    if (this.root) {
      this.root.color = NodeColor.BLACK;
    }
  }
}

export class Trie {
  rootTree: RBTree;

  constructor() {
    this.rootTree = new RBTree();
  }

  insert(word: string): void {
    if (!word) return;
    let currentTree = this.rootTree;
    let node: RBNode | null = null;

    for (let i = 0; i < word.length; i++) {
      const char = word[i];
      node = currentTree.insert(char);

      if (i < word.length - 1) {
        if (!node.childTree) {
          node.childTree = new RBTree();
        }
        currentTree = node.childTree;
      }
    }
    if (node) {
      node.isEndOfWord = true;
    }
  }

  search(prefix: string): string[] {
    let currentTree: RBTree | null = this.rootTree;
    let node: RBNode | null = null;

    for (let i = 0; i < prefix.length; i++) {
      if (!currentTree) return [];
      node = currentTree.search(prefix[i]);
      if (!node) return [];
      currentTree = node.childTree;
    }

    const results: string[] = [];
    if (node && node.isEndOfWord) {
      results.push(prefix);
    }
    
    if (node && node.childTree) {
      this.collectWords(node.childTree.root, prefix, results);
    }
    return results;
  }

  private collectWords(node: RBNode | null, prefix: string, results: string[]) {
    if (!node) return;
    
    this.collectWords(node.left, prefix, results);
    
    const currentPrefix = prefix + node.char;
    if (node.isEndOfWord) {
      results.push(currentPrefix);
    }
    if (node.childTree) {
      this.collectWords(node.childTree.root, currentPrefix, results);
    }
    
    this.collectWords(node.right, prefix, results);
  }

  visualize(prefix: string = ""): VizNode {
    return {
      id: "root",
      char: "*",
      isEndOfWord: false,
      isHighlighted: false,
      color: NodeColor.BLACK,
      children: this.rootTree.root ? [this.visualizeNode(this.rootTree.root, "r", prefix, "")] : []
    };
  }

  private visualizeNode(
    node: RBNode,
    id: string,
    prefixToHighlight: string,
    currentPath: string
  ): VizNode {
    // Вычисляем путь для подсветки, только если двигаемся "вглубь" слова (по центру)
    const newPath = currentPath + node.char;
    
    let isHighlighted = false;
    if (prefixToHighlight.length > 0) {
      if (prefixToHighlight.startsWith(newPath) || newPath.startsWith(prefixToHighlight)) {
        isHighlighted = true;
      }
    }

    const children: VizNode[] = [];
    
    if (node.left) {
      children.push(this.visualizeNode(node.left, `${id}-L`, prefixToHighlight, currentPath));
    }
    
    if (node.childTree && node.childTree.root) {
      children.push(this.visualizeNode(node.childTree.root, `${id}-M`, prefixToHighlight, newPath));
    }

    if (node.right) {
      children.push(this.visualizeNode(node.right, `${id}-R`, prefixToHighlight, currentPath));
    }

    return {
      id,
      char: node.char,
      isEndOfWord: node.isEndOfWord,
      isHighlighted,
      color: node.color,
      children,
    };
  }
}

declare global {
  // eslint-disable-next-line no-var
  var globalTrie: Trie | undefined;
}

export const getTrie = () => {
  if (!globalThis.globalTrie) {
    globalThis.globalTrie = new Trie();
  }
  return globalThis.globalTrie;
};