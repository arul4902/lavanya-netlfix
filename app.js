/* ==========================================================================
   LAVZ & HIM — CINEMATIC INTERACTIVE ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // --- AUDIO SYNTHESIS & SOUNDTRACK CONTROLLER ---
  let audioCtx = null;
  const soundtrack = document.getElementById('soundtrack-audio');
  const dockDisc = document.getElementById('dock-disc');
  const dockPlayBtn = document.getElementById('dock-play-btn');
  const dockPlayIcon = document.getElementById('dock-play-icon');
  const dockMuteBtn = document.getElementById('dock-mute-btn');
  const dockMuteIcon = document.getElementById('dock-mute-icon');

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Synthesize theatrical cinematic sub-bass rumble & chime for Ident
  function playTheatricalChime() {
    try {
      initAudioContext();
      if (!audioCtx) return;

      const now = audioCtx.currentTime;

      // Sub-bass sweep
      const subOsc = audioCtx.createOscillator();
      const subGain = audioCtx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65, now);
      subOsc.frequency.exponentialRampToValueAtTime(32, now + 2.5);
      subGain.gain.setValueAtTime(0, now);
      subGain.gain.linearRampToValueAtTime(0.7, now + 0.3);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      subOsc.connect(subGain);
      subGain.connect(audioCtx.destination);
      subOsc.start(now);
      subOsc.stop(now + 3.0);

      // Shimmering chime
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major high
      freqs.forEach((f, idx) => {
        const osc = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + 1.0 + idx * 0.1);
        g.gain.setValueAtTime(0, now + 1.0 + idx * 0.1);
        g.gain.linearRampToValueAtTime(0.15, now + 1.1 + idx * 0.1);
        g.gain.exponentialRampToValueAtTime(0.001, now + 3.5);
        osc.connect(g);
        g.connect(audioCtx.destination);
        osc.start(now + 1.0 + idx * 0.1);
        osc.stop(now + 3.5);
      });
    } catch (e) {
      console.warn('Web Audio synthesis error:', e);
    }
  }

  function startSoundtrack() {
    initAudioContext();
    if (soundtrack) {
      soundtrack.volume = 1.0;
      soundtrack.play().then(() => {
        dockDisc.classList.add('playing');
        dockPlayIcon.textContent = '⏸';
      }).catch(err => {
        console.log('Audio autoplay prevented, user interaction required', err);
      });
    }
  }

  function toggleSoundtrack() {
    if (!soundtrack) return;
    if (soundtrack.paused) {
      soundtrack.play();
      dockDisc.classList.add('playing');
      dockPlayIcon.textContent = '⏸';
    } else {
      soundtrack.pause();
      dockDisc.classList.remove('playing');
      dockPlayIcon.textContent = '▶';
    }
  }

  dockPlayBtn.addEventListener('click', toggleSoundtrack);
  dockMuteBtn.addEventListener('click', () => {
    if (!soundtrack) return;
    soundtrack.muted = !soundtrack.muted;
    dockMuteIcon.textContent = soundtrack.muted ? '🔇' : '🔊';
  });

  // Audio Ducking during Video Playback
  const allVideos = document.querySelectorAll('video');
  allVideos.forEach(vid => {
    // Only duck when video has audio and is not muted
    vid.addEventListener('play', () => {
      if (soundtrack && !vid.muted) {
        fadeAudio(soundtrack, soundtrack.volume, 0.15, 600);
      }
    });
    vid.addEventListener('pause', () => {
      if (soundtrack) {
        fadeAudio(soundtrack, soundtrack.volume, 1.0, 600);
      }
    });
    vid.addEventListener('ended', () => {
      if (soundtrack) {
        fadeAudio(soundtrack, soundtrack.volume, 1.0, 600);
      }
    });
  });

  function fadeAudio(audioElem, fromVol, toVol, durationMs) {
    const steps = 15;
    const stepTime = durationMs / steps;
    const volDiff = (toVol - fromVol) / steps;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      audioElem.volume = Math.max(0, Math.min(1, fromVol + volDiff * currentStep));
      if (currentStep >= steps) clearInterval(interval);
    }, stepTime);
  }

  // --- 1. THEATRICAL IDENT ANIMATION ---
  const identSection = document.getElementById('cinematic-ident');
  const identBeam = document.getElementById('ident-beam');
  const identTrails = document.getElementById('ident-trails');
  const identContent = document.getElementById('ident-content');
  const skipIdentBtn = document.getElementById('skip-ident-btn');
  const profileScreen = document.getElementById('profile-screen');

  function runIdentAnimation() {
    playTheatricalChime();

    // Beam sweep
    setTimeout(() => {
      identBeam.style.transition = 'all 1.4s cubic-bezier(0.16, 1, 0.3, 1)';
      identBeam.style.opacity = '1';
      identBeam.style.left = '30%';
    }, 400);

    // Trails eruption
    setTimeout(() => {
      identTrails.style.transition = 'opacity 0.6s ease';
      identTrails.style.opacity = '1';
      document.querySelectorAll('.ident-trail-line').forEach(line => {
        line.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        line.style.transform = 'scaleY(1)';
      });
    }, 1400);

    // Monogram reveal
    setTimeout(() => {
      identContent.style.opacity = '1';
      identContent.style.transform = 'scale(1)';
    }, 2200);

    // Fade to Profile Selection
    setTimeout(() => {
      finishIdent();
    }, 4800);
  }

  function finishIdent() {
    identSection.style.opacity = '0';
    setTimeout(() => {
      identSection.style.display = 'none';
      profileScreen.classList.add('active');
    }, 1000);
  }

  skipIdentBtn.addEventListener('click', finishIdent);
  runIdentAnimation();

  // --- 2. PROFILE SELECTION ---
  const profileLavz = document.getElementById('profile-lavz');
  const profileHim = document.getElementById('profile-him');
  const profileStory = document.getElementById('profile-story');
  const entryPrompt = document.getElementById('entry-prompt');

  profileLavz.addEventListener('click', () => {
    profileScreen.classList.remove('active');
    entryPrompt.classList.add('active');
  });

  profileHim.addEventListener('click', () => {
    alert("🔒 Identity Classified!\nFace reveal is intentionally reserved for the wedding day ❤️");
  });

  profileStory.addEventListener('click', () => {
    profileScreen.classList.remove('active');
    entryPrompt.classList.add('active');
  });

  // --- 3. ENTRY PROMPT & STARTING THE EXPERIENCE ---
  const btnStartExp = document.getElementById('btn-start-experience');
  const coldOpen = document.getElementById('cold-open');
  const coldText = document.getElementById('cold-text');
  const coldFollowBtn = document.getElementById('cold-follow-btn');

  btnStartExp.addEventListener('click', () => {
    entryPrompt.classList.remove('active');
    startSoundtrack();
    runColdOpen();
  });

  // --- 4. CINEMATIC COLD OPEN ---
  function runColdOpen() {
    coldOpen.classList.add('active');
    
    // Typing sequence
    typeWriterEffect(coldText, "It started with…", 60, () => {
      setTimeout(() => {
        typeWriterEffect(coldText, "a random Reel.", 70, () => {
          setTimeout(() => {
            typeWriterEffect(coldText, "Why does this girl keep appearing on my feed?", 50, () => {
              // Enable follow button interaction
              coldFollowBtn.addEventListener('click', onFollowClicked);
              setTimeout(() => {
                onFollowClicked();
              }, 2200);
            });
          }, 1000);
        });
      }, 900);
    });
  }

  let followHandled = false;
  function onFollowClicked() {
    if (followHandled) return;
    followHandled = true;
    coldFollowBtn.classList.add('following');
    coldFollowBtn.textContent = 'FOLLOWING ✓';

    setTimeout(() => {
      typeWriterEffect(coldText, "He thought he found a Reel…\nHe didn't know he was finding her.", 60, () => {
        setTimeout(() => {
          coldOpen.style.opacity = '0';
          setTimeout(() => {
            coldOpen.classList.remove('active');
            coldOpen.style.display = 'none';
          }, 800);
        }, 2000);
      });
    }, 1200);
  }

  function typeWriterEffect(elem, text, speed, onDone) {
    elem.innerHTML = '';
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        elem.innerHTML += text.charAt(i) === '\n' ? '<br>' : text.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        if (onDone) onDone();
      }
    }, speed);
  }

  // --- 5. DESKTOP CURSOR GLOW ---
  const cursorGlow = document.getElementById('cursor-glow');
  window.addEventListener('mousemove', (e) => {
    if (cursorGlow) {
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    }
  });

  // --- 6. NAVBAR SCROLL EFFECT ---
  const mainNav = document.getElementById('main-nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      mainNav.classList.add('scrolled');
    } else {
      mainNav.classList.remove('scrolled');
    }
  });

  // --- 7. WAVELENGTH CANVAS (Episode 02) ---
  const waveCanvas = document.getElementById('wavelength-canvas');
  if (waveCanvas) {
    const ctx = waveCanvas.getContext('2d');
    let waveStep = 0;

    function resizeWave() {
      waveCanvas.width = waveCanvas.parentElement.clientWidth * window.devicePixelRatio || 400;
      waveCanvas.height = 120 * window.devicePixelRatio;
    }
    resizeWave();
    window.addEventListener('resize', resizeWave);

    function renderWave() {
      ctx.clearRect(0, 0, waveCanvas.width, waveCanvas.height);
      const w = waveCanvas.width;
      const h = waveCanvas.height;
      const mid = h / 2;

      waveStep += 0.04;

      // Wave 1: Red (Her)
      ctx.beginPath();
      ctx.strokeStyle = '#E50914';
      ctx.lineWidth = 3;
      for (let x = 0; x < w; x++) {
        const y = mid + Math.sin(x * 0.015 + waveStep) * 22;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Wave 2: Crimson / Synchronizing (Him)
      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      for (let x = 0; x < w; x++) {
        // Slowly converges into the exact same frequency and phase
        const y = mid + Math.sin(x * 0.015 + waveStep + 0.1) * 22;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      requestAnimationFrame(renderWave);
    }
    renderWave();
  }

  // --- 8. INTERACTIVE CONNECT THE DOTS (Murugan / Constellation) ---
  const dotsCanvas = document.getElementById('dots-canvas');
  const btnAutoConnect = document.getElementById('btn-auto-connect-dots');
  const btnResetDots = document.getElementById('btn-reset-dots');
  const dotsResolvedMsg = document.getElementById('dots-resolved-message');

  if (dotsCanvas) {
    const ctx = dotsCanvas.getContext('2d');
    let width, height;

    const nodeLabels = ['REEL', 'FOLLOW', 'MESSAGE', 'MURUGAN', 'PRAYER', 'PATIENCE', 'LOVE', 'FAMILY'];
    let nodes = [];
    let connections = [];
    let isConnectingAll = false;

    function initDots() {
      const rect = dotsCanvas.parentElement.getBoundingClientRect();
      width = dotsCanvas.width = rect.width;
      height = dotsCanvas.height = rect.height;

      // Place nodes in a gentle heart-like arc
      nodes = [
        { label: 'REEL', x: width * 0.22, y: height * 0.35, connected: false },
        { label: 'FOLLOW', x: width * 0.35, y: height * 0.22, connected: false },
        { label: 'MURUGAN', x: width * 0.50, y: height * 0.32, connected: false, isMurugan: true },
        { label: 'MESSAGE', x: width * 0.65, y: height * 0.22, connected: false },
        { label: 'PRAYER', x: width * 0.78, y: height * 0.35, connected: false },
        { label: 'PATIENCE', x: width * 0.72, y: height * 0.58, connected: false },
        { label: 'LOVE', x: width * 0.50, y: height * 0.82, connected: false },
        { label: 'FAMILY', x: width * 0.28, y: height * 0.58, connected: false },
      ];
      connections = [];
      dotsResolvedMsg.classList.remove('visible');
    }

    initDots();
    window.addEventListener('resize', initDots);

    function drawDots() {
      ctx.clearRect(0, 0, width, height);

      // Draw connections
      ctx.strokeStyle = '#D8B46A';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#D8B46A';
      ctx.shadowBlur = 10;

      for (let i = 0; i < connections.length; i++) {
        const from = nodes[connections[i].from];
        const to = nodes[connections[i].to];
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }

      // Draw nodes
      nodes.forEach((n, idx) => {
        ctx.shadowBlur = n.connected ? 18 : 6;
        ctx.shadowColor = n.isMurugan ? '#D8B46A' : (n.connected ? '#E50914' : '#ffffff');
        
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.connected ? 9 : 7, 0, Math.PI * 2);
        ctx.fillStyle = n.isMurugan ? '#D8B46A' : (n.connected ? '#ff4d58' : '#ffffff');
        ctx.fill();

        // Label
        ctx.shadowBlur = 0;
        ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = n.isMurugan ? '#ffd880' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText(n.label, n.x, n.y - 14);
      });

      requestAnimationFrame(drawDots);
    }
    drawDots();

    // Auto connect function
    function autoConnect() {
      connections = [];
      nodes.forEach(n => n.connected = true);

      // Connect in sequence to form a closed radiant constellation
      const seq = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 6];
      let step = 0;
      const interval = setInterval(() => {
        if (step < seq.length - 1) {
          connections.push({ from: seq[step], to: seq[step + 1] });
          step++;
        } else {
          clearInterval(interval);
          dotsResolvedMsg.classList.add('visible');
        }
      }, 250);
    }

    btnAutoConnect.addEventListener('click', autoConnect);
    btnResetDots.addEventListener('click', initDots);

    // Click on canvas to connect nearest node
    dotsCanvas.addEventListener('click', (e) => {
      const rect = dotsCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let nearestIdx = -1;
      let minDist = 40;
      nodes.forEach((n, idx) => {
        const dist = Math.hypot(n.x - clickX, n.y - clickY);
        if (dist < minDist) {
          minDist = dist;
          nearestIdx = idx;
        }
      });

      if (nearestIdx !== -1) {
        nodes[nearestIdx].connected = true;
        // Connect to a previous node if any
        const connectedIndices = nodes.map((n, i) => n.connected ? i : -1).filter(i => i !== -1);
        if (connectedIndices.length > 1) {
          const prev = connectedIndices[connectedIndices.length - 2];
          connections.push({ from: prev, to: nearestIdx });
        }
        if (connectedIndices.length >= nodes.length) {
          dotsResolvedMsg.classList.add('visible');
        }
      }
    });
  }

  // --- 9. LIVE CALL TIMER & HEART UNLOCK (Episode 09) ---
  const callTimerElem = document.getElementById('call-timer');
  if (callTimerElem) {
    let callSecs = 6129; // 01:42:09
    setInterval(() => {
      callSecs++;
      const hrs = String(Math.floor(callSecs / 3600)).padStart(2, '0');
      const mins = String(Math.floor((callSecs % 3600) / 60)).padStart(2, '0');
      const secs = String(callSecs % 60).padStart(2, '0');
      callTimerElem.textContent = `${hrs}:${mins}:${secs}`;
    }, 1000);
  }

  const unlockHeartBtn = document.getElementById('btn-unlock-heart');
  const unlockMeterFill = document.getElementById('unlock-meter-fill');
  const unlockPercentage = document.getElementById('unlock-percentage');
  const unlockHeartIcon = document.getElementById('unlock-heart-icon');

  const progressSteps = [20, 38, 57, 74, 91, 100];
  let currentUnlockIndex = 0;

  if (unlockHeartBtn) {
    unlockHeartBtn.addEventListener('click', () => {
      currentUnlockIndex = (currentUnlockIndex + 1) % progressSteps.length;
      const percent = progressSteps[currentUnlockIndex];
      unlockMeterFill.style.width = percent + '%';
      unlockPercentage.textContent = percent + '%';

      if (percent === 100) {
        unlockHeartIcon.textContent = '❤️';
        unlockHeartIcon.style.transform = 'scale(1.3)';
        unlockHeartBtn.textContent = '❤️ UNLOCKED!';
        unlockHeartBtn.style.background = '#4ade80';
        unlockHeartBtn.style.color = '#000';
      } else {
        unlockHeartIcon.textContent = '🔒';
        unlockHeartIcon.style.transform = 'scale(1)';
        unlockHeartBtn.textContent = '❤️ Tap To Unlock';
        unlockHeartBtn.style.background = '';
        unlockHeartBtn.style.color = '';
      }
    });
  }

  // --- 10. SECRET EPISODE ("THE YES THAT WAS NEVER SAID") ---
  const btnSecretYes = document.getElementById('btn-secret-yes');
  const secretYesRevealed = document.getElementById('secret-yes-revealed');
  let dodgeCount = 0;

  if (btnSecretYes) {
    const dodge = () => {
      dodgeCount++;
      if (dodgeCount <= 3) {
        const x = (Math.random() - 0.5) * 80;
        const y = (Math.random() - 0.5) * 40;
        btnSecretYes.style.transform = `translate(${x}px, ${y}px)`;
      } else {
        btnSecretYes.style.display = 'none';
        secretYesRevealed.style.display = 'block';
      }
    };
    btnSecretYes.addEventListener('mouseenter', dodge);
    btnSecretYes.addEventListener('click', () => {
      btnSecretYes.style.display = 'none';
      secretYesRevealed.style.display = 'block';
    });
  }

  // --- 11. ROAST MODE ---
  const btnRoast = document.getElementById('btn-activate-roast');
  const roastBox = document.getElementById('roast-message-box');
  const roastContainer = document.getElementById('roast-container');

  if (btnRoast) {
    btnRoast.addEventListener('click', () => {
      roastContainer.classList.add('roast-active');
      roastBox.style.display = 'block';
      setTimeout(() => {
        roastContainer.classList.remove('roast-active');
      }, 3500);
    });
  }

  // --- 12. DESTINY ANSWER ---
  const btnDestinyAnswer = document.getElementById('btn-destiny-answer');
  const destinyRevealText = document.getElementById('destiny-reveal-text');

  if (btnDestinyAnswer) {
    btnDestinyAnswer.addEventListener('click', () => {
      btnDestinyAnswer.style.display = 'none';
      destinyRevealText.style.display = 'block';
    });
  }

  // --- 13. FACE REVEAL BUFFERING EASTER EGG ---
  const btnRevealHim = document.getElementById('btn-reveal-him');
  const bufferCounter = document.getElementById('buffer-counter');
  const deniedAlert = document.getElementById('denied-alert');

  if (btnRevealHim) {
    btnRevealHim.addEventListener('click', () => {
      btnRevealHim.style.display = 'none';
      bufferCounter.style.display = 'block';
      deniedAlert.style.display = 'none';

      const bufferSteps = [10, 31, 57, 78, 99];
      let step = 0;

      const bufferInterval = setInterval(() => {
        if (step < bufferSteps.length) {
          bufferCounter.textContent = bufferSteps[step] + '%';
          step++;
        } else {
          clearInterval(bufferInterval);
          bufferCounter.style.display = 'none';
          deniedAlert.style.display = 'block';
        }
      }, 400);
    });
  }

  // --- 14. MEMORY GALLERY LIGHTBOX ---
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const fullSrc = item.getAttribute('data-full');
      const caption = item.getAttribute('data-caption');
      lightboxImg.src = fullSrc;
      lightboxCaption.textContent = caption;
      lightboxModal.classList.add('active');
    });
  });

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', () => {
      lightboxModal.classList.remove('active');
    });
  }
  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.classList.remove('active');
    }
  });

  // --- 15. LETTER FROM LAVZ MODAL ---
  const letterModal = document.getElementById('letter-modal');
  const btnOpenLetterNav = document.getElementById('nav-letter-btn');
  const btnOpenLetterHero = document.getElementById('btn-open-letter-hero');
  const letterCloseBtn = document.getElementById('letter-close-btn');

  function openLetter() {
    letterModal.classList.add('active');
  }
  function closeLetter() {
    letterModal.classList.remove('active');
  }

  if (btnOpenLetterNav) btnOpenLetterNav.addEventListener('click', openLetter);
  if (btnOpenLetterHero) btnOpenLetterHero.addEventListener('click', openLetter);
  if (letterCloseBtn) letterCloseBtn.addEventListener('click', closeLetter);
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) closeLetter();
  });

  // Keyboard accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      lightboxModal.classList.remove('active');
      closeLetter();
    }
  });

});
