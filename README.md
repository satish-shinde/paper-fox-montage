# paper-fox-montage

30-second, 1080p animated paper-fox montage generated with **p5.js** + **p5.brush** and exported to MP4 with audio.

## Render output

- Final video: `/home/runner/work/paper-fox-montage/paper-fox-montage/outputs/paper-fox-montage-1080p.mp4`
- Resolution: 1920x1080
- Duration: 30 seconds
- Audio: generated ambient/synth mix and muxed into final MP4

## Run

```bash
npm install
npx playwright install chromium
npm run render
```

This renders 900 PNG frames, encodes H.264 video, generates AAC audio, and muxes both into the final MP4.
