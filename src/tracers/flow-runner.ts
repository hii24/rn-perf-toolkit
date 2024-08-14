/**
 * Replays a flow file (sequence of UI actions) for leak detection.
 * Flow file is a TypeScript module exporting a default async function.
 */
export async function runFlow(flowPath: string): Promise<void> {
  const mod = await import(flowPath);
  if (typeof mod.default !== "function") {
    throw new Error(`flow ${flowPath} must export a default async function`);
  }
  await mod.default();
}
