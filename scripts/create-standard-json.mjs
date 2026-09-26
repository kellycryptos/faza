import fs from "fs";
import path from "path";

function collectSources(contractFile) {
  const sources = {};
  const queue = [contractFile];
  const visited = new Set();

  while (queue.length > 0) {
    const file = queue.shift();
    if (visited.has(file)) continue;
    visited.add(file);

    let filePath;
    if (file.startsWith("@openzeppelin/")) {
      filePath = path.resolve("node_modules", file);
    } else {
      filePath = path.resolve("contracts", file);
    }

    if (!fs.existsSync(filePath)) {
      console.warn("File not found:", filePath);
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    sources[file] = { content };

    // find imports
    const importRegex = /import\s+(?:(?:\{[^}]*\}|[\w*]+(?:\s+as\s+[\w*]+)?)\s+from\s+)?["']([^"']+)["'];/g;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imp = match[1];
      let resolved;
      if (imp.startsWith("@openzeppelin/")) {
        resolved = imp;
      } else if (imp.startsWith(".")) {
        resolved = path.join(path.dirname(file), imp).replace(/\\/g, "/");
      } else {
        resolved = imp;
      }
      if (!visited.has(resolved)) {
        queue.push(resolved);
      }
    }
  }

  return sources;
}

function makeStandardJson(contractFile) {
  const sources = collectSources(contractFile);
  return {
    language: "Solidity",
    sources,
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode", "evm.deployedBytecode"],
        },
      },
    },
  };
}

fs.mkdirSync("cache/verification", { recursive: true });

const bondJson = makeStandardJson("FazaBond.sol");
fs.writeFileSync(
  "cache/verification/FazaBond-standard-input.json",
  JSON.stringify(bondJson, null, 2)
);
console.log("Created cache/verification/FazaBond-standard-input.json");

const otcJson = makeStandardJson("FazaOTC.sol");
fs.writeFileSync(
  "cache/verification/FazaOTC-standard-input.json",
  JSON.stringify(otcJson, null, 2)
);
console.log("Created cache/verification/FazaOTC-standard-input.json");
