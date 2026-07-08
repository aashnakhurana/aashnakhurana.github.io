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

  toggle.addEventListener("click", function () {
    var next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    // Ease every element's colors during the switch
    html.classList.add("theme-easing");
    applyTheme(next);
    try { localStorage.setItem("ak-theme", next); } catch (e) {}
    window.setTimeout(function () { html.classList.remove("theme-easing"); }, 500);
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
