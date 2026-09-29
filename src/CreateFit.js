import React, { useState } from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function CreateFit(props) {
  const items = props.items;
  const goToTab = props.goToTab;
  const THEME = useTheme();

  const [selectedIds, setSelectedIds] = useState([]);
  const [name, setName] = useState("");

  function toggleItem(id) {
    setSelectedIds(function (prev) {
      if (prev.indexOf(id) !== -1) return prev.filter(function (i) { return i !== id; });
      return prev.concat([id]);
    });
  }

  function handleSave() {
    if (selectedIds.length === 0) { alert("Select at least one piece for this fit."); return; }
    if (!name.trim()) { alert("Give this fit a name."); return; }
    const chosen = items.filter(function (i) { return selectedIds.indexOf(i.id) !== -1; });
    const existing = JSON.parse(localStorage.getItem("fitcastSavedFits") || "[]");
    existing.push({
      id: Date.now().toString(),
      name: name.trim(),
      items: chosen.map(function (i) { return { name: i.name, photo: i.photo }; }),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("fitcastSavedFits", JSON.stringify(existing));
    goToTab("SavedFits");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, padding: "20px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", marginBottom: "12px", cursor: "pointer", background: "none", border: "none", fontFamily: FONT },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "20px", margin: "0 0 4px", color: "#000" },
    subtitle: { fontSize: "12px", color: "#888780", margin: "0 0 16px" },
    input: { width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: THEME.white, marginBottom: "16px", fontSize: "13px", boxSizing: "border-box", fontFamily: FONT },
    grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" },
    itemWrap: { position: "relative", border: "none", padding: 0, background: "none", cursor: "pointer" },
    itemImg: (selected) => ({ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "10px", border: selected ? "3px solid " + THEME.accent : "3px solid transparent" }),
    checkMark: { position: "absolute", top: "4px", right: "4px", background: THEME.accent, color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" },
    itemName: { fontSize: "10px", color: "#5F5E5A", margin: "3px 0 0", textAlign: "center" },
    saveButton: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "20px 0" },
  };

  return (
    <div style={styles.page}>
      <button style={styles.backLink} onClick={function () { goToTab("SavedFits"); }}>← Back</button>
      <p style={styles.title}>Create a fit</p>
      <p style={styles.subtitle}>tap each piece to add it, then name and save the fit</p>

      <input style={styles.input} value={name} onChange={function (e) { setName(e.target.value); }} placeholder="name this fit, e.g. rainy day errand fit" />

      {items.length === 0 ? (
        <p style={styles.empty}>Your closet is empty. Add items in the Closet tab first.</p>
      ) : (
        <div style={styles.grid}>
          {items.map(function (item) {
            const selected = selectedIds.indexOf(item.id) !== -1;
            return (
              <button key={item.id} style={styles.itemWrap} onClick={function () { toggleItem(item.id); }}>
                <img src={item.photo} alt={item.name} style={styles.itemImg(selected)} />
                {selected && <span style={styles.checkMark}>✓</span>}
                <p style={styles.itemName}>{item.name}</p>
              </button>
            );
          })}
        </div>
      )}

      <button style={styles.saveButton} onClick={handleSave}>save this fit</button>
    </div>
  );
}