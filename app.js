(() => {
  "use strict";
  const config = window.WEDDING_CONFIG;
  if (!config) return;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const text = (key) => key.split(".").reduce((value, part) => value?.[part], config.texts) ?? "";
  const setText = (selector, value) => { const node = $(selector); if (node) node.textContent = value ?? ""; };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fillText() {
    $$('[data-text]').forEach((node) => { node.textContent = text(node.dataset.text); });
    $$('[data-placeholder]').forEach((node) => { node.placeholder = text(node.dataset.placeholder); });
    [["#groomName", config.couple.groom], ["#brideName", config.couple.bride]].forEach(([selector, person]) => {
      const node = $(selector); node.textContent = person.ar;
      const english = document.createElement("span"); english.className = "couple__latin"; english.dir = "ltr"; english.textContent = person.en;
      node.append(english);
    });
    setText("#coverMono", config.texts.coverSymbol);
    setText("#heroDate", `${config.event.dateText} • ${config.event.timeText}`);
    setText("#verseText", config.texts.verse);
    setText("#invitationText", config.texts.invitation);
    setText("#groomParents", config.family.groom);
    setText("#brideParents", config.family.bride);
    setText("#weddingDate", config.event.dateText);
    setText("#weddingTime", config.event.timeText);
    setText("#venueName", config.venue.name);
    setText("#venueAddr", config.venue.address);
    setText("#closingNote", config.texts.closingNote);
    setText("#closingHashtag", config.texts.hashtag);
    setText("#closingFamilies", config.texts.closingFamilies);
    setText("#calMonth", config.event.monthText);
    setText("#calWeekday", config.event.weekdayText);
    setText("#calDay", config.event.dayText);
    setText("#calTime", config.event.timeText);
    document.title = `${config.texts.title} ${config.couple.groom.ar} & ${config.couple.bride.ar}`;
    $("#metaDescription").content = config.texts.metaDescription;
    $("#ogTitle").content = document.title;
    $("#ogDescription").content = config.texts.metaDescription;
    $$('[data-aria]').forEach((node) => node.setAttribute("aria-label", text(node.dataset.aria)));
    $("#fontCss").href = config.links.fonts;
    $("#ogImage").content = new URL(config.assets.share, location.href).href;
    const map = $("#mapBtn"); map.href = config.venue.mapUrl;
    const whatsapp = config.links.whatsapp;
    $("#contactLink").href = whatsapp;
    setText("#contactLink", config.texts.contactDisplay);
    $("#orderLink").href = whatsapp;
    $("#stickyWhatsApp").href = whatsapp;
    const bg = $("#coverBg"); if (config.assets.coverBackground) bg.style.backgroundImage = `url("${config.assets.coverBackground}")`;
  }

  function fillLists() {
    const timeline = $("#timeline");
    config.program.forEach(({ time, title }) => {
      const item = document.createElement("li"); item.className = "timeline__item";
      const dot = document.createElement("span"); dot.className = "timeline__dot";
      const timeNode = document.createElement("span"); timeNode.className = "timeline__time"; timeNode.textContent = time;
      const titleNode = document.createElement("span"); titleNode.className = "timeline__title"; titleNode.textContent = title;
      item.append(dot, timeNode, titleNode); timeline.append(item);
    });
    const notes = $("#notesList");
    config.notes.forEach((note) => {
      const item = document.createElement("li"); item.className = "notes__item";
      const mark = document.createElement("span"); mark.className = "notes__mark"; mark.textContent = "✿";
      const body = document.createElement("span"); body.textContent = note;
      item.append(mark, body); notes.append(item);
    });
    const gallery = $("#gallery");
    config.assets.gallery.forEach((src, index) => {
      const figure = document.createElement("figure"); figure.className = "mem-cell";
      const image = document.createElement("img"); image.src = src; image.alt = `ذكرى ${index + 1}`;
      image.loading = "lazy"; image.decoding = "async"; figure.append(image); gallery.append(figure);
    });
    const wishes = $("#wishList");
    config.wishes.forEach(({ name, message, color }) => {
      const item = document.createElement("article"); item.className = "wish";
      const avatar = document.createElement("div"); avatar.className = "wish-av"; avatar.style.background = color; avatar.textContent = name.trim().charAt(0);
      const body = document.createElement("div"); body.className = "wish-body";
      const nameNode = document.createElement("div"); nameNode.className = "wish-name"; nameNode.textContent = name;
      const messageNode = document.createElement("div"); messageNode.className = "wish-msg"; messageNode.textContent = message;
      body.append(nameNode, messageNode); item.append(avatar, body); wishes.append(item);
    });
    const calLink = $("#googleCalendar");
    const start = new Date(config.event.date);
    const end = new Date(start.getTime() + 4 * 60 * 60 * 1000);
    const stamp = (date) => date.toISOString().replaceAll("-", "").replaceAll(":", "").replace(/\.\d{3}Z$/, "Z");
    const params = new URLSearchParams({
      text: `${config.texts.title} ${config.couple.groom.ar} & ${config.couple.bride.ar}`,
      dates: `${stamp(start)}/${stamp(end)}`,
      ctz: config.timezone,
      location: `${config.venue.name} — ${config.venue.address}`,
      details: config.links.invitationUrl,
    });
    calLink.href = `${config.links.googleCalendarBase}&${params.toString()}`;
    $("#appleCalendar").href = makeCalendarFile(start, end);
  }

  function makeCalendarFile(start, end) {
    const escape = (value) => value.replaceAll("\\", "\\\\").replaceAll("\n", "\\n").replaceAll(",", "\\,").replaceAll(";", "\\;");
    const event = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//Starlit//AR",
      "CALSCALE:GREGORIAN", "BEGIN:VEVENT", `DTSTART:${start.toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTEND:${end.toISOString().replaceAll(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `SUMMARY:${escape(`${config.texts.title} ${config.couple.groom.ar} & ${config.couple.bride.ar}`)}`,
      `LOCATION:${escape(`${config.venue.name} — ${config.venue.address}`)}`,
      `DESCRIPTION:${escape(config.links.invitationUrl)}`, "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    return URL.createObjectURL(new Blob([event], { type: "text/calendar;charset=utf-8" }));
  }

  function buildStars(count) {
    const layer = $("#stars");
    for (let index = 0; index < count; index += 1) {
      const star = document.createElement("span"); star.className = "star";
      const size = 1 + Math.random() * 2.4;
      star.style.width = `${size}px`; star.style.height = `${size}px`;
      star.style.left = `${Math.random() * 100}%`; star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--tw", `${2 + Math.random() * 4}s`);
      star.style.animationDelay = `${Math.random() * 5}s`; layer.append(star);
    }
  }

  function buildConstellation() {
    const path = $("#cline"); const group = $("#cstars"); const points = [];
    for (let index = 0; index < 12; index += 1) {
      const angle = index / 12 * Math.PI * 2;
      const x = 16 * Math.pow(Math.sin(angle), 3);
      const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
      points.push([100 + x * 5.2, 88 - y * 5]);
    }
    path.setAttribute("d", `M${points.map((point) => `${point[0].toFixed(1)},${point[1].toFixed(1)}`).join(" L")} Z`);
    points.forEach(([x, y], index) => {
      const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      star.setAttribute("cx", x.toFixed(1)); star.setAttribute("cy", y.toFixed(1)); star.setAttribute("r", "2.6");
      star.setAttribute("class", "cstar"); star.style.animationDelay = `${0.5 + index * 0.18}s`; group.append(star);
    });
  }

  function setupCover() {
    const cover = $("#cover"); const invite = $("#invite"); const hero = $(".hero");
    $("#openBtn").addEventListener("click", () => {
      if (!reduceMotion) {
        [18, 30, 12].forEach((top, index) => setTimeout(() => shootStar(top, [70, 90, 55][index]), index * 350));
      }
      cover.classList.add("is-open"); invite.setAttribute("aria-hidden", "false"); hero.classList.add("play");
      window.setTimeout(() => { cover.style.display = "none"; }, 1700);
      startMusic();
    }, { once: true });
  }
  function shootStar(top, left) {
    const shooting = $("#shooting"); const star = document.createElement("div");
    star.className = "shoot shoot--go"; star.style.top = `${top}%`; star.style.left = `${left}%`;
    shooting.append(star); window.setTimeout(() => star.remove(), 1400);
  }

  function setupReveal() {
    const sections = $$(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) { sections.forEach((section) => section.classList.add("is-visible")); return; }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    sections.forEach((section) => observer.observe(section));
  }

  function setupCountdown() {
    const target = new Date(config.event.date).getTime();
    const fields = { days: $("#cdDays"), hours: $("#cdHours"), minutes: $("#cdMins"), seconds: $("#cdSecs") };
    let last = {};
    const tick = () => {
      const difference = target - Date.now();
      if (difference <= 0) { $("#countdown").hidden = true; $("#cdArrived").hidden = false; return; }
      const values = {
        days: Math.floor(difference / 86400000),
        hours: Math.floor(difference % 86400000 / 3600000),
        minutes: Math.floor(difference % 3600000 / 60000),
        seconds: Math.floor(difference % 60000 / 1000),
      };
      Object.entries(values).forEach(([key, value]) => {
        const formatted = String(value).padStart(2, "0");
        if (last[key] !== formatted) {
          fields[key].textContent = formatted; last[key] = formatted;
          if (!reduceMotion) { fields[key].classList.remove("flip"); void fields[key].offsetWidth; fields[key].classList.add("flip"); }
        }
      });
    };
    tick(); window.setInterval(tick, 1000);
  }

  let musicPlayer; let musicReady = false; let musicOn = false;
  function updateMusicButton() { const button = $("#da3wa-music"); button.textContent = musicOn ? "🔊" : "🔇"; button.setAttribute("aria-pressed", String(musicOn)); }
  function startMusic() {
    if (!musicReady || !musicPlayer) return;
    try { musicPlayer.unMute(); musicPlayer.setVolume(70); musicPlayer.playVideo(); musicOn = true; updateMusicButton(); } catch (_) { musicOn = false; updateMusicButton(); }
  }
  function setupMusic() {
    window.onYouTubeIframeAPIReady = () => {
      musicPlayer = new YT.Player("da3wa-yt", {
        videoId: config.assets.musicVideoId,
        playerVars: { autoplay: 0, controls: 0, disablekb: 1, fs: 0, loop: 1, playlist: config.assets.musicVideoId, playsinline: 1, modestbranding: 1, rel: 0 },
        events: { onReady() { musicReady = true; musicPlayer.mute(); updateMusicButton(); }, onStateChange(event) { if (event.data === 0) musicPlayer.playVideo(); } },
      });
    };
    const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; script.async = true; document.head.append(script);
    $("#da3wa-music").addEventListener("click", () => {
      if (musicOn) { musicPlayer?.pauseVideo(); musicOn = false; updateMusicButton(); }
      else startMusic();
    });
  }

  function setupRsvp() {
    let attendance = "yes"; let companions = 0;
    const value = $("#companions");
    $$(".pill", $("#attendance")).forEach((button) => button.addEventListener("click", () => {
      attendance = button.dataset.value;
      $$(".pill", $("#attendance")).forEach((pill) => pill.setAttribute("aria-pressed", String(pill === button)));
    }));
    $("#minus").addEventListener("click", () => { companions = Math.max(0, companions - 1); value.textContent = companions; });
    $("#plus").addEventListener("click", () => { companions = Math.min(20, companions + 1); value.textContent = companions; });
    $("#rsvpForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#guestName").value.trim(); if (!name) return;
      const message = $("#rsvpMessage").value.trim();
      const attendanceText = text(attendance);
      const body = [`تأكيد حضور حفل زفاف ${config.couple.groom.ar} و${config.couple.bride.ar}`, `الاسم: ${name}`, `الحضور: ${attendanceText}`, `عدد المرافقين: ${companions}`, message ? `التهنئة: ${message}` : ""].filter(Boolean).join("\n");
      window.open(`${config.links.whatsapp}?text=${encodeURIComponent(body)}`, "_blank", "noopener,noreferrer");
    });
  }

  fillText(); fillLists(); buildStars(72); buildConstellation(); setupCover(); setupReveal(); setupCountdown(); setupMusic(); setupRsvp();
})();
