(function () {
  var root = document.documentElement;

  // Année
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // ---------- Thème (dark/light) + lampe ----------
  var lamp = document.querySelector(".lamp-toggle");

  function getPreferredTheme() {
    try {
      var stored = localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;
    } catch (e) {}
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme, persist) {
    root.dataset.theme = theme;
    if (lamp) {
      lamp.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
      lamp.setAttribute("aria-label", theme === "light" ? "Éteindre la lampe (mode sombre)" : "Allumer la lampe (mode clair)");
    }
    if (persist) {
      try { localStorage.setItem("theme", theme); } catch (e) {}
    }
  }

  applyTheme(getPreferredTheme(), false);

  if (lamp) {
    lamp.addEventListener("click", function () {
      lamp.classList.add("pulling");
      window.setTimeout(function () { lamp.classList.remove("pulling"); }, 220);
      var next = root.dataset.theme === "light" ? "dark" : "light";
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var applied = false;

      function commitTheme() {
        if (applied) return;
        applied = true;
        applyTheme(next, true);
      }

      if (document.startViewTransition && !reduceMotion) {
        try {
          var transition = document.startViewTransition(commitTheme);
          if (transition) {
            if (transition.finished && transition.finished.catch) transition.finished.catch(function () {});
            if (transition.ready && transition.ready.catch) transition.ready.catch(function () {});
          }
          // Filet de sécurité : le thème change même si la transition n'aboutit pas.
          window.setTimeout(commitTheme, 120);
        } catch (e) {
          commitTheme();
        }
      } else {
        commitTheme();
      }
    });
  }

  // ---------- Toast & presse-papiers ----------
  var toastEl = document.getElementById("toast");
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("show");
    }, 2400);
  }

  function copyText(text, done) {
    function fallback() {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.top = "-1000px";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy");
        if (done) done();
      } catch (e) {
        showToast("Copie impossible");
      }
      document.body.removeChild(field);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        if (done) done();
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  // ---------- Menu mobile ----------
  var mobileMenu = document.getElementById("mobile-menu");
  var menuToggle = document.getElementById("menu-toggle");
  var menuCloseBtn = mobileMenu ? mobileMenu.querySelector(".mobile-menu-close") : null;

  function setMenu(open, restoreFocus) {
    if (!mobileMenu || !menuToggle) return;
    mobileMenu.classList.toggle("open", open);
    mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    document.body.classList.toggle("menu-open", open);

    if (open) {
      window.setTimeout(function () {
        if (menuCloseBtn) menuCloseBtn.focus();
      }, 120);
    } else if (restoreFocus) {
      try { menuToggle.focus({ preventScroll: true }); } catch (e) { menuToggle.focus(); }
    }
  }

  if (mobileMenu && menuToggle) {
    menuToggle.addEventListener("click", function () {
      setMenu(!mobileMenu.classList.contains("open"), true);
    });
    if (menuCloseBtn) menuCloseBtn.addEventListener("click", function () { setMenu(false, true); });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false, false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("open")) setMenu(false, true);
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && mobileMenu.classList.contains("open")) setMenu(false, false);
    });
  }

  // ---------- Navigation : section active ----------
  var navAnchors = document.querySelectorAll('.site-nav a[href^="#"], .mobile-nav a[href^="#"]');
  var spySections = ["accueil", "projets", "apropos", "contact"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function syncNav() {
    if (!spySections.length || !navAnchors.length) return;
    var marker = window.scrollY + 160;
    var current = spySections[0].id;
    spySections.forEach(function (section) {
      if (section.offsetTop <= marker) current = section.id;
    });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = spySections[spySections.length - 1].id;
    }
    navAnchors.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + current;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if (spySections.length) {
    window.addEventListener("scroll", syncNav, { passive: true });
    window.addEventListener("resize", syncNav);
    syncNav();
  }

  // ---------- Suivi de souris (multi-halos subtils) ----------
  var container = document.querySelector(".mouse-lights");
  var fine = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (container && fine && !reduce) {
    var specs = [
      { size: 800, lag: 0.08, opacity: 0.08, cls: "light-0" },
      { size: 500, lag: 0.14, opacity: 0.07, cls: "light-1" },
      { size: 300, lag: 0.22, opacity: 0.14, cls: "light-2" },
      { size: 140, lag: 0.34, opacity: 0.12, cls: "light-3" }
    ];
    var lights = [];

    specs.forEach(function (s) {
      var el = document.createElement("div");
      el.className = "mouse-light " + s.cls;
      el.style.width = s.size + "px";
      el.style.height = s.size + "px";
      el.style.opacity = s.opacity;
      container.appendChild(el);
      lights.push({ el: el, x: 0, y: 0, tx: 0, ty: 0, lag: s.lag });
    });

    container.classList.add("ready");

    var tx = window.innerWidth / 2;
    var ty = window.innerHeight / 3;
    var raf = null;

    function render() {
      raf = null;
      var active = false;
      lights.forEach(function (l) {
        l.x += (l.tx - l.x) * l.lag;
        l.y += (l.ty - l.y) * l.lag;
        l.el.style.transform = "translate(" + l.x.toFixed(1) + "px, " + l.y.toFixed(1) + "px)";
        if (Math.abs(l.tx - l.x) > 0.5 || Math.abs(l.ty - l.y) > 0.5) active = true;
      });
      if (active) raf = requestAnimationFrame(render);
    }

    window.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
      lights.forEach(function (l) { l.tx = tx; l.ty = ty; });
      if (!raf) raf = requestAnimationFrame(render);
    }, { passive: true });
  }

  // ---------- Projets : accordéon (un seul ouvert à la fois) ----------
  var headers = document.querySelectorAll(".project-header");

  // Coupe la lecture des vidéos d'un projet que l'on referme.
  function pauseVideosIn(el) {
    if (!el) return;
    el.querySelectorAll("video").forEach(function (video) {
      if (!video.paused) video.pause();
    });
  }

  function closeAll() {
    headers.forEach(function (h) {
      h.setAttribute("aria-expanded", "false");
      if (h.parentElement.classList.contains("open")) pauseVideosIn(h.parentElement);
      h.parentElement.classList.remove("open");
    });
  }

  function toggle(header) {
    var expanded = header.getAttribute("aria-expanded") === "true";
    closeAll();
    if (!expanded) {
      header.setAttribute("aria-expanded", "true");
      header.parentElement.classList.add("open");
    }
  }

  headers.forEach(function (header) {
    header.addEventListener("click", function () { toggle(header); });
    header.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle(header);
      }
    });
  });

  // ---------- Galerie / Lightbox ----------
  var galleryData = [
    [
      { src: "https://picsum.photos/seed/tsunova-a/1200/900", alt: "Tsunova.X — détail A" },
      { src: "https://picsum.photos/seed/tsunova-b/1200/900", alt: "Tsunova.X — détail B" },
      { src: "https://picsum.photos/seed/tsunova-c/1200/900", alt: "Tsunova.X — détail C" }
    ],
    [
      { src: "https://picsum.photos/seed/wnl-a/1200/900", alt: "Why Not Linux — logo" },
      { src: "https://picsum.photos/seed/wnl-b/1200/900", alt: "Why Not Linux — affiche" },
      { src: "https://picsum.photos/seed/wnl-c/1200/900", alt: "Why Not Linux — teaser" }
    ],
    [
      { src: "https://picsum.photos/seed/nova-a/1200/900", alt: "NOVA — logo" },
      { src: "https://picsum.photos/seed/nova-b/1200/900", alt: "NOVA — brand book" },
      { src: "https://picsum.photos/seed/nova-c/1200/900", alt: "NOVA — supports" }
    ],
    [
      { src: "mangaroa-still-1.jpg", alt: "Mangaroa — image du trailer" },
      { src: "mangaroa-still-2.jpg", alt: "Mangaroa — image du trailer" },
      { src: "mangaroa-still-3.jpg", alt: "Mangaroa — image du trailer" }
    ],
    [
      { src: "https://picsum.photos/seed/stress-a/1200/900", alt: "Stress app — wireframes" },
      { src: "https://picsum.photos/seed/stress-b/1200/900", alt: "Stress app — maquettes" },
      { src: "https://picsum.photos/seed/stress-c/1200/900", alt: "Stress app — prototype" }
    ],
    [
      { src: "https://picsum.photos/seed/pub-a/1200/900", alt: "Visuels pub — scène" },
      { src: "https://picsum.photos/seed/pub-b/1200/900", alt: "Visuels pub — mockup" },
      { src: "https://picsum.photos/seed/pub-c/1200/900", alt: "Visuels pub — affichage" }
    ]
  ];

  var lightbox = document.getElementById("lightbox");
  var lbImage = lightbox ? lightbox.querySelector(".lightbox-image") : null;
  var lbCaption = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lbDots = lightbox ? lightbox.querySelector(".lightbox-dots") : null;
  var lbPrev = lightbox ? lightbox.querySelector(".lightbox-prev") : null;
  var lbNext = lightbox ? lightbox.querySelector(".lightbox-next") : null;
  var lbClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  var lbBackdrop = lightbox ? lightbox.querySelector(".lightbox-backdrop") : null;

  var currentProject = 0;
  var currentIndex = 0;
  var lastLightboxTrigger = null;

  function renderCarousel() {
    if (!lightbox || !lbImage) return;
    var images = galleryData[currentProject];
    if (!images || images.length === 0) return;
    var item = images[currentIndex];

    lbImage.classList.remove("show");
    lbImage.src = item.src;
    lbImage.alt = item.alt;
    if (lbCaption) lbCaption.textContent = (currentIndex + 1) + " / " + images.length + " — " + item.alt;

    // Précharge les images voisines pour un carrousel instantané.
    if (images.length > 1) {
      [images[(currentIndex + 1) % images.length], images[(currentIndex - 1 + images.length) % images.length]]
        .forEach(function (neighbor) {
          if (neighbor && neighbor.src) {
            var preload = new Image();
            preload.src = neighbor.src;
          }
        });
    }

    window.requestAnimationFrame(function () {
      lbImage.classList.add("show");
    });

    if (lbDots) {
      lbDots.innerHTML = "";
      images.forEach(function (_, i) {
        var dot = document.createElement("button");
        dot.className = "lightbox-dot" + (i === currentIndex ? " active" : "");
        dot.type = "button";
        dot.setAttribute("aria-label", "Aller à l'image " + (i + 1));
        dot.addEventListener("click", function () { currentIndex = i; renderCarousel(); });
        lbDots.appendChild(dot);
      });
    }
  }

  function openLightbox(project, index, trigger) {
    currentProject = project;
    currentIndex = index;
    lastLightboxTrigger = trigger || null;
    renderCarousel();
    if (lightbox) {
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (lbClose) {
        window.setTimeout(function () {
          try { lbClose.focus({ preventScroll: true }); } catch (e) { lbClose.focus(); }
        }, 60);
      }
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastLightboxTrigger) {
        try { lastLightboxTrigger.focus({ preventScroll: true }); } catch (e) { lastLightboxTrigger.focus(); }
        lastLightboxTrigger = null;
      }
    }
  }

  function prevImage() {
    var images = galleryData[currentProject];
    if (!images) return;
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    renderCarousel();
  }

  function nextImage() {
    var images = galleryData[currentProject];
    if (!images) return;
    currentIndex = (currentIndex + 1) % images.length;
    renderCarousel();
  }

  document.querySelectorAll(".gallery-thumb").forEach(function (thumb) {
    thumb.addEventListener("click", function (e) {
      e.stopPropagation();
      var p = parseInt(thumb.getAttribute("data-project"), 10);
      var i = parseInt(thumb.getAttribute("data-index"), 10);
      openLightbox(p, i, thumb);
    });
  });

  // Balayage tactile dans la lightbox.
  var lbWrap = lightbox ? lightbox.querySelector(".lightbox-image-wrap") : null;

  if (lbWrap) {
    var swipeStartX = null;
    var swipeStartY = null;

    lbWrap.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      swipeStartX = e.clientX;
      swipeStartY = e.clientY;
    });

    lbWrap.addEventListener("pointerup", function (e) {
      if (swipeStartX === null) return;
      var dx = e.clientX - swipeStartX;
      var dy = e.clientY - swipeStartY;
      swipeStartX = null;
      swipeStartY = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) nextImage();
        else prevImage();
      }
    });

    lbWrap.addEventListener("pointercancel", function () {
      swipeStartX = null;
      swipeStartY = null;
    });
  }

  // Piège à focus simple dans la lightbox.
  if (lightbox) {
    lightbox.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !lightbox.classList.contains("open")) return;
      var focusables = Array.prototype.slice.call(lightbox.querySelectorAll("button"));
      if (!focusables.length) return;
      var first = focusables[0];
      var last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });
  }

  if (lbClose) lbClose.addEventListener("click", closeLightbox);
  if (lbBackdrop) lbBackdrop.addEventListener("click", closeLightbox);
  if (lbPrev) lbPrev.addEventListener("click", prevImage);
  if (lbNext) lbNext.addEventListener("click", nextImage);

  document.addEventListener("keydown", function (e) {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") prevImage();
    else if (e.key === "ArrowRight") nextImage();
  });

  // ---------- Curseur pinceau (plume de graphiste) ----------
  var cursor = document.querySelector(".cursor");

  if (cursor && fine && !reduce) {
    var curX = window.innerWidth / 2;
    var curY = window.innerHeight / 2;
    var targetX = curX;
    var targetY = curY;
    var cursorVisible = false;
    var cursorRaf = null;

    function paintCursor() {
      cursorRaf = null;
      curX += (targetX - curX) * 0.22;
      curY += (targetY - curY) * 0.22;
      cursor.style.transform = "translate3d(" + curX.toFixed(1) + "px, " + curY.toFixed(1) + "px, 0)";
      if (Math.abs(targetX - curX) > 0.3 || Math.abs(targetY - curY) > 0.3) {
        cursorRaf = window.requestAnimationFrame(paintCursor);
      }
    }

    window.addEventListener("pointermove", function (e) {
      targetX = e.clientX;
      targetY = e.clientY;

      if (!cursorVisible) {
        cursorVisible = true;
        curX = targetX;
        curY = targetY;
        root.classList.add("has-cursor");
        cursor.classList.add("on");
      }

      var target = e.target && e.target.closest ? e.target : null;
      var canView = target ? target.closest(".project-header, .gallery-thumb") : null;
      var interactive = target ? target.closest("a, button, [role='button']") : null;

      cursor.classList.toggle("view", !!canView);
      cursor.classList.toggle("hover", !!interactive && !canView);

      if (!cursorRaf) cursorRaf = window.requestAnimationFrame(paintCursor);
    }, { passive: true });

    document.addEventListener("pointerleave", function () {
      cursor.classList.remove("on");
      cursorVisible = false;
    });

    window.addEventListener("blur", function () {
      cursor.classList.remove("on");
      cursorVisible = false;
    });

    // Petit retour "coup de pinceau" au clic
    window.addEventListener("pointerdown", function () {
      cursor.classList.add("down");
    });
    window.addEventListener("pointerup", function () {
      cursor.classList.remove("down");
    });
  }

  // ---------- Progression de lecture ----------
  var progressBar = document.querySelector(".scroll-progress span");

  function updateProgress() {
    if (!progressBar) return;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var ratio = max > 0 ? window.scrollY / max : 0;
    ratio = Math.min(1, Math.max(0, ratio));
    progressBar.style.width = (ratio * 100).toFixed(2) + "%";
  }

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  // ---------- Révélation au défilement ----------
  var revealables = document.querySelectorAll(".project, .section-head, .about-layout, .about-skills, .tip-card, .contact-layout");

  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });

    revealables.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  // ---------- Assistant du studio (mini chatbot) ----------
  var chatbot = document.getElementById("chatbot");
  var chatLog = chatbot ? chatbot.querySelector(".chatbot-log") : null;
  var chatForm = chatbot ? chatbot.querySelector(".chatbot-form") : null;
  var chatInput = chatbot ? chatbot.querySelector(".chatbot-input") : null;
  var chatClose = chatbot ? chatbot.querySelector(".chatbot-close") : null;
  var chatLauncher = document.querySelector(".chat-launch");
  var chatChips = chatbot ? chatbot.querySelectorAll(".chat-chip") : [];

  if (chatbot && chatLog && chatForm && chatInput) {
    // Modifiez librement les réponses et les tarifs ci-dessous.
    var CHAT_INTRO = "Bonjour 👋 Je suis l’assistant du studio. Je peux vous renseigner sur les délais, les tarifs, le processus ou la disponibilité.";
    var CHAT_FALLBACK = "Je n’ai pas encore la réponse à celle-ci. Essayez « délais », « tarifs », « processus », « révisions » ou « contact » — sinon écrivez directement à contact@example.com.";

    var chatAnswers = [
      {
        id: "delais",
        keys: ["delai", "delais", "temps", "duree", "livraison", "deadline", "rapide", "semaine", "planning", "quand"],
        text: "Délais habituels :\n• Logo seul — 5 à 7 jours\n• Identité complète + brand book — 2 à 3 semaines\n• Interface ou landing page — 1 à 2 semaines\n• Montage vidéo de 3 à 5 min — 3 à 5 jours\n• Série de 3 visuels pub — 4 à 6 jours\n\nLe planning est confirmé après le brief."
      },
      {
        id: "tarifs",
        keys: ["tarif", "tarifs", "prix", "budget", "cout", "combien", "devis", "facture", "cher"],
        text: "Chaque devis est construit selon le périmètre. Bases indicatives :\n• Logo — à partir de 250 000 Ar\n• Identité complète + brand book — 900 000 à 1 800 000 Ar\n• UI/UX (app ou site) — à partir de 1 200 000 Ar\n• Montage vidéo — 150 000 Ar / minute\n• Visuel publicitaire — 80 000 Ar / visuel\n\nLe détail est envoyé après le brief."
      },
      {
        id: "processus",
        keys: ["processus", "etapes", "methode", "brief", "deroule", "travaille", "comment"],
        text: "Le déroulé :\n1. Brief — objectifs, cible, contraintes\n2. Recherche — moodboard, références, territoires\n3. Direction — 2 à 3 pistes argumentées\n4. Production — déclinaisons et finitions\n5. Livraison — fichiers sources + guide d’usage"
      },
      {
        id: "revisions",
        keys: ["revision", "revisions", "modif", "correction", "retouche", "aller retour"],
        text: "Deux séries de révisions sont incluses à chaque étape clé. Au-delà, les allers-retours supplémentaires sont facturés à l’heure ou intégrés dans un forfait mensuel."
      },
      {
        id: "outils",
        keys: ["outil", "logiciel", "figma", "affinity", "davinci", "illustrator", "fichier"],
        text: "Je travaille principalement avec Figma (UI/UX et prototypes), Affinity Designer / Photo (identité et visuels) et DaVinci Resolve (montage et étalonnage). Les fichiers sources sont livrés en fin de projet."
      },
      {
        id: "dispo",
        keys: ["disponible", "disponibilite", "libre", "demarrer", "place", "agenda", "charge"],
        text: "Deux créneaux sont ouverts ce mois-ci. Réponse sous 24 à 48 h après votre message, et démarrage possible sous 1 à 2 semaines selon la charge."
      },
      {
        id: "paiement",
        keys: ["paiement", "payer", "acompte", "virement", "mvola", "orange money", "mobile money"],
        text: "Paiement en deux temps : 50 % à la validation du devis, 50 % à la livraison. Virement bancaire, MVola ou Orange Money selon votre préférence."
      },
      {
        id: "projets",
        keys: ["projet", "projets", "portfolio", "travaux", "realisation", "reference", "edition"],
        text: "Six projets sont détaillés dans la section Éditions : Tsunova.X, Why Not Linux, NOVA, le documentaire Mangaroa, une app de gestion du stress et une série de visuels publicitaires. Ouvrez une carte pour voir le contexte, l’approche et la galerie."
      },
      {
        id: "langues",
        keys: ["langue", "francais", "anglais", "malgache", "parle"],
        text: "Je travaille en français, en malgache et en anglais."
      },
      {
        id: "contact",
        keys: ["contact", "email", "mail", "linkedin", "github", "joindre", "ecrire", "whatsapp"],
        text: "Le plus direct : contact@example.com — réponse sous 24 à 48 h.\nLinkedIn : linkedin.com/in/votre-profil\nGitHub : github.com/unknownmdg"
      },
      {
        id: "salutation",
        keys: ["bonjour", "salut", "hello", "bonsoir", "coucou", "hey"],
        text: "Bonjour 👋 Que souhaitez-vous savoir : délais, tarifs, processus ou disponibilité ?"
      },
      {
        id: "merci",
        keys: ["merci", "thanks", "parfait", "super"],
        text: "Avec plaisir. Pour un devis précis, écrivez à contact@example.com avec deux ou trois lignes sur le projet."
      }
    ];

    var chatBusy = false;
    var chatStarted = false;

    function normalizeChat(value) {
      return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    }

    function findAnswer(raw) {
      var q = normalizeChat(raw);
      var best = null;
      var bestScore = 0;

      chatAnswers.forEach(function (item) {
        var score = 0;
        item.keys.forEach(function (key) {
          if (q.indexOf(key) !== -1) score += key.length > 4 ? 2 : 1;
        });
        if (score > bestScore) {
          bestScore = score;
          best = item;
        }
      });

      return best;
    }

    function scrollChat() {
      chatLog.scrollTop = chatLog.scrollHeight;
    }

    function addChatMessage(role, text) {
      var el = document.createElement("div");
      el.className = "chat-msg chat-msg-" + role;
      el.textContent = text;
      chatLog.appendChild(el);
      scrollChat();
      return el;
    }

    function showChatTyping() {
      var el = document.createElement("div");
      el.className = "chat-msg chat-msg-bot chat-typing";
      el.setAttribute("aria-label", "L’assistant écrit");
      for (var i = 0; i < 3; i++) el.appendChild(document.createElement("span"));
      chatLog.appendChild(el);
      scrollChat();
      return el;
    }

    function respondWith(entry) {
      chatBusy = true;
      var typing = reduce ? null : showChatTyping();
      var delay = reduce ? 0 : 520 + Math.random() * 420;

      window.setTimeout(function () {
        if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
        addChatMessage("bot", entry ? entry.text : CHAT_FALLBACK);
        chatBusy = false;
      }, delay);
    }

    function sendChatMessage(raw) {
      var value = (raw || "").trim();
      if (!value || chatBusy) return;
      addChatMessage("user", value);
      chatInput.value = "";
      respondWith(findAnswer(value));
    }

    function openChat() {
      chatbot.classList.add("open");
      chatbot.setAttribute("aria-hidden", "false");
      if (chatLauncher) chatLauncher.setAttribute("aria-expanded", "true");

      if (!chatStarted) {
        chatStarted = true;
        addChatMessage("bot", CHAT_INTRO);
      }

      if (fine) {
        window.setTimeout(function () {
          try { chatInput.focus({ preventScroll: true }); } catch (e) { chatInput.focus(); }
        }, 220);
      }
    }

    function closeChat(restoreFocus) {
      chatbot.classList.remove("open");
      chatbot.setAttribute("aria-hidden", "true");
      if (chatLauncher) chatLauncher.setAttribute("aria-expanded", "false");
      if (restoreFocus && chatLauncher) {
        try { chatLauncher.focus({ preventScroll: true }); } catch (e) { chatLauncher.focus(); }
      }
    }

    if (chatLauncher) {
      chatLauncher.addEventListener("click", function () {
        if (chatbot.classList.contains("open")) closeChat(true);
        else openChat();
      });
    }

    if (chatClose) chatClose.addEventListener("click", function () { closeChat(true); });

    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      sendChatMessage(chatInput.value);
    });

    chatChips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        sendChatMessage(chip.textContent);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && chatbot.classList.contains("open")) closeChat(true);
    });

    document.addEventListener("pointerdown", function (e) {
      if (!chatbot.classList.contains("open")) return;
      if (chatbot.contains(e.target)) return;
      if (chatLauncher && chatLauncher.contains(e.target)) return;
      closeChat(false);
    });
  }

  // ---------- Filtres de familles (graphique / vidéo) ----------
  var filterBtns = document.querySelectorAll(".filter-btn");
  var projectGroups = document.querySelectorAll(".project-group");
  var projectHint = document.getElementById("project-hint");
  var projectStatus = document.getElementById("project-status");

  function closeProjectsIn(group) {
    group.querySelectorAll(".project.open").forEach(function (project) {
      var header = project.querySelector(".project-header");
      if (header) header.setAttribute("aria-expanded", "false");
      pauseVideosIn(project);
      project.classList.remove("open");
    });
  }

  function setGroupState(group, show) {
    window.clearTimeout(group._hideTimer);
    window.clearTimeout(group._showTimer);

    if (show) {
      if (!group.hidden && !group.classList.contains("is-hidden")) {
        group.style.maxHeight = "none";
        group.style.opacity = "1";
        return;
      }

      group.hidden = false;
      group.classList.remove("is-hidden");
      group.querySelectorAll(".project").forEach(function (project) {
        project.classList.add("in");
      });

      if (reduce) {
        group.style.maxHeight = "none";
        group.style.opacity = "1";
        return;
      }

      group.style.maxHeight = "0px";
      group.style.opacity = "0";
      group.offsetHeight;
      group.style.maxHeight = group.scrollHeight + "px";
      group.style.opacity = "1";

      group._showTimer = window.setTimeout(function () {
        group.style.maxHeight = "none";
      }, 600);
      return;
    }

    var height = group.scrollHeight;
    closeProjectsIn(group);
    group.style.maxHeight = height + "px";
    group.style.opacity = "1";
    group.offsetHeight;
    group.classList.add("is-hidden");
    group.style.opacity = "0";
    group.style.maxHeight = "0px";

    group._hideTimer = window.setTimeout(function () {
      group.hidden = true;
    }, reduce ? 0 : 560);
  }

  function applyFilter(mode) {
    filterBtns.forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-filter") === mode ? "true" : "false");
    });

    if (projectHint) projectHint.hidden = true;

    projectGroups.forEach(function (group) {
      var groupMode = group.getAttribute("data-group");
      setGroupState(group, mode === "all" || groupMode === mode);
    });

    if (projectStatus) {
      var label = mode === "graphique" ? "Projets graphiques affichés"
        : mode === "video" ? "Projet vidéo affiché"
        : "Tous les projets affichés";
      projectStatus.textContent = label + ".";
    }
  }

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  // Au chargement, aucune famille n'est ouverte : on attend le choix du visiteur.
  if (filterBtns.length && projectGroups.length) {
    projectGroups.forEach(function (group) {
      group.hidden = true;
      group.classList.add("is-hidden");
      group.style.maxHeight = "0px";
      group.style.opacity = "0";
    });
    root.classList.remove("filtres-vierges");
  }

  filterBtns.forEach(function (btn) {
    var countEl = btn.querySelector(".filter-count");
    if (!countEl) return;
    var mode = btn.getAttribute("data-filter");
    var total = mode === "all"
      ? document.querySelectorAll(".project").length
      : document.querySelectorAll('.project-group[data-group="' + mode + '"] .project').length;
    countEl.textContent = (total < 10 ? "0" : "") + total;
  });

  // ---------- Tip du jour (design / graphisme) ----------
  var tipCard = document.getElementById("tip-card");
  var tipText = document.getElementById("tip-text");
  var tipTag = document.getElementById("tip-tag");
  var tipNext = document.getElementById("tip-next");

  // Banque de tips : design, typo, couleur, UI, motion, print, workflow, client.
  // Ajoutez ou retirez des lignes librement — le tirage s'adapte automatiquement.
  var designTips = [
    ["Hiérarchie", "Un seul accent par écran : si tout ressort, rien ne ressort."],
    ["Hiérarchie", "Classez vos éléments dans l’ordre de lecture : si vous hésitez, le spectateur aussi."],
    ["Hiérarchie", "Le blanc est un outil de hiérarchie : séparer fait souvent plus que décorer."],
    ["Hiérarchie", "La taille n’est qu’un levier. Le contraste, l’isolement et la position pèsent autant."],
    ["Hiérarchie", "Plissez les yeux devant votre mise en page : ce qui reste lisible est votre vrai titre."],
    ["Hiérarchie", "Un écran, une idée dominante. Deux, c’est déjà un débat."],
    ["Hiérarchie", "Alignez à gauche ce qui se lit, centrez ce qui s’annonce."],
    ["Hiérarchie", "Si tout est en gras, plus rien n’est important."],
    ["Hiérarchie", "Un titre doit rester lisible à 30 % de zoom sur une capture d’écran."],
    ["Hiérarchie", "Hiérarchisez aussi les silences : l’espace entre deux blocs raconte leur relation."],

    ["Typographie", "Deux familles suffisent : titres et texte. La troisième doit se justifier."],
    ["Typographie", "Serrez les titres, aérez les paragraphes : le rythme se joue dans cet écart."],
    ["Typographie", "Un interlignage de 1,4 à 1,6 pour le texte courant ; en dessous, on étouffe la lecture."],
    ["Typographie", "Ne descendez pas sous 16 px pour un texte lu sur téléphone."],
    ["Typographie", "Mesurez vos lignes : 45 à 75 caractères, sinon l’œil perd le fil."],
    ["Typographie", "Un logo doit fonctionner à 16 px avant de fonctionner en affiche."],
    ["Typographie", "Évitez le faux gras et le faux italique : ils abîment la lettre et la marque."],
    ["Typographie", "Vérifiez vos crénages sur les paires difficiles : AV, To, LY, 11."],
    ["Typographie", "Les capitales respirent mal : ajoutez un peu de tracking aux titres en majuscules."],
    ["Typographie", "Une seule graisse par niveau hiérarchique : la répétition crée le système."],
    ["Typographie", "Testez vos titres avec les mots les plus longs du client, pas avec « Bonjour »."],
    ["Typographie", "Chiffres anciens pour le texte, chiffres tabulaires pour les tableaux."],
    ["Typographie", "La typographie décorative se réserve aux accroches : jamais dans un paragraphe."],
    ["Typographie", "Un texte centré ne convient qu’aux lignes courtes : trois lignes maximum."],
    ["Typographie", "Vérifiez accents et ligatures dans les exports PDF : les polices se remplacent vite."],
    ["Typographie", "Choisissez d’abord la police du texte : c’est elle qu’on lit le plus longtemps."],

    ["Couleur", "Passez votre écran en niveaux de gris : la hiérarchie doit tenir sans la couleur."],
    ["Couleur", "Choisissez vos gris avant vos couleurs : ce sont eux qui portent 90 % de l’interface."],
    ["Couleur", "Un accent doit avoir un rôle, pas seulement une présence."],
    ["Couleur", "Trois à cinq couleurs suffisent pour une marque ; au-delà, c’est une humeur."],
    ["Couleur", "Un fond sombre n’est pas un fond noir : levez-le de 5 à 8 % pour éviter le trou."],
    ["Couleur", "Contraste minimal : 4,5:1 pour le texte courant, 3:1 pour les grands titres."],
    ["Couleur", "Ne codez jamais une info par la couleur seule : ajoutez une forme ou un mot."],
    ["Couleur", "Vérifiez vos couleurs sur un vrai téléphone, pas sur votre écran calibré."],
    ["Couleur", "Une couleur posée sur un aplat change de perception : jugez-la dans son contexte."],
    ["Couleur", "Évitez le pur #000 et le pur #fff en interface : ils vibrent et fatiguent."],
    ["Couleur", "En mode sombre, désaturez vos accents de 10 à 15 % : ils brillent davantage."],
    ["Couleur", "Enregistrez vos couleurs dans un seul fichier de référence, partagé avec l’équipe."],

    ["Composition", "Une grille n’est pas une contrainte : c’est ce qui rend les exceptions lisibles."],
    ["Composition", "Le meilleur alignement est celui qu’on ne remarque pas mais qu’on ressent."],
    ["Composition", "Répétez un détail trois fois : c’est ainsi qu’un système devient une signature."],
    ["Composition", "Laissez respirer les bords : une marge généreuse fait plus premium qu’un effet."],
    ["Composition", "Composez d’abord en noir et blanc, ajoutez la couleur à la fin."],
    ["Composition", "Un élément qui ne sert ni le sens ni le rythme doit disparaître."],
    ["Composition", "Variez les échelles : un très grand titre et un petit texte créent la tension."],
    ["Composition", "Asymétrie contrôlée : déplacez un bloc, pas toute la page."],
    ["Composition", "Cadrez serré pour l’émotion, large pour le contexte."],
    ["Composition", "Faites la version mobile avant la version desktop : les priorités apparaissent."],
    ["Composition", "Une page se juge à son coin supérieur gauche ; le regard y retourne."],
    ["Composition", "Le vide en bas d’une composition n’est pas un oubli : c’est une respiration."],

    ["Identité", "Un logo doit tenir en une couleur, en négatif et à 16 px. Sinon, il n’est pas fini."],
    ["Identité", "Le logotype n’est pas la marque : la marque, c’est le système autour."],
    ["Identité", "Écrivez la promesse de la marque en une phrase avant de dessiner quoi que ce soit."],
    ["Identité", "Un symbole abstrait doit pouvoir se décrire en une phrase simple."],
    ["Identité", "Prévoyez une zone de respiration autour du logo, et respectez-la partout."],
    ["Identité", "Déclinez l’identité sur le pire support : un reçu noir et blanc."],
    ["Identité", "Une marque se reconnaît à ses règles, pas à ses exceptions."],
    ["Identité", "Testez le logo à l’envers, sur photo, en broderie : les faiblesses sortent."],
    ["Identité", "Deux pistes bien argumentées valent mieux que cinq esquisses."],
    ["Identité", "Un brand book de dix pages utilisé vaut mieux qu’un PDF de quatre-vingts oublié."],

    ["UI/UX", "Trois questions par écran : où je suis, ce que je peux faire, ce qui suit."],
    ["UI/UX", "Un bouton décrit l’action : « Enregistrer » plutôt que « OK »."],
    ["UI/UX", "Les états vides sont des écrans à part entière : ils expliquent et rassurent."],
    ["UI/UX", "Prévenez les erreurs avant de les signaler : un bon formulaire n’a pas besoin de rouge."],
    ["UI/UX", "Le focus clavier reste visible : c’est la souris de ceux qui n’en ont pas."],
    ["UI/UX", "Un lien doit se distinguer du texte sans dépendre uniquement de la couleur."],
    ["UI/UX", "Sur mobile, gardez les actions principales dans le tiers inférieur de l’écran."],
    ["UI/UX", "Réduisez le nombre de choix par écran : deux décisions valent mieux que cinq."],
    ["UI/UX", "Testez avec quelqu’un qui découvre la maquette : ses hésitations sont vos notes."],
    ["UI/UX", "Une animation d’interface doit expliquer un changement, pas le décorer."],
    ["UI/UX", "Les icônes seules se devinent mal : ajoutez un libellé quand l’action compte."],
    ["UI/UX", "Ne cachez pas une action essentielle derrière un survol : le tactile n’en a pas."],

    ["Motion", "Une animation se règle en courbes, pas en durée : l’ease fait 80 % du rendu."],
    ["Motion", "Une transition d’interface vit entre 200 et 400 ms : en dessous, on ne la voit pas."],
    ["Motion", "Le mouvement doit partir de l’endroit où l’attention se trouve déjà."],
    ["Motion", "Animez une propriété à la fois : opacité et position suffisent presque toujours."],
    ["Motion", "Une coupe franche vaut mieux qu’un fondu mou quand le rythme compte."],
    ["Motion", "Le son se mixe à -6 dB sous la voix, et se coupe si personne ne parle."],
    ["Motion", "Verrouillez votre cadence avant de monter : 24, 25 ou 30 images, mais une seule."],
    ["Motion", "Un plan trop long pardonne tout ; un plan trop court ne pardonne rien."],

    ["Production", "Exportez en 2× pour les écrans haute densité, et gardez toujours une version 1×."],
    ["Production", "Un PDF d’impression se vérifie avec les polices incorporées et les fonds perdus."],
    ["Production", "Ajoutez 3 mm de fond perdu et 8 mm de marge de sécurité, systématiquement."],
    ["Production", "Noir riche (C60 M40 J40 N100) pour les aplats, noir 100 % pour le texte."],
    ["Production", "Un blanc n’est pas un blanc : blanc papier ou encre blanche ?"],
    ["Production", "Contrôlez la surimpression avant d’envoyer : c’est là que les blancs disparaissent."],
    ["Production", "Un visuel pensé pour l’écran ne se convertit pas en affiche : recomposez."],
    ["Production", "Nommez vos exports avec la date, la version et le format. Toujours."],
    ["Production", "Un JPEG qualité 80 suffit pour le web ; au-delà, vous payez des octets invisibles."],
    ["Production", "Un texte en image ne se sélectionne pas, ne se traduit pas, ne s’agrandit pas."],

    ["Fichiers", "Nommez vos calques comme si un inconnu devait reprendre le fichier demain matin."],
    ["Fichiers", "Un fichier par déclinaison, pas un fichier avec vingt planches de travail."],
    ["Fichiers", "Verrouillez les éléments validés : le client ne veut pas d’un déplacement accidentel."],
    ["Fichiers", "Sauvegardez avant chaque étape risquée : « final_v3_final » n’est pas une sauvegarde."],
    ["Fichiers", "Utilisez des styles de texte et de couleur : une modification doit se propager."],
    ["Fichiers", "Livrez toujours deux dossiers : « sources » et « exports ». Le client vous remerciera."],
    ["Fichiers", "Un composant se nomme par ce qu’il fait, pas par ce qu’il ressemble."],
    ["Fichiers", "Documentez vos choix dans le fichier : dans six mois, vous serez l’inconnu."],
    ["Fichiers", "Supprimez les « Calque 4 » et les rectangles de test avant d’envoyer : ça se voit."],
    ["Fichiers", "Un dossier de livraison se teste en l’ouvrant sur une autre machine."],

    ["Client", "Montrez deux pistes, pas cinq. La troisième option dilue la décision."],
    ["Client", "Faites valider le brief par écrit avant la première esquisse."],
    ["Client", "Un devis décrit des livrables, pas des heures d’inspiration."],
    ["Client", "Facturez la recherche : c’est elle qui rend le dessin évident."],
    ["Client", "Les allers-retours se comptent : deux séries de retours, puis on rouvre un devis."],
    ["Client", "Envoyez les maquettes avec un contexte : un lien seul se juge sans vous."],
    ["Client", "Expliquez une proposition en trois points : intention, preuve, conséquence."],
    ["Client", "Un client qui ne répond pas n’est pas un client : fixez une date de relance."],
    ["Client", "Le dernier 10 % du projet (exports, nommage, guide) fait la réputation."],
    ["Client", "Dites non aux projets dont vous ne pourriez pas défendre le résultat."],

    ["Accessibilité", "Testez vos contrastes sur la pire capture possible, pas sur votre bel écran."],
    ["Accessibilité", "Chaque image porte un texte alternatif, sauf si elle est purement décorative."],
    ["Accessibilité", "La taille de police du navigateur doit rester respectée : travaillez en rem."],
    ["Accessibilité", "Un formulaire se remplit au clavier, sans piège de focus."],
    ["Accessibilité", "Les titres suivent une hiérarchie h1 → h2 → h3 : pas de saut de niveau."],
    ["Accessibilité", "Prévoyez un mode mouvement réduit : le parallaxe n’est pas pour tout le monde."],
    ["Accessibilité", "Les sous-titres ne sont pas une option : beaucoup de vidéos se regardent sans son."],
    ["Accessibilité", "Un contraste de 3:1 suffit pour une icône, jamais pour un paragraphe."],

    ["Atelier", "Avant d’ajouter un élément, demandez-vous ce qu’il remplace."],
    ["Atelier", "Copiez la structure, jamais la surface : l’idée doit être à vous."],
    ["Atelier", "Constituez une bibliothèque de captures : votre œil se souvient mieux que vous."],
    ["Atelier", "Un projet personnel par saison suffit à nourrir un portfolio."],
    ["Atelier", "Montrez le problème avant la solution : c’est ce que le client achète."],
    ["Atelier", "Le goût se travaille : regardez dix bons travaux pour un que vous produisez."]
  ];

  if (tipCard && tipText && designTips.length) {
    // Tirage sans répétition : chaque tip vu est mémorisé, la banque se recharge à la fin.
    var TIPS_KEY = "umdg-tips-vus";
    var seenTips = [];
    try {
      seenTips = JSON.parse(window.localStorage.getItem(TIPS_KEY) || "[]");
    } catch (e) {
      seenTips = [];
    }
    if (!Array.isArray(seenTips)) seenTips = [];
    seenTips = seenTips.filter(function (i) {
      return typeof i === "number" && i >= 0 && i < designTips.length;
    });

    function saveSeenTips() {
      try {
        window.localStorage.setItem(TIPS_KEY, JSON.stringify(seenTips));
      } catch (e) {}
    }

    function drawTipIndex() {
      if (seenTips.length >= designTips.length) seenTips = [];
      var pool = [];
      for (var i = 0; i < designTips.length; i++) {
        if (seenTips.indexOf(i) === -1) pool.push(i);
      }
      return pool[Math.floor(Math.random() * pool.length)];
    }

    function renderTip(index) {
      var tip = designTips[index];
      if (!tip) return;

      tipText.textContent = tip[1];
      if (tipTag) tipTag.textContent = tip[0];

      if (seenTips.indexOf(index) === -1) seenTips.push(index);
      saveSeenTips();

      if (!reduce) {
        tipCard.classList.remove("swap");
        tipCard.offsetWidth;
        tipCard.classList.add("swap");
      }
    }

    renderTip(drawTipIndex());

    if (tipNext) {
      tipNext.addEventListener("click", function () {
        renderTip(drawTipIndex());
      });
    }
  }

  // ---------- Copier l'email ----------
  var mailCopy = document.querySelector(".mail-copy");
  var mailLink = document.querySelector(".contact-mail");

  if (mailCopy && mailLink) {
    var emailValue = (mailLink.getAttribute("href") || "").replace(/^mailto:/, "");
    var copyTimer = null;
    var mailLabel = mailCopy.querySelector(".mail-copy-label");

    mailCopy.addEventListener("click", function () {
      copyText(emailValue, function () {
        if (mailLabel) mailLabel.textContent = "Copié";
        mailCopy.setAttribute("title", "Email copié");
        mailCopy.classList.add("copied");
        showToast("Email copié");
        window.clearTimeout(copyTimer);
        copyTimer = window.setTimeout(function () {
          if (mailLabel) mailLabel.textContent = "Copier";
          mailCopy.setAttribute("title", "Copier l’adresse email");
          mailCopy.classList.remove("copied");
        }, 1800);
      });
    });
  }

  // ---------- Actions du pied de page : partager / imprimer ----------
  var shareSite = document.getElementById("share-site");
  var printPage = document.getElementById("print-page");

  if (shareSite) {
    shareSite.addEventListener("click", function () {
      var url = location.href.split("#")[0];
      var payload = {
        title: "UnknownMDG — Portfolio",
        text: "Portfolio de UnknownMDG : UI/UX, identité et motion.",
        url: url
      };

      if (navigator.share) {
        navigator.share(payload).catch(function () {});
        return;
      }

      copyText(url, function () { showToast("Lien du portfolio copié"); });
    });
  }

  if (printPage) {
    printPage.addEventListener("click", function () {
      if (window.print) window.print();
    });
  }

  // ---------- Apparition des images ----------
  document.querySelectorAll("main img").forEach(function (img) {
    if (!img.getAttribute("src")) return;
    img.classList.add("img-fade");
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add("img-loaded");
    } else {
      img.addEventListener("load", function () { img.classList.add("img-loaded"); });
      img.addEventListener("error", function () { img.classList.add("img-loaded"); });
    }
  });

  // ---------- Horloge du studio (heure d'Antananarivo) ----------
  var clock = document.getElementById("studio-clock");

  if (clock) {
    var clockFmt = null;
    try {
      clockFmt = new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Indian/Antananarivo"
      });
    } catch (e) {
      clockFmt = new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false });
    }

    var lastClock = "";
    var syncClock = function () {
      var now = new Date();
      var label = clockFmt.format(now);
      if (label === lastClock) return;
      lastClock = label;
      clock.textContent = label;
      clock.setAttribute("datetime", now.toISOString());
      clock.setAttribute("title", "Heure locale à Antananarivo (EAT)");
    };

    syncClock();
    window.setInterval(syncClock, 10000);
  }

  // ---------- Retour en haut ----------
  var toTop = document.querySelector(".to-top");

  if (toTop) {
    function syncToTop() {
      toTop.classList.toggle("show", window.scrollY > 640);
    }

    window.addEventListener("scroll", syncToTop, { passive: true });
    syncToTop();

    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }
  // ---------- Liens de projet (partage & ouverture directe) ----------
  var projectItems = document.querySelectorAll(".project");

  projectItems.forEach(function (project, i) {
    if (!project.id) project.id = "projet-" + (i + 1);
  });

  function setProjectHash(id) {
    try {
      var base = location.pathname + location.search;
      history.replaceState(null, "", id ? "#" + id : base);
    } catch (e) {}
  }

  function openProjectFromHash() {
    var match = /^#projet-(\d+)$/.exec(location.hash || "");
    if (!match) return;
    var project = document.getElementById("projet-" + match[1]);
    if (!project) return;
    var group = project.closest(".project-group");
    if (group && group.dataset.group) applyFilter(group.dataset.group);

    window.setTimeout(function () {
      var header = project.querySelector(".project-header");
      if (header && header.getAttribute("aria-expanded") !== "true") toggle(header);
      window.setTimeout(function () {
        project.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      }, 380);
    }, 160);
  }

  projectItems.forEach(function (project) {
    var details = project.querySelector(".project-details");
    if (!details) return;

    var share = document.createElement("button");
    share.type = "button";
    share.className = "project-share";
    share.setAttribute("aria-label", "Copier le lien du projet");
    share.setAttribute("title", "Copier le lien du projet");
    share.innerHTML = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span class="project-share-label">Copier le lien</span>';
    share.addEventListener("click", function () {
      var url = location.origin + location.pathname + location.search + "#" + project.id;
      copyText(url, function () { showToast("Lien du projet copié"); });
    });
    details.appendChild(share);
  });

  headers.forEach(function (header) {
    header.addEventListener("click", function () {
      window.setTimeout(function () {
        var project = header.parentElement;
        if (project.classList.contains("open") && project.id) setProjectHash(project.id);
        else if (!document.querySelector(".project.open")) setProjectHash("");
      }, 0);
    });
  });

  openProjectFromHash();
  window.addEventListener("hashchange", openProjectFromHash);
})();
