const WIDTH = 1920;
const HEIGHT = 1080;
const DURATION = 30;
const FOX_BASE = [
  [-56, 0],
  [-20, -30],
  [6, -44],
  [56, -16],
  [20, 4],
  [46, 40],
  [0, 18],
  [-26, 46],
];

let renderTime = 0;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function sceneProgress(t, start, end) {
  return constrain((t - start) / (end - start), 0, 1);
}

function brushLine(x1, y1, x2, y2, c = '#f6e6c8', w = 1.2, name = 'HB') {
  brush.set(name, c, w);
  brush.line(x1, y1, x2, y2);
}

function drawFox(cx, cy, scaleV, rotation, glow = 0, morph = 0) {
  push();
  translate(cx, cy);
  rotate(rotation);
  scale(scaleV);

  const fillAlpha = 125 + glow * 110;
  brush.fill('#f1dcc0', fillAlpha);
  brush.noHatch();
  brush.set('HB', '#1d130b', 1);

  beginShape();
  for (const [x, y] of FOX_BASE) {
    const mx = x + sin(frameCount * 0.015 + y * 0.2) * morph;
    const my = y + cos(frameCount * 0.02 + x * 0.12) * morph;
    vertex(mx, my);
  }
  endShape(CLOSE);

  brush.set('2H', '#e6842a', 0.9 + glow * 0.9);
  brush.circle(8, -8, 20 + glow * 24);

  brush.set('HB', '#0b0b0b', 1);
  brush.circle(10, -10, 5 + glow * 2);

  pop();
}

function drawPaperFloor() {
  brush.fill('#1b1f24', 120);
  brush.noStroke();
  brush.rect(0, 0, WIDTH, HEIGHT);

  for (let i = -WIDTH / 2; i < WIDTH / 2; i += 70) {
    const wobble = sin(i * 0.03 + renderTime * 2.2) * 25;
    brushLine(i, -HEIGHT / 2, i + wobble, HEIGHT / 2, '#2d343d', 0.25, '2H');
  }
}

function drawGears(progress) {
  for (let i = 0; i < 4; i++) {
    const r = 130 + i * 75;
    const rot = renderTime * (0.9 + i * 0.16) * (i % 2 === 0 ? 1 : -1);
    push();
    translate(-420 + i * 260, 160 - i * 35);
    rotate(rot);
    brush.set('charcoal', '#7f848a', 0.8);
    brush.noFill();
    brush.circle(0, 0, r);
    for (let d = 0; d < 14; d++) {
      const ang = (TWO_PI * d) / 14;
      const x1 = cos(ang) * r * 0.65;
      const y1 = sin(ang) * r * 0.65;
      const x2 = cos(ang) * r;
      const y2 = sin(ang) * r;
      brushLine(x1, y1, x2, y2, '#9ca2aa', 0.5, '2H');
    }
    pop();
  }

  if (progress > 0.45) {
    const m = map(progress, 0.45, 1, 0, 1);
    for (let i = 0; i < 9; i++) {
      const x = -WIDTH / 2 + i * 240 + 80;
      const h = 90 + noise(i * 0.4, renderTime * 0.7) * 290;
      brush.fill(color(38, 42, 50, 90 + m * 95));
      brush.noStroke();
      brush.rect(x, HEIGHT / 2 - h * m, 150, h * m);
    }
  }
}

function drawOcean(progress) {
  const seaTop = map(progress, 0, 1, 220, 40);
  brush.fill('#123249', 150);
  brush.noStroke();
  brush.rect(0, seaTop, WIDTH, HEIGHT);

  for (let i = 0; i < 7; i++) {
    const y = seaTop + 40 + i * 60;
    const amp = 24 + i * 2;
    brush.set('2B', '#6fa2bf', 0.35);
    beginShape();
    for (let x = -WIDTH / 2; x <= WIDTH / 2; x += 28) {
      vertex(x, y + sin(x * 0.01 + renderTime * 4.4 + i) * amp);
    }
    endShape();
  }

  const waveX = 480 - progress * 720;
  const waveH = 320 + sin(renderTime * 8) * 35;
  brush.set('marker2', '#8dc8f6', 1.4);
  brush.noFill();
  brush.arc(waveX, seaTop - 40, 580, waveH, PI, TWO_PI);
}

function drawDoors(progress) {
  for (let i = 0; i < 8; i++) {
    const z = (i + progress * 6) % 8;
    const depth = map(z, 0, 8, 1.2, 0.35);
    const x = sin(i * 1.7 + renderTime * 1.2) * 600 * depth;
    const y = cos(i * 1.1 + renderTime * 1.7) * 260 * depth;
    brush.set('HB', '#d6ceb7', 0.8 * depth + 0.2);
    brush.noFill();
    brush.rect(x, y, 140 * depth, 230 * depth, 'center');
  }
  const openP = smoothstep(0.52, 1, progress);
  brush.fill(color(207, 168, 91, 120 * openP));
  brush.noStroke();
  brush.rect(420, -40, 210 * openP, 340 * openP, 'center');
}

function drawDesertCat(progress) {
  brush.fill('#c8ab74', 150);
  brush.noStroke();
  brush.rect(0, 170, WIDTH, HEIGHT);

  push();
  translate(0, 80 + sin(renderTime * 1.5) * 18);
  brush.fill('#d8bf8d', 160);
  brush.noStroke();
  brush.ellipse(0, 220, 1300, 520);
  brush.fill('#b68f57', 120);
  brush.ellipse(-300, 130, 260, 160);
  brush.ellipse(310, 120, 260, 160);
  const yawn = smoothstep(0.45, 1, progress);
  brush.fill(color(135, 102, 71, 170));
  brush.ellipse(40, 240, 180 + yawn * 250, 60 + yawn * 170);
  pop();

  for (let i = 0; i < 220; i++) {
    const sx = random(-WIDTH / 2, WIDTH / 2);
    const sy = random(-40, HEIGHT / 2);
    const drift = progress * 500;
    brushLine(sx, sy, sx + drift * 0.22, sy - drift * 0.18, '#dfc48f', 0.16, '2H');
  }
}

function drawSpace(progress) {
  background(2, 5, 16);
  for (let i = 0; i < 240; i++) {
    const x = (noise(i * 0.31, 1.2) - 0.5) * WIDTH;
    const y = (noise(i * 0.17, 5.1) - 0.5) * HEIGHT;
    const tw = 65 + 190 * abs(sin(renderTime * 2 + i));
    brush.set('2H', color(160 + tw * 0.2, 190 + tw * 0.1, 255), 0.2);
    brush.circle(x, y, 2 + (i % 3));
  }

  const holeP = smoothstep(0.58, 1, progress);
  if (holeP > 0) {
    brush.noFill();
    for (let i = 0; i < 7; i++) {
      brush.set('marker2', color(20 + i * 11, 15, 44 + i * 18, 120), 1.2 - i * 0.12);
      brush.circle(260, -20, 130 + i * 45 + holeP * 150);
    }
  }

  for (let i = 0; i < 6; i++) {
    const px = -500 + i * 190 + sin(renderTime * 2 + i) * 30;
    const py = 180 - i * 62;
    brush.set('HB', color(165 + i * 15, 180, 240), 0.75);
    brush.circle(px, py, 32 + i * 8);
  }
}

function drawMoonBloom(progress) {
  background(20, 20, 26);
  brush.fill('#969aa4', 180);
  brush.noStroke();
  brush.circle(0, 210, 960);

  const seedPulse = 8 + abs(sin(renderTime * 12)) * 8;
  brush.set('HB', '#f7f0cb', 1.6);
  brush.circle(0, 120, seedPulse);

  if (progress > 0.45) {
    const b = map(progress, 0.45, 1, 0, 1);
    for (let i = 0; i < 180; i++) {
      const ang = (TWO_PI * i) / 180;
      const len = 40 + b * (240 + noise(i * 0.2) * 300);
      brushLine(0, 120, cos(ang) * len, 120 + sin(ang) * len, '#86d17f', 0.18 + b * 0.22, '2H');
    }

    for (let i = 0; i < 140; i++) {
      const ax = random(-430, 430);
      const ay = random(-120, 410);
      brush.set('HB', color(220, 180 + random(60), 90 + random(80), 130 + b * 100), 0.45);
      brush.circle(ax, ay, 4 + random(8));
    }
  }
}

function drawConstellation(progress) {
  background(0, 0, 0, 255);
  const particles = 460;
  for (let i = 0; i < particles; i++) {
    const tx = map(i, 0, particles - 1, -360, 360);
    const ty = sin(i * 0.12) * 180 + cos(i * 0.09) * 90;
    const p = smoothstep(0, 1, progress);
    const x = lerp(random(-WIDTH / 2, WIDTH / 2), tx, p);
    const y = lerp(random(-HEIGHT / 2, HEIGHT / 2), ty, p);
    brush.set('2H', color(214, 224, 255, 110 + p * 145), 0.18 + p * 0.35);
    brush.circle(x, y, 1.5 + p * 2.2);
  }

  if (progress > 0.75) {
    const wink = sin(renderTime * 18) > 0.65;
    brush.set('HB', wink ? '#ffcc66' : '#d8e2ff', wink ? 2.6 : 1.2);
    brush.circle(95, -120, wink ? 20 : 9);
  }
}

function smoothstep(a, b, x) {
  const t = constrain((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
}

function sceneDraw(t) {
  drawPaperFloor();

  if (t < 1.5) {
    const p = easeInOut(sceneProgress(t, 0, 1.5));
    drawFox(-140 + p * 140, 150 - p * 130, 0.3 + p * 1.1, -0.7 + p * 0.7, p, 8 * (1 - p));
    for (let i = 0; i < 16; i++) {
      const x = -260 + i * 34;
      brushLine(x, 180 + sin(i + t * 7) * 18, x + 30, 220 + cos(i + t * 5) * 16, '#555c66', 0.2, '2H');
    }
    return;
  }

  if (t < 3) {
    background(8, 12, 16);
    const p = sceneProgress(t, 1.5, 3);
    for (let i = -8; i < 9; i++) {
      const x = i * 150 + sin(t * 8 + i) * 45;
      brushLine(x, -HEIGHT / 2, x + p * 240, HEIGHT / 2, '#303b46', 0.45, '2H');
    }
    drawFox(-760 + p * 1050, 170 - sin(t * 12) * 26, 0.95, 0.12, 0.5, 0);
    return;
  }

  if (t < 5) {
    background(16, 19, 24);
    const p = sceneProgress(t, 3, 5);
    drawGears(p);
    drawFox(-700 + p * 1260, 70 + sin(t * 10) * 24, 0.95, 0.1, 0.4, 0);
    return;
  }

  if (t < 7) {
    background(14, 20, 28);
    const p = sceneProgress(t, 5, 7);
    drawOcean(p);
    const bx = -220 + p * 210;
    const by = 180 + sin(t * 6) * 20;
    brush.fill('#e7d8b9', 130);
    brush.noStroke();
    brush.triangle(bx - 90, by + 26, bx + 90, by + 26, bx, by - 44);
    drawFox(bx - 8, by - 35, 0.62, -0.2, 0.2, 0);
    return;
  }

  if (t < 9) {
    background(27, 38, 54);
    const p = sceneProgress(t, 7, 9);
    drawOcean(1);
    const ky = 240 - p * 630;
    drawFox(-120 + p * 280, ky, 0.6 + p * 0.4, -0.5 + p * 1.2, 0.3 + p * 0.6, 0);
    return;
  }

  if (t < 11) {
    background(16, 21, 34);
    const p = sceneProgress(t, 9, 11);
    drawDoors(p);
    drawFox(-620 + p * 980, 90 + sin(t * 10) * 22, 0.82, 0.18, 0.5, 0);
    return;
  }

  if (t < 13) {
    const p = sceneProgress(t, 11, 13);
    drawDesertCat(p);
    drawFox(-430 + p * 820, 120 - p * 20, 0.82, 0.08, 0.3, 0);
    return;
  }

  if (t < 15) {
    const p = sceneProgress(t, 13, 15);
    drawSpace(0.2 + p * 0.3);
    drawFox(-520 + p * 940, 180 - p * 400, 0.8, -0.1 + p * 0.8, 0.4 + p * 0.3, 0);
    return;
  }

  if (t < 17) {
    const p = sceneProgress(t, 15, 17);
    drawSpace(0.45 + p * 0.4);
    drawFox(-500 + p * 860, 220 - p * 280, 0.78, 0.2 - p * 0.5, 0.5, 0);
    return;
  }

  if (t < 19) {
    const p = sceneProgress(t, 17, 19);
    drawSpace(0.8);
    for (let i = 0; i < 65; i++) {
      const ang = (TWO_PI * i) / 65 + t * 1.6;
      const rad = 40 + i * (2 + p * 1.4);
      brushLine(260, -20, 260 + cos(ang) * rad, -20 + sin(ang) * rad, '#f5b0ff', 0.18 + p * 0.3, '2H');
    }
    drawFox(130 + p * 120, -40 + p * 20, 0.72 - p * 0.25, p * 2.6, 0.8, p * 16);
    return;
  }

  if (t < 21) {
    const p = sceneProgress(t, 19, 21);
    drawSpace(0.95);
    for (let i = 0; i < 150; i++) {
      const tail = p * i * 8;
      brushLine(-460 + tail, 140 - i * 1.1, -380 + tail, 120 - i * 1.3, '#8ef4ff', 0.2, '2H');
    }
    const ax = -420 + p * 790;
    const ay = 120 - p * 340;
    drawFox(ax, ay, 0.48 + p * 0.5, -0.5 + p * 1.2, 0.8, 4);
    return;
  }

  if (t < 23) {
    const p = sceneProgress(t, 21, 23);
    drawSpace(0.6);
    brush.fill('#777c85', 155);
    brush.noStroke();
    brush.circle(200, 130, 280);
    drawFox(170 + p * 100, 40 + p * 210, 0.9, 0.2, 0.4, 0);
    return;
  }

  if (t < 25) {
    const p = sceneProgress(t, 23, 25);
    drawMoonBloom(min(0.5, p * 0.6));
    drawFox(260, 80, 0.9, 0.1, 0.6, 0);
    for (let i = 0; i < 240; i++) {
      const ang = random(TWO_PI);
      const len = p * random(440);
      brushLine(0, 120, cos(ang) * len, 120 + sin(ang) * len, '#fff3a1', 0.14 + p * 0.28, '2H');
    }
    return;
  }

  if (t < 27) {
    const p = sceneProgress(t, 25, 27);
    drawMoonBloom(0.5 + p * 0.5);
    drawFox(240, 60, 0.75 - p * 0.2, 0.15 + p * 0.2, 0.35, p * 7);
    return;
  }

  if (t < 28.5) {
    const p = sceneProgress(t, 27, 28.5);
    drawMoonBloom(1);
    drawConstellation(p * 0.5);
    return;
  }

  const p = sceneProgress(t, 28.5, 30);
  drawConstellation(0.5 + p * 0.5);
}

function setup() {
  pixelDensity(1);
  createCanvas(WIDTH, HEIGHT, WEBGL);
  frameRate(30);
  brush.load();
  brush.scaleBrushes(2.2);
  noLoop();
}

function draw() {
  const t = constrain(renderTime, 0, DURATION);
  resetMatrix();
  translate(-WIDTH / 2, -HEIGHT / 2);
  sceneDraw(t);
}

window.renderAtTime = (seconds) => {
  renderTime = seconds;
  redraw();
};
