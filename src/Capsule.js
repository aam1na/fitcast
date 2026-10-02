import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

function isOneYearAgoToday(dateString) {
  const logDate = new Date(dateString);
  const today = new Date();
  return logDate.getDate() === today.getDate() && logDate.getMonth() === today.getMonth() && logDate.getFullYear() === today.getFullYear() - 1;
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

function summaryText(log) {
  if (log.items && log.items.length > 0) {
    return log.items.map(function (i) { return i.name; }).join(", ");
  }
  return log.anchorItem || "logged outfit";
}

export default function Capsule(props) {
  const goToTab = props.goToTab;
  const preferences = props.preferences;
  const THEME = useTheme();

  const [selected, setSelected] = useState(null);

  const allLogs = JSON.parse(localStorage.getItem("fitcastLogs") || "[]").reverse();
  const yearAgoEntry = allLogs.find(function (log) { return isOneYearAgoToday(log.date); });
  const regularLogs = allLogs.filter(function (log) { return isOneYearAgoToday(log.date) === false; });

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 4px" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    subtitle: { fontSize: "12px", color: "#888780", margin: "4px 0 16px" },
    highlightCard: { background: THEME.accent, borderRadius: "16px", padding: "14px", margin: "0 20px 16px", border: "none", width: "calc(100% - 40px)", textAlign: "left", cursor: "pointer" },
    highlightLabel: { fontSize: "12px", color: "#fff", fontWeight: 600, margin: "0 0 10px" },
    photoRow: { display: "flex", gap: "8px", marginBottom: "10px" },
    photoBox: { borderRadius: "10px", flex: 1, aspectRatio: "1 / 1", overflow: "hidden", background: "rgba(255,255,255,0.3)" },
    photoImg: { width: "100%", height: "100%", objectFit: "cover" },
    highlightMeta: { fontSize: "11px", color: "#fff", margin: 0 },
    entryLabel: { fontSize: "12px", color: "#5F5E5A", margin: "0 20px 8px" },
    entryCard: { background: THEME.white, borderRadius: "14px", padding: "12px", margin: "0 20px 12px", display: "flex", alignItems: "center", gap: "10px", border: "none", width: "calc(100% - 40px)", textAlign: "left", cursor: "pointer" },
    entryPhoto: { background: "#E4E4E0", borderRadius: "10px", width: "48px", height: "48px", flexShrink: 0, overflow: "hidden" },
    entryPhotoImg: { width: "100%", height: "100%", objectFit: "cover" },
    entryText: { fontSize: "12px", color: "#5F5E5A" },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "40px 20px" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10 },
    sheet: { background: THEME.white, width: "100%", maxWidth: "480px", borderRadius: "20px 20px 0 0", padding: "20px", fontFamily: FONT, maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" },
    sheetDate: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "18px", margin: "0 0 4px", color: "#000" },
    sheetWeather: { fontSize: "13px", color: "#5F5E5A", margin: "0 0 14px" },
    sheetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "6px" },
    sheetPhoto: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "10px" },
    sheetName: { fontSize: "11px", color: "#5F5E5A", margin: "4px 0 0", textAlign: "center" },
    sheetClose: { width: "100%", background: "none", color: "#888780", border: "none", padding: "14px 0 0", fontSize: "12px", cursor: "pointer", fontFamily: FONT },
  };

  function renderPhotos(log) {
    const list = log.items && log.items.length > 0 ? log.items.slice(0, 3) : [];
    if (list.length === 0) return <div style={styles.photoBox}></div>;
    return list.map(function (it, i) {
      return <div key={i} style={styles.photoBox}><img src={it.photo} alt="" style={styles.photoImg} /></div>;
    });
  }

  let weatherText = "";
  if (yearAgoEntry && yearAgoEntry.weather) weatherText = yearAgoEntry.weather.label + ", " + yearAgoEntry.weather.tempF + "°F";

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.title}>Time capsule</p>
        <p style={styles.subtitle}>{allLogs.length} outfits logged</p>
      </div>

      {yearAgoEntry && (
        <button style={styles.highlightCard} onClick={function () { setSelected(yearAgoEntry); }}>
          <p style={styles.highlightLabel}>a year ago today</p>
          <div style={styles.photoRow}>{renderPhotos(yearAgoEntry)}</div>
          <p style={styles.highlightMeta}>{weatherText}</p>
        </button>
      )}

      {regularLogs.length === 0 && !yearAgoEntry && (
        <div style={styles.empty}>No outfits logged yet. Log one from Home to start building your capsule.</div>
      )}

      {regularLogs.map(function (log, i) {
        let logText = summaryText(log);
        if (log.weather) logText = logText + " · " + log.weather.label + ", " + log.weather.tempF + "°F";
        const firstPhoto = log.items && log.items[0] ? log.items[0].photo : null;

        return (
          <div key={i}>
            <p style={styles.entryLabel}>{relativeLabel(log.date)}</p>
            <button style={styles.entryCard} onClick={function () { setSelected(log); }}>
              <div style={styles.entryPhoto}>{firstPhoto && <img src={firstPhoto} alt="" style={styles.entryPhotoImg} />}</div>
              <span style={styles.entryText}>{logText}</span>
            </button>
          </div>
        );
      })}

      {selected && (
        <div style={styles.overlay} onClick={function () { setSelected(null); }}>
          <div style={styles.sheet} onClick={function (e) { e.stopPropagation(); }}>
            <p style={styles.sheetDate}>{new Date(selected.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
            {selected.weather && <p style={styles.sheetWeather}>{selected.weather.label}, {selected.weather.tempF}°F{selected.vibe ? " · " + selected.vibe : ""}</p>}
            <div style={styles.sheetGrid}>
              {(selected.items || []).map(function (it, i) {
                return (
                  <div key={i}>
                    <img src={it.photo} alt="" style={styles.sheetPhoto} />
                    <p style={styles.sheetName}>{it.name}</p>
                  </div>
                );
              })}
            </div>
            <button style={styles.sheetClose} onClick={function () { setSelected(null); }}>Close</button>
          </div>
        </div>
      )}

      <BottomNav activeTab="Capsule" goToTab={goToTab} showHook={!!(preferences && preferences.askHookEnabled !== false)} />
    </div>
  );
}