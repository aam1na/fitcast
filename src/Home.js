import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";
const DEFAULT_PERSONAS = ["lowkey Sunday", "party", "brunch", "cultural", "business casual"];
const DEFAULT_LOCATION = { lat: 29.76, lon: -95.37, name: "Houston" };

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
  if (tempF >= 85 && humidity >= 60 && (base.condition === "clear" || base.condition === "mostly clear" || base.condition === "partly cloudy")) {
    return { condition: "hot and humid", label: "hot and humid", icon: "🌡️" };
  }
  if (tempF >= 90) {
    return Object.assign({}, base, { condition: "hot", label: "hot, " + base.label });
  }
  if (tempF <= 40) {
    return Object.assign({}, base, { condition: "cold", label: "cold, " + base.label });
  }
  return base;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getHairstyleSuggestion(weather, prefs) {
  if (!prefs || !prefs.hairstyleSuggestionsEnabled) return null;
  if (!weather) return null;

  const hasDetails = prefs.hairLength && prefs.hairTexture;
  const descriptor = hasDetails ? prefs.hairLength + ", " + prefs.hairTexture + " hair" : "your hair";

  if (weather.condition === "hot and humid" || weather.condition === "hot") {
    return "It's warm out, so a loose bun or half-up style would help keep " + descriptor + " cool.";
  }
  if (weather.condition === "rainy" || weather.condition === "drizzle" || weather.condition === "thunderstorm") {
    return "Rain today — a braid or low bun will hold up better than wearing " + descriptor + " down.";
  }
  if (weather.condition === "foggy") {
    return "Damp air today — pulling " + descriptor + " back will help it hold up better.";
  }
  return "Nice weather for wearing " + descriptor + " down or in soft waves today.";
}

export default function Home(props) {
  const preferences = props.preferences;
  const items = props.items;
  const goToTab = props.goToTab;
  const THEME = useTheme();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVibe, setSelectedVibe] = useState(null);
  const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
  const [recentlyLogged, setRecentlyLogged] = useState([]);
  const [displayedItems, setDisplayedItems] = useState(items.slice(0, 4));

  const fetchWeather = useCallback(function (lat, lon, locationName) {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current=temperature_2m,weather_code,relative_humidity_2m&temperature_unit=fahrenheit")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        const tempF = Math.round(data.current.temperature_2m);
        const humidity = data.current.relative_humidity_2m;
        const code = data.current.weather_code;
        const described = describeWeather(code, tempF, humidity);
        setWeather(Object.assign({ tempF: tempF, humidity: humidity, locationName: locationName }, described));
        setLoading(false);
      })
      .catch(function () {
        setWeather({ tempF: 72, humidity: 50, condition: "clear", label: "clear", icon: "🌤️", locationName: locationName });
        setLoading(false);
      });
  }, []);

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

  function pickAnchorItem() {
    if (!weather) return null;
    const candidates = items.filter(function (item) {
      return item.weatherTags && item.weatherTags.indexOf(weather.condition) !== -1;
    });
    if (candidates.length === 0) return null;
    return candidates.reduce(function (a, b) { return a.daysSinceWorn > b.daysSinceWorn ? a : b; });
  }

  function buildReasoningSentence(anchor) {
    if (!anchor) return "Here's an outfit pulled together for today.";
    const conditionText = weather.label.charAt(0).toUpperCase() + weather.label.slice(1) + " today";
    const verb = anchor.category === "SHOES" || anchor.category === "TOP" ? "wearing" : "pulling out";
    return conditionText + ", so " + verb + " your " + anchor.name.toLowerCase() + " since it hasn't been worn in a while.";
  }

  function getFinishingTouches(anchor) {
    const NEGLECT_THRESHOLD_DAYS = 14;
    return items
      .filter(function (item) {
        const isAccessory = item.category === "JEWELRY" || item.category === "BAG" || item.category === "BELT";
        const neglected = item.daysSinceWorn >= NEGLECT_THRESHOLD_DAYS;
        const notAnchor = !anchor || item.id !== anchor.id;
        return isAccessory && neglected && notAnchor;
      })
      .slice(0, 2)
      .map(function (item) {
        return Object.assign({}, item, { reason: "hasn't been worn in a while — would pair well with this look" });
      });
  }

  function swapItem(index) {
    const current = displayedItems[index];
    const sameCategory = items.filter(function (i) { return i.category === current.category && i.id !== current.id; });
    if (sameCategory.length === 0) return;
    const next = sameCategory[Math.floor(Math.random() * sameCategory.length)];
    const updated = displayedItems.slice();
    updated[index] = next;
    setDisplayedItems(updated);
  }

  function logOutfit() {
    const anchor = pickAnchorItem();
    const entry = { date: new Date().toISOString(), weather: weather, anchorItem: anchor ? anchor.name : null, vibe: selectedVibe };
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push(entry);
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setRecentlyLogged(existing.slice(-5).reverse());
    alert("Outfit logged for today!");
  }

  function viewLoggedEntry(log) {
    if (!log) return;
    alert(new Date(log.date).toLocaleDateString() + ": " + (log.anchorItem || "outfit") + ", " + (log.weather ? log.weather.label : ""));
  }

  const anchor = pickAnchorItem();
  const finishingTouches = getFinishingTouches(anchor);
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
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "12px" },
    itemBoxWrap: { position: "relative" },
    itemBox: function (isAnchor) {
      return { background: isAnchor ? THEME.chip : "#E4E4E0", border: isAnchor ? "1.5px solid " + THEME.accent : "none", borderRadius: "10px", height: "56px", width: "100%" };
    },
    refreshBtn: { position: "absolute", bottom: "3px", right: "3px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", padding: 0 },
    reasoning: { fontSize: "13px", color: "#173404", marginBottom: "12px", lineHeight: 1.5, fontFamily: FONT },
    button: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "11px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    finishingCard: { background: "#FAEEDA", borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    finishingLabel: { fontSize: "11px", color: "#854F0B", marginBottom: "8px", fontFamily: FONT },
    finishingItem: { fontSize: "12px", color: "#5C3A08", marginBottom: "6px", fontFamily: FONT },
    hairCard: { background: THEME.chip, borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    hairLabel: { fontSize: "11px", color: "#5F5E5A", marginBottom: "8px", fontFamily: FONT },
    hairText: { fontSize: "12px", color: "#333", fontFamily: FONT },
    exploreCard: { background: THEME.card, borderRadius: "16px", padding: "16px", margin: "0 20px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", width: "calc(100% - 40px)" },
    exploreText: { fontSize: "13px", fontWeight: 600, color: "#173404", fontFamily: FONT },
    sectionLabel: { fontFamily: HEADING_FONT, fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 20px 10px" },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", margin: "0 20px 20px" },
    chip: function (active) {
      return { padding: "7px 13px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#333", fontSize: "12px", border: active ? "none" : "1px solid " + THEME.chip, cursor: "pointer", fontFamily: FONT };
    },
    recentRow: { display: "flex", gap: "8px", margin: "0 20px 20px" },
    recentBox: { background: THEME.white, borderRadius: "10px", width: "48px", height: "48px", fontSize: "9px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2px", color: "#888780", border: "none", cursor: "pointer", fontFamily: FONT },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: THEME.card, display: "flex", justifyContent: "space-around", padding: "10px 0" },
  };

  function navItemStyle(active) {
    return { display: "flex", flexDirection: "column", alignItems: "center", fontSize: "10px", color: active ? "#173404" : "#888780", fontWeight: active ? 600 : 400, background: "none", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        {preferences.profilePicture ? (
          <img src={preferences.profilePicture} alt="" style={styles.avatarImg} />
        ) : (
          <div style={styles.avatarPlaceholder}></div>
        )}
        <div>
          <p style={styles.dateText}>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
          <p style={styles.greeting}>{getGreeting()}{preferences.name ? ", " + preferences.name : ""}</p>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.weatherRow}>
          {loading ? <span>Loading weather...</span> : <span>{weather.icon} {weather.tempF}°F, {weather.label}</span>}
        </div>
        <div style={styles.grid}>
          {displayedItems.map(function (item, i) {
            return (
              <div key={item.id} style={styles.itemBoxWrap}>
                <div style={styles.itemBox(anchor && anchor.id === item.id)}></div>
                <button style={styles.refreshBtn} onClick={function () { swapItem(i); }} title="Swap this item">🔄</button>
              </div>
            );
          })}
        </div>
        <p style={styles.reasoning}>{buildReasoningSentence(anchor)}</p>
        <button style={styles.button} onClick={logOutfit}>Log this outfit for today</button>
      </div>

      {finishingTouches.length > 0 && (
        <div style={styles.finishingCard}>
          <p style={styles.finishingLabel}>Finishing touches</p>
          {finishingTouches.map(function (item) {
            return <p key={item.id} style={styles.finishingItem}>Your {item.name.toLowerCase()} {item.reason}</p>;
          })}
        </div>
      )}

      {hairSuggestion && (
        <div style={styles.hairCard}>
          <p style={styles.hairLabel}>Hair idea</p>
          <p style={styles.hairText}>{hairSuggestion}</p>
        </div>
      )}

      <button style={styles.exploreCard} onClick={function () { alert("Explore feed — building this next."); }}>
        <span style={styles.exploreText}>Explore outfit ideas</span>
        <span>→</span>
      </button>

      <p style={styles.sectionLabel}>What's the vibe today?</p>
      <div style={styles.chipRow}>
        {personas.map(function (p) {
          return <button key={p} style={styles.chip(selectedVibe === p)} onClick={function () { setSelectedVibe(p); }}>{p}</button>;
        })}
        <button style={styles.chip(false)} onClick={function () {
          const newVibe = prompt("Name this vibe:");
          if (newVibe) setPersonas(personas.concat([newVibe]));
        }}>+ add</button>
      </div>

      <p style={styles.sectionLabel}>Recently logged</p>
      <div style={styles.recentRow}>
        {recentSlots.map(function (log, i) {
          return <button key={i} style={styles.recentBox} onClick={function () { viewLoggedEntry(log); }}>{log ? (log.anchorItem || "logged") : ""}</button>;
        })}
      </div>

      <div style={styles.nav}>
        <button style={navItemStyle(true)} onClick={function () { goToTab("Home"); }}><span>🏠</span><span>Home</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Closet"); }}><span>👗</span><span>Closet</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Capsule"); }}><span>🕐</span><span>Capsule</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Hook"); }}><span>💬</span><span>Hook</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Profile"); }}><span>👤</span><span>Profile</span></button>
      </div>
    </div>
  );
}