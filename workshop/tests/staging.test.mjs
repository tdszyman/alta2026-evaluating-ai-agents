import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, access, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

test("staging publishes the report, all modules, prompts and fixtures under a Pages subpath", async () => {
  const directory = await mkdtemp(join(tmpdir(), "alta-workshop-test-"));
  try {
    const destination = join(directory, "alta2026-evaluating-ai-agents/hands-on/app");
    await mkdir(join(destination, "data"), { recursive: true });
    await writeFile(join(destination, "core.mjs"), "old advanced module");
    execFileSync("python3", [fileURLToPath(new URL("../../scripts/stage-workshop.py", import.meta.url)), destination]);
    for (const path of ["index.html", "app.js", "connection.mjs", "report.html", "styles.css", "advanced/index.html", "advanced/app.js", "advanced/core.mjs", "advanced/ui.mjs", "advanced/storage.mjs", "advanced/report.html", "advanced/report.js", "advanced/report.css", "advanced/styles.css", "advanced/data/scenarios.json", "advanced/prompts/judges.json"]) await access(join(destination, path));
    await assert.rejects(access(join(destination, "core.mjs")));
    await assert.rejects(access(join(destination, "data")));
    for (const file of ["index.html", "report.html", "advanced/index.html", "advanced/report.html"]) {
      const html = await readFile(join(destination, file), "utf8");
      for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
        const link = match[1];
        if (link.startsWith("data:") || link.startsWith("#") || link.startsWith("../") || link.includes("?")) continue;
        await access(join(destination, file.substring(0, file.lastIndexOf("/") + 1), link));
        assert.ok(!link.startsWith("/"), "Asset links must work under the Pages repository prefix");
      }
    }
    const fixtures = JSON.parse(await readFile(join(destination, "advanced/data/scenarios.json")));
    assert.equal(fixtures.scenarios.flatMap(scenario => scenario.cases).length, 10);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
