import kleur from "kleur";
import open from "open";

interface BundleOptions {
  platform: "ios" | "android";
  treemap?: boolean;
}

export async function runBundle(opts: BundleOptions): Promise<void> {
  console.log(kleur.cyan(`Analyzing Metro bundle for ${opts.platform}...`));
  // Implementation: invoke Metro CLI, parse the output, build a treemap
  if (opts.treemap) await open("./.rnperf/bundle-treemap.html");
}
