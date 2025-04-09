// Audio-reactive visualizer using p5.js

let dsize, song;
let x = 0;
let ywave = 0;
let hsb = 0;
let angle = 0;
let fft;           // Used to perform FFT analysis on audio
let amp;           // Used to get amplitude (volume) levels

let isMuted = false;
let isRunning = false;

let buttons = [];

// Preload audio file before setup
function preload() {
  song = loadSound("Audio/love-is-darkness.mp3");
}

// Initial canvas and visualizer setup
function setup() {
  createCanvas(900, 450);
  dsize = height - 20;

  fft = new p5.FFT();            // Initialize FFT analyzer
  amp = new p5.Amplitude();      // Initialize amplitude analyzer
  w = width / 32;

  noLoop();                      // Pause draw loop initially
  song.stop();                   // Ensure song doesn't play automatically

  setupButtons();                // Initialize UI buttons
}

// Initializes control buttons (Play, Pause, Refresh, Mute)
function setupButtons() {
  let labels = ['▶️', '⏸️', '🔄', '🔇'];
  let actions = ['play', 'pause', 'refresh', 'mute'];

  for (let i = 0; i < labels.length; i++) {
    buttons.push({
      label: labels[i],
      action: actions[i],
      x: 0,
      y: 0,
      w: 30,
      h: 30
    });
  }
}
//MARK: DRAW
// Main draw loop that updates visuals on the canvas
function draw() {
  background(0);
  let vol = amp.getLevel();       // Get current volume level

  if (song.currentTime() >= 5){
    drawSun()
  }

  drawCircleGroup(vol);           // Central circular visuals
 // drawSun();                      // Pulsating sun effect
  drawSparkles();                 // Random sparkle elements
  drawRedSea(vol);                // Wave-like bottom sea
  drawSpirograph();               // Radial spirograph based on FFT
  drawCanvasButtons();            // UI buttons
}

// MARK: Circle Group
// Draws multiple concentric circles that pulse with audio volume
function drawCircleGroup(vol) {
  colorMode(HSB);

  let d1 = 50 + (sin(angle) * dsize) / PI;
  let d2 = 10 * vol + (sin(-2 * angle) * dsize) / PI;
  let d3 = 10 * vol + (sin(2 * angle) * dsize) / PI;

  fill(hsb, 100, 100);
  ellipse(width / 2, height / 2, d1, d1);
  
  fill(hsb * vol, 100, 100);
  ellipse(width / 2, height / 2, d2, d2);
  
  fill(hsb + 45, 100, 100);
  ellipse(width / 2, height / 2, d1, d2);
}

// MARK: Sun
// Creates a glowing sun effect that expands and contracts over time
function drawSun() {
  let r = map(sin(angle), -1, 1, 0, 200);
  let hue = map(sin(angle), -1, 1, -5, 55);

  stroke(55, 100, 100);
  fill(hue, 100, 100);
  circle(width / 2, height / 2, r * 1.5);

  angle += 0.02; // Animate over time
}

// MARK: Sparkles
// Randomly draws sparkles across the screen
function drawSparkles() {
  let sparkleX = random(0, width);
  let sparkleY = random(0, height);
  let sparkleSize = random(0, 4);
  let hue = map(sin(angle), -1, 1, -5, 55);

  fill(hue, 100, 100);
  noStroke();
  ellipse(sparkleX, sparkleY, sparkleSize);
}

// MARK: Red Sea
// Draws a sine wave-based sea that reacts to volume
function drawRedSea(vol) {
  beginShape();
  noStroke();
  
  let waterhue = map(sin(angle), -1, 1, 240, 180);
  fill(waterhue, 100, 100);

  let xwave = 0;

  for (let x = 0; x <= width; x += 10) {
    let y = map(
      noise(xwave + xwave * vol * 0.003, ywave + xwave * vol * 0.03),
      0,
      1,
      300,
      450
    );
    vertex(x, y);
    xwave += 0.05;
  }

  ywave += 0.01;

  vertex(width, height);
  vertex(0, height);
  endShape(CLOSE);
}

// MARK: Spirograph
// Generates a radial, geometric pattern based on audio frequencies
function drawSpirograph() {
  let spectrum = fft.analyze();
  let bassV = int(fft.getEnergy("bass"));
  let midV = int(fft.getEnergy("mid"));
  let highMidV = int(fft.getEnergy("highMid"));

  let pieces = 16;
  let radius = 32;

  let mapbassV = map(bassV, 0, 255, -15, 15);
  let mapmidV = map(midV, 0, 255, -150, 150);

  push();
  translate(width / 2, height / 2);

  for (let i = 0; i < pieces; i++) {
    rotate(TWO_PI / pieces);

    beginShape();
    stroke(55, 100, 100);
    line(-mapbassV, mapbassV / 1.5, 0, radius);
    line(mapbassV, mapbassV / 1.5, 0, radius);
    endShape();

    beginShape();
    stroke(55, 100, 100);
    line(-mapmidV, radius / PI, 0, radius);
    line(mapmidV, radius / PI, 0, radius);
    endShape();

    // highMid frequency lines
    line(highMidV / 1.5, highMidV / 1.5, 0, radius);
    line(-highMidV / 1.5, highMidV / 1.5, 0, radius);
  }

  pop();
}

// MARK: Buttons
// Renders interactive canvas buttons for controlling playback
function drawCanvasButtons() {
  textAlign(CENTER, CENTER);
  textSize(14);
  noStroke();

  push();
  translate(width / 2, height - 30);

  for (let i = 0; i < buttons.length; i++) {
    let btn = buttons[i];
    let offsetX = -60 + i * 40;

    btn.x = offsetX;
    btn.y = 0;
    btn.w = 25;
    btn.h = 25;

    fill(0, 40, 0); // Background
    //rect(offsetX, 0, btn.w, btn.h, 4);
    //rect(offsetX, 0, btn.w, btn.h, 4);

    fill(255, 180); // Text/Icon
    text(btn.label, offsetX + btn.w / 2, btn.h / 2 + 1);
  }

  pop();
}

// Detects clicks on canvas buttons
function mousePressed() {
  let localX = mouseX - width / 2;
  let localY = mouseY - (height - 30);

  for (let btn of buttons) {
    if (
      localX >= btn.x &&
      localX <= btn.x + btn.w &&
      localY >= btn.y &&
      localY <= btn.y + btn.h
    ) {
      handleButton(btn.action);
      return;
    }
  }
}

// Executes action based on clicked button
function handleButton(action) {
  switch (action) {
    case 'play':
      if (!song.isPlaying()) {
        song.loop();
        song.setVolume(isMuted ? 0 : 1);
      }
      loop();
      isRunning = true;
      break;
    case 'pause':
      song.pause();
      noLoop();
      isRunning = false;
      break;
    case 'refresh':
      song.stop();
      angle = 0;
      ywave = 0;
      noLoop();
      isRunning = false;
      break;
    case 'mute':
      isMuted = !isMuted;
      song.setVolume(isMuted ? 0 : 1);
      buttons.find(b => b.action === 'mute').label = isMuted ? '🔊' : '🔇';
      break;
  }
}
