const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const mod = (n, m) => ((n % m) + m) % m;
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
let vw = innerWidth, vh = innerHeight;

/* ---------- reveal on scroll, in-view flags, active nav ---------- */
const vis = {};
const revealIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in");
}), { threshold: 0.2 });
$$(".rv").forEach(el => revealIO.observe(el));

const visIO = new IntersectionObserver(es => es.forEach(e => (vis[e.target.id] = e.isIntersecting)));
$$("section[id]").forEach(s => visIO.observe(s));

const navIO = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) $$(".top nav a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id));
}), { rootMargin: "-45% 0px -45% 0px" });
$$("section[id]").forEach(s => navIO.observe(s));

/* ---------- scroll parallax for [data-speed] layers ---------- */
const layers = $$("[data-speed]");
function parallax() {
    layers.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        el.style.transform = `translate3d(0,${(r.top + r.height / 2 - vh / 2) * el.dataset.speed}px,0)`;
    });
}

/* ---------- HOME: liquid glass lens ---------- */
const hero = $("#home"), lens = $("#lens"), lensInner = $("#lensInner");
const clone = $("#stage").cloneNode(true);
clone.removeAttribute("id");
clone.setAttribute("aria-hidden", "true");
$$("a,button", clone).forEach(a => (a.tabIndex = -1));
lensInner.appendChild(clone);

const ZOOM = 1.35;
const L = { x: vw / 2, y: vh / 2, tx: vw / 2, ty: vh / 2, last: -1e4, d: 260 };
hero.addEventListener("pointermove", e => {
    const r = hero.getBoundingClientRect();
    L.tx = e.clientX - r.left;
    L.ty = e.clientY - r.top;
    L.last = performance.now();
    hero.style.setProperty("--px", (L.tx / r.width - 0.5).toFixed(3));
    hero.style.setProperty("--py", (L.ty / r.height - 0.5).toFixed(3));
});
function renderLens(t) {
    const w = hero.offsetWidth, h = hero.offsetHeight;
    if (!reduce && performance.now() - L.last > 2500) { // idle: drift on its own (also covers touch)
        L.tx = w / 2 + Math.sin(t * 6e-4) * w * 0.28;
        L.ty = h / 2 + Math.cos(t * 8e-4) * h * 0.2;
    }
    L.x = lerp(L.x, L.tx, 0.12);
    L.y = lerp(L.y, L.ty, 0.12);
    const lx = L.x - L.d / 2, ly = L.y - L.d / 2;
    lens.style.transform = `translate3d(${lx}px,${ly}px,0)`;
    lensInner.style.transformOrigin = `${L.x}px ${L.y}px`;
    lensInner.style.transform = `translate3d(${-lx}px,${-ly}px,0) scale(${ZOOM})`;
}
function sizeHero() {
    L.d = lens.offsetWidth;
    lensInner.style.width = hero.offsetWidth + "px";
    lensInner.style.height = hero.offsetHeight + "px";
}

/* ---------- ABOUT: flashlight + chapters ---------- */
const about = $("#about");
const A = { x: 0, y: 0, tx: 0, ty: 0, last: -1e4 };
about.addEventListener("pointermove", e => {
    const r = about.getBoundingClientRect();
    A.tx = e.clientX - r.left;
    A.ty = e.clientY - r.top;
    A.last = performance.now();
});
function renderAbout(t) {
    const w = about.offsetWidth, h = about.offsetHeight;
    if (!A.x) { A.x = A.tx = w / 2; A.y = A.ty = h * 0.4; }
    if (!reduce && performance.now() - A.last > 2500) {
        A.tx = w * (0.5 + 0.25 * Math.sin(t * 5e-4));
        A.ty = h * (0.45 + 0.2 * Math.cos(t * 7e-4));
    }
    A.x = lerp(A.x, A.tx, 0.1);
    A.y = lerp(A.y, A.ty, 0.1);
    about.style.setProperty("--mx", A.x + "px");
    about.style.setProperty("--my", A.y + "px");
    about.style.setProperty("--ax", (A.x / w - 0.5).toFixed(3));
    about.style.setProperty("--ay", (A.y / h - 0.5).toFixed(3));
}

const chapters = $$(".chapter"), tabs = $$(".chap-nav button:not(.nx)"), bgImgs = $$(".about-bg img");
function setChapter(i) {
    chapters.forEach((c, k) => c.classList.toggle("on", k === i));
    tabs.forEach((b, k) => b.classList.toggle("on", k === i));
    bgImgs.forEach((m, k) => m.classList.toggle("on", k === i));
}
tabs.forEach((b, i) => b.addEventListener("click", () => setChapter(i)));
$("#nextCh").addEventListener("click", () => setChapter((tabs.findIndex(b => b.classList.contains("on")) + 1) % tabs.length));

/* ---------- PROJECTS: spatial gallery ---------- */
// EDIT THIS LIST: replace `src` with your own images (e.g. "images/layout-1.jpg").
// Videos use the YouTube id and show the YouTube thumbnail automatically.
const PROJECTS = [
    { t: "video", id: "tf47n-d9B0w", title: "2D Animation Edit", cat: "Video Editing" },
    { t: "video", id: "lsR3b9YdKgs", title: "2D Animation Edit", cat: "Video Editing" },
    { t: "video", id: "z_AxxXEG34Q", title: "2D Animation Edit", cat: "Video Editing" },

    { t: "image", src: "Photo/project11.jpg", title: "Poster for Film", cat: "Layout Design" },
    { t: "image", src: "Photo/project2.jpg",  title: "Event flyer",     cat: "Layout Design" },
    { t: "image", src: "Photo/project3.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project111.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project5.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project6.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project7.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project8.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project9.jpg",  title: "Menu design",     cat: "Layout Design" },
    { t: "image", src: "Photo/project10.jpg",  title: "Menu design",     cat: "Layout Design" },
];
PROJECTS.forEach(p => (p.thumb = p.t === "video" ? `https://i.ytimg.com/vi/${p.id}/hqdefault.jpg` : p.src));

const gal = $("#gallery"), plane = $("#plane");
const COLS = 6, ROWS = 3, cards = [];
for (let n = 0; n < COLS * ROWS; n++) { // 18 slots, the first 3 projects repeat so the endless plane has no holes
    const i = n % PROJECTS.length, p = PROJECTS[i];
    const b = document.createElement("button");
    b.className = "card" + (p.t === "video" ? " vid" : "");
    b.dataset.i = i;
    b.setAttribute("aria-label", "Open " + p.title);
    b.innerHTML = `<img src="${p.thumb}" alt="${p.title}" draggable="false" loading="lazy"><span class="tag">${p.cat}</span>`;
    plane.appendChild(b);
    cards.push({ el: b, col: n % COLS, row: Math.floor(n / COLS) });
}

let gw = 1, gh = 1, SX = 1, SY = 1, W = 1, H = 1;
function sizeGallery() {
    gw = gal.clientWidth; gh = gal.clientHeight;
    const cw = cards[0].el.offsetWidth;
    SX = Math.max(cw * 1.3, (gw * 1.15) / COLS);
    SY = Math.max(cw * 1.65, (gh * 1.15) / ROWS);
    W = COLS * SX; H = ROWS * SY;
}

const P = { x: 0, y: 0, vx: 0, vy: 0 };
let drag = null;
gal.addEventListener("pointerdown", e => {
    drag = { x: e.clientX, y: e.clientY, moved: 0, card: e.target.closest(".card") };
    gal.classList.add("drag");
});
addEventListener("pointermove", e => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    drag.x = e.clientX; drag.y = e.clientY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    P.x += dx; P.y += dy; P.vx = dx; P.vy = dy;
});
function endDrag() {
    if (!drag) return;
    gal.classList.remove("drag");
    if (drag.moved < 6 && drag.card) openViewer(+drag.card.dataset.i);
    drag = null;
}
addEventListener("pointerup", endDrag);
addEventListener("pointercancel", () => { gal.classList.remove("drag"); drag = null; });
gal.addEventListener("wheel", e => { // horizontal / shift+wheel moves the gallery; plain wheel still scrolls the page
    if (e.shiftKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        P.vx -= (e.deltaX || e.deltaY) * 0.08;
    }
}, { passive: false });

function renderGallery() {
    if (!drag) {
        P.x += P.vx; P.y += P.vy; P.vx *= 0.94; P.vy *= 0.94;
        if (!reduce && Math.abs(P.vx) < 0.3 && Math.abs(P.vy) < 0.3) P.x -= 0.25; // slow idle drift
    }
    for (const c of cards) {
        const bx = c.col * SX - W / 2 + SX / 2;
        const by = c.row * SY - H / 2 + SY / 2 + (c.col % 2 ? SY * 0.12 : 0);
        const x = mod(bx + P.x + W / 2, W) - W / 2;
        const y = mod(by + P.y + H / 2, H) - H / 2;
        const nx = x / (gw / 2), ny = y / (gh / 2);
        const d = Math.min(1.5, Math.hypot(nx, ny * 0.9));
        c.el.style.transform = `translate3d(${x}px,${y}px,${-d * d * 150}px) rotateY(${-nx * 14}deg) rotateX(${ny * 10}deg)`;
        c.el.style.opacity = d > 1.35 ? Math.max(0, 1 - (d - 1.35) * 4) : 1;
    }
}

/* viewer */
const viewer = $("#viewer");
let vi = 0;
function openViewer(i) {
    vi = mod(i, PROJECTS.length);
    const p = PROJECTS[vi];
    $("#vMedia").innerHTML = p.t === "video"
        ? `<iframe src="https://www.youtube.com/embed/${p.id}?autoplay=1&rel=0" title="${p.title}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${p.src}" alt="${p.title}">`;
    $("#vCat").textContent = p.cat;
    $("#vTitle").textContent = p.title;
    $("#vCount").textContent = String(vi + 1).padStart(2, "0") + " / " + String(PROJECTS.length).padStart(2, "0");
    viewer.classList.add("open");
    document.body.style.overflow = "hidden";
}
function closeViewer() {
    viewer.classList.remove("open");
    $("#vMedia").innerHTML = "";
    document.body.style.overflow = "";
}
$("#vNext").addEventListener("click", () => openViewer(vi + 1));
$("#vPrev").addEventListener("click", () => openViewer(vi - 1));
$("#vClose").addEventListener("click", closeViewer);
viewer.addEventListener("click", e => { if (e.target === viewer) closeViewer(); });
addEventListener("keydown", e => {
    if (!viewer.classList.contains("open")) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") openViewer(vi + 1);
    if (e.key === "ArrowLeft") openViewer(vi - 1);
});

/* ---------- software logo band ---------- */
// To use your own logo, drop a file named logos/<slug>.svg or logos/<slug>.png next to index.html
// (e.g. logos/kinemaster.png). It is tried first; then the Simple Icons CDN; then the plain name.
const TOOLS = [
    { n: "KineMaster", s: "kinemaster" },
    { n: "CapCut", s: "capcut" },
    { n: "Photoshop", s: "photoshop", i: "adobephotoshop" },
    { n: "Canva", s: "canva" },
    { n: "Picsart", s: "picsart" },
    { n: "Figma", s: "figma" },
    { n: "Visual Studio", s: "visualstudio" }
];
const logoHTML = TOOLS.map(t => {
    const srcs = [`logos/${t.s}.svg`, `logos/${t.s}.png`, `logos/${t.s}.webp`, `logos/${t.s}.jpg`, `https://cdn.simpleicons.org/${t.i || t.s}/f4f1ea`];
    return `<span class="lg"><img src="${srcs[0]}" alt="${t.n}" title="${t.n}" data-k="0" data-s='${JSON.stringify(srcs)}'></span>`;
}).join("");
const track = $("#track");
track.innerHTML = logoHTML + logoHTML; // two copies = seamless loop
track.addEventListener("error", e => { // try next source, finally fall back to the name
    const img = e.target;
    if (img.tagName !== "IMG") return;
    const srcs = JSON.parse(img.dataset.s), k = +img.dataset.k + 1;
    if (k < srcs.length) { img.dataset.k = k; img.src = srcs[k]; }
    else { const b = document.createElement("b"); b.textContent = img.alt; img.replaceWith(b); }
}, true);

/* ---------- main loop ---------- */
const bar = $("#bar");
function tick(t) {
    if (vis.home) renderLens(t);
    if (vis.about) renderAbout(t);
    if (vis.projects && !viewer.classList.contains("open")) renderGallery();
    parallax();
    bar.style.transform = `scaleX(${scrollY / Math.max(1, document.body.scrollHeight - vh)})`;
    requestAnimationFrame(tick);
}
function onResize() { vw = innerWidth; vh = innerHeight; sizeHero(); sizeGallery(); }
addEventListener("resize", onResize);
addEventListener("load", onResize);
onResize();
requestAnimationFrame(tick);