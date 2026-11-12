/* =========================================================
   The Things We Keep — interactions
   You shouldn't need to edit this file. Content lives in content.js
   ========================================================= */

const $ = (sel) => document.querySelector(sel);

const stage    = $("#stage");
const hallway  = $("#hallway");
const bedroom  = $("#bedroom");
const door     = $("#door");
const fade     = $("#fade");
const prompt   = $("#prompt");
const progress = $("#progress");
const shelf    = $("#shelf-items");
const popup    = $("#popup");

const seen = new Set();   // which trinkets have been read
let current = null;       // trinket that is open right now
let busy = false;         // stops double-clicks during transitions


/* ---------- 1. Scale the 1920x1080 stage to fit any window ---------- */
function fitStage() {
  const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  const x = (window.innerWidth - 1920 * s) / 2;
  const y = (window.innerHeight - 1080 * s) / 2;
  stage.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
}
window.addEventListener("resize", fitStage);
fitStage();


/* ---------- 2. Placeholder boxes for images you haven't exported yet ---------- */
function handleMissing(img) {
  const swap = () => {
    if (!img.isConnected && !img.parentNode) return;
    if (img.classList.contains("scene-bg")) { img.classList.add("missing"); return; }
    const box = document.createElement("div");
    box.className = "missing " + (img.className || "");
    box.setAttribute("style", img.getAttribute("style") || "");
    box.textContent = img.dataset.label || img.getAttribute("src");
    img.replaceWith(box);
  };
  // The image may have already failed before this script ran
  if (img.getAttribute("src") && img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener("error", swap, { once: true });
}
document.querySelectorAll("img").forEach(handleMissing);


/* ---------- 3. Build the trinkets from content.js ---------- */
TRINKETS.forEach((t, i) => {
  // The button is the clickable area; the image sits inside it at its Figma spot
  const [hx, hy, hw, hh] = t.hit || [t.x, t.y, t.w, t.h];
  const btn = document.createElement("button");
  btn.className = "trinket";
  btn.style.cssText = `left:${hx}px; top:${hy}px; width:${hw}px; height:${hh}px;`;
  btn.setAttribute("aria-label", `Open: ${t.title}`);

  const img = document.createElement("img");
  img.alt = "";
  img.src = t.image;
  img.dataset.label = `trinket-${i + 1}`;
  img.style.cssText = `left:${t.x - hx}px; top:${t.y - hy}px; width:${t.w}px; height:${t.h}px;`;
  handleMissing(img);

  btn.appendChild(img);
  btn.addEventListener("click", () => openTrinket(i));
  shelf.appendChild(btn);
});
const trinketButtons = [...shelf.children];
updateProgress();


/* ---------- 4. Sound: music + click chime ----------
   If you add assets/music.mp3 and assets/click.mp3, those are used.
   Until then, a soft built-in tune and chime play instead. */
let muted = false;
let audioCtx = null;
let synthTimer = null;
let synthGain = null;

const music = new Audio("assets/music.mp3");
music.loop = true;
music.volume = 0.35;
let musicFileWorks = true;
music.addEventListener("error", () => { musicFileWorks = false; });

const clickSound = new Audio("assets/click.mp3");
clickSound.volume = 0.6;
let clickFileWorks = true;
clickSound.addEventListener("error", () => { clickFileWorks = false; });

function ctx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function startMusic() {
  if (muted) return;
  if (musicFileWorks) {
    music.play().catch(() => { musicFileWorks = false; startSynth(); });
  } else {
    startSynth();
  }
}

function stopMusic() {
  music.pause();
  if (synthTimer) { clearInterval(synthTimer); synthTimer = null; }
  if (synthGain) { synthGain.gain.setTargetAtTime(0, ctx().currentTime, 0.4); }
}

// A slow, music-box-ish loop of four soft chords
function startSynth() {
  if (synthTimer) return;
  const ac = ctx();
  synthGain = ac.createGain();
  synthGain.gain.value = 0.05;
  synthGain.connect(ac.destination);

  const chords = [
    [349.23, 440.00, 523.25, 659.25], // Fmaj7
    [329.63, 392.00, 493.88, 587.33], // Em7
    [293.66, 349.23, 440.00, 523.25], // Dm7
    [261.63, 329.63, 392.00, 493.88]  // Cmaj7
  ];
  let step = 0;

  const playChord = () => {
    const now = ac.currentTime;
    chords[step % chords.length].forEach((freq, n) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = n === 0 ? "triangle" : "sine";
      osc.frequency.value = freq;
      const t0 = now + n * 0.35;               // gently arpeggiated
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.8, t0 + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 3.6);
      osc.connect(g).connect(synthGain);
      osc.start(t0);
      osc.stop(t0 + 3.7);
    });
    step++;
  };
  playChord();
  synthTimer = setInterval(playChord, 3200);
}

function playClick() {
  if (muted) return;
  if (clickFileWorks) {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => { clickFileWorks = false; synthChime(); });
  } else {
    synthChime();
  }
}

function synthChime() {
  const ac = ctx();
  const now = ac.currentTime;
  [880, 1318.5].forEach((freq, n) => {
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, now + n * 0.09);
    g.gain.exponentialRampToValueAtTime(0.12, now + n * 0.09 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + n * 0.09 + 1.1);
    osc.connect(g).connect(ac.destination);
    osc.start(now + n * 0.09);
    osc.stop(now + n * 0.09 + 1.2);
  });
}

$("#sound-btn").addEventListener("click", (e) => {
  muted = !muted;
  e.currentTarget.classList.toggle("muted", muted);
  e.currentTarget.setAttribute("aria-label", muted ? "Play music" : "Mute music");
  if (muted) stopMusic();
  else if (bedroom.classList.contains("active")) {
    if (synthGain) synthGain.gain.value = 0.05;
    startMusic();
  }
});


/* ---------- 5. Dark mode ---------- */
$("#dark-btn").addEventListener("click", (e) => {
  const on = document.body.classList.toggle("dark");
  e.currentTarget.setAttribute("aria-checked", on);
});


/* ---------- 6. Enter the bedroom ---------- */
door.addEventListener("click", () => {
  if (busy) return;
  busy = true;
  playClick();
  startMusic();                       // browsers only allow music after a click
  door.classList.add("opening");

  setTimeout(() => fade.classList.add("on"), 400);
  setTimeout(() => {
    hallway.classList.remove("active");
    bedroom.classList.add("active");
    setPrompt(PROMPTS.bedroom);
    updateProgress();
    fade.classList.remove("on");
    busy = false;
  }, 1100);
});


/* ---------- 7. Open / close a trinket ---------- */
function openTrinket(i) {
  const t = TRINKETS[i];
  if (letterOpen) closeLetter();
  playClick();

  // If another one is open, mark it as seen first
  if (current !== null && current !== i) markSeen(current);

  current = i;
  updateReplay();
  trinketButtons.forEach((b, n) => b.classList.toggle("current", n === i));

  $("#popup-title").textContent = t.title;
  $(".popup-owner").textContent = t.owner;
  $(".popup-quote").textContent = t.quote;
  $(".popup-p1").textContent = t.p1;
  $(".popup-p2").textContent = t.p2;

  loadSlides(t, i);
  loadClip(t);

  popup.hidden = false;
  requestAnimationFrame(() => popup.classList.add("show"));
  setPrompt(PROMPTS.reading);
  $("#popup-close").focus({ preventScroll: true });
}

function closePopup() {
  if (current === null) return;
  const i = current;
  current = null;
  stopClip();
  popup.classList.remove("show");
  setTimeout(() => { if (current === null) popup.hidden = true; }, 350);
  trinketButtons.forEach((b) => b.classList.remove("current"));
  markSeen(i);
  trinketButtons[i].focus({ preventScroll: true });
}

// The trinket turns from black-and-white to colour once its story is read
function markSeen(i) {
  const btn = trinketButtons[i];
  if (!seen.has(i)) {
    seen.add(i);
    btn.classList.add("seen", "just-seen");
    setTimeout(() => btn.classList.remove("just-seen"), 1300);
  }
  updateProgress();

  if (seen.size === TRINKETS.length) {
    bedroom.classList.add("complete");
    setPrompt(PROMPTS.complete);
  } else if (current === null) {
    setPrompt(PROMPTS.bedroom);
  }
  updateReplay();
}


/* ---------- 7d. Replay: back to the hallway, everything grey again ---------- */
const replayBtn = $("#replay-btn");

function updateReplay() {
  const done = seen.size === TRINKETS.length && current === null;
  if (done && !chestShown) showChest();          // the ending: a chest appears
  replayBtn.classList.toggle("show", done && letterRead && !letterOpen);
}

replayBtn.addEventListener("click", () => {
  if (busy) return;
  busy = true;
  playClick();
  replayBtn.classList.remove("show");
  fade.classList.add("on");

  setTimeout(() => {
    stopClip();
    current = null;
    seen.clear();
    popup.classList.remove("show");
    popup.hidden = true;
    trinketButtons.forEach((b) => b.classList.remove("seen", "current", "just-seen"));
    bedroom.classList.remove("active", "complete");
    hallway.classList.add("active");
    door.classList.remove("opening");
    resetChest();
    progress.textContent = "";
    setPrompt(PROMPTS.hallway);
    fade.classList.remove("on");
    busy = false;
  }, 700);
});

function updateProgress() {
  progress.textContent = bedroom.classList.contains("active") || seen.size
    ? `${seen.size} / ${TRINKETS.length} remembered`
    : "";
}

$("#popup-close").addEventListener("click", closePopup);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closePopup(); closeLetter(); }
  if (current !== null && e.key === "ArrowLeft") showSlide(slideIndex - 1);
  if (current !== null && e.key === "ArrowRight") showSlide(slideIndex + 1);
});


/* ---------- 7b. Photo slideshow inside the pop-up ---------- */
const photoBox = $(".popup-photo");
const slidesEl = $("#slides");
const slideCount = $("#slide-count");
let slideIndex = 0;

function loadSlides(t, i) {
  // Works with photos: [ ... ] (several) or the older photo: "..." (one)
  const photos = t.photos || (t.photo ? [t.photo] : []);
  slidesEl.innerHTML = "";
  slideIndex = 0;

  if (photos.length === 0) {
    const box = document.createElement("div");
    box.className = "missing slide active";
    box.textContent = "photos coming soon";
    slidesEl.appendChild(box);
  }

  photos.forEach((src, n) => {
    const img = document.createElement("img");
    img.className = "slide";
    img.alt = `${t.title}, photo ${n + 1} of ${photos.length}`;
    img.dataset.label = src.split("/").pop();
    img.src = src;
    slidesEl.appendChild(img);
    handleMissing(img);
  });

  photoBox.classList.toggle("single", photos.length <= 1);
  showSlide(0);
}

function showSlide(n) {
  const slides = slidesEl.children;
  if (!slides.length) return;
  slideIndex = (n + slides.length) % slides.length;   // wraps around
  [...slides].forEach((s, k) => s.classList.toggle("active", k === slideIndex));
  slideCount.textContent = `${slideIndex + 1} / ${slides.length}`;
}

$("#slide-prev").addEventListener("click", () => { playClick(); showSlide(slideIndex - 1); });
$("#slide-next").addEventListener("click", () => { playClick(); showSlide(slideIndex + 1); });


/* ---------- 7c. Interview audio clip ----------
   audio: "assets/audio-1.mp3"     the recording
   audioStart / audioEnd (optional) seconds — only play that part */
const player   = $("#audio-player");
const playBtn  = $("#audio-play");
const track    = $("#audio-track");
const fill     = $("#audio-fill");
const timeEl   = $("#audio-time");
const labelEl  = $("#audio-label");
const clip = new Audio();
clip.preload = "metadata";
let clipStart = 0;
let clipEnd = null;

function fmt(s) {
  s = Math.max(0, Math.round(s || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function clipLength() {
  const end = clipEnd ?? clip.duration;
  return isFinite(end) ? end - clipStart : 0;
}
function updateClipUI() {
  const len = clipLength();
  const pos = Math.min(Math.max(clip.currentTime - clipStart, 0), len || 0);
  fill.style.width = len ? `${(pos / len) * 100}%` : "0%";
  timeEl.textContent = `${fmt(pos)} / ${fmt(len)}`;
}

function loadClip(t) {
  stopClip();
  player.classList.remove("missing", "none");
  if (!t.audio) {
    player.classList.add("missing");
    labelEl.textContent = "interview clip coming soon";
    clip.removeAttribute("src");
    timeEl.textContent = "";
    fill.style.width = "0%";
    return;
  }
  labelEl.textContent = "from the interview";
  clipStart = t.audioStart || 0;
  clipEnd = t.audioEnd || null;
  clip.src = t.audio;
  clip.load();
  updateClipUI();
}

function stopClip() {
  if (!clip.paused) clip.pause();
  if (clip.getAttribute("src")) {
    try { clip.currentTime = clipStart; } catch (e) {}
  }
  updateClipUI();
}

clip.addEventListener("loadedmetadata", () => { clip.currentTime = clipStart; updateClipUI(); });
clip.addEventListener("error", () => {
  if (!clip.getAttribute("src")) return;
  player.classList.add("missing");
  labelEl.textContent = `can't find ${clip.getAttribute("src").split("/").pop()}`;
  timeEl.textContent = "";
});
clip.addEventListener("timeupdate", () => {
  if (clipEnd && clip.currentTime >= clipEnd) {
    clip.pause();
    clip.currentTime = clipStart;
  }
  updateClipUI();
});
clip.addEventListener("ended", () => { clip.currentTime = clipStart; updateClipUI(); });

// Background music gets quieter while someone's voice is playing
clip.addEventListener("play", () => {
  player.classList.add("playing");
  playBtn.setAttribute("aria-label", "Pause interview clip");
  music.volume = 0.06;
  if (synthGain) synthGain.gain.setTargetAtTime(0.008, ctx().currentTime, 0.3);
});
clip.addEventListener("pause", () => {
  player.classList.remove("playing");
  playBtn.setAttribute("aria-label", "Play interview clip");
  music.volume = 0.35;
  if (synthGain && !muted) synthGain.gain.setTargetAtTime(0.05, ctx().currentTime, 0.6);
});

playBtn.addEventListener("click", () => {
  if (clip.paused) {
    if (clipEnd && clip.currentTime >= clipEnd - 0.05) clip.currentTime = clipStart;
    clip.play().catch(() => {});
  } else {
    clip.pause();
  }
});

// Click anywhere on the bar to jump to that point
track.addEventListener("click", (e) => {
  const len = clipLength();
  if (!len) return;
  const r = track.getBoundingClientRect();
  const f = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
  clip.currentTime = clipStart + f * len;
  updateClipUI();
});

// Clicking empty wall also closes the note
bedroom.addEventListener("click", (e) => {
  if (current !== null && !popup.contains(e.target) && !e.target.closest(".trinket")) closePopup();
});


/* ---------- 8. Narrator line with a little typewriter effect ---------- */
let typeTimer = null;
function setPrompt(text) {
  clearInterval(typeTimer);
  let n = 0;
  prompt.textContent = "";
  typeTimer = setInterval(() => {
    prompt.textContent = text.slice(0, ++n);
    if (n >= text.length) clearInterval(typeTimer);
  }, 28);
}


/* ---------- 9. Opening lines + title card ----------
   The lines live in content.js (INTRO_LINES). Each one types out
   and stays until the visitor clicks. */
const intro = $("#intro");
const titlecard = $("#titlecard");
const introLine = $("#intro-line");
let introStep = 0;
let introTyping = null;
let idleTimer = null;
let hintActive = true;   // the fading hint is only used before the hallway

function typeIntro(text) {
  clearInterval(introTyping);
  introLine.classList.remove("done", "fading");
  introLine.classList.add("typing");
  let n = 0;
  introLine.textContent = "> ";
  introTyping = setInterval(() => {
    introLine.textContent = "> " + text.slice(0, ++n);
    if (n >= text.length) finishIntroLine();
  }, 45);
}

function finishIntroLine() {
  clearInterval(introTyping);
  introTyping = null;
  introLine.textContent = "> " + INTRO_LINES[introStep];
  introLine.classList.remove("typing");
  introLine.classList.add("done");
}

// Bottom hint: show it, hide it on click, bring it back after 7s of no clicks
function showHint() { if (hintActive) prompt.classList.remove("hint-hidden"); }
function hideHintAndWait() {
  prompt.classList.add("hint-hidden");
  clearTimeout(idleTimer);
  idleTimer = setTimeout(showHint, 7000);
}

function goScene(from, to, after) {
  busy = true;
  fade.classList.add("on");
  setTimeout(() => {
    // Hide the old screen instantly while it's covered, so it can't ghost through
    from.style.transition = "none";
    from.classList.remove("active");
    void from.offsetWidth;
    from.style.transition = "";
    to.classList.add("active");
    if (after) after();
    fade.classList.remove("on");
    busy = false;
  }, 700);
}

function introAdvance() {
  if (busy) return;
  startMusic();                       // the first click starts the music
  hideHintAndWait();
  if (introTyping) { finishIntroLine(); return; }   // click while typing = show the whole line

  if (introStep < INTRO_LINES.length - 1) {
    introStep++;
    introLine.classList.add("fading");
    setTimeout(() => typeIntro(INTRO_LINES[introStep]), 350);
  } else {
    goScene(intro, titlecard, () => {
      prompt.textContent = INTRO_PROMPTS.title;
      prompt.classList.add("hint-hidden");
      clearTimeout(idleTimer);
      idleTimer = setTimeout(showHint, 2800);   // after the title has faded in
    });
  }
}

function titleAdvance() {
  if (busy) return;
  playClick();
  hintActive = false;
  clearTimeout(idleTimer);
  goScene(titlecard, hallway, () => {
    prompt.classList.remove("hint-hidden");
    setPrompt(PROMPTS.hallway);
  });
}

intro.addEventListener("click", introAdvance);
titlecard.addEventListener("click", titleAdvance);

// Keyboard: Space, Enter or → also continue
document.addEventListener("keydown", (e) => {
  if (!["Enter", " ", "ArrowRight"].includes(e.key)) return;
  if (e.target.closest && e.target.closest("button")) return;
  if (intro.classList.contains("active")) { e.preventDefault(); introAdvance(); }
  else if (titlecard.classList.contains("active")) { e.preventDefault(); titleAdvance(); }
});

// Start
prompt.textContent = INTRO_PROMPTS.intro;
typeIntro(INTRO_LINES[0]);
idleTimer = setTimeout(showHint, 2500);


/* ---------- 10. The ending: a little chest with a letter ----------
   Appears after every trinket is in colour and the last note is closed.
   Letter text lives in content.js (LETTER).
   Optional sound files: assets/chest-chime.mp3, assets/chest-open.mp3 */
const chest = $("#chest");
const letter = $("#letter");
let chestShown = false;
let letterOpen = false;
let letterRead = false;
let chestTimers = [];

// Sound effect helper: use the mp3 if it exists, otherwise a built-in sound
function makeSfx(src, fallback) {
  const a = new Audio(src);
  a.volume = 0.6;
  let ok = true;
  a.addEventListener("error", () => { ok = false; });
  return () => {
    if (muted) return;
    if (ok) { a.currentTime = 0; a.play().catch(() => { ok = false; fallback(); }); }
    else fallback();
  };
}

function sparkle(notes, gap, length, volume) {
  const ac = ctx();
  const now = ac.currentTime;
  notes.forEach((freq, n) => {
    const t0 = now + n * gap;
    [["sine", 1], ["triangle", 0.35]].forEach(([type, mix]) => {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(volume * mix, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + length);
      osc.connect(g).connect(ac.destination);
      osc.start(t0);
      osc.stop(t0 + length + 0.1);
    });
  });
}

// A twinkly rising arpeggio when the chest appears
const playChestChime = makeSfx("assets/chest-chime.mp3",
  () => sparkle([1046.5, 1318.5, 1568, 2093, 2637], 0.11, 1.6, 0.09));
// A warm little flourish when it opens
const playChestOpen = makeSfx("assets/chest-open.mp3",
  () => sparkle([523.25, 659.25, 783.99, 1046.5], 0.07, 1.4, 0.08));

function fillLetter() {
  const L = (typeof LETTER !== "undefined") ? LETTER : {};
  $("#letter-title").textContent = L.title || "";
  $("#letter-sign").textContent = L.signature || "";
  const body = $("#letter-body");
  body.innerHTML = "";
  (L.paragraphs || []).forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    body.appendChild(p);
  });
}
fillLetter();

function showChest() {
  chestShown = true;
  chestTimers.push(setTimeout(() => {
    chest.classList.add("show");
    playChestChime();
  }, 1200));
  chestTimers.push(setTimeout(() => {
    if (!letterOpen && !letterRead && current === null) setPrompt(PROMPTS.chest || "> something appeared on the floor..");
  }, 4500));
}

function openLetter() {
  letterOpen = true;
  letter.classList.add("show");
  setPrompt(PROMPTS.letter || "> a little note, just for you.");
  updateReplay();
  $("#letter-close").focus({ preventScroll: true });
}

function closeLetter() {
  if (!letterOpen) return;
  letterOpen = false;
  letterRead = true;
  letter.classList.remove("show");
  setPrompt(PROMPTS.complete);
  updateReplay();
}

function resetChest() {
  chestTimers.forEach(clearTimeout);
  chestTimers = [];
  chestShown = false;
  letterOpen = false;
  letterRead = false;
  chest.classList.remove("show", "open");
  letter.classList.remove("show");
}

chest.addEventListener("click", () => {
  if (letterOpen) return;
  if (!chest.classList.contains("open")) {
    chest.classList.add("open");
    playChestOpen();
    chestTimers.push(setTimeout(openLetter, 650));
  } else {
    playClick();
    openLetter();          // already open: just bring the letter back
  }
});
$("#letter-close").addEventListener("click", closeLetter);
