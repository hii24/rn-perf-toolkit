import kleur from "kleur";
import { traceTTI } from "../tracers/tti.js";
import { rankBundleContributors } from "../analyzers/bundle.js";
import { writeFile } from "node:fs/promises";

interface ColdStartOptions {
  device: string;
  runs: string;
  output?: string;
}

export async function runColdstart(opts: ColdStartOptions): Promise<void> {
  const runs = Number(opts.runs);
  console.log(kleur.cyan(`Running cold-start trace × ${runs} on "${opts.device}"...`));

  const samples = [];
  for (let i = 0; i < runs; i++) {
    process.stdout.write(`  run ${i + 1}/${runs}... `);
    const trace = await traceTTI({ device: opts.device });
    samples.push(trace);
    console.log(kleur.green(`${trace.tti}ms`));
  }

  const avg = average(samples);
  printColdStartReport(avg);

  if (opts.output) {
    await writeFile(opts.output, JSON.stringify({ samples, avg }, null, 2));
    console.log(kleur.dim(`\n  → wrote ${opts.output}`));
  }
}

function average(samples: Array<{ tti: number; phases: Record<string, number> }>) {
  const phases: Record<string, number> = {};
  let tti = 0;
  for (const s of samples) {
    tti += s.tti;
    for (const [k, v] of Object.entries(s.phases)) {
      phases[k] = (phases[k] ?? 0) + v;
    }
  }
  for (const k of Object.keys(phases)) phases[k] = Math.round(phases[k] / samples.length);
  return { tti: Math.round(tti / samples.length), phases };
}

function printColdStartReport(avg: { tti: number; phases: Record<string, number> }): void {
  console.log("\n" + kleur.bold("Cold start breakdown:"));
  const max = Math.max(...Object.values(avg.phases));
  for (const [phase, ms] of Object.entries(avg.phases)) {
    const bar = "█".repeat(Math.round((ms / max) * 30)).padEnd(30, "░");
    console.log(`  ${phase.padEnd(20)} ${kleur.cyan(bar)} ${ms}ms`);
  }
  console.log(kleur.bold(`  ${"TTI".padEnd(20)} ${"─".repeat(30)} ${avg.tti}ms\n`));

  const contributors = rankBundleContributors();
  if (contributors.length) {
    console.log(kleur.bold("Top JS-bundle contributors:"));
    contributors.slice(0, 5).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name.padEnd(28)} ${c.cost}ms ${c.note ?? ""}`);
    });
  }
}
