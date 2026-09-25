import React, { useState, useEffect, useCallback } from "react";

const THEME = {
  bg: "#E6F1F6",
  card: "#BEDBE8",
  accent: "#679AB0",
  chip: "#D7E1E6",
  white: "#FFFFFF",
};

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

const SAMPLE_CLOSET = [
  { id: "1", name: "Waterproof jacket", category: "TOP", weatherTags: ["rainy", "drizzle", "thunderstorm"], daysSinceWorn: 21 },
  { id: "2", name: "Basic white tee", category: "TOP", weatherTags: ["clear", "partly cloudy"], daysSinceWorn: 2 },
  { id: "3", name: "Wool sweater", category: "TOP", weatherTags: ["cold", "overcast"], daysSinceWorn: 16 },
  { id: "4", name: "Jeans", category: "BOTTOM", weatherTags: ["clear", "mostly cloudy", "overcast"], daysSinceWorn: 4 },
  { id: "5", name: "Sandals", category: "SHOES", weatherTags: ["hot", "hot and humid"], daysSinceWorn: 18 },
  { id: "6", name: "Sneakers", category: "SHOES", weatherTags: ["clear", "partly cloudy", "mostly cloudy"], daysSinceWorn: 6 },
  { id: "7", name: "Rain boots", category: "SHOES", weatherTags: ["rainy", "drizzle"], daysSinceWorn: 25 },
  { id: "8", name: "Gold hoops", category: "JEWELRY", weatherTags: [], daysSinceWorn: 16 },
  { id: "9", name: "Straw tote", category: "BAG", weatherTags: [], daysSinceWorn: 9 },
];

const DEFAULT_PERSONAS = ["lowkey Sunday", "party", "brunch", "cultural", "business casual"];
const DEFAULT_LOCATION = { lat: 29.76, lon: -95.37, name: "Houston" };

// Full WMO weather code mapping, matching standard weather app language
function describeWeather(code, tempF, humidity) {
  const map = {
    0: { condition: "clear", label: "clear", icon: "☀️" },
    1: { condition: "mostly clear", label: "mostly clear", icon: "🌤️" },
    2: { condition: "partly cloudy", label: "partly cloudy", icon: "⛅" },
    3: { condition: "overcast", label: "cloudy", icon: "☁️" },
    45: { condition: "foggy", label: "foggy", icon: "🌫️" },
    48: { condition: "foggy", label: "foggy", icon: "🌫️" },
    51: { condition: "drizzle", label: "light drizzle", icon: "🌦️" },
    53: { condition: "drizzle", label: "drizzle", icon: "🌦️" },
    55: { condition: "drizzle", label: "heavy drizzle", icon: "🌦️" },
    61: { condition: "rainy", label: "light rain", icon: "🌧️" },
    63: { condition: "rainy", label: "rain", icon: "🌧️" },
    65: { condition: "rainy", label: "heavy rain", icon: "🌧️" },
    71: { condition: "snowy", label: "light snow", icon: "🌨️" },
    73: { condition: "snowy", label: "snow", icon: "🌨️" },
    75: { condition: "snowy", label: "heavy snow", icon: "❄️" },
    80: { condition: "rainy", label: "rain showers", icon: "🌦️" },
    81: { condition: "rainy", label: "rain showers", icon: "🌦️" },
    82: { condition: "rainy", label: "heavy rain showers", icon: "🌧️" },
    95: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" },
    96: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" },
    99: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" },
  };
  const base = map[code] || { condition: "clear", label: "clear", icon: "🌤️" };
  if (tempF >= 85 && humidity >= 60 && ["clear", "mostly clear", "partly cloudy"].includes(base.condition)) {
    return { condition: "hot and humid", label: "hot and humid", icon: "🌡️" };
  }
  if (tempF >= 90) return { ...base, condition: "hot", label: `hot, ${base.label}` };
  if (tempF <= 40) return { ...base, condition: "cold", label: `cold, ${base.label}` };
  return base;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Home({ preferences }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
  const [recentlyLogged, setRecentlyLogged] = useState([]);
  const [displayedItems, setDisplayedItems] = useState(SAMPLE_CLOSET.slice(0, 4));

  const fetchWeather = useCallback((lat, lon, locationName) => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=fahrenheit`
    )
      .then((res) => res.json())
      .then((data) => {
        const tempF = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const code = data.current.weather_code;
        setWeather({ tempF, humidity, ...describeWeather(code, tempF, humidity), locationName });
        setLoading(false);
      })
      .catch(() => {
        setWeather({ tempF: 72, humidity: 50, condition: "clear", label: "clear", icon: "🌤️", locationName });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    function getLocationAndFetch() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude, "your area"),
          () => fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name)
        );
      } else {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name);
      }
    }
    getLocationAndFetch();
    // Refresh weather every 15 minutes so it stays live, not just at page load
    const interval = setInterval(getLocationAndFetch, 15 * 60 * 1000);

    const saved = localStorage.getItem("fitcastLogs");
    if (saved) setRecentlyLogged(JSON.parse(saved).slice(-5).reverse());

    return () => clearInterval(interval);
  }, [fetchWeather]);

  function pickAnchorItem() {
    if (!weather) return null;
    const candidates = SAMPLE_CLOSET.filter((item) => item.weatherTags.includes(weather.condition));
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) => (a.daysSinceWorn > b.daysSinceWorn ? a : b));
  }

  function buildReasoningSentence(anchor) {
    if (!anchor) return "Here's an outfit pulled together for today.";
    const conditionText = weather.label.charAt(0).toUpperCase() + weather.label.slice(1) + " today";
    const verb = anchor.category === "SHOES" || anchor.category === "TOP" ? "wearing" : "pulling out";
    return `${conditionText}, so ${verb} your ${anchor.name.toLowerCase()} since it hasn't been worn in a while.`;
  }

  // Only flags something as "neglected" past a genuinely long stretch —
  // and never states the exact day count, to avoid sounding surveillance-y.
  function getFinishingTouches(anchor) {
    const NEGLECT_THRESHOLD_DAYS = 14;
    return SAMPLE_CLOSET.filter(
      (item) =>
        ["JEWELRY", "BAG", "BELT"].includes(item.category) &&
        item.daysSinceWorn >= NEGLECT_THRESHOLD_DAYS &&
        (!anchor || item.id !== anchor.id)
    )
      .slice(0, 2)
      .map((item) => ({ ...item, reason: "hasn't been worn in a while — would pair well with this look" }));
  }

  function swapItem(index) {
    const current = displayedItems[index];
    const sameCategory = SAMPLE_CLOSET.filter((i) => i.category === current.category && i.id !== current.id);
    if (sameCategory.length === 0) return;
    const next = sameCategory[Math.floor(Math.random() * sameCategory.length)];
    const updated = [...displayedItems];
    updated[index] = next;
    setDisplayedItems(updated);
  }

  function logOutfit() {
    const anchor = pickAnchorItem();
    const entry = { date: new Date().toISOString(), weather, anchorItem: anchor ? anchor.name : null, vibe: selectedVibe };
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push(entry);
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setRecentlyLogged(existing.slice(-5).reverse());
    alert("Outfit logged for today!");
  }

  function viewLoggedEntry(log) {
    if (!log) return;
    alert(`${new Date(log.date).toLocaleDateString()}: ${log.anchorItem || "outfit"}, ${log.weather?.label || ""}`);
  }

  function goToTab(tabName) {
    if (tabName === "Home") return;
    alert(`${tabName} screen — coming next, not built yet.`);
  }

  const anchor = pickAnchorItem();
  const finishingTouches = getFinishingTouches(anchor);
  const recentSlots = [...recentlyLogged, ...Array(Math.max(0, 5 - recentlyLogged.length)).fill(null)].slice(0, 5);

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 12px", display: "flex", alignItems: "center", gap: "12px" },
    avatar: { width: 44, height: 44, borderRadius: "50%", background: "#D9D9D9", flexShrink: 0 },
    dateText: { fontSize: "13px", color: "#5F5E5A", margin: 0, fontFamily: FONT },
    greeting: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: "2px 0 0", color: "#000" },
    card: { background: THEME.white, borderRadius: "16px", padding: "16px", margin: "8px 20px 16px" },
    weatherRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "13px", color: "#5F5E5A", fontFamily: FONT },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" },
    itemBoxWrap: { position: "relative" },
    itemBox: (isAnchor) => ({
      background: isAnchor ? THEME.chip : "#E4E4E0",
      border: isAnchor ? `1.5px solid ${THEME.accent}` : "none",
      borderRadius: "10px",
      height: "56px",
      width: "100%",
    }),
    refreshBtn: {
      position: "absolute",
      bottom: "3px",
      right: "3px",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "12px",
      padding: 0,
    },
    reasoning: { fontSize: "13px", color: "#173404", marginBottom: "12px", lineHeight: 1.5, fontFamily: FONT },
    button: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "11px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    finishingCard: { background: "#FAEEDA", borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    finishingLabel: { fontSize: "11px", color: "#854F0B", marginBottom: "8px", fontFamily: FONT },
    finishingItem: { fontSize: "12px", color: "#5C3A08", marginBottom: "6px", fontFamily: FONT },
    exploreCard: { background: THEME.card, borderRadius: "16px", padding: "16px", margin: "0 20px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", width: "calc(100% - 40px)" },
    exploreText: { fontSize: "13px", fontWeight: 600, color: "#173404", fontFamily: FONT },
    sectionLabel: { fontFamily: HEADING_FONT, fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 20px 10px" },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "0 20px 20px" },
    chip: (active) => ({ padding: "7px 13px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#333", fontSize: "12px", border: active ? "none" : "1px solid #D7E1E6", cursor: "pointer", fontFamily: FONT }),
    recentRow: { display: "flex", gap: "8px", margin: "0 20px 20px" },
    recentBox: { background: THEME.white, borderRadius: "10px", width: "48px", height: "48px", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2px", color: "#888780", border: "none", cursor: "pointer", fontFamily: FONT },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: THEME.card, display: "flex", justifyContent: "space-around", padding: "10px 0" },
    navItem: (active) => ({ display: "flex", flexDirection: "column", alignItems: "center", fontSize: "10px", color: active ? "#173404" : "#888780", fontWeight: active ? 600 : 400, background: "none", border: "none", cursor: "pointer", fontFamily: FONT }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.avatar} />
        <div>
          <p style={styles.dateText}>
            {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <p style={styles.greeting}>{getGreeting()}{preferences?.name ? `, ${preferences.name}` : ""}</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.weatherRow}>
          {loading ? <span>Loading weather...</span> : <span>{weather.icon} {weather.tempF}°F, {weather.label}</span>}
        </div>
        <div style={styles.grid}>
          {displayedItems.map((item, i) => (
            <div key={item.id} style={styles.itemBoxWrap}>
              <div style={styles.itemBox(anchor && anchor.id === item.id)} />
              <button style={styles.refreshBtn} onClick={() => swapItem(i)} title="Swap this item">🔄</button>
            </div>
          ))}
        </div>
        <p style={styles.reasoning}>{buildReasoningSentence(anchor)}</p>
        <button style={styles.button} onClick={logOutfit}>Log this outfit for today</button>
      </div>

      {finishingTouches.length > 0 && (
        <div style={styles.finishingCard}>
          <p style={styles.finishingLabel}>Finishing touches</p>
          {finishingTouches.map((item) => (
            <p key={item.id} style={styles.finishingItem}>Your {item.name.toLowerCase()} {item.reason}</p>
          ))}
        </div>
      )}

      <button style={styles.exploreCard} onClick={() => alert("Explore feed — building this as the next screen")}>
        <span style={styles.exploreText}>Explore outfit ideas</span>
        <span>→</span>
      </button>

      <p style={styles.sectionLabel}>What's the vibe today?</p>
      <div style={styles.chipRow}>
        {personas.map((p) => (
          <button key={p} style={styles.chip(selectedVibe === p)} onClick={() => setSelectedVibe(p)}>{p}</button>
        ))}
        <button
          style={styles.chip(false)}
          onClick={() => {
            const newVibe = prompt("Name this vibe:");
            if (newVibe) setPersonas([...personas, newVibe]);
          }}
        >
          + add
        </button>
      </div>

      <p style={styles.sectionLabel}>Recently logged</p>
      <div style={styles.recentRow}>
        {recentSlots.map((log, i) => (
          <button key={i} style={styles.recentBox} onClick={() => viewLoggedEntry(log)}>
            {log ? log.anchorItem || "logged" : ""}
          </button>
        ))}
      </div>

      <div style={styles.nav}>
        <button style={styles.navItem(true)} onClick={() => goToTab("Home")}>🏠<span>Home</span></button>
        <button style={styles.navItem(false)} onClick={() => goToTab("Closet")}>👗<span>Closet</span></button>
        <button style={styles.navItem(false)} onClick={() => goToTab("Capsule")}>🕐<span>Capsule</span></button>
        <button style={styles.navItem(false)} onClick={() => goToTab("Hook")}>💬<span>Hook</span></button>
        <button style={styles.navItem(false)} onClick={() => goToTab("Profile")}>👤<span>Profile</span></button>
      </div>
    </div>
  );
}