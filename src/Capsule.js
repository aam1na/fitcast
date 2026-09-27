import React from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

function isOneYearAgoToday(dateString) {
  const logDate = new Date(dateString);
  const today = new Date();
  const sameDay = logDate.getDate() === today.getDate();
  const sameMonth = logDate.getMonth() === today.getMonth();
  const yearBefore = logDate.getFullYear() === today.getFullYear() - 1;
  return sameDay && sameMonth && yearBefore;
}

function relativeLabel(dateString) {
  const logDate = new Date(dateString);
  const today = new Date();
  const diffDays = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return diffDays + " days ago";
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return Math.floor(diffDays / 7) + " weeks ago";
  return Math.floor(diffDays / 30) + " months ago";
}

export default function Capsule(props) {
  const goToTab = props.goToTab;
  const THEME = useTheme();

  const allLogs = JSON.parse(localStorage.getItem("fitcastLogs") || "[]").reverse();
  const yearAgoEntry = allLogs.find(function (log) { return isOneYearAgoToday(log.date); });
  const regularLogs = allLogs.filter(function (log) { return isOneYearAgoToday(log.date) === false; });

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 4px" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    subtitle: { fontSize: "12px", color: "#888780", margin: "4px 0 16px" },
    highlightCard: { background: THEME.accent, borderRadius: "16px", padding: "14px", margin: "0 20px 16px" },
    highlightLabel: { fontSize: "12px", color: "#fff", fontWeight: 600, margin: "0 0 10px" },
    photoRow: { display: "flex", gap: "8px", marginBottom: "10px" },
    photoBoxDark: { background: "rgba(255,255,255,0.3)", borderRadius: "10px", flex: 1, height: "56px" },
    highlightMeta: { fontSize: "11px", color: "#fff", margin: 0 },
    entryLabel: { fontSize: "12px", color: "#5F5E5A", margin: "0 20px 8px" },
    entryCard: { background: THEME.white, borderRadius: "14px", padding: "12px", margin: "0 20px 12px", display: "flex", alignItems: "center", gap: "10px" },
    entryPhoto: { background: "#E4E4E0", borderRadius: "10px", width: "48px", height: "48px" },
    entryText: { fontSize: "12px", color: "#5F5E5A" },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "40px 20px" },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: THEME.card, display: "flex", justifyContent: "space-around", padding: "10px 0" },
  };

  function navItemStyle(active) {
    return { display: "flex", flexDirection: "column", alignItems: "center", fontSize: "10px", color: active ? "#173404" : "#888780", fontWeight: active ? 600 : 400, background: "none", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  let weatherText = "";
  if (yearAgoEntry && yearAgoEntry.weather) {
    weatherText = yearAgoEntry.weather.label + ", " + yearAgoEntry.weather.tempF + "°F";
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.title}>Time capsule</p>
        <p style={styles.subtitle}>{allLogs.length} outfits logged</p>
      </div>

      {yearAgoEntry && (
        <div style={styles.highlightCard}>
          <p style={styles.highlightLabel}>a year ago today</p>
          <div style={styles.photoRow}>
            <div style={styles.photoBoxDark}></div>
            <div style={styles.photoBoxDark}></div>
            <div style={styles.photoBoxDark}></div>
          </div>
          <p style={styles.highlightMeta}>{weatherText}</p>
        </div>
      )}

      {regularLogs.length === 0 && !yearAgoEntry && (
        <div style={styles.empty}>No outfits logged yet. Log one from Home to start building your capsule.</div>
      )}

      {regularLogs.map(function (log, i) {
        let logText = "outfit";
        if (log.anchorItem) logText = log.anchorItem;
        if (log.weather) logText = logText + " · " + log.weather.label + ", " + log.weather.tempF + "°F";

        return (
          <div key={i}>
            <p style={styles.entryLabel}>{relativeLabel(log.date)}</p>
            <div style={styles.entryCard}>
              <div style={styles.entryPhoto}></div>
              <span style={styles.entryText}>{logText}</span>
            </div>
          </div>
        );
      })}

      <div style={styles.nav}>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Home"); }}><span>🏠</span><span>Home</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Closet"); }}><span>👗</span><span>Closet</span></button>
        <button style={navItemStyle(true)} onClick={function () { goToTab("Capsule"); }}><span>🕐</span><span>Capsule</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Hook"); }}><span>💬</span><span>Hook</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Profile"); }}><span>👤</span><span>Profile</span></button>
      </div>
    </div>
  );
}