#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const SOURCE_DIR = path.resolve(__dirname, "..");
const TARGETS = [
  { src: "agents/swarm-orchestrator.md", dest: ".claude/agents/swarm-orchestrator.md" },
  { src: "commands/swarm.md", dest: ".claude/commands/swarm.md" },
  { src: "rules/handoff-protocol.md", dest: ".claude/rules/handoff-protocol.md" },
];

function findProjectRoot(start) {
  let dir = start;
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "package.json")) && !dir.includes("node_modules")) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

function install() {
  const projectRoot = findProjectRoot(process.cwd());
  if (!projectRoot) {
    console.log("[swarm] No project root found — skipping auto-install.");
    console.log("[swarm] Run `swarm-install` manually from your project root.");
    return;
  }

  // Don't install into our own package
  const ownPkg = path.resolve(SOURCE_DIR, "package.json");
  const rootPkg = path.join(projectRoot, "package.json");
  if (fs.existsSync(ownPkg) && fs.existsSync(rootPkg)) {
    try {
      const own = JSON.parse(fs.readFileSync(ownPkg, "utf8"));
      const root = JSON.parse(fs.readFileSync(rootPkg, "utf8"));
      if (own.name === root.name) return;
    } catch {}
  }

  let installed = 0;
  for (const { src, dest } of TARGETS) {
    const srcPath = path.join(SOURCE_DIR, src);
    const destPath = path.join(projectRoot, dest);

    if (fs.existsSync(destPath)) {
      console.log(`[swarm] Exists, skipping: ${dest}`);
      continue;
    }

    const destDir = path.dirname(destPath);
    fs.mkdirSync(destDir, { recursive: true });
    fs.copyFileSync(srcPath, destPath);
    console.log(`[swarm] Installed: ${dest}`);
    installed++;
  }

  if (installed === 0) {
    console.log("[swarm] All files already present — nothing to do.");
  } else {
    console.log(`[swarm] Done — ${installed} file(s) installed into ${projectRoot}`);
    console.log("[swarm] Customize agents/swarm-orchestrator.md with your own agent roster.");
  }
}

install();
