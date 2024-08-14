import kleur from "kleur";
import { snapshotHeap, diffHeap } from "../tracers/heap.js";
import { runFlow } from "../tracers/flow-runner.js";

interface LeaksOptions {
  flow: string;
  runs: string;
}

export async function runLeaks({ flow, runs }: LeaksOptions): Promise<void> {
  const replayCount = Number(runs);
  console.log(kleur.cyan(`Detecting leaks in flow "${flow}" over ${replayCount} runs...`));

  const before = await snapshotHeap();

  for (let i = 0; i < replayCount; i++) {
    process.stdout.write(`  replay ${i + 1}/${replayCount}... `);
    await runFlow(flow);
    console.log(kleur.green("✓"));
  }

  // Force GC twice to settle
  await new Promise((r) => setTimeout(r, 1000));

  const after = await snapshotHeap();
  const diff = diffHeap(before, after);

  console.log("\n" + kleur.bold("Leak report:"));
  if (!diff.suspicious.length) {
    console.log(kleur.green("  ✓ No leaks detected"));
    return;
  }

  for (const leak of diff.suspicious) {
    console.log(
      `  ${kleur.red("⚠")} ${leak.constructor.padEnd(28)} ` +
        `${kleur.yellow(`+${leak.retainedKB}KB`)}  ${kleur.dim(`(${leak.count} instances)`)}`
    );
    if (leak.suggestedFix) console.log(`      ${kleur.dim("→ " + leak.suggestedFix)}`);
  }
}
