import { normalizeTitle, titleSimilarity } from "./similarity";

type Entry = {
  title: string;
  key: string;
};

/**
 * Group titles whose pairwise similarity meets `threshold`, following the
 * transitive closure of the relation (A~B and B~C puts A, B and C together).
 * Empty normalized titles are ignored, singletons are dropped, and the
 * original strings are returned.
 */
export function clusterTitles(titles: string[], threshold = 0.5): string[][] {
  const entries: Entry[] = [];
  for (const title of titles) {
    const key = normalizeTitle(title);
    if (key === "") continue;
    entries.push({ title, key });
  }

  // Union-find over the surviving entries.
  const parent = entries.map((_, index) => index);

  const find = (index: number): number => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    let current = index;
    while (parent[current] !== root) {
      const next = parent[current];
      parent[current] = root;
      current = next;
    }
    return root;
  };

  for (let i = 0; i < entries.length; i += 1) {
    for (let j = i + 1; j < entries.length; j += 1) {
      if (titleSimilarity(entries[i].title, entries[j].title) >= threshold) {
        const rootI = find(i);
        const rootJ = find(j);
        if (rootI !== rootJ) parent[rootJ] = rootI;
      }
    }
  }

  const groups = new Map<number, Entry[]>();
  entries.forEach((entry, index) => {
    const root = find(index);
    const group = groups.get(root);
    if (group) group.push(entry);
    else groups.set(root, [entry]);
  });

  const clusters: string[][] = [];
  for (const group of groups.values()) {
    if (group.length < 2) continue;
    group.sort((x, y) => {
      if (x.key !== y.key) return x.key < y.key ? -1 : 1;
      if (x.title !== y.title) return x.title < y.title ? -1 : 1;
      return 0;
    });
    clusters.push(group.map((entry) => entry.title));
  }

  clusters.sort((x, y) => {
    if (y.length !== x.length) return y.length - x.length;
    const xKey = normalizeTitle(x[0]);
    const yKey = normalizeTitle(y[0]);
    if (xKey === yKey) return 0;
    return xKey < yKey ? -1 : 1;
  });

  return clusters;
}
