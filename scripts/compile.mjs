import fs from "fs";
import path from "path";
import solc from "solc";

function findImports(importPath) {
  if (importPath.startsWith("@openzeppelin/")) {
    const fullPath = path.resolve("node_modules", importPath);
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, "utf8") };
    }
  }
  const localPath = path.resolve("contracts", importPath);
  if (fs.existsSync(localPath)) {
    return { contents: fs.readFileSync(localPath, "utf8") };
  }
  return { error: `File not found: ${importPath}` };
}

function compileContract(filename, contractName) {
  const contractSource = fs.readFileSync(path.resolve("contracts", filename), "utf8");
  const input = {
    language: "Solidity",
    sources: {
      [filename]: {
        content: contractSource,
      },
    },
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  if (output.errors) {
    const fatal = output.errors.filter((e) => e.severity === "error");
    if (fatal.length > 0) {
      console.error(`Errors compiling ${contractName}:`, fatal);
      process.exit(1);
    }
  }

  const compiled = output.contracts[filename][contractName];
  if (!compiled) {
    console.error(`Contract ${contractName} not found in output`);
    process.exit(1);
  }
  return {
    abi: compiled.abi,
    bytecode: "0x" + compiled.evm.bytecode.object,
  };
}

console.log("Compiling FazaBond.sol...");
const bond = compileContract("FazaBond.sol", "FazaBond");
console.log(`FazaBond bytecode length: ${bond.bytecode.length}`);

console.log("Compiling FazaOTC.sol...");
const otc = compileContract("FazaOTC.sol", "FazaOTC");
console.log(`FazaOTC bytecode length: ${otc.bytecode.length}`);

fs.mkdirSync("cache/compiled", { recursive: true });
fs.writeFileSync("cache/compiled/FazaBond.json", JSON.stringify(bond, null, 2));
fs.writeFileSync("cache/compiled/FazaOTC.json", JSON.stringify(otc, null, 2));
console.log("Compilation successful! Artifacts written to cache/compiled/");
