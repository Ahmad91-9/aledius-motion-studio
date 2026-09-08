/**
 * ALEDIUS MOTION STUDIO — CORE ENGINE & TIMELINE CONTROLLER
 * Handles Canvas Particle Physics, Web Audio Synthesis, Subtitle Sync,
 * and Interactive HTML/CSS Keyframe Overlays.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const video = document.getElementById('avatar-video');
  const canvas = document.getElementById('ambient-canvas');
  const ctx = canvas.getContext('2d');
  
  const introLayer = document.getElementById('intro-layer');
  const titleCardLayer = document.getElementById('title-card-layer');
  const lowerThirdLayer = document.getElementById('lower-third-layer');
  const keytermLayer = document.getElementById('keyterm-layer');
  const keytermText = document.getElementById('keyterm-text');
  const subtitlesLayer = document.getElementById('subtitles-layer');
  const subText = document.getElementById('sub-text');
  const outroLayer = document.getElementById('outro-layer');
  const watermarkLayer = document.getElementById('watermark-layer');

  const btnPlayPause = document.getElementById('btn-play-pause');
  const playIcon = document.getElementById('play-icon');
  const playText = document.getElementById('play-text');
  const btnRestart = document.getElementById('btn-restart');
  const btnAudioToggle = document.getElementById('btn-audio-toggle');
  const timelineSlider = document.getElementById('timeline-slider');
  const timeDisplay = document.getElementById('time-display');

  const btnModeFull = document.getElementById('btn-mode-full');
  const btnModeNoIntro = document.getElementById('btn-mode-nointro');

  const btnPreviewIntro = document.getElementById('btn-preview-intro');
  const btnPreviewTc = document.getElementById('btn-preview-tc');
  const btnPreviewLt = document.getElementById('btn-preview-lt');
  const btnPreviewKeys = document.getElementById('btn-preview-keys');
  const btnPreviewOutro = document.getElementById('btn-preview-outro');

  const btnRecordIntro = document.getElementById('btn-record-intro');
  const btnRecordOutro = document.getElementById('btn-record-outro');
  const exportStatus = document.getElementById('export-status');

  // Subtitle timestamps synchronized from user's exact SRT file:
  const SUBTITLES = [
    { start: 0.57, end: 3.83, text: "Rendite ist der prozentuale Wertzuwachs einer Kapitalanlage über" },
    { start: 3.83, end: 7.11, text: "einen bestimmten Zeitraum, üblicherweise auf ein Jahr bezogen." },
    { start: 7.65, end: 9.83, text: "Sie ist die zentrale Kennzahl, um den Erfolg" },
    { start: 9.83, end: 13.27, text: "einer Anlage zu messen und verschiedene Investments vergleichbar zu machen." },
    { start: 13.77, end: 17.19, text: "Wichtig ist die Unterscheidung zwischen nominaler und realer Rendite." },
    { start: 17.79, end: 20.75, text: "Die nominale Rendite gibt den reinen Wertzuwachs an," },
    { start: 20.93, end: 24.07, text: "während die reale Rendite die Inflation herausrechnet und" },
    { start: 24.07, end: 27.39, text: "damit zeigt, wie viel Kaufkraft tatsächlich hinzugewonnen wurde." },
    { start: 27.39, end: 30.33, text: "Ebenso relevant ist, ob eine Rendite vor oder" },
    { start: 30.33, end: 32.47, text: "nach Kosten und Steuern ausgewiesen wird." },
    { start: 32.99, end: 35.01, text: "Und eine hohe Rendite steht selten für sich allein," },
    { start: 35.01, end: 39.25, text: "sie ist fast immer die Kompensation für ein entsprechend höheres Risiko." }
  ];

  // Keyterm overlays synchronized with user narration timestamps
  const KEYTERMS = [
    { start: 17.79, end: 20.75, text: "Nominale Rendite" },
    { start: 20.93, end: 24.07, text: "Reale Rendite" },
    { start: 22.50, end: 27.39, text: "Inflation" },
    { start: 27.39, end: 32.47, text: "Kosten & Steuern" },
    { start: 32.99, end: 39.25, text: "Rendite & Risiko" }
  ];

  // App State
  let isFullMode = true; // true = with intro (45.26s), false = no intro (42.76s)
  let isPlaying = false;
  let isMuted = false;
  let currentTime = 0;
  let introDuration = 2.50;
  let outroDuration = 3.00;
  let avatarDuration = 39.76; // Presenter speaking duration
  let totalDuration = introDuration + avatarDuration + outroDuration; // 45.26s
  let isolatedScene = null; // 'intro', 'tc', 'lt', 'keys', 'outro'

  let introAnimationTriggered = false;
  let outroAnimationTriggered = false;

  function triggerIntroAnimation() {
    introLayer.classList.remove('animating');
    void introLayer.offsetWidth; // Force reflow
    introLayer.classList.add('animating');
    playIntroChime();
    introAnimationTriggered = true;
  }

  function triggerOutroAnimation() {
    outroLayer.classList.remove('animating');
    void outroLayer.offsetWidth; // Force reflow
    outroLayer.classList.add('animating');
    playOutroChime();
    outroAnimationTriggered = true;
  }

  // Canvas dimensions
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // =========================================================
  // 1. WEB AUDIO SYNTHESIZER FOR BRAND SOUND
  // =========================================================
  let audioCtx = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  function playIntroChime() {
    if (isMuted) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    // Deep warm emerald pad
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(146.83, now); // D3
    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.exponentialRampToValueAtTime(0.2, now + 0.6);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 2.5);

    // Crystalline bell shimmer
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(587.33, now + 0.4); // D5
    osc2.frequency.exponentialRampToValueAtTime(880.00, now + 1.2); // A5
    gain2.gain.setValueAtTime(0.001, now + 0.4);
    gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.7);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.4);
    osc2.stop(now + 2.5);
  }

  function playOutroChime() {
    if (isMuted) return;
    initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    const notes = [220.00, 277.18, 329.63, 440.00]; // A major 7th / modern wealth chime
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      gain.gain.setValueAtTime(0.001, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.09, now + idx * 0.15 + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + idx * 0.15);
      osc.stop(now + 3.0);
    });
  }

  // =========================================================
  // 2. CANVAS AMBIENT LIGHT PARTICLES
  // =========================================================
  const particles = [];
  const PARTICLE_COUNT = 38;
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * 440,
      y: Math.random() * 782,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.5 - 0.2,
      alpha: Math.random() * 0.6 + 0.2,
      pulse: Math.random() * Math.PI
    });
  }

  function renderParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render particles only during Intro or Outro scenes for performance
    const isIntroActive = introLayer.classList.contains('active');
    const isOutroActive = outroLayer.classList.contains('active');

    if (isIntroActive || isOutroActive) {
      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx;
        p.pulse += 0.03;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 220, 190, ${currentAlpha})`;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#267D58';
        ctx.fill();
      });
    }

    requestAnimationFrame(renderParticles);
  }
  renderParticles();

  // =========================================================
  // 3. MASTER SYNCHRONIZATION ENGINE
  // =========================================================
  function updateTimeline() {
    if (isolatedScene) return; // In isolated preview mode, normal timeline pauses

    // Format current time display
    const mins = Math.floor(currentTime / 60);
    const secs = (currentTime % 60).toFixed(1);
    const durMins = Math.floor(totalDuration / 60);
    const durSecs = (totalDuration % 60).toFixed(1);
    timeDisplay.textContent = `${mins.toString().padStart(2, '0')}:${secs.padStart(4, '0')} / ${durMins.toString().padStart(2, '0')}:${durSecs.padStart(4, '0')}`;
    timelineSlider.value = currentTime;

    if (isFullMode) {
      // ----------------------------------------------------
      // FULL MODE (SOCIAL MEDIA CUT: Intro -> Avatar -> Outro)
      // ----------------------------------------------------
      if (currentTime < introDuration) {
        // [0.0s - 2.5s] INTRO SCENE (Pure motion graphics bumper, no avatar behind)
        introLayer.classList.add('active');
        titleCardLayer.classList.remove('active');
        lowerThirdLayer.classList.remove('visible');
        keytermLayer.classList.remove('visible');
        subtitlesLayer.classList.remove('visible');
        outroLayer.classList.remove('active', 'animating');
        watermarkLayer.classList.remove('visible');
        outroAnimationTriggered = false;

        video.style.opacity = '0';
        video.pause();
        video.currentTime = 0;

        if (isPlaying && !introAnimationTriggered) {
          triggerIntroAnimation();
        }
      } else if (currentTime >= introDuration && currentTime < (introDuration + avatarDuration)) {
        // [2.5s - 42.26s] MAIN SCENE (AVATAR + GRAPHICS)
        video.style.opacity = '1';
        introAnimationTriggered = false;
        introLayer.classList.remove('active', 'animating');
        outroLayer.classList.remove('active', 'animating');
        outroAnimationTriggered = false;
        watermarkLayer.classList.add('visible');

        const vTime = currentTime - introDuration;
        if (Math.abs(video.currentTime - vTime) > 0.3) {
          video.currentTime = vTime;
        }
        if (isPlaying && video.paused) {
          video.play().catch(() => {});
        }

        // Title Card: [0.0s - 2.5s of Avatar => 2.5s - 5.0s of Master]
        if (vTime >= 0.0 && vTime <= 2.5) {
          titleCardLayer.classList.add('active');
        } else {
          titleCardLayer.classList.remove('active');
        }

        // Lower Third: [2.5s - 6.5s of Avatar => 5.0s - 9.0s of Master]
        if (vTime >= 2.5 && vTime <= 6.5) {
          lowerThirdLayer.classList.add('visible');
        } else {
          lowerThirdLayer.classList.remove('visible');
        }

        // Key Terms:
        const activeKey = KEYTERMS.find(k => vTime >= k.start && vTime <= k.end);
        if (activeKey) {
          keytermText.textContent = activeKey.text;
          keytermLayer.classList.add('visible');
        } else {
          keytermLayer.classList.remove('visible');
        }

        // Subtitles:
        const activeSub = SUBTITLES.find(s => vTime >= s.start && vTime <= s.end);
        if (activeSub) {
          subText.textContent = activeSub.text;
          subtitlesLayer.classList.add('visible');
        } else {
          subtitlesLayer.classList.remove('visible');
        }

      } else {
        // [42.26s - 45.26s] OUTRO SCENE
        video.style.opacity = '0';
        introLayer.classList.remove('active', 'animating');
        titleCardLayer.classList.remove('active');
        lowerThirdLayer.classList.remove('visible');
        keytermLayer.classList.remove('visible');
        subtitlesLayer.classList.remove('visible');
        watermarkLayer.classList.remove('visible');
        outroLayer.classList.add('active');

        video.pause();

        if (isPlaying && !outroAnimationTriggered) {
          triggerOutroAnimation();
        }
      }

    } else {
      // ----------------------------------------------------
      // NO INTRO MODE (SALES APP CUT: Avatar -> Outro)
      // ----------------------------------------------------
      introLayer.classList.remove('active');

      if (currentTime < avatarDuration) {
        video.style.opacity = '1';
        outroLayer.classList.remove('active');
        watermarkLayer.classList.add('visible');

        const vTime = currentTime;
        if (Math.abs(video.currentTime - vTime) > 0.3) {
          video.currentTime = vTime;
        }
        if (isPlaying && video.paused) {
          video.play().catch(() => {});
        }

        // Title card:
        if (vTime >= 0.0 && vTime <= 2.5) {
          titleCardLayer.classList.add('active');
        } else {
          titleCardLayer.classList.remove('active');
        }

        // Lower third:
        if (vTime >= 2.5 && vTime <= 6.5) {
          lowerThirdLayer.classList.add('visible');
        } else {
          lowerThirdLayer.classList.remove('visible');
        }

        // Key terms:
        const activeKey = KEYTERMS.find(k => vTime >= k.start && vTime <= k.end);
        if (activeKey) {
          keytermText.textContent = activeKey.text;
          keytermLayer.classList.add('visible');
        } else {
          keytermLayer.classList.remove('visible');
        }

        // Subtitles:
        const activeSub = SUBTITLES.find(s => vTime >= s.start && vTime <= s.end);
        if (activeSub) {
          subText.textContent = activeSub.text;
          subtitlesLayer.classList.add('visible');
        } else {
          subtitlesLayer.classList.remove('visible');
        }

      } else {
        // Outro:
        titleCardLayer.classList.remove('active');
        lowerThirdLayer.classList.remove('visible');
        keytermLayer.classList.remove('visible');
        subtitlesLayer.classList.remove('visible');
        watermarkLayer.classList.remove('visible');
        outroLayer.classList.add('active');
        video.style.opacity = '0';
        video.pause();
      }
    }

    // Auto-stop at end of video
    if (currentTime >= totalDuration) {
      pausePlayback();
      currentTime = totalDuration;
    }
  }

  // Animation Loop Clock
  let lastTimestamp = null;
  function masterClock(timestamp) {
    if (isPlaying && !isolatedScene) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // Detect intro sound trigger
      if (isFullMode && currentTime < 0.1 && (currentTime + dt) >= 0.1) {
        playIntroChime();
      }
      // Detect outro sound trigger
      const outroStart = isFullMode ? (introDuration + avatarDuration) : avatarDuration;
      if (currentTime < outroStart && (currentTime + dt) >= outroStart) {
        playOutroChime();
      }

      currentTime += dt;
      updateTimeline();
    } else {
      lastTimestamp = null;
    }
    requestAnimationFrame(masterClock);
  }
  requestAnimationFrame(masterClock);

  // Playback Control Functions
  function startPlayback() {
    isPlaying = true;
    playIcon.textContent = '⏸';
    playText.textContent = 'Pause';
    initAudio();
    if (isolatedScene) resetToNormalMode();
    if (currentTime >= totalDuration) {
      currentTime = 0;
      introAnimationTriggered = false;
      outroAnimationTriggered = false;
    }
    if (isFullMode && currentTime < introDuration && !introAnimationTriggered) {
      triggerIntroAnimation();
    }
  }

  function pausePlayback() {
    isPlaying = false;
    playIcon.textContent = '▶';
    playText.textContent = 'Video Abspielen';
    video.pause();
  }

  btnPlayPause.addEventListener('click', () => {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });

  btnRestart.addEventListener('click', () => {
    currentTime = 0;
    resetToNormalMode();
    updateTimeline();
    startPlayback();
  });

  btnAudioToggle.addEventListener('click', () => {
    isMuted = !isMuted;
    video.muted = isMuted;
    btnAudioToggle.textContent = isMuted ? '🔇' : '🔊';
  });

  timelineSlider.addEventListener('input', (e) => {
    currentTime = parseFloat(e.target.value);
    resetToNormalMode();
    updateTimeline();
  });

  // Switch between Full Mode and No-Intro Mode
  btnModeFull.addEventListener('click', () => {
    isFullMode = true;
    totalDuration = introDuration + avatarDuration + outroDuration;
    timelineSlider.max = totalDuration;
    btnModeFull.classList.add('active');
    btnModeNoIntro.classList.remove('active');
    currentTime = 0;
    resetToNormalMode();
    updateTimeline();
  });

  btnModeNoIntro.addEventListener('click', () => {
    isFullMode = false;
    totalDuration = avatarDuration + outroDuration;
    timelineSlider.max = totalDuration;
    btnModeNoIntro.classList.add('active');
    btnModeFull.classList.remove('active');
    currentTime = 0;
    resetToNormalMode();
    updateTimeline();
  });

  function resetToNormalMode() {
    isolatedScene = null;
    introAnimationTriggered = false;
    outroAnimationTriggered = false;
    introLayer.classList.remove('active', 'animating');
    titleCardLayer.classList.remove('active');
    lowerThirdLayer.classList.remove('visible');
    keytermLayer.classList.remove('visible');
    subtitlesLayer.classList.remove('visible');
    outroLayer.classList.remove('active', 'animating');
    watermarkLayer.classList.remove('visible');
  }

  // =========================================================
  // 4. ISOLATED SCENE PREVIEW TRIGGERS
  // =========================================================
  btnPreviewIntro.addEventListener('click', () => {
    pausePlayback();
    resetToNormalMode();
    isolatedScene = 'intro';
    introLayer.classList.add('active');
    triggerIntroAnimation();
  });

  btnPreviewTc.addEventListener('click', () => {
    pausePlayback();
    resetToNormalMode();
    isolatedScene = 'tc';
    titleCardLayer.classList.add('active');
    watermarkLayer.classList.add('visible');
  });

  btnPreviewLt.addEventListener('click', () => {
    pausePlayback();
    resetToNormalMode();
    isolatedScene = 'lt';
    lowerThirdLayer.classList.add('visible');
    watermarkLayer.classList.add('visible');
  });

  let keyIndex = 0;
  btnPreviewKeys.addEventListener('click', () => {
    pausePlayback();
    resetToNormalMode();
    isolatedScene = 'keys';
    keytermText.textContent = KEYTERMS[keyIndex % KEYTERMS.length].text;
    keyIndex++;
    keytermLayer.classList.add('visible');
    watermarkLayer.classList.add('visible');
  });

  btnPreviewOutro.addEventListener('click', () => {
    pausePlayback();
    resetToNormalMode();
    isolatedScene = 'outro';
    outroLayer.classList.add('active');
    triggerOutroAnimation();
  });

  // Timeline Marker Quick Jumps
  document.querySelector('.marker-intro')?.addEventListener('click', () => {
    currentTime = 0;
    resetToNormalMode();
    updateTimeline();
  });
  document.querySelector('.marker-tc')?.addEventListener('click', () => {
    currentTime = isFullMode ? 2.6 : 0.1;
    resetToNormalMode();
    updateTimeline();
  });
  document.querySelector('.marker-lt')?.addEventListener('click', () => {
    currentTime = isFullMode ? 5.5 : 3.0;
    resetToNormalMode();
    updateTimeline();
  });
  document.querySelector('.marker-keys')?.addEventListener('click', () => {
    currentTime = isFullMode ? 20.0 : 17.5;
    resetToNormalMode();
    updateTimeline();
  });
  document.querySelector('.marker-outro')?.addEventListener('click', () => {
    currentTime = isFullMode ? 39.3 : 36.8;
    resetToNormalMode();
    updateTimeline();
  });

  // Keyboard shortcut (Space = Play/Pause)
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      if (isPlaying) pausePlayback(); else startPlayback();
    }
  });

  // =========================================================
  // 5. MEDIARECORDER REALTIME VIDEO EXPORTER
  // =========================================================
  function recordScene(sceneType, durationSec, filename) {
    if (!window.MediaRecorder) {
      alert("MediaRecorder wird von diesem Browser nicht unterstützt.");
      return;
    }

    const videoContainer = document.getElementById('video-frame');
    exportStatus.textContent = `Aufnahme läuft: ${filename} (0/${durationSec}s)...`;

    // Trigger scene
    if (sceneType === 'intro') {
      btnPreviewIntro.click();
    } else {
      btnPreviewOutro.click();
    }

    // Capture canvas stream
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
    const chunks = [];

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      exportStatus.textContent = `Export abgeschlossen! Datei heruntergeladen: ${filename}`;
    };

    recorder.start();
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 1;
      exportStatus.textContent = `Aufnahme läuft: ${filename} (${elapsed}/${durationSec}s)...`;
      if (elapsed >= durationSec) {
        clearInterval(interval);
        recorder.stop();
      }
    }, 1000);
  }

  btnRecordIntro.addEventListener('click', () => {
    recordScene('intro', 3, 'aledius_intro_animation.webm');
  });

  btnRecordOutro.addEventListener('click', () => {
    recordScene('outro', 3, 'aledius_outro_animation.webm');
  });

  // Initial setup
  updateTimeline();
});
