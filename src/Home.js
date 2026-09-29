import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";
import { buildOutfit } from "./outfitLogic";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";
const DEFAULT_PERSONAS = ["lowkey Sunday", "party", "brunch", "cultural", "business casual"];
const DEFAULT_LOCATION = { lat: 29.76, lon: -95.37, name: "Houston" };

function describeWeather(code, tempF, humidity) {
  const map = {
    0: { condition: "clear", label: "clear", icon: "☀️" }, 1: { condition: "mostly clear", label: "mostly clear", icon: "🌤️" },
    2: { condition: "partly cloudy", label: "partly cloudy", icon: "⛅" }, 3: { condition: "overcast", label: "cloudy", icon: "☁️" },
    45: { condition: "foggy", label: "foggy", icon: "🌫️" }, 48: { condition: "foggy", label: "foggy", icon: "🌫️" },
    51: { condition: "drizzle", label: "light drizzle", icon: "🌦️" }, 53: { condition: "drizzle", label: "drizzle", icon: "🌦️" }, 55: { condition: "drizzle", label: "heavy drizzle", icon: "🌦️" },
    61: { condition: "rainy", label: "light rain", icon: "🌧️" }, 63: { condition: "rainy", label: "rain", icon: "🌧️" }, 65: { condition: "rainy", label: "heavy rain", icon: "🌧️" },
    71: { condition: "snowy", label: "light snow", icon: "🌨️" }, 73: { condition: "snowy", label: "snow", icon: "🌨️" }, 75: { condition: "snowy", label: "heavy snow", icon: "❄️" },
    80: { condition: "rainy", label: "rain showers", icon: "🌦️" }, 81: { condition: "rainy", label: "rain showers", icon: "🌦️" }, 82: { condition: "rainy", label: "heavy rain showers", icon: "🌧️" },
    95: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" }, 96: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" }, 99: { condition: "thunderstorm", label: "thunderstorms", icon: "⛈️" },
  };
  const base = map[code] || { condition: "clear", label: "clear", icon: "🌤️" };
  if (tempF >= 85 && humidity >= 60 && (base.condition === "clear" || base.condition === "mostly clear" || base.condition === "partly cloudy")) return { condition: "hot and humid", label: "hot and humid", icon: "🌡️" };
  if (tempF >= 90) return Object.assign({}, base, { condition: "hot", label: "hot, " + base.label });
  if (tempF <= 40) return Object.assign({}, base, { condition: "cold", label: "cold, " + base.label });
  return base;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getHairstyleSuggestion(weather, prefs) {
  if (!prefs || !prefs.hairstyleSuggestionsEnabled || !weather) return null;
  const hasDetails = prefs.hairLength && prefs.hairTexture;
  const descriptor = hasDetails ? prefs.hairLength + ", " + prefs.hairTexture + " hair" : "your hair";
  if (weather.condition === "hot and humid" || weather.condition === "hot") return "It's warm out, so a loose bun or half-up style would help keep " + descriptor + " cool.";
  if (weather.condition === "rainy" || weather.condition === "drizzle" || weather.condition === "thunderstorm") return "Rain today, so a braid or low bun will hold up better than wearing " + descriptor + " down.";
  if (weather.condition === "foggy") return "Damp air today, so pulling " + descriptor + " back will help it hold up better.";
  return "Nice weather for wearing " + descriptor + " down or in soft waves today.";
}

export default function Home(props) {
  const preferences = props.preferences;
  const items = props.items;
  const goToTab = props.goToTab;
  const onWeatherLoaded = props.onWeatherLoaded;
  const THEME = useTheme();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
  const [recentlyLogged, setRecentlyLogged] = useState([]);
  const [manualPieces, setManualPieces] = useState(null);

  const fetchWeather = useCallback(function (lat, lon, locationName) {
    function applyWeather(w) { setWeather(w); setLoading(false); if (onWeatherLoaded) onWeatherLoaded(w); }
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=fahrenheit")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const tempF = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const code = data.current.weather_code;
        applyWeather(Object.assign({ tempF: tempF, humidity: humidity, locationName: locationName }, describeWeather(code, tempF, humidity)));
      })
      .catch(function () { applyWeather({ tempF: 72, humidity: 50, condition: "clear", label: "clear", icon: "🌤️", locationName: locationName }); });
  }, [onWeatherLoaded]);

  useEffect(function () {
    function getLocationAndFetch() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          function (pos) { fetchWeather(pos.coords.latitude, pos.coords.longitude, "your area"); },
          function () { fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name); }
        );
      } else {
        fetchWeather(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lon, DEFAULT_LOCATION.name);
      }
    }
    getLocationAndFetch();
    const interval = setInterval(getLocationAndFetch, 15 * 60 * 1000);
    const saved = localStorage.getItem("fitcastLogs");
    if (saved) setRecentlyLogged(JSON.parse(saved).slice(-5).reverse());
    return function () { clearInterval(interval); };
  }, [fetchWeather]);

  const built = useMemo(function () {
    return buildOutfit(items, weather, selectedVibe, preferences);
  }, [items, weather, selectedVibe, preferences]);

  useEffect(function () { setManualPieces(null); }, [selectedVibe, weather, items]);

  const pieces = manualPieces || built.pieces;
  const anchor = built.anchor;

  function buildReasoningSentence() {
    if (!anchor) return selectedVibe ? "Here's a pick for " + selectedVibe + "." : "Here's an outfit pulled together for today.";
    const conditionText = weather.label.charAt(0).toUpperCase() + weather.label.slice(1) + " today";
    const verb = anchor.category === "SHOES" || anchor.category === "TOP" ? "wearing" : "pulling out";
    return conditionText + ", so " + verb + " your " + anchor.name.toLowerCase() + " since it hasn't been worn in a while.";
  }

  function getFinishingTouches() {
    const NEGLECT_THRESHOLD_DAYS = 14;
    const pieceIds = pieces.map(function (p) { return p.id; });
    return items
      .filter(function (item) {
        const isAccessory = item.category === "JEWELRY" || item.category === "BAG" || item.category === "BELT";
        return isAccessory && item.daysSinceWorn >= NEGLECT_THRESHOLD_DAYS && pieceIds.indexOf(item.id) === -1;
      })
      .slice(0, 2)
      .map(function (item) { return Object.assign({}, item, { reason: "hasn't been worn in a while, and would pair well with this look" }); });
  }

  function swapItem(index) {
    const current = pieces[index];
    const otherIds = pieces.filter(function (_, i) { return i !== index; }).map(function (i2) { return i2.id; });
    const sameCategory = items.filter(function (i) { return i.category === current.category && i.id !== current.id && otherIds.indexOf(i.id) === -1; });
    if (sameCategory.length === 0) return;
    const next = sameCategory[Math.floor(Math.random() * sameCategory.length)];
    const updated = pieces.slice();
    updated[index] = next;
    setManualPieces(updated);
  }

  function logOutfit() {
    const entry = {
      date: new Date().toISOString(),
      weather: weather,
      anchorItem: anchor ? anchor.name : (pieces[0] ? pieces[0].name : null),
      vibe: selectedVibe,
      items: pieces.map(function (i) { return { name: i.name, photo: i.photo }; }),
    };
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push(entry);
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setRecentlyLogged(existing.slice(-5).reverse());
    alert("Outfit logged for today!");
  }

  function viewLoggedEntry(log) {
    if (!log) return;
    alert(new Date(log.date).toLocaleDateString() + ": " + (log.anchorItem || "outfit") + (log.weather ? ", " + log.weather.label : ""));
  }

  const finishingTouches = getFinishingTouches();
  const hairSuggestion = getHairstyleSuggestion(weather, preferences);
  const recentSlots = recentlyLogged.concat(Array(Math.max(0, 5 - recentlyLogged.length)).fill(null)).slice(0, 5);

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 12px", display: "flex", alignItems: "center", gap: "12px" },
    avatarImg: { width: 44, height: 44, borderRadius: "50%", objectFit: "cover" },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: "50%", background: "#D9D9D9" },
    dateText: { fontSize: "13px", color: "#5F5E5A", margin: 0, fontFamily: FONT },
    greeting: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: "2px 0 0", color: "#000" },
    card: { background: THEME.white, borderRadius: "16px", padding: "16px", margin: "8px 20px 16px" },
    weatherRow: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px", fontSize: "13px", color: "#5F5E5A", fontFamily: FONT },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))", gap: "8px", marginBottom: "12px" },
    itemBoxWrap: { position: "relative" },
    refreshBtn: { position: "absolute", bottom: "3px", right: "3px", background: "rgba(255,255,255,0.85)", border: "none", borderRadius: "50%", width: "20px", height: "20px", cursor: "pointer", fontSize: "11px", padding: 0 },
    reasoning: { fontSize: "13px", color: "#173404", marginBottom: "12px", lineHeight: 1.5, fontFamily: FONT },
    button: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "11px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    finishingCard: { background: "#FAEEDA", borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    finishingLabel: { fontSize: "11px", color: "#854F0B", marginBottom: "8px", fontFamily: FONT },
    finishingItem: { fontSize: "12px", color: "#5C3A08", marginBottom: "6px", fontFamily: FONT },
    hairCard: { background: THEME.chip, borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    hairLabel: { fontSize: "11px", color: "#5F5E5A", marginBottom: "8px", fontFamily: FONT },
    hairText: { fontSize: "12px", color: "#333", fontFamily: FONT, margin: 0 },
    exploreCard: { background: THEME.card, borderRadius: "16px", padding: "16px", margin: "0 20px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", width: "calc(100% - 40px)" },
    exploreText: { fontSize: "13px", fontWeight: 600, color: "#173404", fontFamily: FONT },
    sectionLabel: { fontFamily: HEADING_FONT, fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 20px 10px" },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "0 20px 20px" },
    recentRow: { display: "flex", gap: "8px", margin: "0 20px 20px" },
    recentBox: { background: THEME.white, borderRadius: "10px", width: "48px", height: "48px", border: "none", cursor: "pointer", overflow: "hidden", padding: 0 },
    recentEmpty: { background: THEME.white, borderRadius: "10px", width: "48px", height: "48px", border: "none" },
    recentPhoto: { width: "100%", height: "100%", objectFit: "cover" },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px" },
  };

  function itemBoxStyle(isAnchor) {
    return { background: isAnchor ? THEME.chip : "#E4E4E0", border: isAnchor ? "1.5px solid " + THEME.accent : "none", borderRadius: "10px", aspectRatio: "1 / 1", width: "100%", overflow: "hidden" };
  }

  function vibeChipStyle(active) {
    return { padding: "7px 13px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#333", fontSize: "12px", border: active ? "none" : "1px solid " + THEME.chip, cursor: "pointer", fontFamily: FONT };
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {preferences.profilePicture ? <img src={preferences.profilePicture} alt="" style={styles.avatarImg} /> : <div style={styles.avatarPlaceholder}></div>}
        <div>
          <p style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <p style={styles.greeting}>{getGreeting()}{preferences.name ? ", " + preferences.name : ""}</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.weatherRow}>{loading ? <span>Loading weather...</span> : <span>{weather.icon} {weather.tempF}°F, {weather.label}</span>}</div>

        {items.length === 0 ? (
          <p style={styles.empty}>Add a few items to your closet, and today's suggestion will show up here.</p>
        ) : pieces.length === 0 ? (
          <p style={styles.empty}>Add a top, a bottom, and shoes so I have enough to build a look.</p>
        ) : (
          <>
            <div style={styles.grid}>
              {pieces.map(function (item, i) {
                return (
                  <div key={item.id} style={styles.itemBoxWrap}>
                    <img src={item.photo} alt={item.name} style={itemBoxStyle(anchor && anchor.id === item.id)} />
                    <button style={styles.refreshBtn} onClick={function () { swapItem(i); }} title="Swap this item">🔄</button>
                  </div>
                );
              })}
            </div>
            <p style={styles.reasoning}>{buildReasoningSentence()}</p>
            <button style={styles.button} onClick={logOutfit}>Log this outfit for today</button>
          </>
        )}
      </div>

      {finishingTouches.length > 0 && (
        <div style={styles.finishingCard}>
          <p style={styles.finishingLabel}>Finishing touches</p>
          {finishingTouches.map(function (item) { return <p key={item.id} style={styles.finishingItem}>Your {item.name.toLowerCase()} {item.reason}</p>; })}
        </div>
      )}

      {hairSuggestion && (
        <div style={styles.hairCard}><p style={styles.hairLabel}>Hair idea</p><p style={styles.hairText}>{hairSuggestion}</p></div>
      )}

      <button style={styles.exploreCard} onClick={function () { goToTab("Explore"); }}>
        <span style={styles.exploreText}>Explore outfit ideas</span><span>→</span>
      </button>

      <p style={styles.sectionLabel}>What's the vibe today?</p>
      <div style={styles.chipRow}>
        {personas.map(function (p) {
          return <button key={p} style={vibeChipStyle(selectedVibe === p)} onClick={function () { setSelectedVibe(selectedVibe === p ? null : p); }}>{p}</button>;
        })}
        <button style={vibeChipStyle(false)} onClick={function () {
          const newVibe = prompt("Name this vibe:");
          if (newVibe) setPersonas(personas.concat([newVibe]));
        }}>+ add</button>
      </div>

      <p style={styles.sectionLabel}>Recently logged</p>
      <div style={styles.recentRow}>
        {recentSlots.map(function (log, i) {
          const photo = log && log.items && log.items[0] ? log.items[0].photo : null;
          if (!log) return <div key={i} style={styles.recentEmpty}></div>;
          return <button key={i} style={styles.recentBox} onClick={function () { viewLoggedEntry(log); }}>{photo ? <img src={photo} alt="" style={styles.recentPhoto} /> : null}</button>;
        })}
      </div>

      <BottomNav activeTab="Home" goToTab={goToTab} showHook={!!preferences.askHookEnabled} />
    </div>
  );
}