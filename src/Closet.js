import React, { useState } from "react";
import { CATEGORIES } from "./closetData";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

function getMostWornName(logs) {
  const counts = {};
  logs.forEach(function (log) {
    (log.items || []).forEach(function (entry) {
      counts[entry.name] = (counts[entry.name] || 0) + 1;
    });
  });
  const names = Object.keys(counts);
  if (names.length === 0) return null;
  const topName = names.reduce(function (a, b) { return counts[a] >= counts[b] ? a : b; });
  return counts[topName] > 1 ? topName : null;
}

function getMostNeglectedName(items) {
  if (items.length === 0) return null;
  const sorted = items.slice().sort(function (a, b) { return b.daysSinceWorn - a.daysSinceWorn; });
  const top = sorted[0];
  return top && top.daysSinceWorn >= 14 ? top.name : null;
}

export default function Closet(props) {
  const items = props.items;
  const goToTab = props.goToTab;
  const preferences = props.preferences;
  const onSelectItem = props.onSelectItem;
  const THEME = useTheme();

  const [activeCategory, setActiveCategory] = useState("ALL");
  const [customCategories, setCustomCategories] = useState([]);

  const allLogs = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
  const favorites = JSON.parse(localStorage.getItem("fitcastFavorites") || "[]");
  const setCount = items.filter(function (i) { return i.isSet; }).length;
  const mostWornName = getMostWornName(allLogs);
  const mostNeglectedName = getMostNeglectedName(items);

  const allCategories = CATEGORIES.concat(
    customCategories.map(function (c) { return { key: c, label: c.toLowerCase() }; })
  );

  const filteredItems = activeCategory === "ALL" ? items : items.filter(function (item) { return item.category === activeCategory; });

  function addCustomCategory() {
    const name = prompt("Name your custom category (e.g. Watches):");
    if (!name) return;
    const description = prompt('Briefly describe what "' + name + '" is, so Hook can suggest it correctly:');
    const key = name.toUpperCase().replace(/\s+/g, "_");
    setCustomCategories(customCategories.concat([key]));
    console.log('New category "' + name + '" (' + key + "): " + description);
    goToTab("AddItem");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 8px" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    statsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", padding: "6px 20px" },
    statChip: { background: THEME.white, borderRadius: "10px", padding: "7px 6px", textAlign: "center" },
    statNumber: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "14px", color: THEME.accent, margin: 0 },
    statLabel: { fontSize: "9px", color: "#888780", margin: "1px 0 0" },
    noteRow: { padding: "0 20px 12px" },
    noteLine: { fontSize: "11px", color: "#5F5E5A", margin: "2px 0" },
    chipRow: { display: "flex", gap: "6px", flexWrap: "wrap", padding: "4px 20px 16px" },
    grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", padding: "0 20px" },
    card: { background: THEME.white, borderRadius: "14px", padding: "10px", position: "relative", textAlign: "left", border: "none", cursor: "pointer" },
    photoImg: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "10px", marginBottom: "8px" },
    emptyPhotoBox: { background: THEME.chip, borderRadius: "10px", aspectRatio: "1 / 1", width: "100%", marginBottom: "8px" },
    setBadge: { position: "absolute", top: "18px", right: "18px", background: "#FAEEDA", color: "#854F0B", fontSize: "9px", padding: "2px 6px", borderRadius: "6px" },
    itemName: { fontSize: "12px", fontWeight: 500, margin: 0, color: "#173404" },
    itemMeta: { fontSize: "11px", color: "#888780", margin: "2px 0 0" },
    addButton: { width: "calc(100% - 40px)", margin: "16px 20px 0", background: THEME.white, color: "#173404", border: "1px solid " + THEME.card, borderRadius: "14px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    customChip: { padding: "6px 12px", borderRadius: "999px", background: "#FAEEDA", color: "#854F0B", fontSize: "11px", border: "none", cursor: "pointer", fontFamily: FONT },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "30px 30px" },
  };

  function chipStyle(active) {
    return { padding: "6px 12px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#5F5E5A", fontSize: "11px", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.title}>Your closet</p>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statChip}>
          <p style={styles.statNumber}>{items.length}</p>
          <p style={styles.statLabel}>items</p>
        </div>
        <div style={styles.statChip}>
          <p style={styles.statNumber}>{setCount}</p>
          <p style={styles.statLabel}>sets</p>
        </div>
        <div style={styles.statChip}>
          <p style={styles.statNumber}>{allLogs.length}</p>
          <p style={styles.statLabel}>logged</p>
        </div>
        <div style={styles.statChip}>
          <p style={styles.statNumber}>{favorites.length}</p>
          <p style={styles.statLabel}>favorites</p>
        </div>
      </div>

      {(mostWornName || mostNeglectedName) && (
        <div style={styles.noteRow}>
          {mostWornName && <p style={styles.noteLine}>Most worn lately: {mostWornName}</p>}
          {mostNeglectedName && <p style={styles.noteLine}>Could use some love: {mostNeglectedName}</p>}
        </div>
      )}

      <div style={styles.chipRow}>
        {allCategories.map(function (cat) {
          return (
            <button key={cat.key} style={chipStyle(activeCategory === cat.key)} onClick={function () { setActiveCategory(cat.key); }}>
              {cat.label}
            </button>
          );
        })}
        <button style={styles.customChip} onClick={addCustomCategory}>+ custom</button>
      </div>

      {items.length === 0 ? (
        <div style={styles.empty}>Your closet is empty. Tap "add item or set" below to add your first piece with a photo.</div>
      ) : filteredItems.length === 0 ? (
        <div style={styles.empty}>Nothing in this category yet. Tap "add item or set" below to add one.</div>
      ) : (
        <div style={styles.grid}>
          {filteredItems.map(function (item) {
            return (
              <button key={item.id} style={styles.card} onClick={function () { onSelectItem(item); }}>
                {item.isSet && <span style={styles.setBadge}>set</span>}
                {item.photo ? <img src={item.photo} alt={item.name} style={styles.photoImg} /> : <div style={styles.emptyPhotoBox}></div>}
                <p style={styles.itemName}>{item.name}</p>
                <p style={styles.itemMeta}>
                  {item.category.toLowerCase().replace("_", " ")}
                  {item.isLayer ? " · layer" : ""}
                </p>
              </button>
            );
          })}
        </div>
      )}

      <button style={styles.addButton} onClick={function () { goToTab("AddItem"); }}>+ add item or set</button>

      <BottomNav activeTab="Closet" goToTab={goToTab} showHook={!!(preferences && preferences.askHookEnabled !== false)} />
    </div>
  );
}