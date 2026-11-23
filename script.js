/* ==========================================================
   Royal Indian Wedding Invitation - Neha & Guddu
   Interactive Scripts & Audio Engine
   ========================================================== */

// Global Audio & State variables
let audioCtx = null;
let isPlaying = false;
let audioInterval = null;

// Scale: Raag Bhoopali / Auspicious pentatonic notes (Sa Re Ga Pa Dha)
const notes = [
  261.63, // C4 (Sa)
  293.66, // D4 (Re)
  329.63, // E4 (Ga)
  392.00, // G4 (Pa)
  440.00, // A4 (Dha)
  523.25, // C5 (Sa')
  587.33, // D5 (Re')
  659.25, // E5 (Ga')
  783.99, // G5 (Pa')
  880.00  // A5 (Dha')
];

const melodyPattern = [
  { note: 2, dur: 0.8 },
  { note: 3, dur: 0.6 },
  { note: 4, dur: 1.2 },
  { note: 5, dur: 1.5 },
  { note: 4, dur: 0.8 },
  { note: 3, dur: 0.8 },
  { note: 2, dur: 1.4 },
  { note: 1, dur: 0.8 },
  { note: 0, dur: 1.6 },
  { note: 1, dur: 0.8 },
  { note: 2, dur: 1.0 },
  { note: 3, dur: 1.2 },
  { note: 2, dur: 0.8 },
  { note: 1, dur: 0.8 },
  { note: 0, dur: 2.0 },
  { note: 4, dur: 0.9 },
  { note: 5, dur: 1.2 },
  { note: 6, dur: 0.8 },
  { note: 7, dur: 1.5 },
  { note: 6, dur: 0.8 },
  { note: 5, dur: 1.8 }
];

let currentMelodyIdx = 0;

function initSynthAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playShehnaiNote(freq, duration) {
  if (!audioCtx || !isPlaying) return;

  const now = audioCtx.currentTime;
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0.001, now);
  masterGain.gain.exponentialRampToValueAtTime(0.22, now + 0.12);
  masterGain.gain.exponentialRampToValueAtTime(0.18, now + duration * 0.7);
  masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1200, now);
  filter.Q.setValueAtTime(2.2, now);

  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.setValueAtTime(freq, now);

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now);

  const vibrato = audioCtx.createOscillator();
  const vibratoGain = audioCtx.createGain();
  vibrato.frequency.setValueAtTime(5.5, now);
  vibratoGain.gain.setValueAtTime(4.0, now);
  vibrato.connect(osc1.frequency);
  vibrato.connect(osc2.frequency);

  const droneGain = audioCtx.createGain();
  droneGain.gain.setValueAtTime(0.03, now);
  droneGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 1.5);
  const droneOsc = audioCtx.createOscillator();
  droneOsc.type = 'sine';
  droneOsc.frequency.setValueAtTime(130.81, now);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(masterGain);
  masterGain.connect(audioCtx.destination);

  droneOsc.connect(droneGain);
  droneGain.connect(audioCtx.destination);

  vibrato.start(now);
  osc1.start(now);
  osc2.start(now);
  droneOsc.start(now);

  vibrato.stop(now + duration);
  osc1.stop(now + duration);
  osc2.stop(now + duration);
  droneOsc.stop(now + duration * 1.5);
}

function startSynthesizerLoop() {
  initSynthAudio();
  function step() {
    if (!isPlaying) return;
    const item = melodyPattern[currentMelodyIdx];
    const freq = notes[item.note];
    playShehnaiNote(freq, item.dur);
    currentMelodyIdx = (currentMelodyIdx + 1) % melodyPattern.length;
    audioInterval = setTimeout(step, item.dur * 950);
  }
  step();
}

function startMusic() {
  isPlaying = true;
  const weddingAudio = document.getElementById('wedding-audio');
  const soundWave = document.getElementById('sound-wave');
  const audioText = document.getElementById('audio-text');

  if (soundWave) soundWave.classList.remove('paused');
  if (audioText) audioText.textContent = 'मांगलिक संगीत बज रहा है';

  if (weddingAudio) {
    weddingAudio.volume = 0.85;
    const playPromise = weddingAudio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log("Background song started successfully!");
      }).catch(err => {
        console.warn("HTML5 audio playback restricted or failed, starting synth fallback:", err);
        startSynthesizerLoop();
      });
    }
  } else {
    startSynthesizerLoop();
  }
}

function pauseMusic() {
  isPlaying = false;
  const weddingAudio = document.getElementById('wedding-audio');
  const soundWave = document.getElementById('sound-wave');
  const audioText = document.getElementById('audio-text');

  clearTimeout(audioInterval);
  if (weddingAudio) {
    try { weddingAudio.pause(); } catch (e) {}
  }
  if (soundWave) soundWave.classList.add('paused');
  if (audioText) audioText.textContent = 'संगीत चालू करें';
}

function toggleAudio() {
  if (isPlaying) {
    pauseMusic();
  } else {
    startMusic();
  }
}

// Global functions for opening and reopening the invitation
function openInvitation() {
  const overlay = document.getElementById('envelope-overlay');
  if (overlay) {
    overlay.classList.add('opened');
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    }, 600);
  }

  // Play audio safely
  try {
    if (!isPlaying) {
      startMusic();
    }
  } catch (err) {
    console.warn("Audio error on open:", err);
  }

  // Fire celebratory confetti safely
  try {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#e11d48', '#f59e0b', '#fff2a8', '#15803d']
      });
    }
  } catch (err) {
    console.warn("Confetti error:", err);
  }
}

function reopenInvitation() {
  const overlay = document.getElementById('envelope-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    void overlay.offsetWidth; // force reflow
    overlay.classList.remove('opened');
    document.body.style.overflow = 'hidden';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Make globally accessible
window.openInvitation = openInvitation;
window.reopenInvitation = reopenInvitation;
window.toggleAudio = toggleAudio;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {

  // Audio pill button listener
  const audioPill = document.getElementById('audio-pill');
  if (audioPill) {
    audioPill.addEventListener('click', toggleAudio);
  }

  // Envelope button listeners
  const openInviteBtn = document.getElementById('open-invite-btn');
  const reopenInviteBtn = document.getElementById('reopen-invite-btn');
  if (openInviteBtn) openInviteBtn.addEventListener('click', openInvitation);
  if (reopenInviteBtn) reopenInviteBtn.addEventListener('click', reopenInvitation);

  // 1. Falling Petals Canvas Engine
  const canvas = document.getElementById('petals-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let petals = [];

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const petalColors = [
      'rgba(225, 29, 72, 0.85)',
      'rgba(244, 63, 94, 0.8)',
      'rgba(245, 158, 11, 0.85)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(212, 175, 55, 0.75)'
    ];

    class Petal {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20 - Math.random() * 50;
        this.size = 8 + Math.random() * 14;
        this.speedX = -1 + Math.random() * 2;
        this.speedY = 1.2 + Math.random() * 2.2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = -2 + Math.random() * 4;
        this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        this.swing = Math.random() * 2;
        this.swingSpeed = 0.02 + Math.random() * 0.03;
        this.angle = 0;
      }

      update() {
        this.angle += this.swingSpeed;
        this.x += Math.sin(this.angle) * this.swing + this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;

        if (this.y > canvas.height + 30) {
          this.reset();
        }
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(this.size / 2, -this.size / 2, this.size, 0, 0, this.size);
        ctx.bezierCurveTo(-this.size, 0, -this.size / 2, -this.size / 2, 0, 0);
        ctx.fill();
        ctx.restore();
      }
    }

    for (let i = 0; i < 35; i++) {
      const p = new Petal();
      p.y = Math.random() * canvas.height;
      petals.push(p);
    }

    function animatePetals() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < petals.length; i++) {
        petals[i].update();
        petals[i].draw();
      }
      requestAnimationFrame(animatePetals);
    }
    animatePetals();

    // Petal Shower Button
    const petalShowerBtn = document.getElementById('petal-shower-btn');
    if (petalShowerBtn) {
      petalShowerBtn.addEventListener('click', () => {
        for (let i = 0; i < 45; i++) {
          petals.push(new Petal());
        }
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#d4af37', '#e11d48', '#f59e0b', '#fff2a8', '#15803d']
          });
        }
        setTimeout(() => {
          if (petals.length > 40) petals.splice(35);
        }, 10000);
      });
    }
  }

  // 2. Wedding Countdown Timer (Target: 30 November 2026, 19:00:00)
  const weddingDate = new Date('2026-11-30T19:00:00+05:30').getTime();

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = weddingDate - now;

    const dEl = document.getElementById('days');
    const hEl = document.getElementById('hours');
    const mEl = document.getElementById('minutes');
    const sEl = document.getElementById('seconds');
    const tagEl = document.getElementById('countdown-tag');

    if (distance <= 0) {
      if (dEl) dEl.textContent = '00';
      if (hEl) hEl.textContent = '00';
      if (mEl) mEl.textContent = '00';
      if (sEl) sEl.textContent = '00';
      if (tagEl) tagEl.textContent = '✨ आज शुभ विवाह का पावन दिन है! ✨';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const pad = (n) => (n < 10 ? '0' + n : n);

    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(minutes);
    if (sEl) sEl.textContent = pad(seconds);
  }

  setInterval(updateCountdown, 1000);
  updateCountdown();

  // 3. Add To Calendar (Google Calendar)
  const calendarBtn = document.getElementById('add-calendar-btn');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      const title = encodeURIComponent("नेहा संग गुड्डू का शुभ विवाह");
      const details = encodeURIComponent("आयुष्मती नेहा कुमारी संग आयुष्मान् गुड्डू राय के परिणय सूत्र बंधन एवं प्रीतिभोज समारोह में आपकी सस्नेह उपस्थिति सादर प्रार्थनीय है।");
      const location = encodeURIComponent("मंजु वाटिका, दाउदनगर, पटना (बिहार)");
      const startDate = "20261130T133000Z";
      const endDate = "20261130T193000Z";
      const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
      window.open(googleCalUrl, '_blank');
    });
  }

  // 4. Lightbox Gallery
  const galleryItems = document.querySelectorAll('.gallery-thumb');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentGalleryIndex = 0;
  const galleryData = [];

  galleryItems.forEach((thumb, idx) => {
    galleryData.push({
      src: thumb.getAttribute('data-full') || thumb.getAttribute('src'),
      caption: thumb.getAttribute('data-caption') || 'शुभ विवाह स्मृतियां'
    });

    thumb.addEventListener('click', () => {
      currentGalleryIndex = idx;
      openLightbox(idx);
    });
  });

  function openLightbox(index) {
    if (!lightboxModal) return;
    const item = galleryData[index];
    lightboxImg.src = item.src;
    lightboxCaption.textContent = item.caption;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  function showNextImage() {
    currentGalleryIndex = (currentGalleryIndex + 1) % galleryData.length;
    openLightbox(currentGalleryIndex);
  }

  function showPrevImage() {
    currentGalleryIndex = (currentGalleryIndex - 1 + galleryData.length) % galleryData.length;
    openLightbox(currentGalleryIndex);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNextImage();
    if (e.key === 'ArrowLeft') showPrevImage();
  });

  // 5. Gallery Filter Tags
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active', 'bg-amber-600', 'text-white'));
      filterBtns.forEach(b => b.classList.add('bg-amber-100', 'text-amber-900'));
      btn.classList.add('active', 'bg-amber-600', 'text-white');
      btn.classList.remove('bg-amber-100', 'text-amber-900');

      const filter = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-category') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 6. Card Scan Tabs (Designer Card, Page 1, Page 2 switcher)
  const tabAllCard = document.getElementById('tab-card-all');
  const tabPage1 = document.getElementById('tab-page1');
  const tabPage2 = document.getElementById('tab-page2');
  const cardViewAll = document.getElementById('card-view-all');
  const cardImg1 = document.getElementById('card-view-1');
  const cardImg2 = document.getElementById('card-view-2');

  function resetCardTabs() {
    [tabAllCard, tabPage1, tabPage2].forEach(tab => {
      if (tab) {
        tab.classList.remove('bg-amber-600', 'text-white');
        tab.classList.add('bg-amber-50', 'text-amber-800');
      }
    });
    [cardViewAll, cardImg1, cardImg2].forEach(view => {
      if (view) view.classList.add('hidden');
    });
  }

  if (tabAllCard) {
    tabAllCard.addEventListener('click', () => {
      resetCardTabs();
      tabAllCard.classList.add('bg-amber-600', 'text-white');
      tabAllCard.classList.remove('bg-amber-50', 'text-amber-800');
      if (cardViewAll) cardViewAll.classList.remove('hidden');
    });
  }

  if (tabPage1) {
    tabPage1.addEventListener('click', () => {
      resetCardTabs();
      tabPage1.classList.add('bg-amber-600', 'text-white');
      tabPage1.classList.remove('bg-amber-50', 'text-amber-800');
      if (cardImg1) cardImg1.classList.remove('hidden');
    });
  }

  if (tabPage2) {
    tabPage2.addEventListener('click', () => {
      resetCardTabs();
      tabPage2.classList.add('bg-amber-600', 'text-white');
      tabPage2.classList.remove('bg-amber-50', 'text-amber-800');
      if (cardImg2) cardImg2.classList.remove('hidden');
    });
  }

  // 7. Blessings & Wishes Board (No Headcount / Open for All Families)
  const rsvpForm = document.getElementById('rsvp-form');
  const wishesContainer = document.getElementById('wishes-container');

  const defaultWishes = [
    {
      name: "समस्त मंडल एवं राय परिवार",
      relation: "किशनगंज व पटना",
      message: "परमपिता परमेश्वर का आशीर्वाद नेहा और गुड्डू पर सदैव बना रहे। दोनों का दांपत्य जीवन प्रेम, सुख और समृद्धि से परिपूर्ण हो!",
      time: "2 दिन पहले"
    },
    {
      name: "चाचा जयकांत व भीम मंडल",
      relation: "पश्चिमपल्ली, किशनगंज",
      message: "हमारी प्यारी बिटिया नेहा और दामाद गुड्डू को नए जीवन की मंगलकामनाएं! खूब तरक्की करो और सदा मुस्कुराते रहो।",
      time: "कल"
    },
    {
      name: "भाई शिवा & बहनें मधु, निकिता",
      relation: "किशनगंज",
      message: "दीदी और जीजू को शादी की ढेर सारी बधाइयां! सगाई से लेकर शादी तक के सभी पल हमेशा यादगार रहेंगे। Love you both! 🎉❤️",
      time: "आज"
    }
  ];

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  function renderWishes() {
    if (!wishesContainer) return;
    const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    const allWishes = [...stored, ...defaultWishes];

    wishesContainer.innerHTML = '';
    allWishes.forEach(item => {
      const card = document.createElement('div');
      card.className = "bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow";
      card.innerHTML = `
        <div class="flex items-center justify-between mb-2 border-b border-amber-200/60 pb-2">
          <div>
            <h5 class="font-bold text-amber-950 font-poppins text-sm md:text-base">${escapeHtml(item.name)}</h5>
            <span class="text-xs text-amber-700">${escapeHtml(item.relation || 'सपरिवार शुभाशीष')}</span>
          </div>
          <span class="text-xs text-amber-600/80">${escapeHtml(item.time || 'अभी')}</span>
        </div>
        <p class="text-amber-900 text-sm leading-relaxed font-poppins italic">"${escapeHtml(item.message)}"</p>
        <div class="mt-2 text-right">
          <span class="text-xs text-rose-600 font-semibold">❤️ मंगलकामनाएं</span>
        </div>
      `;
      wishesContainer.appendChild(card);
    });
  }

  renderWishes();

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('guest-name');
      const relationInput = document.getElementById('guest-relation');
      const messageInput = document.getElementById('guest-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const relation = relationInput ? relationInput.value.trim() : 'सपरिवार';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name) {
        alert("कृपया अपना शुभ नाम दर्ज करें");
        return;
      }

      const stored = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
      const newWish = {
        name: name,
        relation: relation || 'सपरिवार शुभाशीष',
        message: message || "नेहा एवं गुड्डू को वैवाहिक जीवन की हार्दिक बधाई एवं शुभकामनाएं!",
        time: "अभी"
      };
      stored.unshift(newWish);
      localStorage.setItem('wedding_wishes', JSON.stringify(stored));

      if (typeof confetti === 'function') {
        confetti({
          particleCount: 85,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#d4af37', '#e11d48', '#f59e0b', '#fff2a8', '#15803d']
        });
      }
      renderWishes();

      const successModal = document.getElementById('rsvp-success-msg');
      if (successModal) {
        successModal.classList.remove('hidden');
        setTimeout(() => {
          successModal.classList.add('hidden');
        }, 5000);
      }

      rsvpForm.reset();
    });
  }

  // 8. WhatsApp Share Button
  const whatsappShareBtn = document.getElementById('whatsapp-share-btn');
  if (whatsappShareBtn) {
    whatsappShareBtn.addEventListener('click', () => {
      const text = encodeURIComponent(
        `🌸 *शुभ विवाह निमंत्रण* 🌸\n\n` +
        `॥ श्री गणेशाय नमः ॥\n\n` +
        `प्रिय स्नेहीजन,\n` +
        `परमपिता परमेश्वर की असीम अनुकम्पा से हमारी सुपुत्री *आयुष्मती नेहा कुमारी* एवं *आयुष्मान् गुड्डू राय* के परिणय सूत्र बंधन में आप सपरिवार सादर आमंत्रित हैं।\n\n` +
        `📍 *मातृ-सदन कार्यक्रम (किशनगंज):*\n` +
        `• 25 नवम्बर: सत्यनारायण पूजा एवं हल्दी मटकोर\n` +
        `• 26 नवम्बर: हल्दी, मेहंदी एवं संगीत संध्या\n` +
        `• 27 नवम्बर: देवी पूजन\n` +
        `स्थान: पश्चिमपल्ली, जिला-किशनगंज (बिहार)\n\n` +
        `👑 *शुभ विवाह एवं प्रीतिभोज (पटना):*\n` +
        `• 30 नवम्बर 2026 (सोमवार), संध्या 7:00 बजे से\n` +
        `स्थान: मंजु वाटिका, दाउदनगर, पटना (बिहार)\n\n` +
        `✨ शादी का सम्पूर्ण डिजिटल निमंत्रण, फोटो गैलरी व कार्यक्रम विवरण देखने के लिए नीचे दिए गए लिंक पर क्लिक करें:\n` +
        `${window.location.href}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    });
  }

  // 9. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    const mobileLinks = mobileMenu.querySelectorAll('a, button');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
});
