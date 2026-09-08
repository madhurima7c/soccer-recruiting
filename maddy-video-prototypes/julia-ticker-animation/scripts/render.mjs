import { spawn } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "out");
const framesDir = path.join(outDir, "frames");
const outputFile = path.join(outDir, "julia-ticker-1080p.mp4");
const port = 3011;
const baseUrl = `http://127.0.0.1:${port}/export.html`;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: opts.quiet ? "pipe" : "inherit",
      ...opts,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with ${code}`));
    });
  });
}

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Server did not start at ${url}`);
}

async function main() {
  console.log("Building preview…");
  await run("npm", ["run", "build"]);

  console.log("Starting preview server…");
  const server = spawn("npx", ["vite", "preview", "--port", String(port), "--host", "127.0.0.1"], {
    cwd: root,
    stdio: "pipe",
  });

  try {
    await waitForServer(baseUrl);

    await rm(framesDir, { recursive: true, force: true });
    await mkdir(framesDir, { recursive: true });

    const browser = await chromium.launch();
    const page = await browser.newPage({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1,
    });

    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__juliaTickerExport?.duration);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });

    const { duration } = await page.evaluate(() => window.__juliaTickerExport);
    console.log(`Capturing ${duration} frames at 1920×1080…`);

    for (let frame = 0; frame < duration; frame += 1) {
      await page.evaluate((f) => window.__juliaTickerExport.setFrame(f), frame);
      await page.waitForTimeout(16);
      const framePath = path.join(framesDir, `frame-${String(frame).padStart(5, "0")}.png`);
      await page.locator("#stage").screenshot({ path: framePath, type: "png" });
      if (frame % 30 === 0) {
        console.log(`  frame ${frame}/${duration - 1}`);
      }
    }

    await browser.close();

    await mkdir(outDir, { recursive: true });
    console.log("Encoding MP4…");
    await run(ffmpegInstaller.path, [
      "-y",
      "-framerate",
      "30",
      "-i",
      path.join(framesDir, "frame-%05d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-crf",
      "18",
      "-preset",
      "medium",
      outputFile,
    ]);

    console.log(`Done: ${outputFile}`);
  } finally {
    server.kill("SIGTERM");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
