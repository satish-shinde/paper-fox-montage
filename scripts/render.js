const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const { chromium } = require('playwright');
const ffmpegPath = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'outputs');
const FRAMES_DIR = path.join(OUT, 'frames');
const FPS = 30;
const DURATION = 30;
const TOTAL_FRAMES = FPS * DURATION;
const WIDTH = 1920;
const HEIGHT = 1080;

function ensureCleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
  fs.mkdirSync(dir, { recursive: true });
}

function runFfmpeg(args, label) {
  const result = spawnSync(ffmpegPath, args, { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status}`);
  }
}

async function renderFrames() {
  ensureCleanDir(FRAMES_DIR);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

  const htmlPath = `file://${path.join(ROOT, 'public', 'index.html')}`;
  await page.goto(htmlPath, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => typeof window.renderAtTime === 'function');

  for (let i = 0; i < TOTAL_FRAMES; i += 1) {
    const t = i / FPS;
    await page.evaluate((timeSec) => {
      window.renderAtTime(timeSec);
    }, t);

    const fileName = `frame_${String(i).padStart(4, '0')}.png`;
    const target = path.join(FRAMES_DIR, fileName);
    await page.screenshot({ path: target });

    if ((i + 1) % 60 === 0) {
      process.stdout.write(`Rendered ${i + 1}/${TOTAL_FRAMES} frames\n`);
    }
  }

  await browser.close();
}

function encodeVideo() {
  const videoNoAudio = path.join(OUT, 'paper-fox-montage-no-audio.mp4');
  const audioTrack = path.join(OUT, 'paper-fox-montage-audio.m4a');
  const finalVideo = path.join(OUT, 'paper-fox-montage-1080p.mp4');

  runFfmpeg([
    '-y',
    '-framerate',
    String(FPS),
    '-i',
    path.join(FRAMES_DIR, 'frame_%04d.png'),
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-preset',
    'medium',
    '-crf',
    '18',
    '-r',
    String(FPS),
    videoNoAudio,
  ], 'Video encoding');

  runFfmpeg([
    '-y',
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=220:duration=${DURATION}:sample_rate=48000`,
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=330:duration=${DURATION}:sample_rate=48000`,
    '-f',
    'lavfi',
    '-i',
    `anoisesrc=color=pink:duration=${DURATION}:sample_rate=48000`,
    '-filter_complex',
    '[0:a]volume=0.26[a0];[1:a]volume=0.2[a1];[2:a]volume=0.08[a2];[a0][a1][a2]amix=inputs=3,afade=t=in:st=0:d=1.2,afade=t=out:st=28.6:d=1.4',
    '-c:a',
    'aac',
    '-b:a',
    '192k',
    audioTrack,
  ], 'Audio generation');

  runFfmpeg([
    '-y',
    '-i',
    videoNoAudio,
    '-i',
    audioTrack,
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-shortest',
    finalVideo,
  ], 'Muxing');

  return finalVideo;
}

function probe(filePath) {
  const probeResult = spawnSync(ffprobeStatic.path, [
    '-v',
    'error',
    '-show_entries',
    'stream=width,height,codec_type:format=duration,size',
    '-of',
    'json',
    filePath,
  ], { encoding: 'utf-8' });

  if (probeResult.status !== 0) {
    throw new Error(`ffprobe failed for ${filePath}`);
  }

  return JSON.parse(probeResult.stdout);
}

(async () => {
  try {
    fs.mkdirSync(OUT, { recursive: true });
    await renderFrames();
    const finalVideo = encodeVideo();
    const metadata = probe(finalVideo);
    process.stdout.write(`Done: ${finalVideo}\n`);
    process.stdout.write(`${JSON.stringify(metadata, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${error.stack || error.message}\n`);
    process.exit(1);
  }
})();
