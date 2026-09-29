import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function SavedFits(props) {
  const goToTab = props.goToTab;
  const preferences = props.preferences;
  const THEME = useTheme();

  const [selected, setSelected] = useState(null);
  const fits = JSON.parse(localStorage.getItem("fitcastSavedFits") || "[]").reverse();

  function wearAgain(fit) {
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push({ date: new Date().toISOString(), weather: null, anchorItem: fit.name, vibe: fit.name, items: fit.items });
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setSelected(null);
    alert("Logged " + fit.name + " for today!");
  }

  function deleteFit(id) {
    const updated = JSON.parse(localStorage.getItem("fitcastSavedFits") || "[]").filter(function (f) { return f.id !== id; });
    localStorage.setItem("fitcastSavedFits", JSON.stringify(updated));
    setSelected(null);
    goToTab("Explore");
    goToTab("SavedFits");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "20px 20px 4px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "8px", fontFamily: FONT },
    titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    createButton: { background: THEME.accent, color: "#fff", border: "none", borderRadius: "999px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontFamily: FONT },
    subtitle: { fontSize: "12px", color: "#888780", margin: "4px 0 16px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 20px" },
    card: { background: THEME.white, borderRadius: "14px", padding: "10px", border: "none", textAlign: "left", cursor: "pointer" },
    collage: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" },
    collageImg: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "8px" },
    fitName: { fontSize: "12px", fontWeight: 500, color: "#173404", margin: 0 },
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
        <div style={styles.titleRow}>
          <p style={styles.title}>My fits</p>
          <button style={styles.createButton} onClick={function () { goToTab("CreateFit"); }}>+ create a fit</button>
        </div>
        <p style={styles.subtitle}>your own complete outfits, saved to wear again</p>
      </div>

      {fits.length === 0 ? (
        <div style={styles.empty}>No fits saved yet. Tap "create a fit" to put one together from your closet.</div>
      ) : (
        <div style={styles.grid}>
          {fits.map(function (fit) {
            return (
              <button key={fit.id} style={styles.card} onClick={function () { setSelected(fit); }}>
                <div style={styles.collage}>
                  {fit.items.slice(0, 4).map(function (it, i) {
                    return <img key={i} src={it.photo} alt="" style={styles.collageImg} />;
                  })}
                </div>
                <p style={styles.fitName}>{fit.name}</p>
              </button>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={function () { setSelected(null); }}>
          <div style={styles.sheet} onClick={function (e) { e.stopPropagation(); }}>
            <p style={styles.sheetTitle}>{selected.name}</p>
            <div style={styles.sheetGrid}>
              {selected.items.map(function (it, i) {
                return <img key={i} src={it.photo} alt="" style={styles.sheetPhoto} />;
              })}
            </div>
            <button style={styles.sheetPrimary} onClick={function () { wearAgain(selected); }}>Wear this again</button>
            <button style={styles.sheetDelete} onClick={function () { deleteFit(selected.id); }}>Delete this fit</button>
            <button style={styles.sheetClose} onClick={function () { setSelected(null); }}>Close</button>
          </div>
        </div>
      )}

      <BottomNav activeTab="Explore" goToTab={goToTab} showHook={!!(preferences && preferences.askHookEnabled)} />
    </div>
  );
}