#!/usr/bin/env node
import { Command } from "commander";
import kleur from "kleur";
import { runColdstart } from "./commands/coldstart.js";
import { runProfile } from "./commands/profile.js";
import { runLeaks } from "./commands/leaks.js";
import { runBundle } from "./commands/bundle.js";

const program = new Command();

program
  .name("rnperf")
  .description("React Native performance toolkit")
  .version("0.5.0");

program
  .command("coldstart")
  .description("Measure TTI from cold launch with frame-level breakdown")
  .option("-d, --device <name>", "device name", "default")
  .option("-r, --runs <count>", "number of runs to average", "5")
  .option("-o, --output <path>", "JSON output path")
  .action(runColdstart);

program
  .command("profile")
  .description("Record JS thread, native thread, and frame drops")
  .option("-d, --duration <secs>", "profile duration", "10s")
  .option("--flame", "render flame graph SVG")
  .action(runProfile);

program
  .command("leaks")
  .description("Detect memory leaks by replaying a flow N times")
  .requiredOption("-f, --flow <path>", "flow definition file")
  .option("-r, --runs <count>", "replay count", "10")
  .action(runLeaks);

program
  .command("bundle")
  .description("Analyze Metro bundle composition")
  .option("--platform <ios|android>", "target platform", "ios")
  .option("--treemap", "open treemap visualization")
  .action(runBundle);

program.parseAsync().catch((err) => {
  console.error(kleur.red(`✖ ${err.message}`));
  process.exit(1);
});
