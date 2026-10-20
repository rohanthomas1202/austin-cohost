/* =====================================================================
   CONFIG: edit these values.
   Times use 24-hour "HH:MM" (e.g. "16:00" = 4 PM); the page formats them.
   Never put door codes, wifi passwords or street addresses in here.
   ===================================================================== */
// Every form emails all of these addresses (all on the To: line).
const CONCIERGE_EMAILS = ["rohan+bnbmanager@thomasrohan.com"];
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
  const TO_MAILTO = CONCIERGE_EMAILS.map((e) => e.replace(/\+/g, "%2B")).join(",");
  const TO_DISPLAY = CONCIERGE_EMAILS.join(", ");
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

  // ---------- icons (inline SVG, stroke = currentColor via CSS) ----------
  const ICON = {
    wifi: '<path d="M2.5 9a14 14 0 0 1 19 0"/><path d="M5.5 12.5a9.5 9.5 0 0 1 13 0"/><path d="M8.7 15.9a5 5 0 0 1 6.6 0"/><circle cx="12" cy="19.3" r=".9"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="M10.9 12.1 20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    pot: '<path d="M4 10h16v5.5A4.5 4.5 0 0 1 15.5 20h-7A4.5 4.5 0 0 1 4 15.5z"/><path d="M2 10h20M9 6.5c0-1.4 1.3-2.5 3-2.5s3 1.1 3 2.5"/>',
    washer: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><circle cx="12" cy="13" r="4.5"/><path d="M7.5 6.5h2"/>',
    car: '<path d="M4 15.5 5.6 10a2 2 0 0 1 1.9-1.4h9a2 2 0 0 1 1.9 1.4L20 15.5V19h-3v-2H7v2H4z"/><path d="M4 15.5h16"/><circle cx="8" cy="13.4" r=".6"/><circle cx="16" cy="13.4" r=".6"/>',
    balcony: '<path d="M6 14V9a6 6 0 0 1 12 0v5"/><path d="M3 14h18M5 14v7M9.7 14v7M14.3 14v7M19 14v7M3 21h18"/>',
    coffee: '<path d="M4 9h13v4.5A5.5 5.5 0 0 1 11.5 19h-2A5.5 5.5 0 0 1 4 13.5z"/><path d="M17 10.5h1.2a2.4 2.4 0 0 1 0 4.8H17M8 3.5v2.5M12 3.5v2.5"/>',
    swing: '<path d="M3 3h18M7 3v9M17 3v9M5 12h14v3.5H5zM6.5 15.5V19M17.5 15.5V19"/>',
    umbrella: '<path d="M3 12a9 9 0 0 1 18 0z"/><path d="M12 12v6.5a2 2 0 0 1-4 0"/>',
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    fence: '<path d="M5 21V7l2-3 2 3v14M15 21V7l2-3 2 3v14M3 10.5h18M3 16.5h18"/>',
    check: '<path d="M5 12.5 10 17l9-10"/>',
    people: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.1c2.6.3 4.5 2.6 4.5 5.4"/>',
    paw: '<circle cx="6" cy="10" r="2"/><circle cx="10" cy="6" r="2"/><circle cx="14" cy="6" r="2"/><circle cx="18" cy="10" r="2"/><path d="M12 11c-3 0-5.5 3.6-5.5 6a2.5 2.5 0 0 0 3.2 2.4c1.5-.4 3.1-.4 4.6 0a2.5 2.5 0 0 0 3.2-2.4c0-2.4-2.5-6-5.5-6z"/>',
    nopaw: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'
  };
  const svgIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[name] || ICON.check}</svg>`;
  function amenityIcon(a) {
    const s = a.toLowerCase();
    if (/wi-?fi|internet/.test(s)) return "wifi";
    if (/check-?in|keyless|lock/.test(s)) return "key";
    if (/coffee|espresso/.test(s)) return "coffee";
    if (/kitchen/.test(s)) return "pot";
    if (/washer|dryer|laundry/.test(s)) return "washer";
    if (/parking|garage/.test(s)) return "car";
    if (/balcony/.test(s)) return "balcony";
    if (/swing|porch/.test(s)) return "swing";
    if (/fence/.test(s)) return "fence";
    if (/patio|yard|deck|garden/.test(s)) return "umbrella";
    if (/\btv\b|television/.test(s)) return "tv";
    return "check";
  }

  // ---------- illustration: Austin skyline at dusk (inline SVG, no photos) ----------
  // Sky colors per property, top of the sky to the horizon.
  const SKIES = {
    loft:      ["#0A3238", "#2C6A70", "#EE7A57", "#FF9446", "#FFD08A"],
    bungalow:  ["#152B4A", "#5A4170", "#E8616B", "#FF8A4C", "#FFC77D"],
    casita:    ["#0A3238", "#8E4A55", "#FF6B4A", "#FF8E3C", "#FFD27A"],
    townhouse: ["#13525B", "#5D9C9C", "#F4A57B", "#FFB061", "#FFE1A0"]
  };
  function skyVars(art) {
    const s = SKIES[art] || SKIES.loft;
    return s.map((c, i) => `--s${i + 1}:${c}`).join(";");
  }
  function buildingSVG(type, bx) {
    const ink = "#0A3238", lit = "#FFC46B";
    const g = (inner) => `<g transform="translate(${bx} 0)" fill="${ink}">${inner}</g>`;
    if (type === "bungalow") return g(`
      <rect x="10" y="176" width="150" height="60"/>
      <polygon points="-6,182 85,128 176,182"/>
      <rect x="0" y="182" width="170" height="6"/>
      <rect x="28" y="196" width="26" height="22" rx="2" fill="${lit}"/><rect x="116" y="196" width="26" height="22" rx="2" fill="${lit}"/>
      <rect x="73" y="192" width="24" height="44" rx="2" fill="${lit}" opacity=".85"/>
      <rect x="130" y="140" width="12" height="26"/>`);
    if (type === "casita") return g(`
      <path d="M0 236V158q0-10 10-10h26q7 0 9-7 4-11 25-11t25 11q2 7 9 7h26q10 0 10 10v78z"/>
      <path d="M58 236v-34a12 12 0 0 1 24 0v34z" fill="${lit}" opacity=".85"/>
      <circle cx="70" cy="160" r="8" fill="${lit}"/>
      <rect x="16" y="182" width="20" height="26" rx="10" fill="${lit}"/><rect x="104" y="182" width="20" height="26" rx="10" fill="${lit}"/>
      <path d="M-30 196q50-14 100-5t110-4" fill="none" stroke="${lit}" stroke-width="2" stroke-dasharray="1 9" stroke-linecap="round"/>`);
    if (type === "townhouse") return g(`
      <rect x="0" y="150" width="62" height="86"/><polygon points="-5,152 31,124 67,152"/>
      <rect x="62" y="136" width="62" height="100"/><polygon points="57,138 93,108 129,138"/>
      <rect x="124" y="156" width="62" height="80"/><polygon points="119,158 155,132 191,158"/>
      <rect x="12" y="166" width="14" height="18" rx="1.5" fill="${lit}"/><rect x="36" y="166" width="14" height="18" rx="1.5" fill="${lit}" opacity=".55"/>
      <rect x="74" y="152" width="14" height="18" rx="1.5" fill="${lit}" opacity=".55"/><rect x="98" y="152" width="14" height="18" rx="1.5" fill="${lit}"/>
      <rect x="136" y="172" width="14" height="18" rx="1.5" fill="${lit}"/><rect x="160" y="172" width="14" height="18" rx="1.5" fill="${lit}"/>
      <rect x="84" y="200" width="18" height="36" rx="1.5" fill="${lit}" opacity=".8"/>`);
    // loft
    return g(`
      <rect x="0" y="132" width="150" height="104"/>
      <rect x="-8" y="124" width="166" height="12" rx="3"/>
      <rect x="16" y="150" width="30" height="30" rx="2" fill="${lit}"/><rect x="60" y="150" width="30" height="30" rx="2" fill="${lit}" opacity=".55"/><rect x="104" y="150" width="30" height="30" rx="2" fill="${lit}"/>
      <rect x="16" y="194" width="30" height="30" rx="2" fill="${lit}" opacity=".55"/><rect x="104" y="194" width="30" height="30" rx="2" fill="${lit}" opacity=".55"/>
      <rect x="62" y="196" width="26" height="40" rx="2" fill="${lit}" opacity=".9"/>
      <rect x="8" y="186" width="134" height="4"/>`);
  }
  function horizonSVG(art, opts) {
    const o = opts || {};
    const bx = o.bx == null ? 930 : o.bx;
    return `<svg viewBox="0 0 1200 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <path d="M0 196C150 170 300 186 450 176S760 150 900 168s200-8 300 4V300H0z" fill="#0A3238" opacity=".2"/>
      <g fill="#0A3238">
        <rect x="150" y="150" width="34" height="100"/><rect x="190" y="118" width="28" height="130"/>
        <path d="M222 250V110h12V96h14v14h12v140z"/><rect x="266" y="136" width="30" height="114"/>
        <path d="M300 250V82l13-10 13 10v168z"/><rect x="312" y="44" width="2" height="30"/>
        <rect x="330" y="124" width="40" height="126"/><rect x="376" y="148" width="28" height="102"/>
        <path d="M410 250V112l17-8 17 8v138z"/><rect x="450" y="162" width="30" height="88"/>
        <rect x="560" y="208" width="120" height="42"/><rect x="588" y="186" width="64" height="24"/>
        <path d="M592 188q28-56 56 0z"/><rect x="616" y="118" width="8" height="24"/><circle cx="620" cy="116" r="4"/>
        <ellipse cx="70" cy="214" rx="66" ry="30"/><ellipse cx="34" cy="204" rx="38" ry="22"/><ellipse cx="108" cy="202" rx="40" ry="24"/>
        <ellipse cx="760" cy="222" rx="52" ry="24"/><ellipse cx="734" cy="212" rx="30" ry="18"/>
        <ellipse cx="1150" cy="216" rx="60" ry="28"/><ellipse cx="1112" cy="206" rx="34" ry="20"/>
      </g>
      ${buildingSVG(art, bx)}
      <path d="M0 232C200 224 420 230 600 226S1000 220 1200 228V300H0z" fill="#0A3238"/>
    </svg>`;
  }

  // ---------- render listing ----------
  document.title = `${P.name} · ${BRAND}`;
  document.querySelectorAll("[data-brand]").forEach((el) => { el.textContent = BRAND; });
  $(".brand").setAttribute("aria-label", `${BRAND} home`);

  const hero = $("#hero");
  hero.setAttribute("style", skyVars(P.art));
  $("#title").innerHTML = P.name.split(/\s+/).map((w) => `<span class="w">${esc(w)}</span>`).join(" ");
  $("#horizon").innerHTML = horizonSVG(P.art);
  $("#hero-place").innerHTML = `${svgIcon("pin")}<span>${esc(P.neighborhood)}, Austin, Texas</span>`;

  $("#price").textContent = money(P.nightly);
  $("#quick").innerHTML = [
    ["people", `Sleeps ${P.maxGuests}`],
    P.petsAllowed ? ["paw", `Pets OK, ${money(P.petFee)} fee`] : ["nopaw", "No pets"],
    ["key", "Self check-in"]
  ].map(([i, t]) => `<li>${svgIcon(i)}${esc(t)}</li>`).join("");

  $("#facts").innerHTML = [
    ["Check-in", fmtTime(P.checkIn), ""],
    ["Checkout", fmtTime(P.checkOut), ""],
    ["Early check-in", `From ${fmtTime(P.earlyCheckInFrom)}`, `${money(P.earlyFee)} fee`],
    ["Late checkout", `After ${fmtTime(P.checkOut)}`, `${money(P.lateFee)} fee`]
  ].map(([k, v, s]) => `<div class="time"><dt>${esc(k)}</dt><dd>${esc(v)}${s ? `<small>${esc(s)}</small>` : ""}</dd></div>`).join("");

  $("#description").textContent = P.description;
  $("#amenities").innerHTML = P.amenities.slice(0, 6).map((a) => `<li><span class="ico">${svgIcon(amenityIcon(a))}</span>${esc(a)}</li>`).join("");
  $("#rules").innerHTML = [
    `Up to ${P.maxGuests} guests`,
    P.petsAllowed ? `Pets welcome, ${money(P.petFee)} pet fee` : "No pets",
    "No parties or events",
    "No smoking or vaping indoors",
    "Quiet hours 10 PM to 8 AM",
    `Check-in after ${fmtTime(P.checkIn)}, checkout by ${fmtTime(P.checkOut)}`
  ].map((r) => `<li>${esc(r)}</li>`).join("");

  // Other stays: mini dusk scenes
  $("#stays").innerHTML = Object.keys(PROPERTIES).filter((k) => k !== id).map((k) => {
    const o = PROPERTIES[k];
    return `<a class="stay" href="?property=${encodeURIComponent(k)}">
      <div class="mini" style="${skyVars(o.art)}" aria-hidden="true">
        <div class="sky"></div><div class="mini-sun"></div>
        <p class="mini-name">${o.name.split(/\s+/).map((w) => `<span>${esc(w)}</span>`).join("")}</p>
        <div class="horizon">${horizonSVG(o.art, { bx: 640 })}</div>
      </div>
      <div class="stay-info">
        <span class="sr-only">${esc(o.name)}, </span>
        <span class="stay-meta">${esc(o.neighborhood)}, sleeps ${o.maxGuests}${o.petsAllowed ? ", pets OK" : ""}</span>
        <span class="stay-price">${money(o.nightly)} per night</span>
      </div></a>`;
  }).join("");

  // Setup banner while the placeholder email is still in place
  if (CONCIERGE_EMAILS.some((e) => /REPLACE_ME/i.test(e))) {
    const b = $("#setup-banner");
    b.innerHTML = "Setup: set <code>CONCIERGE_EMAILS</code> at the top of app.js.";
    b.hidden = false;
    console.warn("CONCIERGE_EMAILS still has the placeholder.");
  }

  // ---------- hero name: fit the property name to the width, like a gig poster ----------
  const measurer = document.createElement("span");
  measurer.className = "marquee marquee-measure";
  measurer.setAttribute("aria-hidden", "true");
  document.body.appendChild(measurer);
  function fitName() {
    const h1 = $("#title"), box = $(".hero-type");
    const cs = getComputedStyle(box);
    const W = box.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    h1.style.fontSize = "10px";
    const availH = hero.clientHeight - $("#topbar").offsetHeight - $("#horizon").clientHeight * 0.5 - 28;
    measurer.style.fontSize = "100px";
    const width = (t) => { measurer.textContent = t; return measurer.getBoundingClientRect().width || 1; };
    const words = P.name.split(/\s+/);
    const widest = Math.max(...words.map(width));
    const full = width(words.join(" "));
    const LH = 0.86;
    const fsStack = Math.min((100 * W) / widest, availH / (words.length * LH));
    const fsLine = Math.min((100 * W) / full, availH / LH);
    const stack = fsStack > fsLine;
    const fs = Math.max(40, Math.min(stack ? fsStack : fsLine, 300)) * 0.98;
    h1.classList.toggle("stack", stack);
    h1.style.fontSize = fs.toFixed(1) + "px";
  }
  fitName();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitName);
  let fitRaf = 0;
  window.addEventListener("resize", () => { cancelAnimationFrame(fitRaf); fitRaf = requestAnimationFrame(fitName); });

  // ---------- top bar turns solid after the hero ----------
  const topbar = $("#topbar");
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => topbar.classList.toggle("solid", !e.isIntersecting), { rootMargin: "-64px 0px 0px 0px" }).observe(hero);
  } else {
    topbar.classList.add("solid");
  }

  // ---------- tabs ----------
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  const PANELS = tabs.map((t) => t.getAttribute("aria-controls"));
  function selectTab(panelId, focus) {
    tabs.forEach((t) => {
      const on = t.getAttribute("aria-controls") === panelId;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    });
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t.getAttribute("aria-controls")));
    t.addEventListener("keydown", (e) => {
      let j = null;
      if (e.key === "ArrowRight") j = (i + 1) % tabs.length;
      else if (e.key === "ArrowLeft") j = (i - 1 + tabs.length) % tabs.length;
      else if (e.key === "Home") j = 0;
      else if (e.key === "End") j = tabs.length - 1;
      if (j !== null) { e.preventDefault(); selectTab(PANELS[j], true); }
    });
  });
  document.querySelectorAll("[data-tab]").forEach((a) => a.addEventListener("click", () => selectTab(a.getAttribute("data-tab"))));
  function openFromHash() {
    const h = location.hash.slice(1);
    if (PANELS.includes(h)) { selectTab(h); requestAnimationFrame(() => $("#plan").scrollIntoView()); }
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

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
    const href = `mailto:${TO_MAILTO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\r\n"))}`;
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
    const many = CONCIERGE_EMAILS.length > 1;
    let panel = form.parentNode.querySelector(".confirm");
    if (!panel) {
      panel = document.createElement("div");
      panel.className = "confirm";
      panel.innerHTML = `
        <h3 tabindex="-1"><span class="okdot" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg></span>Opening your email app…</h3>
        <p>Press <strong>Send</strong> in your email app and the Concierge will reply in minutes.</p>
        <div class="draft">
          <div class="draft-row"><span class="k">To</span><span class="v" data-to></span><button type="button" class="link-btn" data-copy-addr>${many ? "Copy addresses" : "Copy address"}</button></div>
          <div class="draft-row"><span class="k">Subject</span><span class="v" data-subject></span></div>
          <pre class="draft-body" data-msg tabindex="0" aria-label="Message body"></pre>
        </div>
        <p class="hint">No email app opened? Copy the message and send it to the address above.</p>
        <div class="btn-row">
          <button type="button" class="btn btn-dark btn-sm" data-copy-msg>Copy message</button>
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
        const ok = await copyText(TO_DISPLAY);
        status.textContent = ok ? (many ? "Email addresses copied." : "Email address copied.") : "Couldn't copy automatically. Select the address and copy it.";
      });
      panel.querySelector("[data-back]").addEventListener("click", () => {
        panel.hidden = true; form.hidden = false; status.textContent = "";
        const head = form.parentNode.querySelector(".panel-head"); if (head) head.hidden = false;
        const first = form.querySelector("input, textarea, select"); if (first) first.focus();
      });
    }
    panel.querySelector("[data-to]").innerHTML = CONCIERGE_EMAILS.map(esc).join("<br>");
    panel.querySelector("[data-subject]").textContent = mail.subject;
    panel.querySelector("[data-msg]").textContent = mail.body;
    panel.querySelector("[data-reopen]").href = mail.href;
    panel.querySelector("[data-status]").textContent = "";
    panel.dataset.full = `To: ${TO_DISPLAY}\nSubject: ${mail.subject}\n\n${mail.body}`;
    const head = form.parentNode.querySelector(".panel-head"); if (head) head.hidden = true;
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
