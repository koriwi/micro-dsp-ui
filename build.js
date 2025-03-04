import { buildSync } from "esbuild";
import { readFileSync, rmSync, writeFileSync } from "fs";

buildSync({
  entryPoints: ["src/index.js"], // Your main JS file
  bundle: true,
  minify: true,
  treeShaking: true,
  format: "iife",
  outfile: "dist/script.js",
});

let html = readFileSync("src/index.html", "utf8");
let script = readFileSync("dist/script.js", "utf8");
let finalHtml = html.replace("</body>", `<script>${script}</script></body>`);

writeFileSync("dist/index.html", finalHtml);
rmSync("dist/script.js");
console.log("Build complete: dist/index.html");
