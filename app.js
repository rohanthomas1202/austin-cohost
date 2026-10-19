/* =====================================================================
   CONFIG: edit these values.
   Times use 24-hour "HH:MM" (e.g. "16:00" = 4 PM); the page formats them.
   Never put door codes, wifi passwords or street addresses in here.
   ===================================================================== */
const CONCIERGE_EMAIL = "REPLACE_ME@example.com";
const BRAND = "Austin Co-Host Co.";
const DEFAULT_PROPERTY = "zilker";

const PROPERTIES = {
  zilker: {
    name: "Zilker Loft",
    neighborhood: "Zilker",
    maxGuests: 4,
    nightly: 189,
    checkIn: "16:00",
    checkOut: "10:00",
    earlyCheckInFrom: "12:00",
    earlyFee: 30,
    lateFee: 30,
    petsAllowed: false,
    petFee: 0,
    description: "A bright, airy loft a short bike ride from Zilker Park and Barton Springs. High ceilings, a king bed upstairs, a sleeper sofa below, and a balcony made for golden-hour iced coffee.",
    amenities: ["Fast Wi-Fi", "Self check-in", "Full kitchen", "Washer & dryer", "Free parking", "Private balcony"],
    art: "loft"
  },
  east6th: {
    name: "East 6th Bungalow",
    neighborhood: "East Austin",
    maxGuests: 3,
    nightly: 159,
    checkIn: "16:00",
    checkOut: "11:00",
    earlyCheckInFrom: "13:00",
    earlyFee: 30,
    lateFee: 30,
    petsAllowed: false,
    petFee: 0,
    description: "A cozy one-bedroom bungalow close to East Austin's taco trucks, coffee shops and live music. Walkable by day, quiet at night, with a shaded porch swing for slow mornings.",
    amenities: ["Fast Wi-Fi", "Self check-in", "Kitchenette", "Pour-over coffee bar", "Porch swing", "Street parking"],
    art: "bungalow"
  },
  soco: {
    name: "South Congress Casita",
    neighborhood: "South Congress",
    maxGuests: 4,
    nightly: 219,
    checkIn: "15:00",
    checkOut: "10:00",
    earlyCheckInFrom: "12:00",
    earlyFee: 30,
    lateFee: 30,
    petsAllowed: false,
    petFee: 0,
    description: "A colorful casita near the boutiques, food trucks and music venues of South Congress. Queen bed plus a daybed, a private patio under string lights, and downtown views a short stroll away.",
    amenities: ["Fast Wi-Fi", "Self check-in", "Full kitchen", "Private patio", "Smart TV", "Free parking"],
    art: "casita"
  },
  mueller: {
    name: "Mueller Townhouse",
    neighborhood: "Mueller",
    maxGuests: 6,
    nightly: 249,
    checkIn: "16:00",
    checkOut: "11:00",
    earlyCheckInFrom: "13:00",
    earlyFee: 30,
    lateFee: 30,
    petsAllowed: true,
    petFee: 50,
    description: "A roomy three-bedroom townhouse in family-friendly Mueller, steps from the park, lake trail and Sunday farmers market. Space for six, a fenced patio, and your dog is welcome too.",
    amenities: ["Fast Wi-Fi", "Self check-in", "Full kitchen", "Washer & dryer", "Fenced patio", "Garage parking"],
    art: "townhouse"
  }
};
/* ======================= end of CONFIG ======================= */

(function () {
  "use strict";

  // ---------- helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const oneLine = (s) => String(s || "").replace(/\s+/g, " ").trim();
  const multiLine = (s) => String(s || "").trim().replace(/\s*[\r\n]+\s*/g, " / ").replace(/[ \t]+/g, " ");
  const money = (n) => "$" + Number(n).toLocaleString("en-US");
  const EMAIL_RE = /^[^\s@<>(),;:"\[\]]+@[^\s@<>(),;:"\[\]]+\.[A-Za-z]{2,}$/;

  function fmtTime(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return m ? `${h12}:${String(m).padStart(2, "0")} ${suffix}` : `${h12} ${suffix}`;
  }
  function isoLocal(d) {
    const z = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  }
  function dayNum(iso) { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d) / 86400000; }
  function addDays(iso, n) { const t = new Date((dayNum(iso) + n) * 86400000); return t.toISOString().slice(0, 10); }
  const ISO_RE = /^\d{4}-\d{2}-\d{2}$/;
  const TIME_RE = /^\d{2}:\d{2}$/;

  // ---------- pick property ----------
  const requested = (new URLSearchParams(window.location.search).get("property") || "").trim().toLowerCase();
  const id = Object.prototype.hasOwnProperty.call(PROPERTIES, requested) ? requested : DEFAULT_PROPERTY;
  const P = PROPERTIES[id];
  const TODAY = isoLocal(new Date());

  // ---------- illustration (inline SVG, no photos) ----------
  const PALETTES = {
    loft:      { sky: ["#174E5B", "#E57A4A", "#F8C48E"], sun: "#FFD9A6", hill: "#2F6E73", ground: "#0A3C46" },
    bungalow:  { sky: ["#2E3B66", "#C95A6A", "#F3A85E"], sun: "#FFE2B5", hill: "#4A4F78", ground: "#1E2B45" },
    casita:    { sky: ["#E9703F", "#F4A26A", "#FCE1BE"], sun: "#FFF2D8", hill: "#C26A45", ground: "#0E4F5C" },
    townhouse: { sky: ["#6FAEB6", "#CFE2D6", "#FBE6C4"], sun: "#F7A94B", hill: "#5C9A8F", ground: "#0E4F5C" }
  };
  function buildingSVG(type) {
    const glow = "#FFD27F", win = "#0E4F5C";
    if (type === "bungalow") return `
      <rect x="470" y="252" width="210" height="78" fill="#FFF4E8"/>
      <polygon points="452,256 575,196 698,256" fill="#9E3912"/>
      <rect x="470" y="252" width="210" height="8" fill="#7E2C0D" opacity=".35"/>
      <rect x="492" y="276" width="34" height="30" rx="3" fill="${glow}"/><rect x="624" y="276" width="34" height="30" rx="3" fill="${glow}"/>
      <rect x="560" y="272" width="30" height="58" rx="3" fill="${win}"/>
      <rect x="470" y="326" width="210" height="6" fill="#CDBFB1"/>
      <rect x="538" y="262" width="4" height="66" fill="#E8D8C6"/><rect x="608" y="262" width="4" height="66" fill="#E8D8C6"/>`;
    if (type === "casita") return `
      <path d="M490 330 V238 q0 -12 12 -12 h30 q8 0 10 -8 q4 -12 23 -12 q19 0 23 12 q2 8 10 8 h30 q12 0 12 12 V330 Z" fill="#F6D2BB"/>
      <rect x="500" y="236" width="10" height="6" fill="#8A5A3C"/><rect x="530" y="236" width="10" height="6" fill="#8A5A3C"/><rect x="590" y="236" width="10" height="6" fill="#8A5A3C"/><rect x="620" y="236" width="10" height="6" fill="#8A5A3C"/>
      <path d="M548 330 v-44 a17 17 0 0 1 34 0 v44 z" fill="${win}"/>
      <circle cx="565" cy="250" r="10" fill="${glow}"/>
      <rect x="506" y="268" width="26" height="30" rx="13" fill="${glow}"/><rect x="598" y="268" width="26" height="30" rx="13" fill="${glow}"/>
      <path d="M472 300 q46 -16 92 -6 q46 10 102 -4" fill="none" stroke="#FFF2D8" stroke-width="1.5" stroke-dasharray="2 9" stroke-linecap="round"/>`;
    if (type === "townhouse") return `
      <rect x="452" y="214" width="82" height="116" fill="#FFF4E8"/><polygon points="446,216 493,184 540,216" fill="#0E4F5C"/>
      <rect x="534" y="200" width="82" height="130" fill="#F8DCC7"/><polygon points="528,202 575,168 622,202" fill="#C2491D"/>
      <rect x="616" y="220" width="82" height="110" fill="#E3EFEC"/><polygon points="610,222 657,192 704,222" fill="#0A3C46"/>
      <rect x="468" y="236" width="20" height="24" rx="2" fill="${glow}"/><rect x="498" y="236" width="20" height="24" rx="2" fill="${win}"/><rect x="480" y="290" width="24" height="40" rx="2" fill="${win}"/>
      <rect x="550" y="222" width="20" height="24" rx="2" fill="${win}"/><rect x="580" y="222" width="20" height="24" rx="2" fill="${glow}"/><rect x="562" y="290" width="24" height="40" rx="2" fill="${win}"/>
      <rect x="632" y="242" width="20" height="24" rx="2" fill="${glow}"/><rect x="662" y="242" width="20" height="24" rx="2" fill="${glow}"/><rect x="644" y="290" width="24" height="40" rx="2" fill="${win}"/>`;
    // loft
    return `
      <rect x="486" y="176" width="168" height="154" fill="#FFF4E8"/>
      <rect x="476" y="166" width="188" height="14" rx="3" fill="#0E4F5C"/>
      <rect x="502" y="196" width="40" height="44" rx="3" fill="${glow}"/><rect x="550" y="196" width="40" height="44" rx="3" fill="${win}"/><rect x="598" y="196" width="40" height="44" rx="3" fill="${glow}"/>
      <rect x="502" y="252" width="40" height="44" rx="3" fill="${win}"/><rect x="598" y="252" width="40" height="44" rx="3" fill="${win}"/>
      <rect x="553" y="270" width="34" height="60" rx="3" fill="#C2491D"/>
      <rect x="494" y="240" width="152" height="6" fill="#0E4F5C" opacity=".85"/>`;
  }
  function sceneSVG(type, uid, label) {
    const c = PALETTES[type] || PALETTES.loft;
    return `<svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(label)}">
      <defs>
        <linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.sky[0]}"/><stop offset=".55" stop-color="${c.sky[1]}"/><stop offset="1" stop-color="${c.sky[2]}"/></linearGradient>
        <radialGradient id="glow-${uid}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${c.sun}" stop-opacity=".75"/><stop offset="1" stop-color="${c.sun}" stop-opacity="0"/></radialGradient>
      </defs>
      <rect width="800" height="400" fill="url(#sky-${uid})"/>
      <circle cx="300" cy="262" r="150" fill="url(#glow-${uid})"/>
      <circle cx="300" cy="262" r="62" fill="${c.sun}"/>
      <path d="M0 292 C120 258 230 276 330 262 S560 236 800 272 V400 H0Z" fill="${c.hill}" opacity=".55"/>
      <g fill="${c.ground}" opacity=".38">
        <rect x="70" y="232" width="26" height="70"/><rect x="100" y="214" width="20" height="88"/><rect x="124" y="244" width="30" height="58"/>
        <rect x="160" y="200" width="18" height="102"/><rect x="182" y="226" width="26" height="76"/><rect x="740" y="236" width="24" height="70"/><rect x="706" y="250" width="30" height="56"/>
      </g>
      <path d="M0 330 C210 312 450 324 800 306 V400 H0Z" fill="${c.ground}"/>
      <g>
        <rect x="150" y="286" width="9" height="46" fill="#3B2A20"/>
        <ellipse cx="154" cy="282" rx="58" ry="26" fill="#1F5A4A"/><ellipse cx="124" cy="270" rx="34" ry="20" fill="#2A6B57"/><ellipse cx="186" cy="268" rx="36" ry="21" fill="#2A6B57"/>
      </g>
      ${buildingSVG(type)}
      <path d="M0 352 C220 340 520 350 800 334 V400 H0Z" fill="#0A2E36" opacity=".55"/>
    </svg>`;
  }

  // ---------- render listing ----------
  document.title = `${P.name} · ${BRAND}`;
  document.querySelectorAll("[data-brand]").forEach((el) => { el.textContent = BRAND; });
  $(".brand").setAttribute("aria-label", `${BRAND} home`);

  $("#hero").innerHTML = sceneSVG(P.art, "hero", `Illustration of ${P.name} in ${P.neighborhood}, Austin`) +
    `<span class="hero-chip">${esc(P.neighborhood)} · Austin, TX</span><span class="hero-note">Illustration</span>`;
  $("#eyebrow").textContent = `${P.neighborhood} · Austin`;
  $("#title").textContent = P.name;
  $("#price").textContent = money(P.nightly);
  $("#meta").innerHTML = [
    `Up to ${P.maxGuests} guests`,
    P.petsAllowed ? `Pets OK (${money(P.petFee)} fee)` : "No pets",
    "Self check-in"
  ].map((t) => `<li>${esc(t)}</li>`).join("");
  $("#facts").innerHTML = [
    ["Check-in", fmtTime(P.checkIn), ""],
    ["Checkout", fmtTime(P.checkOut), ""],
    ["Early check-in", `From ${fmtTime(P.earlyCheckInFrom)}`, `${money(P.earlyFee)} fee`],
    ["Late checkout", `After ${fmtTime(P.checkOut)}`, `${money(P.lateFee)} fee`]
  ].map(([k, v, s]) => `<div class="fact"><dt>${esc(k)}</dt><dd>${esc(v)}${s ? `<small>${esc(s)}</small>` : ""}</dd></div>`).join("");
  $("#description").textContent = P.description;
  $("#amenities").innerHTML = P.amenities.slice(0, 6).map((a) => `<li>${esc(a)}</li>`).join("");
  $("#rules").innerHTML = [
    `Up to ${P.maxGuests} guests`,
    P.petsAllowed ? `Pets welcome, ${money(P.petFee)} pet fee` : "No pets",
    "No parties or events",
    "No smoking or vaping indoors",
    "Quiet hours 10 PM to 8 AM",
    `Check-in after ${fmtTime(P.checkIn)}, checkout by ${fmtTime(P.checkOut)}`
  ].map((r) => `<li>${esc(r)}</li>`).join("");

  // Other stays
  $("#stays").innerHTML = Object.keys(PROPERTIES).filter((k) => k !== id).map((k) => {
    const o = PROPERTIES[k];
    return `<a class="card stay" href="?property=${encodeURIComponent(k)}">
      <span class="stay-art" aria-hidden="true">${sceneSVG(o.art, "s-" + k, o.name)}</span>
      <span class="stay-text"><span class="stay-name">${esc(o.name)}</span>
      <span class="stay-meta">${esc(o.neighborhood)} · up to ${o.maxGuests} guests${o.petsAllowed ? " · pets OK" : ""}</span>
      <span class="stay-price">${money(o.nightly)} / night</span></span></a>`;
  }).join("");
  $("#stays").querySelectorAll(".stay-art svg").forEach((s) => s.setAttribute("aria-hidden", "true"));

  // Setup banner while the placeholder email is still in place
  if (/REPLACE_ME/i.test(CONCIERGE_EMAIL)) {
    const b = $("#setup-banner");
    b.innerHTML = "Setup: set <code>CONCIERGE_EMAIL</code> at the top of app.js.";
    b.hidden = false;
    console.warn("CONCIERGE_EMAIL is still the placeholder.");
  }

  // ---------- open the right card from CTA / hash ----------
  function openCard(cardId) {
    const d = document.getElementById(cardId);
    if (d && d.tagName === "DETAILS") d.open = true;
  }
  document.querySelectorAll("[data-open]").forEach((a) => a.addEventListener("click", () => openCard(a.getAttribute("data-open"))));
  if (location.hash) openCard(location.hash.slice(1));

  // ---------- form setup ----------
  // Booking: dates + guests
  const bookIn = $("#book-in"), bookOut = $("#book-out"), bookGuests = $("#book-guests");
  bookIn.min = TODAY; bookOut.min = addDays(TODAY, 1);
  bookGuests.innerHTML = `<option value="">Select</option>` +
    Array.from({ length: P.maxGuests }, (_, i) => `<option value="${i + 1}">${i + 1} guest${i ? "s" : ""}</option>`).join("");
  $("#book-guests-hint").textContent = `${P.name} sleeps up to ${P.maxGuests}.` + (P.petsAllowed ? ` Pets OK (${money(P.petFee)} fee), mention them in a message.` : "");
  function updateEstimate() {
    const est = $("#book-estimate");
    if (ISO_RE.test(bookIn.value)) bookOut.min = addDays(bookIn.value, 1);
    if (ISO_RE.test(bookIn.value) && ISO_RE.test(bookOut.value)) {
      const n = dayNum(bookOut.value) - dayNum(bookIn.value);
      est.textContent = n > 0 ? `${n} night${n > 1 ? "s" : ""} × ${money(P.nightly)} = ${money(n * P.nightly)} before taxes and fees.` : "";
    } else est.textContent = "";
  }
  bookIn.addEventListener("change", () => {
    if (ISO_RE.test(bookIn.value) && (!bookOut.value || bookOut.value <= bookIn.value)) bookOut.value = addDays(bookIn.value, 1);
    updateEstimate();
  });
  bookOut.addEventListener("change", updateEstimate);

  // Early / late
  const timesDate = $("#times-date"), timesTime = $("#times-time"), timesHint = $("#times-time-hint");
  timesDate.min = TODAY;
  $("#times-sub").textContent = `Early check-in from ${fmtTime(P.earlyCheckInFrom)} or late checkout, ${money(P.earlyFee)} each.`;
  function timesType() { const r = $('#form-times input[name="type"]:checked'); return r ? r.value : ""; }
  function updateTimesHint() {
    const t = timesType();
    if (t === "early") {
      timesHint.textContent = `Early check-in: any time from ${fmtTime(P.earlyCheckInFrom)} to before ${fmtTime(P.checkIn)}. Fee ${money(P.earlyFee)}.`;
      timesTime.min = P.earlyCheckInFrom; timesTime.max = P.checkIn;
      if (!timesTime.value) timesTime.value = P.earlyCheckInFrom;
    } else if (t === "late") {
      timesHint.textContent = `Late checkout: any time after ${fmtTime(P.checkOut)} and before ${fmtTime(P.checkIn)}. Fee ${money(P.lateFee)}.`;
      timesTime.min = P.checkOut; timesTime.max = P.checkIn;
    } else {
      timesHint.textContent = `Standard check-in ${fmtTime(P.checkIn)}, checkout ${fmtTime(P.checkOut)}. Pick early or late above.`;
    }
  }
  document.querySelectorAll('#form-times input[name="type"]').forEach((r) => r.addEventListener("change", () => {
    // reset a time that no longer fits the new choice
    if (timesTime.value) {
      const v = timesTime.value;
      const okEarly = v >= P.earlyCheckInFrom && v < P.checkIn, okLate = v > P.checkOut && v < P.checkIn;
      if ((r.value === "early" && !okEarly) || (r.value === "late" && !okLate)) timesTime.value = "";
    }
    updateTimesHint();
  }));
  updateTimesHint();

  // ---------- validation ----------
  function setError(el, msg) {
    const err = document.getElementById(el.id + "-err");
    if (err) err.textContent = msg || "";
    if (msg) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
  }
  function clearErrors(form) {
    form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll(".error").forEach((e) => { e.textContent = ""; });
  }
  // clear a field's error as soon as the guest edits it
  document.querySelectorAll("form[data-kind]").forEach((form) => {
    form.addEventListener("input", (e) => {
      const t = e.target;
      const holder = t.type === "radio" ? t.closest("fieldset") : t;
      if (holder && holder.getAttribute("aria-invalid")) setError(holder, "");
    });
  });
  function checkNameEmail(form, errs) {
    const n = form.elements.name, e = form.elements.email;
    const name = oneLine(n.value), email = oneLine(e.value);
    if (!name) errs.push([n, "Please enter your name."]);
    else if (name.length < 2) errs.push([n, "Please enter your full name."]);
    if (!email) errs.push([e, "Please enter your email."]);
    else if (!EMAIL_RE.test(email)) errs.push([e, "Please enter a valid email, like name@example.com."]);
    return { name, email };
  }

  const SPECS = {
    book(form, errs) {
      const ci = bookIn.value, co = bookOut.value, g = bookGuests.value;
      if (!ci) errs.push([bookIn, "Choose a check-in date."]);
      else if (!ISO_RE.test(ci)) errs.push([bookIn, "Use a valid date."]);
      else if (ci < TODAY) errs.push([bookIn, "Check-in can't be in the past."]);
      if (!co) errs.push([bookOut, "Choose a check-out date."]);
      else if (!ISO_RE.test(co)) errs.push([bookOut, "Use a valid date."]);
      else if (ISO_RE.test(ci) && co <= ci) errs.push([bookOut, "Check-out must be after check-in."]);
      if (!g) errs.push([bookGuests, "Choose the number of guests."]);
      else if (+g < 1 || +g > P.maxGuests) errs.push([bookGuests, `Up to ${P.maxGuests} guests.`]);
      const nights = ISO_RE.test(ci) && ISO_RE.test(co) ? dayNum(co) - dayNum(ci) : 0;
      return { type: "Request to book", fields: [["Check-in date", ci], ["Check-out date", co], ["Nights", String(nights)], ["Guests", g]] };
    },
    times(form, errs) {
      const fs = $("#times-type"), t = timesType(), d = timesDate.value, tm = timesTime.value;
      if (!t) errs.push([fs, "Choose early check-in or late checkout."]);
      if (!d) errs.push([timesDate, "Choose a date."]);
      else if (!ISO_RE.test(d)) errs.push([timesDate, "Use a valid date."]);
      else if (d < TODAY) errs.push([timesDate, "Date can't be in the past."]);
      if (!tm) errs.push([timesTime, "Choose a time."]);
      else if (!TIME_RE.test(tm.slice(0, 5))) errs.push([timesTime, "Use a valid time."]);
      else if (t === "early" && !(tm >= P.earlyCheckInFrom && tm < P.checkIn)) errs.push([timesTime, `Early check-in is available from ${fmtTime(P.earlyCheckInFrom)} to before ${fmtTime(P.checkIn)}.`]);
      else if (t === "late" && !(tm > P.checkOut && tm < P.checkIn)) errs.push([timesTime, `Late checkout must be after ${fmtTime(P.checkOut)} and before ${fmtTime(P.checkIn)}.`]);
      const type = t === "late" ? "Late checkout" : "Early check-in";
      const fee = t === "late" ? P.lateFee : P.earlyFee;
      return { type, fields: [["Date", d], ["Desired time", tm ? fmtTime(tm.slice(0, 5)) : ""], ["Fee", money(fee)]] };
    },
    issue(form, errs) {
      const ta = $("#issue-what"), fs = $("#issue-urgent");
      const what = multiLine(ta.value);
      const u = form.querySelector('input[name="urgent"]:checked');
      if (!what) errs.push([ta, "Tell us what's wrong."]);
      else if (what.length < 5) errs.push([ta, "Add a few more details."]);
      if (!u) errs.push([fs, "Let us know if it's urgent."]);
      return { type: "Report an issue", fields: [["Issue", what], ["Urgent", u ? u.value : ""]] };
    },
    message(form, errs) {
      const ta = $("#msg-text");
      const msg = multiLine(ta.value);
      if (!msg) errs.push([ta, "Please write a message."]);
      return { type: "Message the host", fields: [["Message", msg]] };
    }
  };

  // ---------- email building ----------
  function buildEmail(type, name, email, fields) {
    const subject = `[${P.name}] ${type} - ${name}`;
    const lines = [
      `Property: ${P.name} (${id})`,
      `Request type: ${type}`,
      `Guest name: ${name}`,
      `Guest email: ${email}`,
      ...fields.map(([k, v]) => `${k}: ${v}`),
      `Sent from: ${BRAND} booking site`
    ];
    const body = lines.join("\n");
    const href = `mailto:${CONCIERGE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\r\n"))}`;
    return { subject, body, href };
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
    } catch (_) { /* fall through */ }
    const ta = document.createElement("textarea");
    ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.top = "-1000px"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    ta.remove();
    return ok;
  }

  function showConfirmation(form, mail) {
    let panel = form.parentNode.querySelector(".confirm");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "confirm";
      panel.innerHTML = `
        <h3 tabindex="-1"><span class="okdot" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>Opening your email app…</h3>
        <p>Press <strong>Send</strong> in your email app and the Concierge bot will reply in minutes.</p>
        <p class="hint">No email app opened? Copy the message below and send it to:</p>
        <div class="to-line"><strong data-to></strong><button type="button" class="btn btn-ghost btn-sm" data-copy-addr>Copy address</button></div>
        <pre class="msg" data-msg tabindex="0" aria-label="Full message"></pre>
        <div class="btn-row">
          <button type="button" class="btn btn-teal btn-sm" data-copy-msg>Copy message</button>
          <a class="btn btn-ghost btn-sm" data-reopen href="#">Open email again</a>
          <button type="button" class="btn btn-ghost btn-sm" data-back>Edit or send another</button>
        </div>
        <p class="status" role="status" aria-live="polite" data-status></p>`;
      form.parentNode.appendChild(panel);
      const status = panel.querySelector("[data-status]");
      panel.querySelector("[data-copy-msg]").addEventListener("click", async () => {
        const ok = await copyText(panel.dataset.full);
        status.textContent = ok ? "Message copied. Paste it into a new email." : "Couldn't copy automatically. Select the text above and copy it.";
      });
      panel.querySelector("[data-copy-addr]").addEventListener("click", async () => {
        const ok = await copyText(CONCIERGE_EMAIL);
        status.textContent = ok ? "Email address copied." : "Couldn't copy automatically. Select the address and copy it.";
      });
      panel.querySelector("[data-back]").addEventListener("click", () => {
        panel.hidden = true; form.hidden = false; status.textContent = "";
        const first = form.querySelector("input, textarea, select"); if (first) first.focus();
      });
    }
    panel.querySelector("[data-to]").textContent = CONCIERGE_EMAIL;
    panel.querySelector("[data-msg]").textContent = `To: ${CONCIERGE_EMAIL}\nSubject: ${mail.subject}\n\n${mail.body}`;
    panel.querySelector("[data-reopen]").href = mail.href;
    panel.querySelector("[data-status]").textContent = "";
    panel.dataset.full = `To: ${CONCIERGE_EMAIL}\nSubject: ${mail.subject}\n\n${mail.body}`;
    form.hidden = true;
    panel.hidden = false;
    panel.querySelector("h3").focus({ preventScroll: true });
    panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  document.querySelectorAll("form[data-kind]").forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      clearErrors(form);
      const errs = [];
      const { name, email } = checkNameEmail(form, errs);
      const spec = SPECS[form.dataset.kind](form, errs);
      if (errs.length) {
        errs.forEach(([el, msg]) => setError(el, msg));
        const first = errs[0][0];
        (first.tagName === "FIELDSET" ? first.querySelector("input") : first).focus();
        return;
      }
      const mail = buildEmail(spec.type, name, email, spec.fields);
      showConfirmation(form, mail);
      window.__lastMailto = mail.href; // handy for testing in the console
      window.location.href = mail.href;
    });
  });
})();
