// ─── Navbar scroll effect ───────────────────
(function () {
  const nav = document.getElementById("mainNav");
  if (!nav) return;
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add("scrolled");
    } else {
      nav.classList.remove("scrolled");
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

// ─── Active nav link on scroll ──────────────
(function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + entry.target.id
            );
          });
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px" }
  );

  sections.forEach((sec) => observer.observe(sec));
})();

// ─── Scroll Reveal animation ─────────────────
(function () {
  const reveals = document.querySelectorAll(".reveal");
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  reveals.forEach((el) => observer.observe(el));
})();

// ─── Countdown Timer ─────────────────────────
(function () {
  // Pricing section elements
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");
  // Top bar elements
  const tbHours = document.getElementById("tb-hours");
  const tbMinutes = document.getElementById("tb-minutes");
  const tbSeconds = document.getElementById("tb-seconds");

  if (!hoursEl && !tbHours) return;

  // Persist countdown across page refreshes using sessionStorage
  const STORAGE_KEY = "azm_countdown_end";
  let endTime = parseInt(sessionStorage.getItem(STORAGE_KEY), 10);
  if (!endTime || endTime <= Date.now()) {
    endTime = Date.now() + 48 * 60 * 60 * 1000;
    sessionStorage.setItem(STORAGE_KEY, endTime);
  }

  const pad = (n) => String(n).padStart(2, "0");

  const tick = () => {
    const diff = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    // Update pricing countdown
    if (hoursEl) hoursEl.textContent = pad(h);
    if (minutesEl) minutesEl.textContent = pad(m);
    if (secondsEl) secondsEl.textContent = pad(s);
    // Update top bar countdown
    if (tbHours) tbHours.textContent = pad(h);
    if (tbMinutes) tbMinutes.textContent = pad(m);
    if (tbSeconds) tbSeconds.textContent = pad(s);
    if (diff <= 0) clearInterval(timer);
  };

  tick();
  const timer = setInterval(tick, 1000);
})();

// ─── Custom Video Controls ────────────────────
(function () {
  const video = document.getElementById("promoVideo");
  if (!video) return;

  const overlayPlay = document.getElementById("videoOverlayPlay");
  const controls = document.getElementById("videoControls");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const muteBtn = document.getElementById("muteBtn");
  const progressBar = document.getElementById("progressBar");
  const volumeBar = document.getElementById("volumeBar");
  const timeLabel = document.getElementById("timeLabel");

  video.removeAttribute("controls");

  const fmt = (t) => {
    if (isNaN(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  const updatePlayIcon = () => {
    if (!playPauseBtn) return;
    playPauseBtn.querySelector("i").className = video.paused
      ? "bi bi-play-fill"
      : "bi bi-pause-fill";
  };

  const updateMuteIcon = () => {
    if (!muteBtn) return;
    muteBtn.querySelector("i").className =
      video.muted || video.volume === 0
        ? "bi bi-volume-mute-fill"
        : "bi bi-volume-up-fill";
  };

  const updateTime = () => {
    if (!timeLabel) return;
    timeLabel.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration || 0)}`;
  };

  const updateProgress = () => {
    if (!progressBar || !video.duration) return;
    progressBar.value = (video.currentTime / video.duration) * 100 || 0;
  };

  const playVideo = () => {
    video.play().then(() => {
      if (soundToggle) soundToggle.style.display = "none";
      updatePlayIcon();
    }).catch(() => { });
  };

  const pauseVideo = () => {
    video.pause();
    updatePlayIcon();
  };

  const soundToggle = document.getElementById("videoSoundToggle");

  if (soundToggle) {
    soundToggle.addEventListener("click", () => {
      video.muted = false;
      video.volume = 1;
      playVideo();
      updateMuteIcon();
    });
  }

  playPauseBtn?.addEventListener("click", () => (video.paused ? playVideo() : pauseVideo()));
  video.addEventListener("click", () => (video.paused ? playVideo() : pauseVideo()));

  progressBar?.addEventListener("input", (e) => {
    if (!video.duration) return;
    video.currentTime = (Number(e.target.value) / 100) * video.duration;
  });

  volumeBar?.addEventListener("input", (e) => {
    video.volume = Number(e.target.value);
    video.muted = video.volume === 0;
    updateMuteIcon();
  });

  muteBtn?.addEventListener("click", () => {
    video.muted = !video.muted;
    if (!video.muted && video.volume === 0) {
      video.volume = 0.5;
      if (volumeBar) volumeBar.value = "0.5";
    }
    updateMuteIcon();
  });

  video.addEventListener("timeupdate", () => { updateTime(); updateProgress(); });
  video.addEventListener("loadedmetadata", () => { updateTime(); updateProgress(); });
  video.addEventListener("play", () => { updatePlayIcon(); });
  video.addEventListener("pause", () => { updatePlayIcon(); });
  video.addEventListener("ended", () => {
    if (soundToggle && !video.muted) soundToggle.style.display = "flex";
    video.currentTime = 0;
    updateTime(); updateProgress(); updatePlayIcon();
  });

  // Fullscreen support
  const fullScreenBtn = document.getElementById("fullScreenBtn");
  const heroWrapper = document.querySelector(".video-wrapper");
  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (heroWrapper.requestFullscreen) heroWrapper.requestFullscreen();
      else if (heroWrapper.webkitRequestFullscreen) heroWrapper.webkitRequestFullscreen();
      else if (heroWrapper.msRequestFullscreen) heroWrapper.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  fullScreenBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFullScreen();
  });

  video.addEventListener("dblclick", (e) => {
    e.stopPropagation();
    toggleFullScreen();
  });

  // Settings Menu Logic (Hero Video)
  const speedBtns = document.querySelectorAll(".vc-speed-btn");
  speedBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const speed = parseFloat(btn.dataset.speed);
      video.playbackRate = speed;
      speedBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  const qualityBtns = document.querySelectorAll(".vc-quality-btn");
  qualityBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      qualityBtns.forEach(b => b.classList.remove("active", "text-warning"));
      btn.classList.add("active");
      if (btn.dataset.quality === 'auto') btn.classList.add("text-warning");
      // Note: Actual quality switching requires different video source URLs
    });
  });

  // Stop propagation on the settings dropup wrapper itself too
  const vcDropup = document.querySelector(".video-controls .dropup");
  if (vcDropup) {
    vcDropup.addEventListener("click", (e) => e.stopPropagation());
    vcDropup.addEventListener("dblclick", (e) => e.stopPropagation());
  }

  if (volumeBar) video.volume = Number(volumeBar.value ?? 1);
  updateMuteIcon(); updateTime(); updateProgress();
})();

// ─── Results / Testimonials Slider ───────────
(function () {
  const slider = document.getElementById("resultsSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".result-slide"));
  const dots = Array.from(slider.querySelectorAll(".results-dots .results-dot"));
  const total = slides.length;
  if (!total) return;

  let current = 0;
  let autoTimer = null;

  const applyPositions = () => {
    slides.forEach((slide, index) => {
      let diff = index - current;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;

      slide.classList.remove("is-center", "is-left-1", "is-left-2", "is-right-1", "is-right-2", "is-hidden");

      if (diff === 0) slide.classList.add("is-center");
      else if (diff === -1) slide.classList.add("is-left-1");
      else if (diff === -2) slide.classList.add("is-left-2");
      else if (diff === 1) slide.classList.add("is-right-1");
      else if (diff === 2) slide.classList.add("is-right-2");
      else slide.classList.add("is-hidden");
    });

    dots.forEach((dot, idx) => dot.classList.toggle("is-active", idx === current));
  };

  const goTo = (index) => {
    current = (index + total) % total;
    applyPositions();
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  // Auto advance every 4.5 seconds
  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(next, 4500);
  };
  const resetAuto = () => { clearInterval(autoTimer); startAuto(); };

  dots.forEach((dot, idx) => {
    dot.addEventListener("click", () => { goTo(idx); resetAuto(); });
  });

  // Touch / pointer drag
  const track = slider.querySelector(".results-track");
  if (track) {
    let startX = 0, isDragging = false;

    const getX = (e) =>
      e.touches?.[0]?.clientX ?? e.changedTouches?.[0]?.clientX ?? e.clientX;

    track.addEventListener("pointerdown", (e) => { isDragging = true; startX = getX(e); });
    track.addEventListener("touchstart", (e) => { isDragging = true; startX = getX(e); }, { passive: true });

    const handleUp = (e) => {
      if (!isDragging) return;
      const delta = getX(e) - startX;
      if (Math.abs(delta) > 40) { delta < 0 ? next() : prev(); resetAuto(); }
      isDragging = false;
    };

    window.addEventListener("pointerup", handleUp);
    window.addEventListener("touchend", handleUp, { passive: true });
  }

  applyPositions();
  startAuto();

  // Pause on hover
  slider.addEventListener("mouseenter", () => clearInterval(autoTimer));
  slider.addEventListener("mouseleave", startAuto);
})();

// ─── Testimonial Thumbnail Video Click-to-Play + Volume ──
(function () {
  const thumbs = document.querySelectorAll(".result-video-thumb");
  if (!thumbs.length) return;

  thumbs.forEach((thumb) => {
    const vid = thumb.querySelector(".result-thumb-video");
    const icon = thumb.querySelector(".result-play-icon");
    const volBar = thumb.querySelector(".thumb-vol-range");
    const volIcon = thumb.querySelector(".thumb-vol-icon");
    if (!vid) return;

    thumb.style.cursor = "pointer";

    // Volume range control
    if (volBar) {
      volBar.addEventListener("input", (e) => {
        e.stopPropagation();
        vid.volume = Number(e.target.value);
        vid.muted = vid.volume === 0;
        if (volIcon) {
          volIcon.className = vid.muted ? "bi bi-volume-mute-fill thumb-vol-icon" : "bi bi-volume-up-fill thumb-vol-icon";
        }
      });
      volBar.addEventListener("click", (e) => e.stopPropagation());
    }

    // Mute icon click
    if (volIcon) {
      volIcon.style.cursor = "pointer";
      volIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        vid.muted = !vid.muted;
        if (!vid.muted && vid.volume === 0) { vid.volume = 0.7; if (volBar) volBar.value = "0.7"; }
        volIcon.className = vid.muted ? "bi bi-volume-mute-fill thumb-vol-icon" : "bi bi-volume-up-fill thumb-vol-icon";
      });
    }

    // Play / pause on thumb click
    thumb.addEventListener("click", () => {
      if (vid.paused) {
        document.querySelectorAll(".result-thumb-video").forEach((v) => { if (v !== vid) v.pause(); });
        document.querySelectorAll(".result-play-icon").forEach((ic) => { ic.style.opacity = "0.9"; });
        document.querySelectorAll(".result-video-thumb").forEach((t) => t.classList.remove("is-playing"));
        vid.play().catch(() => { });
        if (icon) icon.style.opacity = "0";
        thumb.classList.add("is-playing");
      } else {
        vid.pause();
        if (icon) icon.style.opacity = "0.9";
        thumb.classList.remove("is-playing");
      }
    });

    vid.addEventListener("ended", () => {
      if (icon) icon.style.opacity = "0.9";
      thumb.classList.remove("is-playing");
    });
  });
})();

// ── Play / Pause + Volume per card ──
(function () {

  // Initialize Swiper for Community Slider (Horizontal Stack)
  new Swiper(".communitySwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    loop: true,
    speed: 500,
    coverflowEffect: {
      rotate: 25,
      stretch: 0,
      depth: 300,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
      dynamicBullets: true,
    },
  });


  const testimoCards = document.querySelectorAll(".testimo-card");
  testimoCards.forEach((card) => {
    const thumb = card.querySelector(".testimo-thumb");
    const vid = card.querySelector(".testimo-video");
    const playCenter = card.querySelector(".testimo-play-center");
    const playSm = card.querySelector(".testimo-play-sm");
    const timeLabel = card.querySelector(".testimo-time");
    const progressRange = card.querySelector(".testimo-progress-range");
    if (!vid) return;

    const fmt = (s) => {
      if (isNaN(s)) return "0:00";
      const m = Math.floor(s / 60);
      const sec = String(Math.floor(s % 60)).padStart(2, "0");
      return `${m}:${sec}`;
    };

    vid.addEventListener("loadedmetadata", () => {
      if (timeLabel) timeLabel.textContent = fmt(vid.duration);
    });

    vid.addEventListener("timeupdate", () => {
      if (progressRange && vid.duration) {
        progressRange.value = (vid.currentTime / vid.duration) * 100;
      }
    });

    if (progressRange) {
      progressRange.addEventListener("input", (e) => {
        e.stopPropagation();
        if (vid.duration) {
          vid.currentTime = (Number(e.target.value) / 100) * vid.duration;
        }
      });
      progressRange.addEventListener("click", (e) => e.stopPropagation());
      progressRange.addEventListener("mousedown", (e) => e.stopPropagation());
      progressRange.addEventListener("touchstart", (e) => e.stopPropagation(), { passive: true });
    }

    const togglePlay = () => {
      if (vid.paused) {
        // Pause all other videos
        document.querySelectorAll(".testimo-video").forEach((v) => { if (v !== vid) v.pause(); });
        document.querySelectorAll(".testimo-thumb").forEach((t) => t.classList.remove("is-playing"));
        document.querySelectorAll(".testimo-play-sm i").forEach(i => i.className = "bi bi-play-fill");

        vid.play().catch(() => { });
        thumb.classList.add("is-playing");
        if (playSm) playSm.innerHTML = '<i class="bi bi-pause-fill"></i>';
      } else {
        vid.pause();
        thumb.classList.remove("is-playing");
        if (playSm) playSm.innerHTML = '<i class="bi bi-play-fill"></i>';
      }
    };

    const fsBtn = card.querySelector(".testimo-fullscreen-btn");
    const thumbWrapper = card.querySelector(".testimo-thumb");

    const toggleFS = () => {
      if (!document.fullscreenElement) {
        if (thumbWrapper.requestFullscreen) thumbWrapper.requestFullscreen();
        else if (thumbWrapper.webkitRequestFullscreen) thumbWrapper.webkitRequestFullscreen();
        else if (thumbWrapper.msRequestFullscreen) thumbWrapper.msRequestFullscreen();
      } else {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
      }
    };

    if (fsBtn) {
      fsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFS();
      });
    }

    vid.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFS();
    });

    const speedBtns = card.querySelectorAll(".testimo-speed-btn");
    speedBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const speed = parseFloat(btn.dataset.speed);
        vid.playbackRate = speed;
        speedBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    const qualityBtns = card.querySelectorAll(".testimo-quality-btn");
    qualityBtns.forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        qualityBtns.forEach(b => b.classList.remove("active", "text-warning"));
        btn.classList.add("active");
        if (btn.dataset.quality === 'auto') btn.classList.add("text-warning");
      });
    });

    const bottomBar = card.querySelector(".testimo-bottom-bar");
    if (bottomBar) {
      bottomBar.addEventListener("click", (e) => e.stopPropagation());
      bottomBar.addEventListener("dblclick", (e) => e.stopPropagation());
    }

    if (playCenter) playCenter.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); });
    if (playSm) playSm.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); togglePlay(); });
    thumb.addEventListener("click", (e) => { togglePlay(); });
    vid.addEventListener("ended", () => {
      thumb.classList.remove("is-playing");
      if (playSm) playSm.innerHTML = '<i class="bi bi-play-fill"></i>';
      if (progressRange) progressRange.value = 0;
    });
  });

  const cards = document.querySelectorAll(".vid-card");
  cards.forEach((card) => {
    const thumb = card.querySelector(".vid-thumb");
    const vid = card.querySelector(".vid-video");
    const playBtn = card.querySelector(".vid-play-btn");
    const volRange = card.querySelector(".vid-vol-range");
    const volIcon = card.querySelector(".vid-vol-icon");
    const timeLabel = card.querySelector(".vid-time-label");
    if (!vid) return;

    // Format seconds → m:ss
    const fmt = (s) => {
      const m = Math.floor(s / 60);
      const sec = String(Math.floor(s % 60)).padStart(2, "0");
      return `${m}:${sec}`;
    };

    // Time label update
    vid.addEventListener("timeupdate", () => {
      if (timeLabel) timeLabel.textContent = fmt(vid.currentTime);
    });

    // Play / pause toggle
    const togglePlay = () => {
      if (vid.paused) {
        // Pause all other videos
        document.querySelectorAll(".vid-video").forEach((v) => { if (v !== vid) v.pause(); });
        document.querySelectorAll(".vid-thumb").forEach((t) => t.classList.remove("is-playing"));
        vid.play().catch(() => { });
        thumb.classList.add("is-playing");
      } else {
        vid.pause();
        thumb.classList.remove("is-playing");
      }
    };

    if (playBtn) playBtn.addEventListener("click", (e) => { e.stopPropagation(); togglePlay(); });
    thumb.addEventListener("click", togglePlay);

    vid.addEventListener("ended", () => { thumb.classList.remove("is-playing"); });

    // Volume
    if (volRange) {
      volRange.addEventListener("input", (e) => {
        e.stopPropagation();
        vid.volume = Number(e.target.value);
        vid.muted = vid.volume === 0;
        if (volIcon) volIcon.className = vid.muted ? "bi bi-volume-mute-fill vid-vol-icon" : "bi bi-volume-up-fill vid-vol-icon";
      });
      volRange.addEventListener("click", (e) => e.stopPropagation());
      volRange.addEventListener("mousedown", (e) => e.stopPropagation());
    }

    if (volIcon) {
      volIcon.addEventListener("click", (e) => {
        e.stopPropagation();
        vid.muted = !vid.muted;
        if (!vid.muted && vid.volume === 0) { vid.volume = 0.7; if (volRange) volRange.value = "0.7"; }
        volIcon.className = vid.muted ? "bi bi-volume-mute-fill vid-vol-icon" : "bi bi-volume-up-fill vid-vol-icon";
      });
    }
  });
})();
