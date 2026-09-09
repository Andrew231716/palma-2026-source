import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "https://esm.sh/react@19.1.1/jsx-runtime";
import React, { useState, useEffect, useMemo, useRef } from "https://esm.sh/react@19.1.1";
import ReactDOM from "https://esm.sh/react-dom@19.1.1/client?deps=react@19.1.1";
import { MapPin, Calendar, Euro, CheckSquare, Home, Plane, Waves, Sun, Copy, Check, ChevronDown, Users, Sparkles, Clock, ShoppingBag, Pencil, X, Plus, Trash2, Luggage, Ticket, Wallet, User, ArrowRight, CloudSun, Umbrella, Wind, ShieldAlert, Phone, Bus, Share2, Download, ExternalLink, ListChecks, MessageCircle, Navigation, Wifi, WifiOff, RefreshCw, Sunrise, Sunset, LockKeyhole, ShieldCheck, Languages, Volume2, Camera, ArrowLeftRight, ImageIcon } from "https://esm.sh/lucide-react@0.468.0?deps=react@19.1.1";

const TRIP_START = new Date("2026-09-01T00:00:00");
const TRIP_END = new Date("2026-09-09T23:59:59");
const mapsUrl = (place) => {
    if (place && typeof place === "object" && place.url)
        return place.url;
    const name = place && typeof place === "object" ? place.name : place;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ", Mallorca")}`;
};
const placeName = (place) => (place && typeof place === "object" ? place.name : place);
const CASA_PLACE = { name: "Camí de Son Puigserver, 07639 Llucmajor, Illes Balears, Spain", url: "https://www.google.com/maps/search/?api=1&query=Cam%C3%AD%20de%20Son%20Puigserver%2C%2007639%20Llucmajor%2C%20Illes%20Balears%2C%20Spain" };
const DEFAULT_DAYS = [
    {
        num: 1, date: "2026-09-01", weekday: "Martedì", badge: null, title: "Andata",
        items: [
            "Partenza ore 14:50 da Malpensa",
            "Arrivo a PMI ore 16:35",
            "Arrivo a casa alle 17:30 circa (se tutto in orario, anche prima)",
            "Spesa al Mercadona di Llucmajor",
            "Cena a casa e giro la sera a Can Pastilla",
            "Gelato da Star Fresco",
        ],
        places: [CASA_PLACE, "Mercadona Llucmajor", "Can Pastilla", "Star Fresco Can Pastilla"],
        note: "",
    },
    {
        num: 2, date: "2026-09-02", weekday: "Mercoledì", badge: "Adunanza", title: "Es Trenc",
        items: [
            "Spiaggia Es Trenc mattina presto",
            "Pranzo a sacco, rimaniamo fino a un po' più tardi o pranzo a casa",
            "Se prevista pioggia: gita a Sóller",
            "Adunanza alle 19:45",
        ],
        places: ["Es Trenc", "Carrer Blau, 4, 07007 Coll d'en Rabassa", "Sóller"],
        note: "",
    },
    {
        num: 3, date: "2026-09-03", weekday: "Giovedì", badge: "Barca", title: "Caló des Moro",
        items: [
            "Caló des Moro",
            "Cala S'Almunia (30 minuti circa)",
            "Pranzo a casa",
            "Gita in barca alle 16:00, ritrovo a Cala Figuera (presentarci mezz'ora prima)",
        ],
        places: ["Caló des Moro", "Cala S'Almunia", "Cala Figuera"], note: "",
    },
    {
        num: 4, date: "2026-09-04", weekday: "Venerdì", badge: null, title: "Cala Mosques & Valldemossa",
        items: [
            "Cala Mosques (18 minuti)",
            "Pranzo da La Taberna a Can Pastilla",
            "Pit stop a casa o altra spiaggia vicino (Cala Pi o Arenal Sa Ràpita, o Es Trenc)",
            "Tramonto qui",
            "Giro e cena la sera a Valldemossa",
        ],
        places: ["Cala Mosques", "La Taberna Can Pastilla", "Cala Pi", "Arenal Sa Ràpita",
            { name: "Punto panoramico tramonto", url: "https://maps.app.goo.gl/ZrPNFFvBfLNxJZKSA?g_st=ig" },
            "Valldemossa"],
        note: "",
    },
    {
        num: 5, date: "2026-09-05", weekday: "Sabato", badge: "Adunanza", title: "Servizio",
        items: [
            "Mattina servizio",
            "Adunanza alle 17:00",
            "Sera da definire cosa fare (magari giro a Palma essendo lì)",
        ],
        places: [], note: "",
    },
    {
        num: 6, date: "2026-09-06", weekday: "Domenica", badge: null, title: "Coi fratelli",
        items: [
            "Mattina spiaggia con i fratelli della congregazione",
            "Pranzo a casa",
            "Mare il pomeriggio (Mirador del pas de Verro)",
            "Sera fuori con i fratelli",
        ],
        places: ["Mirador del pas de Verro"], note: "",
    },
    {
        num: 7, date: "2026-09-07", weekday: "Lunedì", badge: null, title: "Cala Varques",
        items: [
            "Cala Varques (a circa 50 minuti)",
            "Pranzo in giro a Cala d'Or",
            "Pomeriggio a Cala Esmeralda",
            "Sera a casa",
        ],
        places: ["Cala Varques", "Cala d'Or", "Cala Esmeralda"], note: "",
    },
    {
        num: 8, date: "2026-09-08", weekday: "Martedì", badge: null, title: "Cala Agulla o Es Trenc",
        items: [
            "Cala Agulla, a 1 ora, e Cala Mesquida vicino",
            "Oppure: Spiaggia Es Trenc / mattina a Sóller",
        ],
        places: ["Cala Agulla", "Cala Mesquida"], note: "",
    },
    {
        num: 9, date: "2026-09-09", weekday: "Mercoledì", badge: null, title: "Ritorno",
        items: [
            "Da definire in base a come saremo organizzati per lasciare le macchine",
            "Orario volo: partenza 13:25",
            "Arrivo a Bergamo (BGY): 15:10",
        ],
        places: [], note: "",
    },
];
const COST_ITEMS = [
    { id: "auto", label: "Auto", perPerson: 25, everyone: true, completable: true },
    { id: "casa", label: "Casa", perPerson: 110, everyone: true, completable: true },
    { id: "bagaglio", label: "Bagaglio extra", perPerson: 11.5, everyone: false, completable: true },
];
const PRE_DEPARTURE = [
    { id: "pre-1", text: "Chiedere se ci danno gli ombrelloni" },
    { id: "pre-2", text: "Chiedere se ci vengono a prendere a Bergamo" },
    { id: "pre-3", text: "Vedere il Malpensa Express per l'andata" },
    { id: "pre-4", text: "Fare check-in online e salvare le carte d'imbarco" },
    { id: "pre-5", text: "Controllare documenti, patente e tessera sanitaria europea" },
    { id: "pre-6", text: "Scaricare la zona di Maiorca su Google Maps per uso offline" },
    { id: "pre-7", text: "Controllare roaming dati e caricabatterie / power bank" },
    { id: "pre-8", text: "Ricontrollare orari volo e istruzioni per casa / auto" },
];
const SPESA_ITEMS = [
    { id: "spesa-1", text: "Comprare acqua, non solo alcol" },
    { id: "spesa-2", text: "Tenere la cena del primo giorno easy" },
];
const WEATHER_LAT = 39.57;
const WEATHER_LON = 2.65;
const WEATHER_CACHE_KEY = "palma2026-weather-cache-v1";
const EXPENSE_CATEGORIES = ["Spesa", "Ristorante", "Trasporti", "Parcheggio", "Carburante", "Attività", "Altro"];
const DEFAULT_SHOPPING = [
    { id: "shop-acqua", text: "Acqua", done: false },
    { id: "shop-colazione", text: "Colazione", done: false },
    { id: "shop-pranzo", text: "Cose per pranzo al sacco", done: false },
    { id: "shop-frutta", text: "Frutta / snack", done: false },
];
const weatherLabel = (code) => {
    if (code === 0)
        return "Sereno";
    if ([1, 2].includes(code))
        return "Poco nuvoloso";
    if (code === 3)
        return "Nuvoloso";
    if ([45, 48].includes(code))
        return "Nebbia";
    if ([51, 53, 55, 56, 57].includes(code))
        return "Pioviggine";
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code))
        return "Pioggia";
    if ([71, 73, 75, 77, 85, 86].includes(code))
        return "Neve";
    if ([95, 96, 99].includes(code))
        return "Temporali";
    return "Variabile";
};
const weatherEmoji = (code) => {
    if (code === 0)
        return "☀️";
    if ([1, 2].includes(code))
        return "🌤️";
    if (code === 3)
        return "☁️";
    if ([45, 48].includes(code))
        return "🌫️";
    if ([95, 96, 99].includes(code))
        return "⛈️";
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
        return "🌧️";
    return "🌦️";
};
const PACKING_DEFAULT = {
    "Mare e spiaggia": [
        "Costume (meglio due)", "Telo mare", "Crema solare", "Doposole",
        "Occhiali da sole", "Cappello", "Ciabatte da scoglio", "Sacchetto per il bagnato",
    ],
    "Documenti": [
        "Carta d'identità / passaporto", "Boarding pass", "Conferma prenotazione casa",
        "Patente (per l'auto)", "Tesserino sanitario europeo",
    ],
    "Tecnologia": [
        "Caricatore telefono", "Power bank", "Cavo di ricarica di scorta", "Auricolari",
    ],
    "Per la casa": [
        "Ciabatte per casa", "Prodotti da bagno essenziali", "Sacchetto biancheria sporca",
    ],
    "Salute e praticità": [
        "Farmaci personali", "Cerotti / piccolo kit primo soccorso", "Borraccia", "Repellente insetti",
    ],
    "Per l'adunanza": [
        "Vestiti adatti per mercoledì e sabato", "Bibbia / pubblicazioni",
    ],
};
const NAME_COLORS = ["#C1523A", "#3FA9AE", "#8A6FBF", "#4C8C4A", "#C98A2E", "#3A6FC1"];
const nameColor = (name) => {
    const sum = [...(name || "?")].reduce((s, c) => s + c.charCodeAt(0), 0);
    return NAME_COLORS[sum % NAME_COLORS.length];
};
function useTripPhase() {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(t);
    }, []);
    if (now < TRIP_START) {
        const days = Math.ceil((TRIP_START.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { phase: "before", days };
    }
    if (now > TRIP_END)
        return { phase: "after" };
    const dayIndex = Math.floor((now.getTime() - TRIP_START.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return { phase: "during", dayIndex: Math.min(dayIndex, 9) };
}
const formatMoney = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function useMallorcaWeather() {
    const [weather, setWeather] = useState(() => {
        try {
            const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "null");
            return cached?.data || null;
        }
        catch {
            return null;
        }
    });
    const [weatherUpdatedAt, setWeatherUpdatedAt] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "null")?.updatedAt || null;
        }
        catch {
            return null;
        }
    });
    const [weatherLoading, setWeatherLoading] = useState(false);
    const [weatherError, setWeatherError] = useState("");
    const refreshWeather = async (force = false) => {
        try {
            const cached = JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || "null");
            if (!force && cached?.updatedAt && Date.now() - new Date(cached.updatedAt).getTime() < 30 * 60 * 1000) {
                setWeather(cached.data);
                setWeatherUpdatedAt(cached.updatedAt);
                return;
            }
        }
        catch { }
        setWeatherLoading(true);
        setWeatherError("");
        try {
            const params = new URLSearchParams({
                latitude: String(WEATHER_LAT), longitude: String(WEATHER_LON), timezone: "Europe/Madrid", forecast_days: "16",
                daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max,wind_speed_10m_max,sunrise,sunset"
            });
            const r = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
            if (!r.ok)
                throw new Error("Meteo non disponibile");
            const json = await r.json();
            const rows = (json.daily?.time || []).map((date, i) => ({
                date, code: json.daily.weather_code?.[i], max: json.daily.temperature_2m_max?.[i], min: json.daily.temperature_2m_min?.[i],
                rain: json.daily.precipitation_probability_max?.[i], uv: json.daily.uv_index_max?.[i], wind: json.daily.wind_speed_10m_max?.[i],
                sunrise: json.daily.sunrise?.[i], sunset: json.daily.sunset?.[i],
            }));
            const updatedAt = new Date().toISOString();
            setWeather(rows);
            setWeatherUpdatedAt(updatedAt);
            localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({ updatedAt, data: rows }));
        }
        catch (e) {
            setWeatherError("Non riesco ad aggiornare il meteo. Mostro l'ultima previsione salvata, se disponibile.");
        }
        finally {
            setWeatherLoading(false);
        }
    };
    useEffect(() => { refreshWeather(false); }, []);
    return { weather, weatherUpdatedAt, weatherLoading, weatherError, refreshWeather };
}
async function loadJSON(key, fallback, shared) {
    try {
        const r = await window.storage.get(key, shared);
        if (r && r.value)
            return JSON.parse(r.value);
    }
    catch (e) { }
    return fallback;
}
async function saveJSON(key, value, shared) {
    try {
        await window.storage.set(key, JSON.stringify(value), shared);
    }
    catch (e) { }
}
function ProfileBar({ profile, setProfile }) {
    const [editing, setEditing] = useState(!profile);
    const [draft, setDraft] = useState(profile || "");
    if (!editing) {
        return (_jsxs("div", { className: "profile-bar", children: [_jsx("div", { className: "profile-chip", style: { background: nameColor(profile) }, children: profile.slice(0, 1).toUpperCase() }), _jsx("span", { className: "profile-name", children: profile }), _jsxs("button", { className: "profile-edit", onClick: () => { setDraft(profile); setEditing(true); }, children: [_jsx(Pencil, { size: 12 }), " cambia"] })] }));
    }
    return (_jsxs("div", { className: "profile-bar profile-bar-edit", children: [_jsx(User, { size: 15 }), _jsx("input", { className: "profile-input", placeholder: "Il tuo nome", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => { if (e.key === "Enter" && draft.trim()) {
                    setProfile(draft.trim());
                    setEditing(false);
                } } }), _jsx("button", { className: "pill pill-accent", disabled: !draft.trim(), onClick: () => { if (draft.trim()) {
                    setProfile(draft.trim());
                    setEditing(false);
                } }, children: "Salva" })] }));
}
function WaveProgress({ activeDay }) {
    const dots = DEFAULT_DAYS.map((d, i) => {
        const x = 20 + i * 45;
        const y = 30 + Math.sin(i * 0.9) * 14;
        let state = "future";
        if (activeDay && d.num < activeDay)
            state = "past";
        if (activeDay && d.num === activeDay)
            state = "today";
        return { x, y, state };
    });
    const pathD = "M " + dots.map((p) => `${p.x},${p.y}`).join(" L ");
    return (_jsxs("div", { className: "wave-wrap", children: [_jsxs("svg", { viewBox: "0 0 400 60", className: "wave-svg", preserveAspectRatio: "none", children: [_jsx("path", { d: pathD, fill: "none", stroke: "rgba(251,248,243,0.35)", strokeWidth: "2" }), dots.map((p, i) => (_jsxs("g", { children: [p.state === "today" && _jsx("circle", { cx: p.x, cy: p.y, r: "9", className: "dot-pulse" }), _jsx("circle", { cx: p.x, cy: p.y, r: p.state === "today" ? 5.5 : 4, className: `wave-dot dot-${p.state}` })] }, i)))] }), _jsx("div", { className: "wave-labels", children: DEFAULT_DAYS.map((d) => (_jsx("span", { className: d.num === activeDay ? "wave-label active" : "wave-label", children: d.num }, d.num))) })] }));
}
function Hero() {
    const tp = useTripPhase();
    let headline, sub;
    if (tp.phase === "before") {
        headline = `Mancano ${tp.days} giorn${tp.days === 1 ? "o" : "i"}`;
        sub = "alla partenza per Maiorca";
    }
    else if (tp.phase === "during") {
        const d = DEFAULT_DAYS[tp.dayIndex - 1];
        headline = `Giorno ${tp.dayIndex} di 9`;
        sub = `${d.weekday} — ${d.title}`;
    }
    else {
        headline = "Bentornati";
        sub = "Il viaggio a Maiorca è finito, ma le foto restano";
    }
    return (_jsxs("header", { className: "hero", children: [_jsx("button", { className: "hero-refresh", type: "button", title: "Aggiorna dati", "aria-label": "Aggiorna dati", onClick: () => location.reload(), children: _jsx(RefreshCw, { size: 18 }) }), _jsxs("div", { className: "hero-eyebrow", children: [_jsx(Waves, { size: 16 }), _jsx("span", { children: "Palma \u00B7 1\u20139 Settembre 2026" })] }), _jsx("h1", { className: "hero-title", children: headline }), _jsx("p", { className: "hero-sub", children: sub }), _jsx(WaveProgress, { activeDay: tp.phase === "during" ? tp.dayIndex : (tp.phase === "after" ? 9 : 0) }), _jsxs("p", { className: "hero-climate", children: [_jsx(Sun, { size: 14 }), " Clima medio inizio settembre: 27\u201329\u00B0C, mare intorno ai 25\u00B0C"] })] }));
}
function DayEditForm({ day, onSave, onCancel, onReset, hasOverride }) {
    const [title, setTitle] = useState(day.title);
    const [badge, setBadge] = useState(day.badge || "");
    const [note, setNote] = useState(day.note || "");
    const [itemsText, setItemsText] = useState(day.items.join("\n"));
    const [placesText, setPlacesText] = useState((day.places || []).map(placeName).join("\n"));
    return (_jsxs("div", { className: "edit-form", children: [_jsxs("label", { className: "edit-label", children: ["Titolo del giorno", _jsx("input", { value: title, onChange: (e) => setTitle(e.target.value) })] }), _jsxs("label", { className: "edit-label", children: ["Badge (es. Adunanza, Barca \u2014 lascia vuoto per nessuno)", _jsx("input", { value: badge, onChange: (e) => setBadge(e.target.value) })] }), _jsxs("label", { className: "edit-label", children: ["Attivit\u00E0 (una per riga)", _jsx("textarea", { rows: 5, value: itemsText, onChange: (e) => setItemsText(e.target.value) })] }), _jsxs("label", { className: "edit-label", children: ["Luoghi / tappe per la mappa (uno per riga)", _jsx("textarea", { rows: 3, value: placesText, onChange: (e) => setPlacesText(e.target.value) })] }), _jsxs("label", { className: "edit-label", children: ["Nota", _jsx("textarea", { rows: 2, value: note, onChange: (e) => setNote(e.target.value) })] }), _jsxs("div", { className: "edit-actions", children: [_jsxs("button", { className: "pill pill-accent", onClick: () => onSave({
                            title: title.trim() || day.title,
                            badge: badge.trim() || null,
                            note: note.trim(),
                            items: itemsText.split("\n").map((s) => s.trim()).filter(Boolean),
                            places: placesText.split("\n").map((s) => s.trim()).filter(Boolean).map((name) => {
                                const existing = (day.places || []).find((p) => placeName(p) === name);
                                return existing || name;
                            }),
                        }), children: [_jsx(Check, { size: 13 }), " Salva"] }), _jsxs("button", { className: "pill", onClick: onCancel, children: [_jsx(X, { size: 13 }), " Annulla"] }), hasOverride && _jsx("button", { className: "pill pill-ghost", onClick: onReset, children: "Ripristina originale" })] })] }));
}
function DayCard({ day, isToday, override, onSaveOverride, onResetOverride }) {
    const [open, setOpen] = useState(isToday);
    const [editing, setEditing] = useState(false);
    const effective = {
        ...day,
        ...(override || {}),
        items: override && override.items ? override.items : day.items,
        places: override && override.places ? override.places : day.places,
    };
    return (_jsxs("div", { className: `day-card ${isToday ? "day-card-today" : ""}`, children: [_jsxs("button", { className: "day-head", onClick: () => setOpen((o) => !o), children: [_jsx("div", { className: "day-num", children: String(day.num).padStart(2, "0") }), _jsxs("div", { className: "day-headtext", children: [_jsxs("div", { className: "day-weekday", children: [day.weekday, effective.badge && _jsx("span", { className: "badge", children: effective.badge }), isToday && _jsx("span", { className: "badge badge-today", children: "Oggi" }), override && _jsx("span", { className: "badge badge-edited", children: "modificato" })] }), _jsx("div", { className: "day-title", children: effective.title })] }), _jsx(ChevronDown, { size: 18, className: `chev ${open ? "chev-open" : ""}` })] }), open && (_jsx("div", { className: "day-body", children: !editing ? (_jsxs(_Fragment, { children: [_jsx("ul", { className: "day-items", children: effective.items.map((text, i) => (_jsxs("li", { children: [_jsx("span", { className: "dot-bullet" }), _jsx("span", { children: text })] }, i))) }), effective.note && _jsx("p", { className: "day-note", children: effective.note }), effective.places.length > 0 && (_jsx("div", { className: "pill-row", children: effective.places.map((p) => (_jsxs("a", { href: mapsUrl(p), target: "_blank", rel: "noreferrer", className: "pill", children: [_jsx(MapPin, { size: 13 }), " ", placeName(p)] }, placeName(p)))) })), _jsxs("button", { className: "edit-toggle", onClick: () => setEditing(true), children: [_jsx(Pencil, { size: 12 }), " Modifica questo giorno"] })] })) : (_jsx(DayEditForm, { day: effective, hasOverride: !!override, onCancel: () => setEditing(false), onReset: () => { onResetOverride(day.num); setEditing(false); }, onSave: (data) => { onSaveOverride(day.num, data); setEditing(false); } })) }))] }));
}
function ProgrammaTab({ overrides, setOverrides }) {
    const tp = useTripPhase();
    const todayNum = tp.phase === "during" ? tp.dayIndex : null;
    const saveOverride = (num, data) => {
        const next = { ...overrides, [num]: data };
        setOverrides(next);
    };
    const resetOverride = (num) => {
        const next = { ...overrides };
        delete next[num];
        setOverrides(next);
    };
    return (_jsxs("div", { className: "tab-panel", children: [_jsx("p", { className: "shared-note", children: "Le modifiche al programma sono condivise: chi apre questa app vede la versione pi\u00F9 recente." }), DEFAULT_DAYS.map((d) => (_jsx(DayCard, { day: d, isToday: d.num === todayNum, override: overrides[d.num], onSaveOverride: saveOverride, onResetOverride: resetOverride }, d.num)))] }));
}
function PackingCategory({ title, items, checkState, onToggle, onChangeItems, onReset }) {
    const [draft, setDraft] = useState("");
    const [editIndex, setEditIndex] = useState(null);
    const [editDraft, setEditDraft] = useState("");
    const itemId = (text) => `pack-${title}-${text}`;
    const add = () => {
        const text = draft.trim();
        if (!text) return;
        onChangeItems([...items, text]);
        setDraft("");
    };
    const remove = (index) => onChangeItems(items.filter((_, i) => i !== index));
    const beginEdit = (index) => { setEditIndex(index); setEditDraft(items[index] || ""); };
    const saveEdit = () => {
        const text = editDraft.trim();
        if (!text || editIndex == null) return;
        const next = items.slice();
        next[editIndex] = text;
        onChangeItems(next);
        setEditIndex(null);
        setEditDraft("");
    };
    const done = items.filter((text) => checkState[itemId(text)]).length;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "checklist-head", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Luggage, { size: 16 }), " ", title] }), _jsxs("div", { className: "packing-head-actions", children: [_jsxs("span", { className: "progress-label", children: [done, "/", items.length] }), _jsx("button", { className: "tiny-btn packing-reset", title: "Ripristina lista originale", onClick: onReset, children: _jsx(RefreshCw, { size: 12 }) })] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${items.length ? (done / items.length) * 100 : 0}%` } }) }), _jsx("ul", { className: "check-list packing-editable", children: items.map((text, index) => {
                const id = itemId(text);
                const editing = editIndex === index;
                return (_jsxs("li", { children: [editing ? (_jsxs("div", { className: "packing-inline-edit", children: [_jsx("input", { value: editDraft, autoFocus: true, onChange: (e) => setEditDraft(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditIndex(null); } }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: saveEdit, children: _jsx(Check, { size: 12 }) }), _jsx("button", { className: "tiny-btn", onClick: () => setEditIndex(null), children: _jsx(X, { size: 12 }) })] })) : (_jsxs(_Fragment, { children: [_jsxs("label", { className: "check-item", children: [_jsx("input", { type: "checkbox", checked: !!checkState[id], onChange: () => onToggle(id) }), _jsx("span", { className: checkState[id] ? "checked" : "", children: text })] }), _jsx("button", { className: "tiny-btn", title: "Modifica", onClick: () => beginEdit(index), children: _jsx(Pencil, { size: 12 }) }), _jsx("button", { className: "tiny-btn", title: "Elimina", onClick: () => remove(index), children: _jsx(Trash2, { size: 12 }) })] }))] }, `${text}-${index}`));
            }) }), _jsxs("div", { className: "add-row", children: [_jsx("input", { placeholder: "Aggiungi un oggetto…", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") add(); } }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: add, children: _jsx(Plus, { size: 14 }) })] })] }));
}
function SimpleChecklist({ title, items, state, onToggle }) {
    const done = items.filter((it) => state[it.id]).length;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "checklist-head", children: [_jsxs("h3", { className: "card-title", children: [_jsx(CheckSquare, { size: 16 }), " ", title] }), _jsxs("span", { className: "progress-label", children: [done, "/", items.length] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${items.length ? (done / items.length) * 100 : 0}%` } }) }), _jsx("ul", { className: "check-list", children: items.map((it) => (_jsx("li", { children: _jsxs("label", { className: "check-item", children: [_jsx("input", { type: "checkbox", checked: !!state[it.id], onChange: () => onToggle(it.id) }), _jsx("span", { className: state[it.id] ? "checked" : "", children: it.text })] }) }, it.id))) })] }));
}
function EditableSimpleChecklist({ title, items, state, onToggle, onChangeItems, onReset }) {
    const [draft, setDraft] = useState("");
    const [editId, setEditId] = useState(null);
    const [editDraft, setEditDraft] = useState("");
    const add = () => { const text = draft.trim(); if (!text) return; onChangeItems([...items, { id: `pre-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, text }]); setDraft(""); };
    const beginEdit = (item) => { setEditId(item.id); setEditDraft(item.text); };
    const saveEdit = () => { const text = editDraft.trim(); if (!text || !editId) return; onChangeItems(items.map((it) => it.id === editId ? { ...it, text } : it)); setEditId(null); setEditDraft(""); };
    const remove = (id) => onChangeItems(items.filter((it) => it.id !== id));
    const done = items.filter((it) => state[it.id]).length;
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "checklist-head", children: [_jsxs("h3", { className: "card-title", children: [_jsx(CheckSquare, { size: 16 }), " ", title] }), _jsxs("div", { className: "packing-head-actions", children: [_jsxs("span", { className: "progress-label", children: [done, "/", items.length] }), _jsx("button", { className: "tiny-btn packing-reset", title: "Ripristina lista originale", onClick: onReset, children: _jsx(RefreshCw, { size: 12 }) })] })] }), _jsx("div", { className: "progress-bar", children: _jsx("div", { className: "progress-fill", style: { width: `${items.length ? (done / items.length) * 100 : 0}%` } }) }), _jsx("ul", { className: "check-list packing-editable", children: items.map((it) => (_jsxs("li", { children: [editId === it.id ? (_jsxs("div", { className: "packing-inline-edit", children: [_jsx("input", { value: editDraft, autoFocus: true, onChange: (e) => setEditDraft(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditId(null); } }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: saveEdit, children: _jsx(Check, { size: 12 }) }), _jsx("button", { className: "tiny-btn", onClick: () => setEditId(null), children: _jsx(X, { size: 12 }) })] })) : (_jsxs(_Fragment, { children: [_jsxs("label", { className: "check-item", children: [_jsx("input", { type: "checkbox", checked: !!state[it.id], onChange: () => onToggle(it.id) }), _jsx("span", { className: state[it.id] ? "checked" : "", children: it.text })] }), _jsx("button", { className: "tiny-btn", title: "Modifica", onClick: () => beginEdit(it), children: _jsx(Pencil, { size: 12 }) }), _jsx("button", { className: "tiny-btn", title: "Elimina", onClick: () => remove(it.id), children: _jsx(Trash2, { size: 12 }) })] }))] }, it.id))) }), _jsxs("div", { className: "add-row", children: [_jsx("input", { placeholder: "Aggiungi una voce…", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => { if (e.key === "Enter") add(); } }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: add, children: _jsx(Plus, { size: 14 }) })] })] }));
}
function BagaglioTab({ checkState, toggleCheck, customPacking, setCustomPacking }) {
    const migrated = !!customPacking?.__v36;
    const getItems = (cat, defaults) => migrated ? (customPacking?.[cat] || defaults) : [...defaults, ...(customPacking?.[cat] || [])];
    const snapshot = () => Object.fromEntries(Object.entries(PACKING_DEFAULT).map(([cat, defaults]) => [cat, getItems(cat, defaults)]));
    const update = (cat, items) => setCustomPacking({ ...customPacking, ...snapshot(), __v36: true, __preDeparture: customPacking?.__preDeparture || PRE_DEPARTURE.map((it) => ({ ...it })), [cat]: items });
    const reset = (cat) => update(cat, [...PACKING_DEFAULT[cat]]);
    const preItems = customPacking?.__preDeparture || PRE_DEPARTURE;
    const updatePre = (items) => setCustomPacking({ ...customPacking, ...snapshot(), __v36: true, __preDeparture: items });
    const resetPre = () => updatePre(PRE_DEPARTURE.map((it) => ({ ...it })));
    return (_jsxs("div", { className: "tab-panel", children: [_jsx("p", { className: "personal-note", children: "Tutte le liste del bagaglio sono modificabili: matita per cambiare una voce, cestino per eliminarla e + per aggiungerne una. Le modifiche restano salvate sul tuo dispositivo." }), _jsx(EditableSimpleChecklist, { title: "Prima di partire", items: preItems, state: checkState, onToggle: toggleCheck, onChangeItems: updatePre, onReset: resetPre }), Object.entries(PACKING_DEFAULT).map(([cat, defaults]) => (_jsx(PackingCategory, { title: cat, items: getItems(cat, defaults), checkState: checkState, onToggle: toggleCheck, onChangeItems: (items) => update(cat, items), onReset: () => reset(cat) }, cat)))] }));
}
function BoardingCard({ leg, icon: Icon, data, onChange }) {
    const fields = [
        ["compagnia", "Compagnia aerea"],
        ["volo", "Numero volo"],
        ["prenotazione", "Codice prenotazione (PNR)"],
        ["data", "Data"],
        ["orario", "Orario volo"],
        ["terminal", "Terminal"],
        ["gate", "Gate / imbarco"],
        ["posto", "Posto"],
        ["bagaglio", "Bagaglio"],
    ];
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Icon, { size: 16 }), " ", leg] }), _jsx("div", { className: "boarding-grid", children: fields.map(([key, label]) => (_jsxs("label", { className: "edit-label", children: [label, _jsx("input", { value: data[key] || "", onChange: (e) => onChange({ ...data, [key]: e.target.value }), placeholder: "\u2014" })] }, key))) })] }));
}
function ImbarcoTab({ boarding, setBoarding }) {
    return (_jsxs("div", { className: "tab-panel", children: [_jsx("p", { className: "personal-note", children: "I dati della carta d'imbarco sono visibili solo a te." }), _jsx(BoardingCard, { leg: "Andata \u2014 1 settembre", icon: Plane, data: boarding.andata || {}, onChange: (d) => setBoarding({ ...boarding, andata: d }) }), _jsx(BoardingCard, { leg: "Ritorno \u2014 9 settembre", icon: Plane, data: boarding.ritorno || {}, onChange: (d) => setBoarding({ ...boarding, ritorno: d }) })] }));
}
function EstimateCard({ settings, setSettings }) {
    const { persone, valigie } = settings;
    const completed = settings.completedCosts || {};
    const toggleCompleted = (id) => setSettings((s) => ({ ...s, completedCosts: { ...(s.completedCosts || {}), [id]: !s.completedCosts?.[id] } }));
    const rows = COST_ITEMS.map((item) => {
        const count = item.everyone ? persone : valigie;
        return { ...item, count, total: item.perPerson * count };
    });
    const grandTotal = rows.reduce((s, r) => s + r.total, 0);
    const perPersonBase = COST_ITEMS.filter((c) => c.everyone).reduce((s, c) => s + c.perPerson, 0);
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Euro, { size: 16 }), " Stima di partenza"] }), _jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["Persone", _jsx("input", { type: "number", min: "1", value: persone, onChange: (e) => setSettings((s) => ({ ...s, persone: Math.max(1, Number(e.target.value) || 1) })) })] }), _jsxs("label", { children: ["Bagagli extra", _jsx("input", { type: "number", min: "0", value: valigie, onChange: (e) => setSettings((s) => ({ ...s, valigie: Math.max(0, Number(e.target.value) || 0) })) })] })] }), _jsxs("p", { className: "base-per-person", children: ["€ ", formatMoney(perPersonBase), " ", _jsx("span", { className: "base-per-person-label", children: "a persona (base)" })] }), _jsxs("table", { className: "cost-table", children: [_jsx("tbody", { children: rows.map((r) => (_jsxs("tr", { className: completed[r.id] ? "cost-row-done" : "", children: [_jsx("td", { children: r.label }), _jsxs("td", { className: "cost-detail", children: ["€ ", formatMoney(r.perPerson), " × ", r.count] }), _jsxs("td", { className: "cost-total", children: ["€ ", formatMoney(r.total)] }), _jsx("td", { className: "cost-status", children: r.completable && (_jsxs("button", { className: `cost-complete-btn ${completed[r.id] ? "done" : ""}`, onClick: () => toggleCompleted(r.id), children: [_jsx(Check, { size: 12 }), " ", completed[r.id] ? "Completato" : "Da completare"] })) })] }, r.id))) }), _jsx("tfoot", { children: _jsxs("tr", { children: [_jsx("td", { colSpan: 3, children: "Totale gruppo" }), _jsxs("td", { className: "cost-total cost-grand", children: ["€ ", formatMoney(grandTotal)] })] }) })] })] }));
}
function splitAmountEvenly(amount, count) {
    if (count <= 0)
        return [];
    const totalCents = Math.round(Number(amount || 0) * 100);
    const base = Math.floor(totalCents / count);
    const remainder = totalCents % count;
    return Array.from({ length: count }, (_, i) => (base + (i < remainder ? 1 : 0)) / 100);
}
function expenseParticipants(e, people) {
    if (Array.isArray(e.participants)) {
        if (e.participants.length === 0)
            return [];
        return e.participants.filter((p) => people.includes(p));
    }
    return people;
}
function expenseSplitLabel(e, people) {
    const participants = expenseParticipants(e, people);
    if (!participants.length)
        return "nessuno";
    return participants.join(", ");
}
function computeBalances(people, expenses, transfers = []) {
    const balance = {};
    people.forEach((p) => { balance[p] = 0; });
    expenses.forEach((e) => {
        const participants = expenseParticipants(e, people);
        if (!participants.length)
            return;
        const shares = splitAmountEvenly(e.amount, participants.length);
        participants.forEach((p, i) => { balance[p] = (balance[p] || 0) - shares[i]; });
        const payer = String(e.paidBy || "").trim();
        if (payer)
            balance[payer] = (balance[payer] || 0) + Number(e.amount || 0);
    });
    transfers.forEach((t) => {
        const amt = Number(t.amount || 0);
        if (!amt)
            return;
        balance[t.from] = (balance[t.from] || 0) + amt;
        balance[t.to] = (balance[t.to] || 0) - amt;
    });
    return balance;
}
function computePairwiseSettlements(people, expenses, transfers = []) {
    const owes = {};
    const addDebt = (debtor, creditor, amount) => {
        if (!debtor || !creditor || debtor === creditor || amount <= 0.005)
            return;
        if (!owes[debtor])
            owes[debtor] = {};
        owes[debtor][creditor] = (owes[debtor][creditor] || 0) + amount;
    };
    expenses.forEach((e) => {
        const participants = expenseParticipants(e, people);
        if (!participants.length)
            return;
        const payer = String(e.paidBy || "").trim();
        if (!payer)
            return;
        const shares = splitAmountEvenly(e.amount, participants.length);
        participants.forEach((p, i) => {
            if (p !== payer)
                addDebt(p, payer, shares[i]);
        });
    });
    transfers.forEach((t) => {
        const amt = Number(t.amount || 0);
        if (!amt)
            return;
        const from = String(t.from || "").trim();
        const to = String(t.to || "").trim();
        if (!from || !to)
            return;
        if (owes[from]?.[to]) {
            owes[from][to] = Math.max(0, owes[from][to] - amt);
            if (owes[from][to] < 0.005)
                delete owes[from][to];
        }
    });
    const names = new Set(people);
    Object.keys(owes).forEach((n) => {
        names.add(n);
        Object.keys(owes[n] || {}).forEach((m) => names.add(m));
    });
    const list = [...names];
    const out = [];
    for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
            const a = list[i], b = list[j];
            const aOwesB = owes[a]?.[b] || 0;
            const bOwesA = owes[b]?.[a] || 0;
            const net = aOwesB - bOwesA;
            if (net > 0.01)
                out.push({ from: a, to: b, amt: Number(net.toFixed(2)) });
            else if (net < -0.01)
                out.push({ from: b, to: a, amt: Number((-net).toFixed(2)) });
        }
    }
    return out.sort((x, y) => y.amt - x.amt);
}
function expenseOwner(e) {
    return String(e?.createdBy || e?.paidBy || "").trim();
}
function canManageExpense(e, profile) {
    const me = String(profile || "").trim();
    const owner = expenseOwner(e);
    return !!me && !!owner && me === owner;
}
function AddExpenseForm({ profile, people, onAdd }) {
    const [desc, setDesc] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("Spesa");
    const [paidBy, setPaidBy] = useState(people.includes(profile) ? profile : (people[0] || ""));
    const [participants, setParticipants] = useState([]);
    useEffect(() => {
        setParticipants((prev) => prev.filter((p) => people.includes(p)));
        setPaidBy((current) => people.includes(current) ? current : (people.includes(profile) ? profile : (people[0] || "")));
    }, [people.join(","), profile]);
    const toggleParticipant = (name) => {
        setParticipants((prev) => prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]);
    };
    const submit = () => {
        const amt = parseFloat(amount.replace(",", "."));
        if (!desc.trim() || !amt || amt <= 0 || !paidBy || participants.length === 0)
            return;
        onAdd({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            description: desc.trim(), amount: amt, category, paidBy, participants,
            createdBy: String(profile || paidBy || "").trim(),
            addedAt: new Date().toISOString(),
        });
        setDesc("");
        setAmount("");
        setParticipants([]);
    };
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Plus, { size: 16 }), " Aggiungi una spesa"] }), _jsxs("div", { className: "field-row", children: [_jsxs("label", { children: ["Descrizione", _jsx("input", { value: desc, onChange: (e) => setDesc(e.target.value), placeholder: "Es. Spesa Mercadona" })] }), _jsxs("label", { children: ["Importo (\u20AC)", _jsx("input", { value: amount, onChange: (e) => setAmount(e.target.value), placeholder: "0,00" })] })] }), _jsxs("label", { className: "edit-label", children: ["Categoria", _jsx("select", { value: category, onChange: (e) => setCategory(e.target.value), children: EXPENSE_CATEGORIES.map((c) => _jsx("option", { value: c, children: c }, c)) })] }), _jsxs("label", { className: "edit-label", children: ["Pagato da", _jsx("select", { value: paidBy, onChange: (e) => setPaidBy(e.target.value), children: people.map((p) => _jsx("option", { value: p, children: p }, p)) })] }), _jsxs("div", { className: "edit-label", children: ["Diviso tra", _jsx("div", { className: "participant-chips", children: people.map((p) => (_jsx("button", { type: "button", className: `chip ${participants.includes(p) ? "chip-on" : ""}`, onClick: () => toggleParticipant(p), style: participants.includes(p) ? { background: nameColor(p) } : {}, children: p }, p))) }), participants.length === 0 && _jsx("p", { className: "micro-note", children: "Seleziona almeno una persona tra cui dividere la spesa." })] }), _jsxs("button", { className: "pill pill-accent", disabled: participants.length === 0, onClick: submit, children: [_jsx(Plus, { size: 13 }), " Aggiungi spesa"] })] }));
}
function settlementKey(from, to) {
    return `${from}::${to}`;
}
function mergeSettlementEntries(computed, existing = []) {
    const paid = existing.filter((e) => e.paid);
    const unpaidMap = new Map(existing.filter((e) => !e.paid).map((e) => [settlementKey(e.from, e.to), e]));
    const nextUnpaid = computed.map((s) => {
        const key = settlementKey(s.from, s.to);
        const prev = unpaidMap.get(key);
        const computedAmount = Number(Number(s.amt).toFixed(2));
        if (prev) {
            return {
                ...prev,
                from: s.from,
                to: s.to,
                computedAmount,
                amount: prev.customAmount ? Number(prev.amount || 0) : computedAmount,
            };
        }
        return {
            id: `set-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            from: s.from,
            to: s.to,
            amount: computedAmount,
            computedAmount,
            paid: false,
            customAmount: false,
        };
    });
    return [...paid, ...nextUnpaid];
}
function pruneTransfers(transfers, entries) {
    const ids = new Set((entries || []).map((e) => e.id));
    return (transfers || []).filter((t) => ids.has(t.settlementId));
}
function SettlementSummaryRow({ entry }) {
    return (_jsxs("div", { className: "settle-summary-row", children: [_jsxs("div", { className: "settle-summary-people", children: [_jsx("span", { style: { color: nameColor(entry.from) }, children: entry.from }), _jsx(ArrowRight, { size: 13 }), _jsx("span", { style: { color: nameColor(entry.to) }, children: entry.to })] }), _jsxs("strong", { children: ["€ ", formatMoney(entry.amount)] })] }));
}
function formatInputAmount(n) {
    const num = Number(n);
    if (!Number.isFinite(num))
        return "";
    return num.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
function parseAmountInput(raw) {
    const cleaned = String(raw).trim().replace(/\s/g, "").replace(",", ".");
    const amount = parseFloat(cleaned);
    return Number.isFinite(amount) ? Math.max(0, Number(amount.toFixed(2))) : 0;
}
function sanitizeAmountDraft(raw) {
    let s = String(raw).replace(/[^\d.,]/g, "");
    const sep = s.includes(",") ? "," : (s.includes(".") ? "." : null);
    if (sep) {
        const parts = s.split(sep);
        s = parts[0] + sep + parts.slice(1).join("").replace(/[.,]/g, "").slice(0, 2);
    }
    return s;
}
function SettlementBoard({ computed, entries, setEntries, transfers, setTransfers }) {
    const computedKey = JSON.stringify(computed);
    const [amountDrafts, setAmountDrafts] = useState({});
    useEffect(() => {
        setEntries((prev) => {
            const next = mergeSettlementEntries(computed, prev);
            setTransfers((tr) => pruneTransfers(tr, next));
            return next;
        });
        setAmountDrafts({});
    }, [computedKey]);
    const unpaid = entries.filter((e) => !e.paid);
    const paid = entries.filter((e) => e.paid);
    const entryAmount = (entry) => amountDrafts[entry.id] != null ? parseAmountInput(amountDrafts[entry.id]) : Number(entry.amount || 0);
    const paidTotal = paid.reduce((s, e) => s + Number(e.amount || 0), 0);
    const unpaidTotal = unpaid.reduce((s, e) => s + entryAmount(e), 0);
    const displayAmount = (entry) => amountDrafts[entry.id] ?? formatInputAmount(entry.amount);
    const onAmountChange = (id, raw) => setAmountDrafts((d) => ({ ...d, [id]: sanitizeAmountDraft(raw) }));
    const commitAmount = (id) => {
        if (amountDrafts[id] == null)
            return;
        const amount = parseAmountInput(amountDrafts[id]);
        const computedAmount = Number(entries.find((e) => e.id === id)?.computedAmount ?? amount);
        const customAmount = Math.abs(amount - computedAmount) > 0.011;
        setEntries(entries.map((e) => e.id === id ? { ...e, amount, customAmount } : e));
        setAmountDrafts((d) => {
            const next = { ...d };
            delete next[id];
            return next;
        });
    };
    const resetRowAmount = (id) => {
        setEntries(entries.map((e) => {
            if (e.id !== id || e.paid)
                return e;
            const auto = Number(e.computedAmount ?? e.amount ?? 0);
            return { ...e, amount: auto, customAmount: false };
        }));
        setAmountDrafts((d) => {
            const next = { ...d };
            delete next[id];
            return next;
        });
    };
    const resetAllComputed = () => {
        setEntries(entries.map((e) => {
            if (e.paid)
                return e;
            const auto = Number(e.computedAmount ?? e.amount ?? 0);
            return { ...e, amount: auto, customAmount: false };
        }));
        setAmountDrafts({});
    };
    const setPaid = (entry, nextPaid) => {
        const amount = entryAmount(entry);
        if (amountDrafts[entry.id] != null) {
            const computedAmount = Number(entry.computedAmount ?? amount);
            const customAmount = Math.abs(amount - computedAmount) > 0.011;
            setEntries(entries.map((e) => e.id === entry.id ? { ...e, amount, customAmount } : e));
            setAmountDrafts((d) => {
                const next = { ...d };
                delete next[entry.id];
                return next;
            });
        }
        if (nextPaid) {
            if (amount <= 0)
                return;
            setTransfers([...transfers.filter((t) => t.settlementId !== entry.id), {
                id: `tr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                settlementId: entry.id,
                from: entry.from,
                to: entry.to,
                amount,
                at: new Date().toISOString(),
            }]);
            setEntries(entries.map((e) => e.id === entry.id ? { ...e, paid: true, paidAt: new Date().toISOString(), amount } : e));
            return;
        }
        setTransfers(transfers.filter((t) => t.settlementId !== entry.id));
        setEntries(entries.map((e) => e.id === entry.id ? { ...e, paid: false, paidAt: null } : e));
    };
    const removePaid = (entry) => {
        setTransfers(transfers.filter((t) => t.settlementId !== entry.id));
        setEntries(entries.filter((e) => e.id !== entry.id));
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(ArrowRight, { size: 16 }), " Chi deve dare a chi"] }), _jsx("p", { className: "micro-note", children: "Totale netto Splitwise tra ogni coppia, aggiornato con le nuove spese. Puoi correggere gli importi a mano: le modifiche restano salvate e contano anche per saldato/da saldare." }), unpaid.length === 0 ? (_jsx("p", { className: "empty-note", children: "Nessun pagamento in sospeso al momento." })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "settlement-list", children: unpaid.map((entry) => (_jsxs("li", { className: "settlement-row settlement-row-edit", children: [_jsx("span", { className: "settlement-name", style: { color: nameColor(entry.from) }, children: entry.from }), _jsx(ArrowRight, { size: 14 }), _jsx("span", { className: "settlement-name", style: { color: nameColor(entry.to) }, children: entry.to }), entry.customAmount && _jsx("span", { className: "settle-custom-tag", title: entry.computedAmount != null ? `Calcolato: € ${formatMoney(entry.computedAmount)}` : "Importo modificato a mano", children: "modificato" }), _jsxs("label", { className: "settlement-amount-edit", children: ["€", _jsx("input", { type: "text", inputMode: "decimal", value: displayAmount(entry), onChange: (e) => onAmountChange(entry.id, e.target.value), onBlur: () => commitAmount(entry.id) })] }), entry.customAmount && _jsx("button", { className: "settle-row-reset", type: "button", title: "Ripristina importo calcolato", onClick: () => resetRowAmount(entry.id), children: _jsx(RefreshCw, { size: 12 }) }), _jsxs("div", { className: "settle-flag-group", children: [_jsxs("button", { className: "settle-flag settle-flag-on", onClick: () => setPaid(entry, true), children: [_jsx(Check, { size: 12 }), " Saldato"] }), _jsxs("button", { className: "settle-flag settle-flag-off active", children: [_jsx(X, { size: 12 }), " Da saldare"] })] })] }, entry.id))) }), unpaid.some((e) => e.customAmount) && _jsx("button", { className: "settle-reset-link", type: "button", onClick: resetAllComputed, children: "Ripristina tutti gli importi calcolati" })] }))] }), (paid.length > 0 || unpaid.length > 0) && (_jsxs("div", { className: "settle-summary-grid", children: [_jsxs("div", { className: "card settle-summary settle-summary-paid", children: [_jsxs("div", { className: "settle-summary-head", children: [_jsxs("h4", { children: [_jsx(Check, { size: 15 }), " Saldato"] }), _jsxs("span", { className: "settle-summary-total", children: ["€ ", formatMoney(paidTotal)] })] }), paid.length === 0 ? (_jsx("p", { className: "empty-note", children: "Ancora nessun saldo registrato." })) : (_jsx("div", { className: "settle-summary-list", children: paid.map((entry) => (_jsxs("div", { className: "settle-summary-item", children: [_jsx(SettlementSummaryRow, { entry: entry }), _jsxs("div", { className: "settle-summary-actions", children: [entry.paidAt && _jsx("span", { className: "settle-summary-date", children: new Date(entry.paidAt).toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" }) }), _jsxs("button", { className: "settle-flag settle-flag-off", onClick: () => setPaid(entry, false), children: [_jsx(X, { size: 11 }), " Annulla"] }), _jsx("button", { className: "tiny-btn", onClick: () => removePaid(entry), title: "Rimuovi dal riepilogo", children: _jsx(Trash2, { size: 12 }) })] })] }, entry.id))) }))] }), _jsxs("div", { className: "card settle-summary settle-summary-pending", children: [_jsxs("div", { className: "settle-summary-head", children: [_jsxs("h4", { children: [_jsx(Clock, { size: 15 }), " Da saldare"] }), _jsxs("span", { className: "settle-summary-total", children: ["€ ", formatMoney(unpaidTotal)] })] }), unpaid.length === 0 ? (_jsx("p", { className: "empty-note", children: "Tutto saldato, nessun debito aperto." })) : (_jsx("div", { className: "settle-summary-list", children: unpaid.map((entry) => (_jsx("div", { className: "settle-summary-item", children: _jsx(SettlementSummaryRow, { entry: entry }) }, entry.id))) }))] })] }))] }));
}
function PersonalExpenseSummary({ profile, entries }) {
    const me = String(profile || "").trim();
    const open = (entries || []).filter((e) => !e.paid && Number(e.amount || 0) > 0.005);
    const toGive = open.filter((e) => String(e.from || "").trim() === me);
    const toReceive = open.filter((e) => String(e.to || "").trim() === me);
    const giveTotal = toGive.reduce((s, e) => s + Number(e.amount || 0), 0);
    const receiveTotal = toReceive.reduce((s, e) => s + Number(e.amount || 0), 0);
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(User, { size: 16 }), " Il mio riepilogo"] }), _jsx("p", { className: "micro-note", children: "Riepilogo personale basato sugli importi attuali di Chi deve dare a chi, comprese le modifiche manuali e i saldi già registrati." }), _jsxs("div", { className: "settle-summary-grid", style: { marginTop: 12 }, children: [_jsxs("div", { className: "settle-summary settle-summary-pending", children: [_jsxs("div", { className: "settle-summary-head", children: [_jsx("h4", { children: "Devo dare" }), _jsxs("span", { className: "settle-summary-total", children: ["€ ", formatMoney(giveTotal)] })] }), toGive.length === 0 ? _jsx("p", { className: "empty-note", children: "Non devi dare nulla al momento." }) : _jsx("div", { className: "settle-summary-list", children: toGive.map((entry) => _jsx("div", { className: "settle-summary-item", children: _jsxs("div", { className: "settle-summary-row", children: [_jsxs("div", { children: ["A ", _jsx("strong", { style: { color: nameColor(entry.to) }, children: entry.to })] }), _jsxs("strong", { children: ["€ ", formatMoney(entry.amount)] })] }) }, entry.id)) })] }), _jsxs("div", { className: "settle-summary settle-summary-paid", children: [_jsxs("div", { className: "settle-summary-head", children: [_jsx("h4", { children: "Devo ricevere" }), _jsxs("span", { className: "settle-summary-total", children: ["€ ", formatMoney(receiveTotal)] })] }), toReceive.length === 0 ? _jsx("p", { className: "empty-note", children: "Non devi ricevere nulla al momento." }) : _jsx("div", { className: "settle-summary-list", children: toReceive.map((entry) => _jsx("div", { className: "settle-summary-item", children: _jsxs("div", { className: "settle-summary-row", children: [_jsxs("div", { children: ["Da ", _jsx("strong", { style: { color: nameColor(entry.from) }, children: entry.from })] }), _jsxs("strong", { children: ["€ ", formatMoney(entry.amount)] })] }) }, entry.id)) })] })] })] }));
}
function SpeseTab({ settings, setSettings, profile, people, setPeople, expenses, setExpenses, transfers, setTransfers, settlementEntries, setSettlementEntries }) {
    const [newPerson, setNewPerson] = useState("");
    const addPerson = () => {
        const name = newPerson.trim();
        if (name && !people.includes(name)) {
            setPeople([...people, name]);
            setNewPerson("");
        }
    };
    const removePerson = (name) => setPeople(people.filter((p) => p !== name));
    const removeExpense = (id) => {
        const target = expenses.find((e) => e.id === id);
        if (!target || !canManageExpense(target, profile))
            return;
        setExpenses(expenses.filter((e) => e.id !== id));
    };
    const settlements = useMemo(() => computePairwiseSettlements(people, expenses, transfers), [people, expenses, transfers]);
    const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
    return (_jsxs("div", { className: "tab-panel", children: [_jsx(EstimateCard, { settings: settings, setSettings: setSettings }), _jsx(PersonalExpenseSummary, { profile: profile, entries: settlementEntries }), _jsx("p", { className: "shared-note", children: "Le spese sono condivise nel gruppo, ma ogni partecipante pu\u00F2 eliminare solo le spese che ha aggiunto lui/lei." }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Users, { size: 16 }), " Chi partecipa"] }), _jsx("div", { className: "participant-chips", children: people.map((p) => (_jsxs("span", { className: "chip chip-on", style: { background: nameColor(p) }, children: [p, _jsx("button", { className: "chip-x", onClick: () => removePerson(p), children: _jsx(X, { size: 11 }) })] }, p))) }), _jsxs("div", { className: "add-row", children: [_jsx("input", { placeholder: "Aggiungi persona\u2026", value: newPerson, onChange: (e) => setNewPerson(e.target.value), onKeyDown: (e) => { if (e.key === "Enter")
                                    addPerson(); } }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: addPerson, children: _jsx(Plus, { size: 14 }) })] })] }), people.length > 0 && _jsx(AddExpenseForm, { profile: profile, people: people, onAdd: (e) => setExpenses([...expenses, e]) }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Wallet, { size: 16 }), " Spese registrate"] }), expenses.length === 0 ? (_jsx("p", { className: "empty-note", children: "Ancora nessuna spesa. Aggiungine una qui sopra." })) : (_jsxs(_Fragment, { children: [_jsx("ul", { className: "expense-list", children: expenses.slice().reverse().map((e) => {
                                    const mine = canManageExpense(e, profile);
                                    const owner = expenseOwner(e);
                                    const splitLabel = expenseSplitLabel(e, people);
                                    return (_jsxs("li", { className: "expense-row", children: [_jsx("div", { className: "expense-avatar", style: { background: nameColor(e.paidBy) }, children: e.paidBy.slice(0, 1).toUpperCase() }), _jsxs("div", { className: "expense-main", children: [_jsx("div", { className: "expense-desc", children: e.description }), _jsxs("div", { className: "expense-meta", children: [e.category || "Altro", " \u00B7 ", e.paidBy, " ha pagato \u00B7 diviso tra ", splitLabel, owner ? ` \u00B7 aggiunta da ${owner}` : ""] })] }), _jsxs("div", { className: "expense-amount", children: ["\u20AC ", formatMoney(e.amount)] }), mine ? _jsx("button", { className: "tiny-btn", onClick: () => removeExpense(e.id), title: "Elimina la tua spesa", children: _jsx(Trash2, { size: 13 }) }) : _jsx("span", { className: "expense-lock", title: "Solo chi ha aggiunto la spesa pu\u00F2 modificarla", children: _jsx(LockKeyhole, { size: 13 }) })] }, e.id));
                                }) }), _jsxs("div", { className: "expense-total", children: ["Totale speso: ", _jsxs("strong", { children: ["\u20AC ", formatMoney(totalSpent)] })] })] }))] }), people.length > 0 && _jsx(SettlementBoard, { computed: settlements, entries: settlementEntries, setEntries: setSettlementEntries, transfers: transfers, setTransfers: setTransfers })] }));
}
function SharedShoppingList({ items, setItems }) {
    const [draft, setDraft] = useState("");
    const add = () => {
        const text = draft.trim();
        if (!text)
            return;
        setItems([...items, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, text, done: false }]);
        setDraft("");
    };
    const toggle = (id) => setItems(items.map((it) => it.id === id ? { ...it, done: !it.done } : it));
    const remove = (id) => setItems(items.filter((it) => it.id !== id));
    return (_jsxs("div", { className: "card", children: [_jsxs("div", { className: "checklist-head", children: [_jsxs("h3", { className: "card-title", children: [_jsx(ShoppingBag, { size: 16 }), " Lista spesa condivisa"] }), _jsxs("span", { className: "progress-label", children: [items.filter((x) => x.done).length, "/", items.length] })] }), _jsx("ul", { className: "check-list", children: items.map((it) => (_jsxs("li", { children: [_jsxs("label", { className: "check-item", children: [_jsx("input", { type: "checkbox", checked: !!it.done, onChange: () => toggle(it.id) }), _jsx("span", { className: it.done ? "checked" : "", children: it.text })] }), _jsx("button", { className: "tiny-btn", onClick: () => remove(it.id), children: _jsx(Trash2, { size: 12 }) })] }, it.id))) }), _jsxs("div", { className: "add-row", children: [_jsx("input", { placeholder: "Aggiungi alla spesa\u2026", value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && add() }), _jsx("button", { className: "tiny-btn tiny-btn-accent", onClick: add, children: _jsx(Plus, { size: 14 }) })] }), _jsx("p", { className: "micro-note", children: "Questa lista \u00E8 sincronizzata con tutto il gruppo." })] }));
}
function CasaTab({ checkState, toggleCheck, shoppingItems, setShoppingItems }) {
    const [copied, setCopied] = useState(false);
    const addressText = "Camí de Son Puigserver, 07639 Llucmajor, Illes Balears, Spain";
    const copyAddress = async () => {
        try {
            await navigator.clipboard.writeText(addressText);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
        }
        catch (e) { }
    };
    return (_jsxs("div", { className: "tab-panel", children: [_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Home, { size: 16 }), " Indirizzo casa"] }), _jsx("p", { className: "address-text", children: addressText }), _jsxs("div", { className: "pill-row", children: [_jsxs("a", { href: mapsUrl(CASA_PLACE), target: "_blank", rel: "noreferrer", className: "pill pill-accent", children: [_jsx(MapPin, { size: 13 }), " Apri in Maps"] }), _jsxs("button", { className: "pill", onClick: copyAddress, children: [copied ? _jsx(Check, { size: 13 }) : _jsx(Copy, { size: 13 }), " ", copied ? "Copiato" : "Copia indirizzo"] })] }), _jsxs("div", { className: "info-line", children: [_jsx(Clock, { size: 14 }), " Arrivo previsto marted\u00EC 1 settembre: circa 17:30"] }), _jsxs("div", { className: "info-line", children: [_jsx(ShoppingBag, { size: 14 }), " Spesa di riferimento: Mercadona di Llucmajor"] })] }), _jsx(SharedShoppingList, { items: shoppingItems, setItems: setShoppingItems }), _jsx(SimpleChecklist, { title: "Promemoria spesa personale", items: SPESA_ITEMS, state: checkState, onToggle: toggleCheck })] }));
}
function MappaTab({ overrides }) {
    const allPlaces = useMemo(() => {
        const seen = new Set();
        const out = [];
        DEFAULT_DAYS.forEach((d) => {
            const places = overrides?.[d.num]?.places || d.places;
            places.forEach((p) => {
                const name = placeName(p);
                if (!seen.has(name)) {
                    seen.add(name);
                    out.push({ place: p, day: d.num, weekday: d.weekday });
                }
            });
        });
        return out;
    }, [overrides]);
    return (_jsx("div", { className: "tab-panel", children: _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(MapPin, { size: 16 }), " Tutti i luoghi del viaggio"] }), _jsx("div", { className: "map-grid", children: allPlaces.map((p) => (_jsxs("a", { href: mapsUrl(p.place), target: "_blank", rel: "noreferrer", className: "map-tile", children: [_jsx(MapPin, { size: 16 }), _jsxs("div", { children: [_jsx("div", { className: "map-tile-name", children: placeName(p.place) }), _jsx("div", { className: "map-tile-day", children: p.day ? `Giorno ${p.day} · ${p.weekday}` : p.weekday })] })] }, placeName(p.place)))) })] }) }));
}
function WeatherMini({ row }) {
    if (!row)
        return _jsx("span", { className: "weather-unavailable", children: "Previsione non ancora disponibile" });
    return (_jsxs("div", { className: "weather-mini", children: [_jsx("span", { className: "weather-emoji", children: weatherEmoji(row.code) }), _jsxs("div", { children: [_jsxs("strong", { children: [Math.round(row.max), "\u00B0"] }), _jsx("span", { children: weatherLabel(row.code) })] }), _jsxs("div", { children: [_jsx(Umbrella, { size: 13 }), " ", Math.round(row.rain || 0), "%"] }), _jsxs("div", { children: [_jsx(Wind, { size: 13 }), " ", Math.round(row.wind || 0), " km/h"] }), _jsxs("div", { children: [_jsx(Sun, { size: 13 }), " UV ", Number(row.uv || 0).toFixed(1)] })] }));
}
function GroupBoard({ notes, setNotes, profile }) {
 const [draft,setDraft]=useState("");const [busy,setBusy]=useState(false);
 useEffect(()=>{let dead=false;const pull=async()=>{try{const n=await boardLoad();if(!dead)setNotes(n)}catch{}};void pull();const tm=window.setInterval(pull,8000);return()=>{dead=true;window.clearInterval(tm)}},[]);
 const add=async()=>{const text=draft.trim();if(!text||busy)return;setBusy(true);try{const d=await boardRequest("add",{text,author:profile||"Gruppo"});setNotes(d.notes||[]);setDraft("")}finally{setBusy(false)}};
 const del=async n=>{if(!n?.mine||busy)return;setBusy(true);try{const d=await boardRequest("delete",{id:n.id});setNotes(d.notes||[])}finally{setBusy(false)}};
 return (_jsxs("div",{className:"card",children:[_jsxs("h3",{className:"card-title",children:[_jsx(MessageCircle,{size:16})," Bacheca del gruppo"]}),notes.length===0?_jsx("p",{className:"empty-note",children:"Nessun messaggio. Utile per cambi programma, orari e promemoria."}):_jsx("div",{className:"group-notes",children:notes.slice().reverse().map(n=>_jsxs("div",{className:"group-note",children:[_jsxs("div",{className:"group-note-body",children:[_jsx("strong",{children:n.author}),_jsx("span",{children:n.text})]}),n.mine&&_jsx("button",{className:"tiny-btn",disabled:busy,title:"Elimina il tuo messaggio",onClick:()=>del(n),children:_jsx(X,{size:12})})]},n.id))}),_jsxs("div",{className:"add-row",children:[_jsx("input",{placeholder:"Scrivi un promemoria per tutti…",value:draft,disabled:busy,onChange:e=>setDraft(e.target.value),onKeyDown:e=>e.key==="Enter"&&add()}),_jsx("button",{className:"tiny-btn tiny-btn-accent",disabled:busy,onClick:add,children:_jsx(Plus,{size:14})})]})]}));
}
function DashboardTab({ weather, notes, setNotes, profile, setActiveTab, expenses, overrides }) {
    const tp = useTripPhase();
    const baseToday = tp.phase === "during" ? DEFAULT_DAYS[tp.dayIndex - 1] : (tp.phase === "before" ? DEFAULT_DAYS[0] : DEFAULT_DAYS[8]);
    const dayOverride = overrides?.[baseToday.num] || {};
    const today = { ...baseToday, ...dayOverride, items: dayOverride.items || baseToday.items, places: dayOverride.places || baseToday.places };
    const row = weather?.find((w) => w.date === today.date);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    return (_jsxs("div", { className: "tab-panel", children: [_jsxs("div", { className: "card today-card", children: [_jsxs("div", { className: "today-head", children: [_jsxs("div", { children: [_jsx("div", { className: "today-kicker", children: tp.phase === "during" ? "OGGI" : tp.phase === "before" ? "PRIMO GIORNO" : "ULTIMO GIORNO" }), _jsxs("h3", { children: [today.weekday, " \u00B7 ", today.title] })] }), _jsx("span", { className: "today-number", children: today.num })] }), _jsx("ul", { className: "day-items compact", children: today.items.slice(0, 4).map((text, i) => _jsxs("li", { children: [_jsx("span", { className: "dot-bullet" }), _jsx("span", { children: text })] }, i)) }), _jsx(WeatherMini, { row: row }), _jsxs("div", { className: "quick-grid", children: [_jsxs("button", { className: "quick-action", onClick: () => setActiveTab("programma"), children: [_jsx(Calendar, { size: 17 }), _jsx("span", { children: "Programma" })] }), _jsxs("button", { className: "quick-action", onClick: () => setActiveTab("spese"), children: [_jsx(Wallet, { size: 17 }), _jsxs("span", { children: ["Spese \u20AC ", formatMoney(totalSpent)] })] }), _jsxs("a", { className: "quick-action", href: mapsUrl(CASA_PLACE), target: "_blank", rel: "noreferrer", children: [_jsx(Navigation, { size: 17 }), _jsx("span", { children: "Vai a casa" })] }), _jsxs("button", { className: "quick-action", onClick: () => setActiveTab("meteo"), children: [_jsx(CloudSun, { size: 17 }), _jsx("span", { children: "Meteo viaggio" })] })] })] }), _jsx(GroupBoard, { notes: notes, setNotes: setNotes, profile: profile })] }));
}
function WeatherTab({ weather, weatherUpdatedAt, weatherLoading, weatherError, refreshWeather }) {
    const tripRows = DEFAULT_DAYS.map((d) => ({ day: d, forecast: weather?.find((w) => w.date === d.date) })).filter((x) => x.forecast);
    return (_jsxs("div", { className: "tab-panel", children: [_jsxs("div", { className: "card", children: [_jsxs("div", { className: "card-title-row", children: [_jsxs("h3", { className: "card-title", children: [_jsx(CloudSun, { size: 16 }), " Meteo Maiorca"] }), _jsx("button", { className: "tiny-btn", onClick: () => refreshWeather(true), disabled: weatherLoading, children: _jsx(RefreshCw, { size: 13, className: weatherLoading ? "spin" : "" }) })] }), _jsx("p", { className: "weather-source", children: "Previsione indicativa per Palma/Maiorca. Controllala insieme alle condizioni locali prima di spiaggia, trekking o barca." }), weatherUpdatedAt && _jsxs("p", { className: "micro-note", children: ["Aggiornato: ", new Date(weatherUpdatedAt).toLocaleString("it-IT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })] }), weatherError && _jsx("p", { className: "weather-error", children: weatherError })] }), tripRows.length === 0 && _jsx("div", { className: "card", children: _jsx("p", { className: "empty-note", children: "Le previsioni del viaggio non sono ancora nel periodo disponibile. L'app le mostrer\u00E0 automaticamente quando entreranno nella finestra previsionale." }) }), tripRows.map(({ day, forecast }) => (_jsxs("div", { className: "card weather-day", children: [_jsxs("div", { className: "weather-day-title", children: [_jsx("span", { className: "weather-big-emoji", children: weatherEmoji(forecast.code) }), _jsxs("div", { children: [_jsxs("strong", { children: [day.weekday, " ", day.num, " settembre"] }), _jsx("span", { children: weatherLabel(forecast.code) })] }), _jsxs("div", { className: "weather-temp", children: [Math.round(forecast.max), "\u00B0 ", _jsxs("small", { children: [Math.round(forecast.min), "\u00B0"] })] })] }), _jsxs("div", { className: "weather-stats", children: [_jsxs("div", { children: [_jsx(Umbrella, { size: 15 }), _jsxs("strong", { children: [Math.round(forecast.rain || 0), "%"] }), _jsx("span", { children: "pioggia" })] }), _jsxs("div", { children: [_jsx(Wind, { size: 15 }), _jsx("strong", { children: Math.round(forecast.wind || 0) }), _jsx("span", { children: "km/h vento" })] }), _jsxs("div", { children: [_jsx(Sun, { size: 15 }), _jsx("strong", { children: Number(forecast.uv || 0).toFixed(1) }), _jsx("span", { children: "indice UV" })] })] }), _jsxs("div", { className: "sun-times", children: [_jsxs("span", { children: [_jsx(Sunrise, { size: 14 }), " ", forecast.sunrise?.slice(11, 16) || "—"] }), _jsxs("span", { children: [_jsx(Sunset, { size: 14 }), " ", forecast.sunset?.slice(11, 16) || "—"] })] }), (forecast.rain >= 50 || forecast.wind >= 35 || forecast.uv >= 8) && _jsxs("div", { className: "weather-warning", children: [_jsx(ShieldAlert, { size: 14 }), " ", forecast.rain >= 50 ? "Possibile pioggia: valutate il piano alternativo." : forecast.wind >= 35 ? "Vento sostenuto: ricontrollate le condizioni soprattutto per la barca." : "UV molto alto: protezione solare e ombra nelle ore centrali."] })] }, day.date))), _jsxs("a", { className: "card external-card", href: "https://www.aemet.es/en/eltiempo/prediccion/municipios/palma-id07040", target: "_blank", rel: "noreferrer", children: [_jsx(ExternalLink, { size: 17 }), _jsxs("div", { children: [_jsx("strong", { children: "Controlla anche AEMET" }), _jsx("span", { children: "Servizio meteorologico ufficiale spagnolo" })] })] })] }));
}
function SharedLogistics({ logistics, setLogistics }) {
    const [draft, setDraft] = useState(logistics);
    useEffect(() => { setDraft(logistics); }, [logistics]);
    const fields = [
        ["host", "Contatto / host casa"], ["wifi", "Wi-Fi casa"], ["checkin", "Check-in / accesso casa"],
        ["rental", "Autonoleggio"], ["booking", "Prenotazione auto"], ["plate", "Targa / auto assegnata"],
        ["fuel", "Carburante / politica pieno"], ["return", "Riconsegna auto"], ["parking", "Note parcheggio"],
    ];
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Navigation, { size: 16 }), " Logistica condivisa"] }), _jsx("div", { className: "logistics-grid", children: fields.map(([key, label]) => (_jsxs("label", { className: "edit-label", children: [label, _jsx("input", { value: draft[key] || "", onChange: (e) => setDraft({ ...draft, [key]: e.target.value }), onBlur: () => setLogistics(draft), placeholder: "\u2014" })] }, key))) }), _jsx("p", { className: "micro-note", children: "Questi dati sono condivisi con chi entra nell'app usando il codice del viaggio." })] }));
}
function InfoTab({ exportData, logistics, setLogistics }) {
    const [online, setOnline] = useState(navigator.onLine);
    const [shared, setShared] = useState(false);
    useEffect(() => {
        const on = () => setOnline(true), off = () => setOnline(false);
        window.addEventListener("online", on);
        window.addEventListener("offline", off);
        return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
    }, []);
    const shareApp = async () => {
        try {
            if (navigator.share)
                await navigator.share({ title: "Palma 2026", text: "Apri l'app del viaggio Palma 2026", url: location.href });
            else {
                await navigator.clipboard.writeText(location.href);
                setShared(true);
                setTimeout(() => setShared(false), 1800);
            }
        }
        catch { }
    };
    return (_jsxs("div", { className: "tab-panel", children: [_jsxs("div", { className: `status-card ${online ? "online" : "offline"}`, children: [online ? _jsx(Wifi, { size: 15 }) : _jsx(WifiOff, { size: 15 }), " ", online ? "Online · sincronizzazione disponibile" : "Offline · puoi continuare a consultare i dati già caricati"] }), _jsx(SharedLogistics, { logistics: logistics, setLogistics: setLogistics }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(ShieldAlert, { size: 16 }), " Emergenze"] }), _jsxs("a", { href: "tel:112", className: "emergency-button", children: [_jsx(Phone, { size: 18 }), _jsxs("div", { children: [_jsx("strong", { children: "112" }), _jsx("span", { children: "Numero unico europeo per le emergenze" })] })] }), _jsx("p", { className: "micro-note", children: "Per problemi non urgenti usa i recapiti della struttura, autonoleggio o compagnia aerea presenti nelle relative prenotazioni." })] }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Bus, { size: 16 }), " Trasporti e servizi utili"] }), _jsxs("div", { className: "link-list", children: [_jsxs("a", { href: "https://www.tib.org/en/inici", target: "_blank", rel: "noreferrer", children: [_jsx(Bus, { size: 15 }), _jsxs("span", { children: [_jsx("strong", { children: "TIB Mallorca" }), _jsx("small", { children: "bus, treni, metro, orari e avvisi" })] }), _jsx(ExternalLink, { size: 13 })] }), _jsxs("a", { href: "https://www.aena.es/en/palma-de-mallorca.html", target: "_blank", rel: "noreferrer", children: [_jsx(Plane, { size: 15 }), _jsxs("span", { children: [_jsx("strong", { children: "Aeroporto PMI" }), _jsx("small", { children: "informazioni ufficiali Aena" })] }), _jsx(ExternalLink, { size: 13 })] }), _jsxs("a", { href: mapsUrl("Palma de Mallorca Airport PMI"), target: "_blank", rel: "noreferrer", children: [_jsx(MapPin, { size: 15 }), _jsxs("span", { children: [_jsx("strong", { children: "PMI in Maps" }), _jsx("small", { children: "navigazione verso l'aeroporto" })] }), _jsx(ExternalLink, { size: 13 })] })] })] }), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Share2, { size: 16 }), " App del viaggio"] }), _jsxs("div", { className: "pill-row", children: [_jsxs("button", { className: "pill pill-accent", onClick: shareApp, children: [_jsx(Share2, { size: 13 }), " ", shared ? "Link copiato" : "Condividi app"] }), _jsxs("button", { className: "pill", onClick: exportData, children: [_jsx(Download, { size: 13 }), " Esporta backup"] })] }), _jsx("p", { className: "micro-note", children: "Su iPhone: Safari \u2192 Condividi \u2192 \u201CAggiungi alla schermata Home\u201D. Cos\u00EC si apre come un'app e le pagine gi\u00E0 visitate restano disponibili anche senza rete." })] })] }));
}

const PHRASE_SECTIONS = [
    { id: "saluti", title: "Saluti e cortesia", emoji: "👋", items: [
        { it: "Buongiorno", es: "Buenos días" },
        { it: "Buon pomeriggio / Buonasera", es: "Buenas tardes" },
        { it: "Buonanotte", es: "Buenas noches" },
        { it: "Ciao / A presto", es: "Hola / Hasta luego" },
        { it: "Per favore", es: "Por favor" },
        { it: "Grazie", es: "Gracias" },
        { it: "Prego / Di nulla", es: "De nada" },
        { it: "Scusa / Mi scusi", es: "Perdón / Disculpe" },
        { it: "Sì / No", es: "Sí / No" },
        { it: "Non parlo spagnolo", es: "No hablo español" },
        { it: "Parlo un po' di spagnolo", es: "Hablo un poco de español" },
        { it: "Parla inglese?", es: "¿Habla inglés?" },
        { it: "Non capisco", es: "No entiendo" },
        { it: "Può ripetere?", es: "¿Puede repetir?" },
        { it: "Più lentamente, per favore", es: "Más despacio, por favor" },
    ]},
    { id: "negozi", title: "Negozi e supermercato", emoji: "🛒", items: [
        { it: "Dove si trova...?", es: "¿Dónde está...?" },
        { it: "Avete...?", es: "¿Tiene...? / ¿Tienen...?" },
        { it: "Vorrei questo", es: "Quisiera esto" },
        { it: "Me lo porto / Lo prendo", es: "Me lo llevo" },
        { it: "Quanto costa?", es: "¿Cuánto cuesta?" },
        { it: "Qual è il prezzo?", es: "¿Cuál es el precio?" },
        { it: "È troppo caro", es: "Es demasiado caro" },
        { it: "Avete uno sconto?", es: "¿Tiene descuento?" },
        { it: "Accettate carta?", es: "¿Aceptan tarjeta?" },
        { it: "Solo contanti?", es: "¿Solo efectivo?" },
        { it: "Lo scontrino, per favore", es: "El ticket, por favor" },
        { it: "Una busta, per favore", es: "Una bolsa, por favor" },
        { it: "Supermercato", es: "Supermercado" },
        { it: "Farmacia", es: "Farmacia" },
        { it: "Acqua", es: "Agua" },
        { it: "Pane", es: "Pan" },
        { it: "Frutta", es: "Fruta" },
        { it: "Latte", es: "Leche" },
        { it: "Uova", es: "Huevos" },
        { it: "Gelato", es: "Helado" },
        { it: "Senza glutine", es: "Sin gluten" },
        { it: "Senza lattosio", es: "Sin lactosa" },
        { it: "Da asporto", es: "Para llevar" },
        { it: "È aperto adesso?", es: "¿Está abierto ahora?" },
        { it: "A che ora chiude?", es: "¿A qué hora cierra?" },
    ]},
    { id: "ristorante", title: "Bar e ristorante", emoji: "🍽️", items: [
        { it: "Un tavolo per [numero], per favore", es: "Una mesa para [número], por favor" },
        { it: "Il menu, per favore", es: "La carta / el menú, por favore" },
        { it: "Cosa consiglia?", es: "¿Qué recomienda?" },
        { it: "Per me...", es: "Para mí..." },
        { it: "Vorrei...", es: "Quisiera..." },
        { it: "Senza...", es: "Sin..." },
        { it: "Sono allergico a...", es: "Soy alérgico a..." },
        { it: "Vegetariano / Vegano", es: "Vegetariano / Vegano" },
        { it: "Acqua naturale / frizzante", es: "Agua sin gas / con gas" },
        { it: "Una birra / un vino", es: "Una cerveza / un vino" },
        { it: "Un caffè", es: "Un café" },
        { it: "Per condividere", es: "Para compartir" },
        { it: "È buonissimo!", es: "¡Está muy bueno!" },
        { it: "Il conto, per favore", es: "La cuenta, por favor" },
        { it: "Posso pagare con carta?", es: "¿Puedo pagar con tarjeta?" },
        { it: "Il servizio è incluso?", es: "¿Está incluido el servicio?" },
        { it: "Un gelato, per favore", es: "Un helado, por favor" },
    ]},
    { id: "commerciale", title: "Commerciale e trattative", emoji: "💶", items: [
        { it: "Sto solo guardando", es: "Solo estoy mirando" },
        { it: "Posso provarlo?", es: "¿Puedo probármelo?" },
        { it: "Avete una taglia più grande/piccola?", es: "¿Tiene una talla más grande/pequeña?" },
        { it: "È in saldo?", es: "¿Está rebajado?" },
        { it: "È l'ultimo prezzo?", es: "¿Es el último precio?" },
        { it: "Posso avere uno sconto?", es: "¿Me puede hacer un descuento?" },
        { it: "È incluso l'IVA?", es: "¿Está incluido el IVA?" },
        { it: "Vorrei una fattura", es: "Quisiera una factura" },
        { it: "Posso pagare a rate?", es: "¿Puedo pagar a plazos?" },
        { it: "Resto / resto del cambio", es: "Cambio" },
        { it: "È rotto / difettoso", es: "Está roto / defectuoso" },
        { it: "Vorrei un rimborso", es: "Quisiera un reembolso" },
        { it: "Posso cambiarlo?", es: "¿Puedo cambiarlo?" },
        { it: "La garanzia", es: "La garantía" },
        { it: "Consegna a domicilio?", es: "¿Entrega a domicilio?" },
    ]},
    { id: "direzioni", title: "Indicazioni e aiuto", emoji: "🧭", items: [
        { it: "Dove si trova...?", es: "¿Dónde está...?" },
        { it: "Come arrivo a...?", es: "¿Cómo llego a...?" },
        { it: "È lontano?", es: "¿Está lejos?" },
        { it: "È vicino?", es: "¿Está cerca?" },
        { it: "A destra / A sinistra", es: "A la derecha / A la izquierda" },
        { it: "Sempre dritto", es: "Todo recto" },
        { it: "Qui vicino", es: "Aquí cerca" },
        { it: "Mi sono perso/a", es: "Me he perdido" },
        { it: "Ho bisogno di aiuto", es: "Necesito ayuda" },
        { it: "Chiamate la polizia", es: "Llame a la policía" },
        { it: "Chiamate un'ambulanza", es: "Llame a una ambulancia" },
        { it: "Dov'è il bagno?", es: "¿Dónde está el baño?" },
        { it: "A che ora apre?", es: "¿A qué hora abre?" },
    ]},
    { id: "numeri", title: "Numeri e prezzi", emoji: "🔢", items: [
        { it: "Uno / Due / Tre", es: "Uno / Dos / Tres" },
        { it: "Quattro / Cinque / Sei", es: "Cuatro / Cinco / Seis" },
        { it: "Sette / Otto / Nove / Dieci", es: "Siete / Ocho / Nueve / Diez" },
        { it: "Venti / Trenta / Cinquanta", es: "Veinte / Treinta / Cincuenta" },
        { it: "Cento / Mille", es: "Cien / Mil" },
        { it: "Euro", es: "Euro" },
        { it: "Mezzo litro", es: "Medio litro" },
        { it: "Un chilo", es: "Un kilo" },
        { it: "Due persone", es: "Dos personas" },
        { it: "Oggi / Domani", es: "Hoy / Mañana" },
        { it: "Ieri", es: "Ayer" },
        { it: "Adesso / Più tardi", es: "Ahora / Más tarde" },
    ]},
    { id: "casa", title: "Casa e alloggio", emoji: "🏠", items: [
        { it: "La chiave", es: "La llave" },
        { it: "La password del Wi-Fi", es: "La contraseña del Wi-Fi" },
        { it: "Non funziona", es: "No funciona" },
        { it: "C'è un problema", es: "Hay un problema" },
        { it: "Acqua calda", es: "Agua caliente" },
        { it: "Aria condizionata", es: "Aire acondicionado" },
        { it: "Riscaldamento", es: "Calefacción" },
        { it: "La spazzatura / I rifiuti", es: "La basura" },
        { it: "Riciclaggio", es: "Reciclaje" },
        { it: "È troppo rumoroso", es: "Hay mucho ruido" },
        { it: "Check-in / Check-out", es: "Entrada / Salida" },
    ]},
    { id: "trasporti", title: "Trasporti", emoji: "🚌", items: [
        { it: "Autobus", es: "Autobús" },
        { it: "Taxi", es: "Taxi" },
        { it: "Parcheggio", es: "Aparcamiento / Parking" },
        { it: "Biglietto", es: "Billete" },
        { it: "Fermata", es: "Parada" },
        { it: "Aeroporto", es: "Aeropuerto" },
        { it: "Noleggio auto", es: "Alquiler de coches" },
        { it: "Benzina", es: "Gasolina" },
        { it: "Dove posso parcheggiare?", es: "¿Dónde puedo aparcar?" },
        { it: "Quanto costa il biglietto?", es: "¿Cuánto cuesta el billete?" },
        { it: "Un taxi per..., per favore", es: "Un taxi a..., por favor" },
    ]},
    { id: "persone", title: "Parlare con le persone", emoji: "🤝", items: [
        { it: "Piacere di conoscerti", es: "Mucho gusto" },
        { it: "Come stai?", es: "¿Qué tal? / ¿Cómo estás?" },
        { it: "Tutto bene", es: "Todo bien" },
        { it: "Siamo in vacanza", es: "Estamos de vacaciones" },
        { it: "Siamo un gruppo di amici", es: "Somos un grupo de amigos" },
        { it: "Vengo dall'Italia", es: "Vengo de Italia" },
        { it: "È la prima volta a Maiorca", es: "Es la primera vez en Mallorca" },
        { it: "Che bel posto!", es: "¡Qué lugar tan bonito!" },
        { it: "Ci vediamo dopo", es: "Nos vemos luego" },
        { it: "Buon viaggio!", es: "¡Buen viaje!" },
        { it: "Congregazione / adunanza", es: "Congregación / reunión", note: "Utile con i fratelli locali" },
        { it: "Chiesa del Regno", es: "Salón del Reino" },
    ]},
];
function PhraseRow({ item }) {
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(item.es);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch { }
    };
    return (_jsxs("div", { className: "phrase-row", children: [_jsxs("div", { className: "phrase-main", children: [_jsx("div", { className: "phrase-it", children: item.it }), _jsx("div", { className: "phrase-es", children: item.es }), item.note && _jsx("div", { className: "phrase-note", children: item.note })] }), _jsx("button", { className: "tiny-btn phrase-copy", onClick: copy, title: "Copia in spagnolo", children: copied ? _jsx(Check, { size: 12 }) : _jsx(Copy, { size: 12 }) })] }));
}
function PhraseSection({ section, open, onToggle }) {
    return (_jsxs("div", { className: "phrase-section", children: [_jsxs("button", { className: "phrase-section-head", onClick: onToggle, children: [_jsx("span", { className: "phrase-emoji", children: section.emoji }), _jsxs("div", { className: "phrase-section-title", children: [_jsx("strong", { children: section.title }), _jsxs("span", { children: [section.items.length, " frasi"] })] }), _jsx(ChevronDown, { size: 18, className: `chev ${open ? "chev-open" : ""}` })] }), open && _jsx("div", { className: "phrase-list", children: section.items.map((item, i) => _jsx(PhraseRow, { item: item }, `${section.id}-${i}`)) })] }));
}
function pickVoice(lang) {
    if (typeof window === "undefined" || !window.speechSynthesis)
        return null;
    const voices = window.speechSynthesis.getVoices();
    const want = lang === "it" ? /^it/i : /^es/i;
    const pool = voices.filter((v) => want.test(v.lang || ""));
    if (lang === "it") {
        return pool.find((v) => /IT|Italy|Ital/i.test(`${v.name} ${v.lang}`))
            || pool.find((v) => v.localService)
            || pool[0]
            || null;
    }
    return pool.find((v) => /ES|Spain|Spagnol|Spanish|Espa/i.test(`${v.name} ${v.lang}`))
        || pool.find((v) => v.localService)
        || pool[0]
        || null;
}
function pickSpanishVoice() {
    return pickVoice("es");
}
function speakWithSynth(text, hooks = {}, lang = "es") {
    if (typeof window === "undefined" || !window.speechSynthesis)
        return Promise.reject(new Error("no_synth"));
    const say = String(text || "").trim().slice(0, 400);
    return new Promise((resolve, reject) => {
        const synth = window.speechSynthesis;
        let done = false;
        const finish = (ok, err) => {
            if (done)
                return;
            done = true;
            if (ok) {
                hooks.onend?.();
                resolve();
            }
            else {
                hooks.onerror?.(err);
                reject(err || new Error("speech_failed"));
            }
        };
        const startSpeak = () => {
            synth.cancel();
            const utterance = new SpeechSynthesisUtterance(say);
            const voice = pickVoice(lang);
            if (voice) {
                utterance.voice = voice;
                utterance.lang = voice.lang;
            }
            else {
                utterance.lang = lang === "it" ? "it-IT" : "es-ES";
            }
            utterance.rate = 0.95;
            utterance.onstart = () => hooks.onstart?.();
            utterance.onend = () => finish(true);
            utterance.onerror = (e) => finish(false, e);
            synth.speak(utterance);
            if (synth.paused)
                synth.resume();
        };
        const voices = synth.getVoices();
        if (voices.length) {
            startSpeak();
            return;
        }
        const onVoices = () => {
            synth.removeEventListener("voiceschanged", onVoices);
            startSpeak();
        };
        synth.addEventListener("voiceschanged", onVoices);
        window.setTimeout(() => {
            synth.removeEventListener("voiceschanged", onVoices);
            if (!done)
                startSpeak();
        }, 300);
    });
}
let palmaAudioCtx = null;
function unlockPalmaAudio() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx)
            return;
        if (!palmaAudioCtx)
            palmaAudioCtx = new Ctx();
        if (palmaAudioCtx.state === "suspended")
            void palmaAudioCtx.resume();
    }
    catch { }
}
async function playSpeechAudio(text, lang, hooks = {}) {
    const say = String(text || "").trim().slice(0, 200);
    if (!say)
        throw new Error("empty");
    hooks.onstart?.();
    const r = await fetch(`/api/speak?text=${encodeURIComponent(say)}&lang=${lang === "it" ? "it" : "es"}`, { credentials: "same-origin" });
    if (!r.ok)
        throw new Error("speak_api_failed");
    const buf = await r.arrayBuffer();
    if (!buf.byteLength)
        throw new Error("speak_empty");
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx && palmaAudioCtx) {
        try {
            if (palmaAudioCtx.state === "suspended")
                await palmaAudioCtx.resume();
            const audioBuffer = await palmaAudioCtx.decodeAudioData(buf.slice(0));
            await new Promise((resolve, reject) => {
                const source = palmaAudioCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(palmaAudioCtx.destination);
                source.onended = () => {
                    hooks.onend?.();
                    resolve();
                };
                source.onerror = (e) => {
                    hooks.onerror?.(e);
                    reject(e);
                };
                source.start(0);
            });
            return;
        }
        catch {
            /* fall through to HTMLAudioElement */
        }
    }
    const blob = new Blob([buf], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.preload = "auto";
    try {
        await audio.play();
        await new Promise((resolve, reject) => {
            audio.onended = () => resolve();
            audio.onerror = (e) => reject(e);
        });
        hooks.onend?.();
    }
    catch (e) {
        hooks.onerror?.(e);
        throw e;
    }
    finally {
        URL.revokeObjectURL(url);
    }
}
async function playSpanishAudio(text, hooks = {}) {
    return playSpeechAudio(text, "es", hooks);
}
function speakText(text, lang, hooks = {}) {
    const say = String(text || "").trim().slice(0, 400);
    if (!say)
        return Promise.reject(new Error("empty"));
    const voiceLang = lang === "it" ? "it" : "es";
    return playSpeechAudio(say, voiceLang, hooks).catch(() => speakWithSynth(say, hooks, voiceLang));
}
function speakSpanishText(text, hooks = {}) {
    return speakText(text, "es", hooks);
}
async function compressTranslatePhoto(file) {
    const bitmap = await createImageBitmap(file);
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height, 1));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
    bitmap.close?.();
    const blob = await new Promise((resolve, reject) => canvas.toBlob((b) => b ? resolve(b) : reject(new Error("compress_failed")), "image/jpeg", 0.86));
    return blob;
}
async function blobToBase64(blob) {
    const buf = await blob.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 8192)
        bin += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return btoa(bin);
}
function PhraseTranslator() {
    const [direction, setDirection] = useState("it-es");
    const [input, setInput] = useState("");
    const [result, setResult] = useState("");
    const [detectedText, setDetectedText] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [speaking, setSpeaking] = useState(false);
    const [speakError, setSpeakError] = useState("");
    const fileRef = useRef(null);
    const photoUrlRef = useRef("");
    const isItEs = direction === "it-es";
    const resultLang = isItEs ? "es" : "it";
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis)
            return;
        const warm = () => { window.speechSynthesis.getVoices(); };
        warm();
        window.speechSynthesis.addEventListener("voiceschanged", warm);
        return () => {
            window.speechSynthesis.removeEventListener("voiceschanged", warm);
            window.speechSynthesis.cancel();
            if (photoUrlRef.current) {
                URL.revokeObjectURL(photoUrlRef.current);
                photoUrlRef.current = "";
            }
        };
    }, []);
    const clearPhotoPreview = () => {
        if (photoUrlRef.current) {
            URL.revokeObjectURL(photoUrlRef.current);
            photoUrlRef.current = "";
        }
        setPhotoPreview("");
    };
    const reset = () => {
        if (typeof window !== "undefined" && window.speechSynthesis)
            window.speechSynthesis.cancel();
        setInput("");
        setResult("");
        setDetectedText("");
        clearPhotoPreview();
        setError("");
        setSpeakError("");
        setCopied(false);
        setSpeaking(false);
        setLoading(false);
    };
    const switchDirection = (next) => {
        if (next === direction)
            return;
        reset();
        setDirection(next);
    };
    const translate = async () => {
        const text = input.trim();
        if (!text || loading)
            return;
        setLoading(true);
        setError("");
        setResult("");
        setDetectedText("");
        clearPhotoPreview();
        if (typeof window !== "undefined" && window.speechSynthesis)
            window.speechSynthesis.cancel();
        setSpeaking(false);
        try {
            const code = localStorage.getItem("palma2026-trip-code") || "";
            const r = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ text, direction, code }),
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok || !d?.translation)
                throw new Error(d?.error || "translate_failed");
            setResult(String(d.translation).trim());
        }
        catch {
            setError("Traduzione non disponibile al momento. Controlla la connessione e riprova.");
        }
        finally {
            setLoading(false);
        }
    };
    const translatePhoto = async (file) => {
        if (!file || loading)
            return;
        setLoading(true);
        setError("");
        setResult("");
        setDetectedText("");
        setInput("");
        if (typeof window !== "undefined" && window.speechSynthesis)
            window.speechSynthesis.cancel();
        setSpeaking(false);
        try {
            const blob = await compressTranslatePhoto(file);
            const image = await blobToBase64(blob);
            const code = localStorage.getItem("palma2026-trip-code") || "";
            const r = await fetch("/api/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "same-origin",
                body: JSON.stringify({ image, mimeType: "image/jpeg", direction, code }),
            });
            const d = await r.json().catch(() => ({}));
            if (!r.ok || !d?.translation) {
                if (d?.error === "image_translate_unavailable")
                    throw new Error("photo_no_gemini");
                throw new Error(d?.error || "translate_failed");
            }
            const detected = String(d.detected || "").trim();
            if (detected)
                setDetectedText(detected);
            setInput(detected);
            setResult(String(d.translation).trim());
            clearPhotoPreview();
            if (photoUrlRef.current)
                URL.revokeObjectURL(photoUrlRef.current);
            photoUrlRef.current = URL.createObjectURL(file);
            setPhotoPreview(photoUrlRef.current);
        }
        catch (e) {
            if (e?.message === "photo_no_gemini")
                setError("Per tradurre dalle foto serve la chiave Gemini configurata su Vercel.");
            else
                setError("Non sono riuscito a leggere la foto. Prova con più luce, testo più grande o scrivi a mano.");
        }
        finally {
            setLoading(false);
        }
    };
    const onPhotoPick = (e) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (file)
            void translatePhoto(file);
    };
    const copy = async () => {
        if (!result)
            return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
        catch { }
    };
    const speak = () => {
        if (!result)
            return;
        setSpeakError("");
        unlockPalmaAudio();
        speakText(result, resultLang, {
            onstart: () => setSpeaking(true),
            onend: () => setSpeaking(false),
            onerror: () => setSpeaking(false),
        }).catch(() => {
            setSpeaking(false);
            setSpeakError("Impossibile riprodurre l'audio. Controlla volume e modalità silenziosa del telefono.");
        });
    };
    const canReset = !!(input.trim() || result || error || photoPreview || detectedText);
    return (_jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Languages, { size: 16 }), " Traduci al volo"] }), _jsx("p", { className: "micro-note", children: "Traduci testo o foto tra italiano e spagnolo. Utile per menu, cartelli e conversazioni." }), _jsxs("div", { className: "phrase-direction-toggle", children: [_jsxs("button", { type: "button", className: `phrase-direction-btn ${isItEs ? "active" : ""}`, onClick: () => switchDirection("it-es"), children: [_jsx(ArrowRight, { size: 13 }), " IT \u2192 ES"] }), _jsxs("button", { type: "button", className: `phrase-direction-btn ${!isItEs ? "active" : ""}`, onClick: () => switchDirection("es-it"), children: [_jsx(ArrowLeftRight, { size: 13 }), " ES \u2192 IT"] })] }), _jsx("textarea", { className: "phrase-translate-input", rows: 3, value: input, onChange: (e) => setInput(e.target.value), onKeyDown: (e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                                    translate(); }, placeholder: isItEs ? "Es. Vorrei due birre e un'insalata, per favore" : "Ej. ¿Cuánto cuesta esto?" }), _jsxs("div", { className: "phrase-translate-actions", children: [_jsxs("button", { type: "button", className: "pill pill-accent", disabled: !input.trim() || loading, onClick: translate, children: [loading ? _jsx(RefreshCw, { size: 13, className: "spin-icon" }) : _jsx(Languages, { size: 13 }), " ", loading ? "Traduco\u2026" : "Traduci"] }), _jsxs("button", { type: "button", className: "pill", disabled: loading, onClick: () => fileRef.current?.click(), children: [_jsx(Camera, { size: 13 }), " ", loading ? "Leggo\u2026" : "Foto"] }), _jsx("input", { ref: fileRef, type: "file", accept: "image/*", capture: "environment", className: "phrase-photo-input", onChange: onPhotoPick }), result && _jsxs("button", { type: "button", className: "pill", onClick: copy, children: [copied ? _jsx(Check, { size: 13 }) : _jsx(Copy, { size: 13 }), " ", copied ? "Copiato" : "Copia"] }), result && _jsxs("button", { type: "button", className: `pill ${speaking ? "pill-speaking" : ""}`, onClick: speak, children: [_jsx(Volume2, { size: 13 }), " ", speaking ? "In riproduzione\u2026" : "Ascolta"] }), canReset && _jsxs("button", { type: "button", className: "pill", onClick: reset, disabled: loading, children: [_jsx(RefreshCw, { size: 13 }), " Ripristina"] })] }), photoPreview && (_jsxs("div", { className: "phrase-photo-preview", children: [_jsx(ImageIcon, { size: 14 }), _jsx("img", { src: photoPreview, alt: "Foto analizzata" })] })), detectedText && (_jsxs("div", { className: "phrase-translate-detected", children: [_jsx("span", { className: "phrase-translate-label", children: isItEs ? "Letto nella foto" : "Testo rilevato" }), _jsx("div", { className: "phrase-it", children: detectedText })] })), result && (_jsxs("div", { className: "phrase-translate-result", children: [_jsx("span", { className: "phrase-translate-label", children: isItEs ? "In spagnolo" : "In italiano" }), _jsx("div", { className: "phrase-es", children: result })] })), speakError && _jsx("p", { className: "phrase-translate-error", children: speakError }), error && _jsx("p", { className: "phrase-translate-error", children: error })] }));
}
function LinguaTab() {
    const [query, setQuery] = useState("");
    const [openId, setOpenId] = useState("saluti");
    const q = query.trim().toLowerCase();
    const sections = q ? PHRASE_SECTIONS.map((s) => ({ ...s, items: s.items.filter((it) => it.it.toLowerCase().includes(q) || it.es.toLowerCase().includes(q) || (it.note || "").toLowerCase().includes(q)) })).filter((s) => s.items.length) : PHRASE_SECTIONS;
    return (_jsxs("div", { className: "tab-panel", children: [_jsx(PhraseTranslator, {}), _jsxs("div", { className: "card", children: [_jsxs("h3", { className: "card-title", children: [_jsx(Languages, { size: 16 }), " Frasi pronte"] }), _jsx("p", { className: "shared-note", children: "Frasi utili per negozi, ristoranti e conversazioni quotidiane a Maiorca. Tocca una sezione per aprirla e usa il pulsante copia per la frase in spagnolo." }), _jsx("input", { className: "phrase-search", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Cerca una parola o frase\u2026" }), _jsx("p", { className: "micro-note", children: "A Maiorca si parla spagnolo; in alcune zone sentirai anche il catal\u00E0/mallorqu\u00ED. Per i turisti lo spagnolo va benissimo." })] }), sections.length === 0 && _jsx("div", { className: "card", children: _jsx("p", { className: "empty-note", children: "Nessuna frase trovata. Prova con un'altra parola." }) }), sections.map((section) => (_jsx(PhraseSection, { section: section, open: openId === section.id, onToggle: () => setOpenId((id) => id === section.id ? "" : section.id) }, section.id)))] }));
}
async function boardRequest(action,payload={}) {
 const code=localStorage.getItem("palma2026-trip-code")||"";if(!code)return{notes:[]};
 const r=await fetch("/api/board",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({action,code,...payload})});const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error||`board_${r.status}`);return d}
async function boardLoad(){try{return(await boardRequest("list")).notes||[]}catch{return[]}}

const TABS = [
    { id: "oggi", label: "Oggi", icon: Sparkles },
    { id: "programma", label: "Programma", icon: Calendar },
    { id: "meteo", label: "Meteo", icon: CloudSun },
    { id: "bagaglio", label: "Bagaglio", icon: Luggage },
    { id: "imbarco", label: "Imbarco", icon: Ticket },
    { id: "spese", label: "Spese", icon: Wallet },
    { id: "casa", label: "Casa", icon: Home },
    { id: "mappa", label: "Mappa", icon: MapPin },
    { id: "lingua", label: "Lingua", icon: Languages },
    { id: "ricordi", label: "Ricordi", icon: Waves },
    { id: "info", label: "Info", icon: ListChecks },
];
function App() {
    const [activeTab, setActiveTab] = useState("oggi");
    useEffect(() => { if (activeTab === "ricordi") { window.dispatchEvent(new Event("palma-open-circle")); setActiveTab("oggi"); } }, [activeTab]);
    const [loaded, setLoaded] = useState(false);
    const [profile, setProfileState] = useState("");
    const [checkState, setCheckState] = useState({});
    const [customPacking, setCustomPacking] = useState({});
    const [packingLists, setPackingListsState] = useState(null);
    const [boarding, setBoarding] = useState({});
    const [settings, setSettings] = useState({ persone: 5, valigie: 4 });
    const [overrides, setOverridesState] = useState({});
    const [people, setPeopleState] = useState([]);
    const [expenses, setExpensesState] = useState([]);
    const [transfers, setTransfersState] = useState([]);
    const [settlementEntries, setSettlementEntriesState] = useState([]);
    const [shoppingItems, setShoppingItemsState] = useState(DEFAULT_SHOPPING);
    const [logistics, setLogisticsState] = useState({});
    const [groupNotes, setGroupNotesState] = useState([]);
    const { weather, weatherUpdatedAt, weatherLoading, weatherError, refreshWeather } = useMallorcaWeather();
    const remoteKeysRef = useRef(new Set());
    useEffect(() => {
        (async () => {
            const [p, cs, cp, pl, bd, st, ov, pe, ex, tr, se, sh, lg, gn] = await Promise.all([
                loadJSON("palma2026-profile", "", false),
                loadJSON("palma2026-checklist", {}, false),
                loadJSON("palma2026-packing-custom", {}, false),
                loadJSON("palma2026-packing-lists", null, false),
                loadJSON("palma2026-boarding", {}, false),
                loadJSON("palma2026-settings", { persone: 5, valigie: 4 }, false),
                loadJSON("palma2026-itinerary", {}, true),
                loadJSON("palma2026-people", [], true),
                loadJSON("palma2026-expenses", [], true),
                loadJSON("palma2026-transfers", [], true),
                loadJSON("palma2026-settlement-entries", [], true),
                loadJSON("palma2026-shopping", DEFAULT_SHOPPING, true),
                loadJSON("palma2026-logistics", {}, true),
                boardLoad(),
            ]);
            setProfileState(p);
            setCheckState(cs);
            setCustomPacking(cp);
            setPackingListsState({ ...Object.fromEntries(Object.entries(PACKING_DEFAULT).map(([cat, arr]) => [cat, [...arr, ...(cp?.[cat] || [])]])), __preDeparture: PRE_DEPARTURE.map((it) => ({ ...it })), ...(pl || {}) });
            setBoarding(bd);
            setSettings({ persone: 5, valigie: 4, completedCosts: {}, ...(st || {}), completedCosts: { ...(st?.completedCosts || {}) } });
            setOverridesState(ov);
            setPeopleState(pe);
            setExpensesState((ex || []).filter((e) => !["gita in barca", "barca"].includes(String(e?.description || "").trim().toLowerCase())));
            setTransfersState(tr);
            setSettlementEntriesState(se || []);
            setShoppingItemsState(sh);
            setLogisticsState(lg);
            setGroupNotesState(gn);
            setLoaded(true);
        })();
    }, []);
    useEffect(() => { if (loaded)
        saveJSON("palma2026-profile", profile, false); }, [profile, loaded]);
    useEffect(() => { if (loaded)
        saveJSON("palma2026-checklist", checkState, false); }, [checkState, loaded]);
    useEffect(() => { if (loaded)
        saveJSON("palma2026-packing-custom", customPacking, false); }, [customPacking, loaded]);
    useEffect(() => { if (loaded && packingLists)
        saveJSON("palma2026-packing-lists", packingLists, false); }, [packingLists, loaded]);
    useEffect(() => { if (loaded)
        saveJSON("palma2026-boarding", boarding, false); }, [boarding, loaded]);
    useEffect(() => { if (loaded)
        saveJSON("palma2026-settings", settings, false); }, [settings, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-itinerary"))
            return;
        saveJSON("palma2026-itinerary", overrides, true);
    }, [overrides, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-people"))
            return;
        saveJSON("palma2026-people", people, true);
    }, [people, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-expenses"))
            return;
        saveJSON("palma2026-expenses", expenses, true);
    }, [expenses, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-transfers"))
            return;
        saveJSON("palma2026-transfers", transfers, true);
    }, [transfers, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-settlement-entries"))
            return;
        saveJSON("palma2026-settlement-entries", settlementEntries, true);
    }, [settlementEntries, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-shopping"))
            return;
        saveJSON("palma2026-shopping", shoppingItems, true);
    }, [shoppingItems, loaded]);
    useEffect(() => {
        if (!loaded)
            return;
        if (remoteKeysRef.current.delete("palma2026-logistics"))
            return;
        saveJSON("palma2026-logistics", logistics, true);
    }, [logistics, loaded]);

    useEffect(() => {
        const onSharedChange = (event) => {
            const { key, value } = event.detail || {};
            if (!key)
                return;
            remoteKeysRef.current.add(key);
            if (key === "palma2026-itinerary")
                setOverridesState(value || {});
            else if (key === "palma2026-people")
                setPeopleState(value || []);
            else if (key === "palma2026-expenses")
                setExpensesState((value || []).filter((e) => !["gita in barca", "barca"].includes(String(e?.description || "").trim().toLowerCase())));
            else if (key === "palma2026-transfers")
                setTransfersState(value || []);
            else if (key === "palma2026-settlement-entries")
                setSettlementEntriesState(value || []);
            else if (key === "palma2026-shopping")
                setShoppingItemsState(value || []);
            else if (key === "palma2026-logistics")
                setLogisticsState(value || {});
            else if (key === "palma2026-group-notes")
                setGroupNotesState(value || []);
            else
                remoteKeysRef.current.delete(key);
        };
        window.addEventListener("palma-shared-change", onSharedChange);
        return () => window.removeEventListener("palma-shared-change", onSharedChange);
    }, []);
    useEffect(() => {
        if (loaded && profile && !people.includes(profile)) {
            setPeopleState((prev) => prev.includes(profile) ? prev : [...prev, profile]);
        }
    }, [profile, loaded]);
    const exportData = () => {
        const data = { exportedAt: new Date().toISOString(), trip: "Palma 2026", profile, checkState, customPacking, packingLists, boarding, settings, overrides, people, expenses, transfers, settlementEntries, shoppingItems, logistics, groupNotes };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `palma-2026-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const toggleCheck = (id) => setCheckState((s) => ({ ...s, [id]: !s[id] }));
    if (!loaded) {
        return _jsx("div", { className: "app-root", children: _jsx("div", { className: "loading", children: "Caricamento\u2026" }) });
    }
    return (_jsxs("div", { className: "app-root", children: [_jsx("style", { children: `
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,700;1,9..144,600&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@500;600&display=swap');
        :root {
          --sea:#123B4D; --turquoise:#3FA9AE; --sand:#EFE0BC; --terracotta:#C1523A; --foam:#FBF8F3; --ink:#17262B;
        }
        * { box-sizing: border-box; }
        .app-root { font-family:'Manrope',sans-serif; background:var(--foam); color:var(--ink); min-height:100vh; padding-bottom:calc(40px + env(safe-area-inset-bottom)); }
        .loading { padding:60px; text-align:center; font-family:'Fraunces',serif; color:var(--sea); }

        .hero { position:relative; background:linear-gradient(160deg,var(--sea) 0%,#1D5D6E 60%,var(--turquoise) 130%); color:var(--foam); padding:calc(36px + env(safe-area-inset-top)) 20px 22px; text-align:center; overflow:hidden; }
        .hero-refresh { position:absolute; top:calc(10px + env(safe-area-inset-top)); right:14px; z-index:2; width:40px; height:40px; border:1px solid rgba(255,255,255,.28); border-radius:12px; background:rgba(255,255,255,.14); color:var(--foam); display:inline-flex; align-items:center; justify-content:center; cursor:pointer; -webkit-tap-highlight-color:transparent; }
        .hero-refresh:active { transform:scale(.96); background:rgba(255,255,255,.22); }
        .hero-eyebrow { display:inline-flex; align-items:center; gap:6px; font-family:'IBM Plex Mono',monospace; font-size:12px; letter-spacing:.06em; text-transform:uppercase; background:rgba(255,255,255,.12); padding:5px 12px; border-radius:20px; margin-bottom:14px; }
        .hero-title { font-family:'Fraunces',serif; font-weight:700; font-size:clamp(30px,7vw,44px); margin:0 0 4px; letter-spacing:-.01em; }
        .hero-sub { margin:0; font-size:15px; opacity:.88; }
        .wave-wrap { margin:22px auto 4px; max-width:420px; }
        .wave-svg { width:100%; height:46px; display:block; }
        .wave-dot { fill:rgba(251,248,243,.4); }
        .dot-past { fill:var(--terracotta); }
        .dot-today { fill:var(--foam); }
        .dot-pulse { fill:none; stroke:var(--foam); stroke-width:1.5; opacity:.6; animation:pulse 2s ease-out infinite; transform-origin:center; }
        @keyframes pulse { 0%{r:5.5;opacity:.7;} 100%{r:13;opacity:0;} }
        .wave-labels { display:flex; justify-content:space-between; font-family:'IBM Plex Mono',monospace; font-size:10px; opacity:.55; padding:0 14px; }
        .wave-label.active { opacity:1; font-weight:700; color:var(--terracotta); }
        .hero-climate { display:inline-flex; align-items:center; gap:6px; font-size:12.5px; opacity:.8; margin-top:14px; }

        .profile-bar { display:flex; align-items:center; gap:8px; padding:10px 16px; background:white; border-bottom:1px solid rgba(18,59,77,.08); }
        .profile-chip { width:24px; height:24px; border-radius:50%; color:white; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .profile-name { font-weight:700; font-size:13.5px; flex:1; }
        .profile-edit { display:flex; align-items:center; gap:4px; border:none; background:none; font-size:12px; color:var(--turquoise); font-weight:600; cursor:pointer; }
        .profile-bar-edit { gap:10px; }
        .profile-input { flex:1; border:1.5px solid rgba(18,59,77,.15); border-radius:8px; padding:6px 10px; font-family:'Manrope',sans-serif; font-size:13.5px; }

        .tabs { display:flex; overflow-x:auto; gap:6px; padding:12px 16px 4px; position:sticky; top:0; background:var(--foam); z-index:10; border-bottom:1px solid rgba(23,38,43,.08); }
        .tab-btn { display:flex; align-items:center; gap:6px; white-space:nowrap; border:none; background:transparent; color:var(--ink); font-family:'Manrope',sans-serif; font-weight:600; font-size:13.5px; padding:9px 14px; border-radius:999px; cursor:pointer; opacity:.55; transition:all .15s ease; }
        .tab-btn.active { background:var(--sea); color:var(--foam); opacity:1; }

        .tab-panel { padding:16px; max-width:640px; margin:0 auto; display:flex; flex-direction:column; gap:14px; }
        .shared-note, .personal-note { font-size:12px; color:#6b7c82; background:rgba(63,169,174,.09); border-radius:10px; padding:8px 12px; margin:0; }
        .empty-note { font-size:13.5px; color:#6b7c82; margin:0; }

        .card { background:white; border-radius:16px; padding:16px 18px; box-shadow:0 1px 3px rgba(18,59,77,.08); border:1px solid rgba(18,59,77,.06); }
        .card-title { display:flex; align-items:center; gap:7px; font-family:'Fraunces',serif; font-weight:600; font-size:16px; margin:0 0 10px; color:var(--sea); }

        .day-card { background:white; border-radius:16px; overflow:hidden; border:1px solid rgba(18,59,77,.06); box-shadow:0 1px 3px rgba(18,59,77,.06); }
        .day-card-today { border:1.5px solid var(--terracotta); }
        .day-head { width:100%; display:flex; align-items:center; gap:12px; background:none; border:none; padding:14px 16px; cursor:pointer; text-align:left; }
        .day-num { font-family:'IBM Plex Mono',monospace; font-weight:600; font-size:13px; color:var(--turquoise); background:rgba(63,169,174,.12); border-radius:8px; padding:6px 8px; min-width:30px; text-align:center; }
        .day-headtext { flex:1; }
        .day-weekday { font-size:12px; text-transform:uppercase; letter-spacing:.05em; color:var(--terracotta); font-weight:700; display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .day-title { font-family:'Fraunces',serif; font-weight:600; font-size:17px; margin-top:2px; }
        .badge { font-family:'Manrope',sans-serif; font-size:10px; font-weight:700; background:var(--sea); color:var(--foam); border-radius:20px; padding:2px 8px; text-transform:none; letter-spacing:0; }
        .badge-today { background:var(--terracotta); }
        .badge-edited { background:var(--turquoise); }
        .chev { transition:transform .2s ease; color:var(--sea); opacity:.5; flex-shrink:0; }
        .chev-open { transform:rotate(180deg); }
        .day-body { padding:0 16px 16px 58px; }
        .day-items { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px; }
        .day-items li { display:flex; align-items:flex-start; gap:8px; font-size:14px; line-height:1.4; }
        .dot-bullet { width:6px; height:6px; border-radius:50%; background:var(--turquoise); margin-top:7px; flex-shrink:0; }
        .day-note { font-size:13px; font-style:italic; opacity:.65; margin:10px 0 0; }
        .edit-toggle { display:inline-flex; align-items:center; gap:5px; border:none; background:none; color:var(--turquoise); font-weight:600; font-size:12.5px; margin-top:12px; cursor:pointer; padding:0; }

        .pill-row { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
        .pill { display:inline-flex; align-items:center; gap:5px; font-size:12.5px; font-weight:600; text-decoration:none; color:var(--sea); background:rgba(18,59,77,.06); border:none; border-radius:999px; padding:6px 12px; cursor:pointer; font-family:'Manrope',sans-serif; }
        .pill-accent { background:var(--terracotta); color:white; }
        .pill-accent:disabled { opacity:.4; cursor:not-allowed; }
        .pill-ghost { background:none; color:#9aa8ac; }

        .edit-form { display:flex; flex-direction:column; gap:12px; }
        .edit-label { display:flex; flex-direction:column; gap:5px; font-size:12.5px; font-weight:600; color:var(--sea); }
        .edit-label input, .edit-label textarea, .edit-label select { font-family:'Manrope',sans-serif; font-size:13.5px; border:1.5px solid rgba(18,59,77,.15); border-radius:10px; padding:8px 10px; color:var(--ink); resize:vertical; }
        .edit-actions { display:flex; gap:8px; flex-wrap:wrap; }

        .field-row { display:flex; gap:14px; flex-wrap:wrap; }
        .field-row label { display:flex; flex-direction:column; gap:5px; font-size:12.5px; font-weight:600; color:var(--sea); flex:1; min-width:140px; }
        .field-row input { font-family:'IBM Plex Mono',monospace; font-size:16px; font-weight:600; border:1.5px solid rgba(18,59,77,.15); border-radius:10px; padding:8px 10px; color:var(--ink); }
        .base-per-person { font-family:'Fraunces',serif; font-size:26px; font-weight:700; color:var(--terracotta); margin:10px 0; }
        .base-per-person-label { font-family:'Manrope',sans-serif; font-size:12px; font-weight:600; color:#6b7c82; }
        .cost-table { width:100%; border-collapse:collapse; font-size:14px; }
        .cost-table td { padding:8px 0; border-bottom:1px solid rgba(18,59,77,.07); }
        .cost-detail { color:#6b7c82; font-family:'IBM Plex Mono',monospace; font-size:12.5px; text-align:right; }
        .cost-total { text-align:right; font-weight:700; font-family:'IBM Plex Mono',monospace; }
        .cost-grand { color:var(--terracotta); font-size:17px; }
        .cost-table tfoot td { border-bottom:none; padding-top:12px; font-weight:700; }
        .cost-status { text-align:right; padding-left:8px !important; }
        .cost-complete-btn { border:1px solid rgba(18,59,77,.10); background:#fff; color:var(--sea); border-radius:999px; padding:5px 8px; display:inline-flex; align-items:center; gap:4px; font:700 10px 'Manrope',sans-serif; white-space:nowrap; cursor:pointer; }
        .cost-complete-btn.done { background:rgba(76,140,74,.12); color:#416f40; border-color:rgba(76,140,74,.16); }
        .cost-row-done td:first-child { text-decoration:line-through; opacity:.55; }
        .packing-head-actions { display:flex; align-items:center; gap:7px; }
        .packing-reset { width:24px; height:24px; }
        .packing-inline-edit { display:flex; align-items:center; gap:6px; flex:1; }
        .packing-inline-edit input { min-width:0; flex:1; border:1.5px solid rgba(18,59,77,.15); border-radius:9px; padding:7px 9px; font:500 13.5px 'Manrope',sans-serif; }
        .packing-editable li > .tiny-btn { opacity:.72; }

        .checklist-head { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .checklist-head .card-title { margin:0; }
        .progress-label { font-family:'IBM Plex Mono',monospace; font-size:12px; color:var(--turquoise); font-weight:600; }
        .progress-bar { height:5px; background:rgba(18,59,77,.08); border-radius:4px; overflow:hidden; margin-bottom:12px; }
        .progress-fill { height:100%; background:var(--turquoise); transition:width .3s ease; }
        .check-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px; }
        .check-list li { display:flex; align-items:center; justify-content:space-between; gap:8px; }
        .check-item { display:flex; align-items:center; gap:10px; font-size:14.5px; cursor:pointer; flex:1; }
        .check-item input { width:17px; height:17px; accent-color:var(--turquoise); flex-shrink:0; }
        .check-item .checked { text-decoration:line-through; opacity:.45; }
        .tiny-btn { border:none; background:rgba(18,59,77,.06); color:#6b7c82; border-radius:8px; width:26px; height:26px; display:flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .tiny-btn-accent { background:var(--turquoise); color:white; }
        .add-row { display:flex; gap:8px; margin-top:12px; }
        .add-row input { flex:1; border:1.5px solid rgba(18,59,77,.15); border-radius:10px; padding:7px 10px; font-family:'Manrope',sans-serif; font-size:13.5px; }

        .boarding-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .address-text { font-size:15.5px; font-weight:600; margin:0 0 12px; }
        .info-line { display:flex; align-items:center; gap:7px; font-size:13px; color:#566970; margin-top:12px; }

        .map-grid { display:flex; flex-direction:column; gap:8px; }
        .map-tile { display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--ink); background:rgba(63,169,174,.07); border-radius:12px; padding:10px 12px; }
        .map-tile svg { color:var(--terracotta); flex-shrink:0; }
        .map-tile-name { font-weight:700; font-size:14px; }
        .map-tile-day { font-size:11.5px; color:#6b7c82; font-family:'IBM Plex Mono',monospace; }

        .participant-chips { display:flex; flex-wrap:wrap; gap:8px; margin-top:6px; }
        .chip { border:1.5px solid rgba(18,59,77,.15); background:white; color:var(--ink); border-radius:999px; padding:6px 12px; font-size:12.5px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px; font-family:'Manrope',sans-serif; }
        .chip-on { color:white; border-color:transparent; }
        .chip-x { background:rgba(255,255,255,.3); border:none; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; }

        .expense-list { list-style:none; margin:0 0 12px; padding:0; display:flex; flex-direction:column; gap:10px; }
        .expense-row { display:flex; align-items:center; gap:10px; }
        .expense-avatar { width:30px; height:30px; border-radius:50%; color:white; font-weight:700; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .expense-main { flex:1; min-width:0; }
        .expense-desc { font-weight:700; font-size:14px; }
        .expense-meta { font-size:11.5px; color:#6b7c82; }
        .expense-amount { font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:14px; }
        .expense-lock { display:inline-flex; align-items:center; justify-content:center; width:30px; height:30px; color:#9aa8ac; opacity:.85; }
        .balance-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px; }
        .balance-row { display:flex; align-items:center; justify-content:space-between; gap:10px; font-size:13px; padding:8px 10px; border-radius:10px; background:rgba(18,59,77,.035); }
        .balance-names { display:inline-flex; align-items:center; gap:6px; }
        .balance-amt { font-family:'IBM Plex Mono',monospace; font-size:12.5px; font-weight:700; text-align:right; }
        .balance-credit { color:#1f7a5c; }
        .balance-debt { color:var(--terracotta); }
        .pill:disabled { opacity:.45; cursor:not-allowed; }
        .expense-total { text-align:right; font-size:13.5px; padding-top:10px; border-top:1px solid rgba(18,59,77,.08); }

        .settlement-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
        .settlement-row { display:flex; align-items:center; gap:8px; font-size:13.5px; flex-wrap:wrap; }
        .settlement-row-edit { padding:12px; border-radius:14px; background:rgba(18,59,77,.035); border:1px solid rgba(18,59,77,.06); }
        .settlement-row svg { color:#9aa8ac; flex-shrink:0; }
        .settlement-name { font-weight:700; }
        .settlement-amt { margin-left:auto; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--terracotta); }
        .settlement-amount-edit { display:inline-flex; align-items:center; gap:4px; margin-left:auto; font-family:'IBM Plex Mono',monospace; font-weight:700; color:var(--terracotta); }
        .settlement-amount-edit input { width:72px; border:1.5px solid rgba(18,59,77,.15); border-radius:10px; padding:6px 8px; font:inherit; text-align:right; background:#fff; }
        .settle-custom-tag { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--turquoise); background:rgba(40,120,135,.1); padding:2px 6px; border-radius:999px; }
        .settle-reset-link { margin-top:10px; border:none; background:none; color:var(--turquoise); font:600 12px 'Manrope',sans-serif; cursor:pointer; padding:0; text-decoration:underline; }
        .settle-row-reset { border:none; background:rgba(18,59,77,.06); color:var(--sea); width:28px; height:28px; border-radius:8px; display:inline-flex; align-items:center; justify-content:center; cursor:pointer; flex-shrink:0; }
        .settle-flag-group { display:flex; gap:6px; width:100%; }
        .settle-flag { display:inline-flex; align-items:center; justify-content:center; gap:4px; border:1px solid rgba(18,59,77,.12); border-radius:999px; padding:7px 10px; background:#fff; color:#5d6d73; font:700 11px 'Manrope',sans-serif; cursor:pointer; flex:1; }
        .settle-flag-on.active, .settle-flag-on:hover { background:rgba(76,140,74,.14); border-color:rgba(76,140,74,.25); color:#416f40; }
        .settle-flag-off.active, .settle-flag-off:hover { background:rgba(193,82,58,.10); border-color:rgba(193,82,58,.18); color:#9d3d2b; }
        .settle-summary-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .settle-summary { padding-top:14px; }
        .settle-summary-paid { background:linear-gradient(180deg,#fff 0%,rgba(76,140,74,.08) 100%); border-color:rgba(76,140,74,.14); }
        .settle-summary-pending { background:linear-gradient(180deg,#fff 0%,rgba(193,82,58,.07) 100%); border-color:rgba(193,82,58,.12); }
        .settle-summary-head { display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:10px; }
        .settle-summary-head h4 { display:flex; align-items:center; gap:6px; margin:0; font-size:14px; color:var(--sea); }
        .settle-summary-total { font-family:'IBM Plex Mono',monospace; font-weight:700; font-size:14px; color:var(--terracotta); }
        .settle-summary-list { display:flex; flex-direction:column; gap:8px; }
        .settle-summary-item { padding:10px; border-radius:12px; background:rgba(255,255,255,.72); border:1px solid rgba(18,59,77,.06); }
        .settle-summary-row { display:flex; align-items:center; justify-content:space-between; gap:8px; font-size:13px; }
        .settle-summary-people { display:flex; align-items:center; gap:6px; flex-wrap:wrap; font-weight:700; }
        .settle-summary-actions { display:flex; align-items:center; gap:6px; margin-top:8px; flex-wrap:wrap; }
        .settle-summary-date { font-size:10.5px; color:#718087; margin-right:auto; }
        .settle-btn { display:inline-flex; align-items:center; gap:4px; border:none; border-radius:999px; padding:5px 8px; background:rgba(76,140,74,.11); color:#416f40; font:700 10.5px 'Manrope',sans-serif; cursor:pointer; }
        .logistics-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

        .micro-note { font-size:11.5px; line-height:1.45; color:#718087; margin:10px 0 0; }
        .card-title-row { display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .card-title-row .card-title { margin-bottom:0; }
        .spin { animation:spin .8s linear infinite; }
        .today-card { background:linear-gradient(145deg,#fff 0%,rgba(63,169,174,.07) 100%); }
        .today-head { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; margin-bottom:12px; }
        .today-head h3 { font-family:'Fraunces',serif; color:var(--sea); font-size:21px; margin:2px 0 0; }
        .today-kicker { font-family:'IBM Plex Mono',monospace; font-size:10.5px; color:var(--terracotta); font-weight:700; letter-spacing:.08em; }
        .today-number { width:38px; height:38px; border-radius:12px; background:var(--sea); color:white; display:grid; place-items:center; font-family:'IBM Plex Mono',monospace; font-weight:700; }
        .day-items.compact { margin-bottom:14px; }
        .weather-mini { display:flex; align-items:center; gap:13px; flex-wrap:wrap; background:rgba(18,59,77,.05); padding:10px 12px; border-radius:12px; font-size:12px; }
        .weather-mini > div { display:flex; align-items:center; gap:4px; color:#5d6f76; }
        .weather-mini > div:first-of-type { flex-direction:column; align-items:flex-start; gap:0; color:var(--ink); margin-right:auto; }
        .weather-mini strong { font-size:18px; color:var(--sea); }
        .weather-mini span:not(.weather-emoji) { font-size:10.5px; }
        .weather-emoji { font-size:26px; }
        .weather-unavailable { font-size:12px; color:#7c898e; }
        .quick-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; margin-top:12px; }
        .quick-action { border:none; text-decoration:none; background:white; box-shadow:0 1px 3px rgba(18,59,77,.08); color:var(--sea); border-radius:12px; padding:11px; display:flex; align-items:center; gap:8px; font:700 12px 'Manrope',sans-serif; cursor:pointer; }
        .group-notes { display:flex; flex-direction:column; gap:8px; margin-bottom:10px; }
        .group-note { display:flex; align-items:flex-start; gap:8px; background:rgba(63,169,174,.07); border-radius:11px; padding:9px 10px; }
        .group-note-body { flex:1; display:flex; flex-direction:column; gap:2px; }
        .group-note-body strong { font-size:11px; color:var(--terracotta); }
        .group-note-body span { font-size:13px; line-height:1.35; }
        .weather-source { font-size:12.5px; line-height:1.5; color:#617078; margin:8px 0 0; }
        .weather-error, .weather-warning { display:flex; gap:7px; align-items:flex-start; border-radius:10px; padding:9px 10px; background:rgba(193,82,58,.1); color:#91412f; font-size:11.5px; margin-top:10px; }
        .weather-day-title { display:flex; align-items:center; gap:10px; }
        .weather-big-emoji { font-size:32px; }
        .weather-day-title > div:nth-child(2) { display:flex; flex-direction:column; flex:1; }
        .weather-day-title strong { font-size:14px; color:var(--sea); }
        .weather-day-title span { font-size:11.5px; color:#697a80; }
        .weather-temp { font-family:'Fraunces',serif; font-size:27px; font-weight:700; color:var(--terracotta); white-space:nowrap; }
        .weather-temp small { font:600 13px 'IBM Plex Mono',monospace; color:#7b8a8f; }
        .weather-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-top:13px; }
        .weather-stats > div { display:flex; flex-direction:column; align-items:center; gap:2px; background:rgba(18,59,77,.045); padding:9px 4px; border-radius:10px; }
        .weather-stats svg { color:var(--turquoise); }
        .weather-stats strong { font:700 13px 'IBM Plex Mono',monospace; }
        .weather-stats span { font-size:9.5px; color:#738187; }
        .sun-times { display:flex; justify-content:space-between; margin-top:10px; color:#718087; font-size:11px; }
        .sun-times span { display:flex; align-items:center; gap:5px; }
        .external-card { display:flex; align-items:center; gap:11px; text-decoration:none; color:var(--ink); }
        .external-card > div { display:flex; flex-direction:column; }
        .external-card strong { color:var(--sea); font-size:13.5px; }
        .external-card span { color:#718087; font-size:11px; }
        .status-card { display:flex; align-items:center; gap:7px; border-radius:12px; padding:9px 12px; font-size:11.5px; font-weight:700; }
        .status-card.online { background:rgba(76,140,74,.1); color:#416f40; }
        .status-card.offline { background:rgba(201,138,46,.13); color:#80621f; }
        .emergency-button { display:flex; align-items:center; gap:12px; text-decoration:none; background:rgba(193,82,58,.09); color:var(--terracotta); padding:12px; border-radius:12px; }
        .emergency-button > div { display:flex; flex-direction:column; }
        .emergency-button strong { font:700 22px 'IBM Plex Mono',monospace; }
        .emergency-button span { font-size:11px; color:#805548; }
        .link-list { display:flex; flex-direction:column; gap:8px; }
        .link-list a { display:flex; align-items:center; gap:10px; text-decoration:none; color:var(--sea); background:rgba(18,59,77,.045); padding:10px 11px; border-radius:11px; }
        .link-list a > span { flex:1; display:flex; flex-direction:column; }
        .link-list strong { font-size:13px; }
        .link-list small { color:#718087; font-size:10.5px; margin-top:1px; }

        .phrase-search { width:100%; margin-top:12px; border:1.5px solid rgba(18,59,77,.15); border-radius:12px; padding:11px 12px; font-size:16px; background:#fff; color:var(--ink); }
        .phrase-search:focus { outline:none; border-color:var(--turquoise); box-shadow:0 0 0 3px rgba(63,169,174,.12); }
        .phrase-section { background:white; border-radius:16px; border:1px solid rgba(18,59,77,.06); box-shadow:0 1px 3px rgba(18,59,77,.06); overflow:hidden; }
        .phrase-section-head { width:100%; display:flex; align-items:center; gap:12px; padding:14px 16px; border:none; background:none; text-align:left; cursor:pointer; }
        .phrase-emoji { font-size:22px; line-height:1; }
        .phrase-section-title { flex:1; display:flex; flex-direction:column; gap:2px; }
        .phrase-section-title strong { font-size:15px; color:var(--sea); }
        .phrase-section-title span { font-size:11.5px; color:#718087; }
        .phrase-list { border-top:1px solid rgba(18,59,77,.06); padding:4px 10px 10px; display:flex; flex-direction:column; gap:6px; }
        .phrase-row { display:flex; align-items:flex-start; gap:8px; padding:10px; border-radius:12px; background:rgba(18,59,77,.03); }
        .phrase-main { flex:1; min-width:0; }
        .phrase-it { font-size:12.5px; color:#6b7c82; margin-bottom:3px; }
        .phrase-es { font-size:15px; font-weight:700; color:var(--sea); line-height:1.35; }
        .phrase-note { font-size:11px; color:#8a979c; margin-top:4px; }
        .phrase-copy { flex:0 0 34px; width:34px; height:34px; }
        .phrase-translate-input { width:100%; margin-top:10px; border:1.5px solid rgba(18,59,77,.15); border-radius:12px; padding:11px 12px; font:500 16px 'Manrope',sans-serif; background:#fff; color:var(--ink); resize:vertical; min-height:84px; }
        .phrase-translate-input:focus { outline:none; border-color:var(--turquoise); box-shadow:0 0 0 3px rgba(63,169,174,.12); }
        .phrase-direction-toggle { display:flex; gap:8px; margin-top:10px; }
        .phrase-direction-btn { flex:1; display:inline-flex; align-items:center; justify-content:center; gap:6px; border:1.5px solid rgba(18,59,77,.14); background:#fff; color:var(--ink); border-radius:999px; padding:9px 10px; font:700 12.5px 'Manrope',sans-serif; cursor:pointer; }
        .phrase-direction-btn.active { background:rgba(63,169,174,.12); border-color:rgba(63,169,174,.35); color:var(--sea); }
        .phrase-photo-input { display:none; }
        .phrase-photo-preview { margin-top:10px; display:flex; align-items:center; gap:8px; padding:8px; border-radius:12px; background:rgba(18,59,77,.04); border:1px solid rgba(18,59,77,.08); }
        .phrase-photo-preview img { width:72px; height:72px; object-fit:cover; border-radius:8px; flex:0 0 72px; }
        .phrase-translate-detected { margin-top:10px; padding:10px 12px; border-radius:12px; background:rgba(18,59,77,.04); border:1px dashed rgba(18,59,77,.12); }
        .phrase-translate-actions { display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
        .pill-speaking { background:rgba(63,169,174,.14); color:var(--sea); border-color:rgba(63,169,174,.35); }
        .phrase-translate-result { margin-top:12px; padding:12px; border-radius:12px; background:rgba(63,169,174,.08); border:1px solid rgba(63,169,174,.15); }
        .phrase-translate-label { display:block; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.04em; color:var(--turquoise); margin-bottom:6px; }
        .phrase-translate-error { margin:10px 0 0; font-size:12.5px; color:#91412f; background:rgba(193,82,58,.1); border-radius:10px; padding:9px 10px; }
        .spin-icon { animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }

        @media (max-width:420px) { .boarding-grid, .logistics-grid { grid-template-columns:1fr; } .settlement-row { flex-wrap:wrap; } .settle-summary-grid { grid-template-columns:1fr; } }
        @media (prefers-reduced-motion: reduce) { .dot-pulse { animation:none; } }
      ` }), _jsx(Hero, {}), _jsx(ProfileBar, { profile: profile, setProfile: setProfileState }), _jsx("nav", { className: "tabs", children: TABS.map((t) => (_jsxs("button", { className: `tab-btn ${activeTab === t.id ? "active" : ""}`, onClick: () => setActiveTab(t.id), children: [_jsx(t.icon, { size: 15 }), " ", t.label] }, t.id))) }), activeTab === "oggi" && _jsx(DashboardTab, { weather: weather, notes: groupNotes, setNotes: setGroupNotesState, profile: profile, setActiveTab: setActiveTab, expenses: expenses, overrides: overrides }), activeTab === "programma" && _jsx(ProgrammaTab, { overrides: overrides, setOverrides: setOverridesState }), activeTab === "meteo" && _jsx(WeatherTab, { weather: weather, weatherUpdatedAt: weatherUpdatedAt, weatherLoading: weatherLoading, weatherError: weatherError, refreshWeather: refreshWeather }), activeTab === "bagaglio" && (_jsx(BagaglioTab, { checkState: checkState, toggleCheck: toggleCheck, customPacking: customPacking, setCustomPacking: setCustomPacking })), activeTab === "imbarco" && _jsx(ImbarcoTab, { boarding: boarding, setBoarding: setBoarding }), activeTab === "spese" && (_jsx(SpeseTab, { settings: settings, setSettings: setSettings, profile: profile || "Io", people: people, setPeople: setPeopleState, expenses: expenses, setExpenses: setExpensesState, transfers: transfers, setTransfers: setTransfersState, settlementEntries: settlementEntries, setSettlementEntries: setSettlementEntriesState })), activeTab === "casa" && _jsx(CasaTab, { checkState: checkState, toggleCheck: toggleCheck, shoppingItems: shoppingItems, setShoppingItems: setShoppingItemsState }), activeTab === "mappa" && _jsx(MappaTab, { overrides: overrides }), activeTab === "lingua" && _jsx(LinguaTab, {}), activeTab === "info" && _jsx(InfoTab, { exportData: exportData, logistics: logistics, setLogistics: setLogisticsState })] }));
}
const SUPABASE_URL = "https://cvdlzwralgtapsigyuko.supabase.co";
const TRIP_SLUG = "palma-2026";
const cloudConfigured = Boolean(SUPABASE_URL);
const SYNC_URL = cloudConfigured ? `${SUPABASE_URL}/functions/v1/trip-sync` : "";
let tripId = null;
let tripCode = null;
let pollTimer = null;
const sharedKeys = new Set();
const LOCAL_SHARED_PREFIX = "palma2026-shared-local:";
const CLOUD_CACHE_PREFIX = "palma2026-shared-cache:";
const PENDING_PREFIX = "palma2026-shared-pending:";
const TRIP_ID_KEY = "palma2026-trip-id";
const TRIP_CODE_KEY = "palma2026-trip-code";
function parseLocalValue(raw) {
    return raw == null ? null : { value: raw };
}
const cloudCacheKey = (key) => `${CLOUD_CACHE_PREFIX}${key}`;
const pendingKey = (key) => `${PENDING_PREFIX}${key}`;
async function syncRequest(payload) {
    if (!SYNC_URL)
        throw new Error("Supabase non è configurato.");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 12000);
    let response;
    try {
        response = await fetch(SYNC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ slug: TRIP_SLUG, code: tripCode, ...payload }),
            signal: controller.signal,
        });
    }
    catch (cause) {
        const error = new Error(cause?.name === "AbortError" ? "network_timeout" : "network_error");
        error.status = 0;
        error.isAuthFailure = false;
        throw error;
    }
    finally {
        window.clearTimeout(timeout);
    }
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const code = typeof data?.error === "string" ? data.error : `http_${response.status}`;
        const error = new Error(code);
        error.status = response.status;
        error.isAuthFailure = response.status === 401 || response.status === 403;
        throw error;
    }
    return data;
}
function isDefinitiveAccessError(error) {
    return error?.isAuthFailure === true || error?.status === 401 || error?.status === 403;
}
function dispatchRemoteChange(key, value) {
    if (value == null)
        localStorage.removeItem(cloudCacheKey(key));
    else
        localStorage.setItem(cloudCacheKey(key), JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("palma-shared-change", { detail: { key, value } }));
}
async function readCloudValue(key, dispatchIfChanged = false) {
    if (!tripCode || !navigator.onLine)
        return null;
    const data = await syncRequest({ op: "get", key });
    const nextRaw = data?.value == null ? null : JSON.stringify(data.value);
    const previousRaw = localStorage.getItem(cloudCacheKey(key));
    if (nextRaw == null)
        localStorage.removeItem(cloudCacheKey(key));
    else
        localStorage.setItem(cloudCacheKey(key), nextRaw);
    if (dispatchIfChanged && previousRaw !== nextRaw) {
        dispatchRemoteChange(key, data?.value ?? null);
    }
    return nextRaw;
}
async function writeCloudValue(key, value) {
    if (!tripCode)
        return false;
    let jsonValue = value;
    try {
        jsonValue = JSON.parse(value);
    }
    catch { }
    await syncRequest({ op: "set", key, value: jsonValue });
    return true;
}
async function flushPendingShared() {
    if (!tripCode || !navigator.onLine)
        return;
    const pending = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k?.startsWith(PENDING_PREFIX))
            continue;
        const value = localStorage.getItem(k);
        if (value != null)
            pending.push([k.slice(PENDING_PREFIX.length), value]);
    }
    for (const [key, value] of pending) {
        try {
            await writeCloudValue(key, value);
            localStorage.removeItem(pendingKey(key));
        }
        catch {
            break;
        }
    }
}
async function pollSharedKeys() {
    if (!tripCode || !navigator.onLine || document.visibilityState !== "visible")
        return;
    for (const key of [...sharedKeys]) {
        try {
            await readCloudValue(key, true);
        }
        catch {
            break;
        }
    }
}
function startPolling() {
    if (pollTimer != null)
        window.clearInterval(pollTimer);
    pollTimer = window.setInterval(() => { void pollSharedKeys(); }, 8000);
}
async function restoreCloudAccess() {
    if (!cloudConfigured)
        return null;
    const savedTripId = localStorage.getItem(TRIP_ID_KEY);
    const savedCode = localStorage.getItem(TRIP_CODE_KEY);
    if (!savedTripId || !savedCode)
        return null;
    tripId = savedTripId;
    tripCode = savedCode;
    if (!navigator.onLine) {
        startPolling();
        return tripId;
    }
    try {
        const data = await syncRequest({ op: "ping" });
        if (!data?.trip_id)
            throw new Error("invalid_trip_code");
        tripId = String(data.trip_id);
        localStorage.setItem(TRIP_ID_KEY, tripId);
        startPolling();
        void flushPendingShared();
        return tripId;
    }
    catch (error) {
        if (isDefinitiveAccessError(error)) {
            localStorage.removeItem(TRIP_ID_KEY);
            localStorage.removeItem(TRIP_CODE_KEY);
            tripId = null;
            tripCode = null;
            return null;
        }
        // A timeout, an unstable mobile connection or a temporary 5xx must not
        // sign the device out. Keep the validated local access and resync later.
        startPolling();
        return tripId;
    }
}
async function joinCloudTrip(code, _displayName) {
    if (!cloudConfigured)
        throw new Error("Supabase non è configurato.");
    tripCode = code.trim();
    if (!tripCode)
        throw new Error("invalid_trip_code");
    try {
        const data = await syncRequest({ op: "ping" });
        if (!data?.trip_id)
            throw new Error("invalid_trip_code");
        tripId = String(data.trip_id);
        localStorage.setItem(TRIP_ID_KEY, tripId);
        localStorage.setItem(TRIP_CODE_KEY, tripCode);
        startPolling();
        void flushPendingShared();
        return tripId;
    }
    catch (error) {
        tripId = null;
        tripCode = null;
        throw error;
    }
}
async function leaveCloudTrip() {
    if (pollTimer != null) {
        window.clearInterval(pollTimer);
        pollTimer = null;
    }
    localStorage.removeItem(TRIP_ID_KEY);
    localStorage.removeItem(TRIP_CODE_KEY);
    tripId = null;
    tripCode = null;
}
const storageBridge = {
    async get(key, shared = false) {
        if (!shared)
            return parseLocalValue(localStorage.getItem(key));
        sharedKeys.add(key);
        if (!cloudConfigured || !tripCode) {
            return parseLocalValue(localStorage.getItem(`${LOCAL_SHARED_PREFIX}${key}`));
        }
        try {
            const raw = await readCloudValue(key, false);
            return parseLocalValue(raw);
        }
        catch {
            return parseLocalValue(localStorage.getItem(cloudCacheKey(key)));
        }
    },
    async set(key, value, shared = false) {
        if (!shared) {
            localStorage.setItem(key, value);
            return;
        }
        sharedKeys.add(key);
        if (!cloudConfigured || !tripCode) {
            localStorage.setItem(`${LOCAL_SHARED_PREFIX}${key}`, value);
            return;
        }
        localStorage.setItem(cloudCacheKey(key), value);
        try {
            await writeCloudValue(key, value);
            localStorage.removeItem(pendingKey(key));
        }
        catch {
            localStorage.setItem(pendingKey(key), value);
        }
    },
};
if (typeof window !== "undefined") {
    window.addEventListener("online", () => {
        void flushPendingShared();
        void pollSharedKeys();
    });
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible")
            void pollSharedKeys();
    });
}
window.storage = storageBridge;
function AccessScreen({ onJoined }) {
    const [name, setName] = useState(() => localStorage.getItem("palma2026-profile-name-draft") || "");
    const [code, setCode] = useState(() => localStorage.getItem(TRIP_CODE_KEY) || "");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const join = async () => {
        if (!code.trim())
            return;
        setBusy(true);
        setError("");
        try {
            if (name.trim())
                localStorage.setItem("palma2026-profile-name-draft", name.trim());
            await joinCloudTrip(code.trim(), name.trim());
            if (name.trim()) {
                await storageBridge.set("palma2026-profile", JSON.stringify(name.trim()), false);
            }
            onJoined();
        }
        catch (e) {
            const raw = e?.message || "Impossibile entrare nel viaggio.";
            setError(raw.includes("invalid_trip_code") || raw.includes("unauthorized") ? "Codice viaggio non corretto." : "Connessione non disponibile. Riprova tra poco.");
        }
        finally {
            setBusy(false);
        }
    };
    return (_jsx("main", { className: "boot-shell", children: _jsxs("section", { className: "access-card", children: [_jsx("div", { className: "access-icon", children: _jsx(Plane, { size: 28 }) }), _jsx("div", { className: "access-kicker", children: "Palma \u00B7 1\u20139 settembre 2026" }), _jsx("h1", { children: "Entra nel viaggio" }), _jsx("p", { className: "access-copy", children: "Inserisci il codice del gruppo. Il programma e le spese saranno sincronizzati con gli altri partecipanti." }), _jsxs("label", { className: "boot-label", children: ["Il tuo nome", _jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Es. Andrea", autoComplete: "name" })] }), _jsxs("label", { className: "boot-label", children: ["Codice viaggio", _jsx("input", { value: code, onChange: (e) => setCode(e.target.value), onKeyDown: (e) => e.key === "Enter" && join(), placeholder: "Inserisci il codice", autoComplete: "off" })] }), error && _jsx("div", { className: "boot-error", children: error }), _jsxs("button", { className: "boot-primary", onClick: join, disabled: !code.trim() || busy, children: [_jsx(LockKeyhole, { size: 16 }), " ", busy ? "Accesso…" : "Entra"] }), _jsxs("div", { className: "boot-security", children: [_jsx(ShieldCheck, { size: 15 }), " Accesso protetto: il codice viene verificato sul server e il database non \u00E8 esposto direttamente."] }), _jsxs("div", { className: "boot-slug", children: ["Viaggio: ", TRIP_SLUG] })] }) }));
}
function Root() {
    const [state, setState] = useState(cloudConfigured ? "checking" : "ready");
    useEffect(() => {
        if (!cloudConfigured)
            return;
        let cancelled = false;
        (async () => {
            try {
                const restored = await restoreCloudAccess();
                if (!cancelled)
                    setState(restored ? "ready" : "locked");
            }
            catch {
                if (!cancelled)
                    setState("locked");
            }
        })();
        return () => { cancelled = true; };
    }, []);
    if (state === "checking") {
        return (_jsx("main", { className: "boot-shell", children: _jsxs("section", { className: "access-card access-card-center", children: [_jsx("div", { className: "boot-spinner" }), _jsx("h1", { children: "Palma 2026" }), _jsx("p", { className: "access-copy", children: "Collegamento al viaggio\u2026" })] }) }));
    }
    if (state === "locked")
        return _jsx(AccessScreen, { onJoined: () => setState("ready") });
    return (_jsxs(_Fragment, { children: [!cloudConfigured && (_jsxs("div", { className: "local-mode-banner", children: [_jsx(WifiOff, { size: 14 }), " Modalit\u00E0 locale: configura Supabase per condividere i dati."] })), _jsx(App, {})] }));
}
if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js?v=77", { updateViaCache: "none" }).catch(() => undefined);
    });
}
ReactDOM.createRoot(document.getElementById("root")).render(_jsx(React.StrictMode, { children: _jsx(Root, {}) }));
