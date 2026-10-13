/* Aashna Khurana — portfolio interactions */
(function () {
  "use strict";

  var html = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (light default, persisted) ---------- */
  var toggle = document.getElementById("themeToggle");

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    toggle.setAttribute(
      "aria-label",
      theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
    );
  }

  var stored = null;
  try { stored = localStorage.getItem("ak-theme"); } catch (e) {}
  applyTheme(stored === "dark" ? "dark" : "light");

  var switching = 0;
  toggle.addEventListener("click", function () {
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    function swap() {
      applyTheme(next);
      try { localStorage.setItem("ak-theme", next); } catch (e) {}
    }
    // Elements switch colors instantly; the cross-fade (when supported) is done by the
    // browser on whole-page snapshots, so photo, colors and backgrounds stay in sync.
    switching++;
    html.classList.add("theme-switching");
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(swap).finished.then(done, done);
    } else {
      swap();
      window.requestAnimationFrame(function () { window.requestAnimationFrame(done); });
    }
    // A quick second tap starts a new switch before the first finishes; keep the
    // class until the last one is done
    function done() { if (--switching === 0) html.classList.remove("theme-switching"); }
  });

  /* ---------- Header state on scroll ---------- */
  var header = document.getElementById("siteHeader");
  var backTop = document.getElementById("backTop");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 24);
    backTop.classList.toggle("is-visible", y > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Mobile menu ---------- */
  var menuToggle = document.getElementById("menuToggle");
  var nav = document.getElementById("mainNav");
  var navClose = document.getElementById("navClose");
  var navBackdrop = document.getElementById("navBackdrop");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuToggle.classList.toggle("is-open", open);
    navBackdrop.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  function closeMenu() { setMenu(false); }

  menuToggle.addEventListener("click", function () {
    setMenu(!nav.classList.contains("is-open"));
  });
  navClose.addEventListener("click", closeMenu);
  navBackdrop.addEventListener("click", closeMenu);

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "500px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { revealObs.observe(el); });

    // Safety net: a fast programmatic jump (clicking a nav link to a far section)
    // can move the viewport past elements between observer samples, leaving them
    // stuck at opacity 0. Reveal anything that has reached the viewport on scroll,
    // and after hash navigation in case the browser jumps without scroll events.
    var revealTicking = false;
    function revealInView() {
      revealTicking = false;
      var vh = window.innerHeight;
      for (var i = 0; i < revealEls.length; i++) {
        var el = revealEls[i];
        if (el.classList.contains("in-view")) continue;
        if (el.getBoundingClientRect().top < vh * 0.92) {
          el.classList.add("in-view");
          revealObs.unobserve(el);
        }
      }
    }
    window.addEventListener("scroll", function () {
      if (!revealTicking) { revealTicking = true; window.requestAnimationFrame(revealInView); }
    }, { passive: true });
    window.addEventListener("hashchange", function () { window.setTimeout(revealInView, 650); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* ---------- Scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    var spyObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (link) {
              link.classList.toggle(
                "is-active",
                link.getAttribute("href") === "#" + entry.target.id
              );
            });
          }
        });
      },
      { rootMargin: "-35% 0px -55% 0px" }
    );
    sections.forEach(function (sec) { spyObs.observe(sec); });
  }

  /* ---------- Research journey slider ---------- */
  var track = document.getElementById("journeyTrack");
  if (track) {
    var cards = Array.prototype.slice.call(track.querySelectorAll(".journey-card"));
    var stops = Array.prototype.slice.call(document.querySelectorAll("#journeyRail .rail-stop"));
    var prevBtn = document.getElementById("journeyPrev");
    var nextBtn = document.getElementById("journeyNext");
    var countEl = document.getElementById("journeyCount");
    var current = -1;

    function pad(n) { return (n < 10 ? "0" : "") + n; }

    function setCurrent(i) {
      if (i === current) return;
      current = i;
      cards.forEach(function (c, k) { c.classList.toggle("is-current", k === i); });
      stops.forEach(function (s, k) {
        s.classList.toggle("is-active", k === i);
        s.setAttribute("aria-selected", String(k === i));
      });
      prevBtn.disabled = i === 0;
      nextBtn.disabled = i === cards.length - 1;
      countEl.textContent = pad(i + 1) + " / " + pad(cards.length);
    }

    // The card whose left edge is closest to the track's left edge is current;
    // at the far end of the scroll, the last card is (it can't reach the left edge).
    function syncFromScroll() {
      var max = track.scrollWidth - track.clientWidth;
      if (track.scrollLeft >= max - 4) { setCurrent(cards.length - 1); return; }
      var base = track.getBoundingClientRect().left;
      var best = 0, bestDist = Infinity;
      cards.forEach(function (c, k) {
        var d = Math.abs(c.getBoundingClientRect().left - base);
        if (d < bestDist) { bestDist = d; best = k; }
      });
      setCurrent(best);
    }

    function goTo(i) {
      i = Math.max(0, Math.min(cards.length - 1, i));
      track.scrollTo({ left: cards[i].offsetLeft - cards[0].offsetLeft, behavior: reduceMotion ? "auto" : "smooth" });
      setCurrent(i);
    }

    var scrollTicking = false;
    track.addEventListener("scroll", function () {
      if (!scrollTicking) {
        scrollTicking = true;
        window.requestAnimationFrame(function () { scrollTicking = false; syncFromScroll(); });
      }
    }, { passive: true });

    prevBtn.addEventListener("click", function () { goTo(current - 1); });
    nextBtn.addEventListener("click", function () { goTo(current + 1); });
    stops.forEach(function (s, k) { s.addEventListener("click", function () { goTo(k); }); });

    track.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(current + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goTo(current - 1); }
    });

    // Mouse drag (touch and trackpads swipe natively via overflow scrolling)
    var dragX = 0, dragStart = 0, dragFrom = 0, dragging = false, dragMoved = false;
    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragging = true; dragMoved = false;
      dragX = e.clientX; dragStart = track.scrollLeft; dragFrom = current;
    });
    window.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragX;
      if (!dragMoved && Math.abs(dx) > 5) { dragMoved = true; track.classList.add("is-dragging"); }
      if (dragMoved) track.scrollLeft = dragStart - dx;
    });
    window.addEventListener("pointerup", function (e) {
      if (!dragging) return;
      dragging = false;
      if (!dragMoved) return;
      track.classList.remove("is-dragging");
      var dx = e.clientX - dragX;
      // Snap in the direction of the drag once it passes a small threshold
      if (dx < -40) goTo(Math.max(current, dragFrom + 1));
      else if (dx > 40) goTo(Math.min(current, dragFrom - 1));
      else goTo(dragFrom);
    });
    // Swallow the click that ends a drag so links inside cards don't fire
    track.addEventListener("click", function (e) {
      if (dragMoved) { e.preventDefault(); e.stopPropagation(); dragMoved = false; }
    }, true);

    setCurrent(0);
  }

  /* ---------- Publication tabs ---------- */
  var tabs = document.querySelectorAll(".pub-tab");
  var pubEntries = document.querySelectorAll("#pubList [data-cat]");

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var filter = tab.getAttribute("data-filter");
      tabs.forEach(function (t) {
        t.classList.toggle("is-active", t === tab);
        t.setAttribute("aria-selected", String(t === tab));
      });
      var delay = 0;
      pubEntries.forEach(function (item) {
        var show = item.getAttribute("data-cat") === filter;
        item.hidden = !show;
        item.classList.remove("is-entering", "in-view");
        if (show) {
          item.classList.add("in-view");
          if (!reduceMotion && item.classList.contains("pub-item")) {
            item.style.animationDelay = delay + "ms";
            item.classList.add("is-entering");
            delay += 45;
          }
        }
      });
    });
  });

  /* ---------- Podcast player ---------- */
  document.querySelectorAll("[data-podcast]").forEach(function (player) {
    var audio = player.querySelector("audio");
    var playBtn = player.querySelector(".podcast-play");
    var seek = player.querySelector(".podcast-seek");
    var curEl = player.querySelector("[data-current]");
    var durEl = player.querySelector("[data-duration]");
    var rateBtns = player.querySelectorAll("[data-rate]");
    var seeking = false;

    function fmt(t) {
      t = Math.max(0, Math.floor(t || 0));
      var m = Math.floor(t / 60), sec = t % 60;
      return m + ":" + (sec < 10 ? "0" : "") + sec;
    }
    function paint() {
      var max = parseFloat(seek.max) || 1;
      seek.style.setProperty("--progress", (seek.value / max) * 100 + "%");
    }

    audio.addEventListener("loadedmetadata", function () {
      if (isFinite(audio.duration)) {
        seek.max = Math.floor(audio.duration);
        durEl.textContent = fmt(audio.duration);
      }
      paint();
    });
    audio.addEventListener("timeupdate", function () {
      if (seeking) return;
      seek.value = Math.floor(audio.currentTime);
      curEl.textContent = fmt(audio.currentTime);
      paint();
    });
    audio.addEventListener("play", function () {
      player.classList.add("is-playing");
      playBtn.setAttribute("aria-label", "Pause podcast");
    });
    audio.addEventListener("pause", function () {
      player.classList.remove("is-playing");
      playBtn.setAttribute("aria-label", "Play podcast");
    });
    audio.addEventListener("ended", function () { audio.currentTime = 0; });

    playBtn.addEventListener("click", function () {
      if (audio.paused) audio.play(); else audio.pause();
    });
    seek.addEventListener("input", function () {
      seeking = true;
      curEl.textContent = fmt(seek.value);
      paint();
    });
    seek.addEventListener("change", function () {
      audio.currentTime = parseFloat(seek.value);
      seeking = false;
    });
    player.querySelectorAll("[data-skip]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var t = audio.currentTime + parseFloat(btn.getAttribute("data-skip"));
        audio.currentTime = Math.max(0, Math.min(t, audio.duration || t));
      });
    });
    rateBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        audio.playbackRate = parseFloat(btn.getAttribute("data-rate"));
        rateBtns.forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
          b.setAttribute("aria-pressed", String(b === btn));
        });
      });
    });
    paint();
  });

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll(".stat-num");

  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + (p === 1 ? suffix : "");
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
