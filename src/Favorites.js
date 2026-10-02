import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function Favorites(props) {
  const goToTab = props.goToTab;
  const preferences = props.preferences;
  const THEME = useTheme();

  const [selected, setSelected] = useState(null);
  const favorites = JSON.parse(localStorage.getItem("fitcastFavorites") || "[]").reverse();

  function wearAgain(fav) {
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push({ date: new Date().toISOString(), weather: null, anchorItem: fav.items[0].name, vibe: fav.label, items: fav.items });
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setSelected(null);
    alert("Logged for today!");
  }

  function removeFavorite(key) {
    const updated = JSON.parse(localStorage.getItem("fitcastFavorites") || "[]").filter(function (f) { return f.key !== key; });
    localStorage.setItem("fitcastFavorites", JSON.stringify(updated));
    setSelected(null);
    goToTab("Explore");
    goToTab("Favorites");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "20px 20px 4px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "8px", fontFamily: FONT },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    subtitle: { fontSize: "12px", color: "#888780", margin: "4px 0 16px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 20px" },
    card: { background: THEME.white, borderRadius: "14px", padding: "10px", border: "none", textAlign: "left", cursor: "pointer" },
    collage: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" },
    collageImg: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "8px" },
    label: { fontSize: "12px", fontWeight: 500, color: "#173404", margin: 0 },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "30px 30px" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10 },
    sheet: { background: THEME.white, width: "100%", maxWidth: "480px", borderRadius: "20px 20px 0 0", padding: "20px", fontFamily: FONT, maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" },
    sheetTitle: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "18px", margin: "0 0 14px", color: "#000" },
    sheetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "16px" },
    sheetPhoto: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "10px" },
    sheetPrimary: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT, marginBottom: "8px" },
    sheetDelete: { width: "100%", background: "none", color: THEME.logout || "#B24848", border: "1px solid " + (THEME.logout || "#B24848"), borderRadius: "12px", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: FONT, marginBottom: "8px" },
    sheetClose: { width: "100%", background: "none", color: "#888780", border: "none", padding: "8px 0", fontSize: "12px", cursor: "pointer", fontFamily: FONT },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backLink} onClick={function () { goToTab("Explore"); }}>← Back</button>
        <p style={styles.title}>Favorites</p>
        <p style={styles.subtitle}>outfits you've hearted, from Home, Hook, or Explore</p>
      </div>

      {favorites.length === 0 ? (
        <div style={styles.empty}>Nothing favorited yet. Tap the heart on an outfit anywhere in the app to save it here.</div>
      ) : (
        <div style={styles.grid}>
          {favorites.map(function (fav) {
            return (
              <button key={fav.key} style={styles.card} onClick={function () { setSelected(fav); }}>
                <div style={styles.collage}>
                  {fav.items.slice(0, 4).map(function (it, i) { return <img key={i} src={it.photo} alt="" style={styles.collageImg} />; })}
                </div>
                <p style={styles.label}>{fav.label}</p>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={function () { setSelected(null); }}>
          <div style={styles.sheet} onClick={function (e) { e.stopPropagation(); }}>
            <p style={styles.sheetTitle}>{selected.label}</p>
            <div style={styles.sheetGrid}>
              {selected.items.map(function (it, i) { return <img key={i} src={it.photo} alt="" style={styles.sheetPhoto} />; })}
            </div>
            <button style={styles.sheetPrimary} onClick={function () { wearAgain(selected); }}>Wear this again</button>
            <button style={styles.sheetDelete} onClick={function () { removeFavorite(selected.key); }}>Remove from favorites</button>
            <button style={styles.sheetClose} onClick={function () { setSelected(null); }}>Close</button>
          </div>
        </div>
      )}

      <BottomNav activeTab="Explore" goToTab={goToTab} showHook={preferences && preferences.askHookEnabled !== false} />
    </div>
  );
}