/**
 * Writes every file in the brand manifest from the geometry in
 * `src/design/brand`.
 *
 *     npm run assets:build
 *
 * Vectors are serialised directly. Rasters go through Chromium — already on
 * disk for Playwright, so no image toolchain has to be installed to rebuild an
 * icon — and the ones the stores require to be opaque are re-encoded without an
 * alpha channel on the way out.
 *
 * Nothing here runs at app runtime. The committed output under `assets/` is
 * what ships; this exists so that output is reproducible rather than hand-drawn
 * once and quietly diverged from ever after.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { chromium } from "playwright";
import { lightColors } from "../src/design/palettes";
import { brandAssets } from "../src/design/brand/manifest";
import {
  atmosphereFieldSvg,
  emMarkSvg,
  iconSvg,
  splashMarkSvg
} from "../src/design/brand/svg";
import { flattenToOpaque, readPngHeader } from "./png";

// The compiled script lives under `.assets-build/`, so `__dirname` points into
// the build output rather than at the repo. npm runs scripts from the package
// root, which is the location that stays true for both.
const ROOT = process.cwd();

const sources: Record<string, () => string> = {
  mark: emMarkSvg,
  "field-light": () => atmosphereFieldSvg("light"),
  "field-dark": () => atmosphereFieldSvg("dark"),
  "icon-light": () => iconSvg("light"),
  "icon-dark": () => iconSvg("dark"),
  "icon-tinted": () => iconSvg("tinted"),
  "icon-adaptive": () => iconSvg("adaptive"),
  "splash-light": () => splashMarkSvg("light"),
  "splash-dark": () => splashMarkSvg("dark")
};

export const svgFor = (source: string) => {
  const generator = sources[source];
  if (!generator) {
    throw new Error(`No generator named "${source}".`);
  }
  return generator();
};

const write = (file: string, contents: Buffer | string) => {
  const path = join(ROOT, file);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
  const bytes = readFileSync(path).length;
  console.log(`  ${file}  ${(bytes / 1024).toFixed(1)}kB`);
};

const main = async () => {
  const rasters = brandAssets.filter((asset) => asset.kind === "png");
  const browser = await chromium.launch();

  try {
    for (const asset of brandAssets) {
      const svg = svgFor(asset.source);

      if (asset.kind === "svg") {
        write(asset.file, svg);
        continue;
      }

      const page = await browser.newPage({
        viewport: { width: asset.size, height: asset.size },
        deviceScaleFactor: 1
      });

      // The SVG is inlined rather than loaded from a file so the rasteriser
      // reads exactly the string the tests compare against, and margin:0 keeps
      // the drawing registered to the viewport corner.
      await page.setContent(
        `<!doctype html><style>
           html,body{margin:0;padding:0;background:transparent}
           svg{display:block;width:${asset.size}px;height:${asset.size}px}
         </style>${svg}`
      );

      const shot = await page.screenshot({ omitBackground: true, type: "png" });
      await page.close();

      write(asset.file, asset.alpha ? shot : flattenToOpaque(shot, lightColors.background));
    }

    for (const asset of rasters) {
      const header = readPngHeader(readFileSync(join(ROOT, asset.file)));
      if (header.width !== asset.size || header.hasAlpha !== asset.alpha) {
        throw new Error(
          `${asset.file} came out ${header.width}px alpha=${header.hasAlpha}, ` +
            `manifest wants ${asset.size}px alpha=${asset.alpha}.`
        );
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n${brandAssets.length} assets written.`);
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
