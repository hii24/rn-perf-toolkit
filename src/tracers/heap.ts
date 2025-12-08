export interface HeapSnapshot {
  takenAt: number;
  byConstructor: Map<string, { count: number; retainedKB: number }>;
}

export interface HeapDiff {
  suspicious: Array<{
    constructor: string;
    count: number;
    retainedKB: number;
    suggestedFix?: string;
  }>;
}

const SUSPECT_THRESHOLD_KB = 32;

export async function snapshotHeap(): Promise<HeapSnapshot> {
  // Real impl: bridge to Hermes heap snapshot or Chrome DevTools Protocol
  return { takenAt: Date.now(), byConstructor: new Map() };
}

export function diffHeap(before: HeapSnapshot, after: HeapSnapshot): HeapDiff {
  const suspicious: HeapDiff["suspicious"] = [];

  for (const [ctor, afterStats] of after.byConstructor) {
    const beforeStats = before.byConstructor.get(ctor);
    const grewBy = afterStats.retainedKB - (beforeStats?.retainedKB ?? 0);
    if (grewBy < SUSPECT_THRESHOLD_KB) continue;

    suspicious.push({
      constructor: ctor,
      count: afterStats.count - (beforeStats?.count ?? 0),
      retainedKB: grewBy,
      suggestedFix: SUGGESTED_FIXES[ctor],
    });
  }

  return { suspicious };
}

const SUGGESTED_FIXES: Record<string, string> = {
  EventEmitter: "Check unmount cleanup — listeners often outlive components",
  Image: "Verify FastImage cache config or call clearMemoryCache() periodically",
  HermesObject: "Generic — likely a closure capturing a large parent scope",
};
