import fs from "fs/promises";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import autoprefixer from "autoprefixer";
import esbuild from "esbuild";
import { execSync } from "child_process";

async function build() {
  // Build JS
  await esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,
    minify: true,
    treeShaking: true,
    format: "iife",
    outfile: "dist/script.js",
  });

  // Process TailwindCSS
  execSync("npx tailwindcss -o dist/style.css --minify");
  const css = await fs.readFile("dist/style.css", "utf8");

  // Read HTML template
  let html = await fs.readFile("src/index.html", "utf8");

  // Inline JS and CSS
  let script = await fs.readFile("dist/script.js", "utf8");
  let finalHtml = html
    .replace("</head>", `<style>${css}</style></head>`)
    .replace("</body>", `<script>${script}</script></body>`);

  await fs.rm("dist", { recursive: true });
  await fs.mkdir("dist", { recursive: true });

  await fs.writeFile("dist/index.html", finalHtml);

  const info = await fs.stat("./dist/index.html");
  console.log(
    "✅ Build complete: dist/index.html",
    (info.size / 1024).toFixed(2) + "kB",
  );
}

build();
