import React, { useState } from "react";
import { CATEGORIES } from "./closetData";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function AddItem(props) {
  const onAdd = props.onAdd;
  const goBack = props.goBack;
  const THEME = useTheme();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("TOP");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isLayer, setIsLayer] = useState(false);
  const [productLink, setProductLink] = useState("");

  const realCategories = CATEGORIES.filter(function (c) { return c.key !== "ALL"; });

  function handleSave() {
    if (!name.trim()) {
      alert("Give this item a name first.");
      return;
    }
    const finalCategory = category === "CUSTOM" ? customCategoryName.toUpperCase().replace(/\s+/g, "_") : category;
    const newItem = {
      id: Date.now().toString(),
      name: name.trim(),
      category: finalCategory,
      weatherTags: [],
      daysSinceWorn: 0,
      isLayer: category === "TOP" ? isLayer : false,
      isSet: category === "SET",
      productLink: productLink.trim() || null,
    };
    onAdd(newItem);
    goBack();
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, padding: "20px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", marginBottom: "12px", cursor: "pointer", background: "none", border: "none", fontFamily: FONT },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "20px", margin: "0 0 16px", color: "#000" },
    photoBox: { background: "#E4E4E0", borderRadius: "14px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "16px", fontSize: "13px", color: "#888780" },
    label: { fontSize: "11px", color: "#888780", margin: "0 0 4px" },
    input: { width: "100%", padding: "10px", borderRadius: "10px", border: "none", background: THEME.white, marginBottom: "12px", fontSize: "13px", boxSizing: "border-box", fontFamily: FONT },
    chipRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" },
    toggleRow: { background: THEME.white, borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" },
    hint: { fontSize: "10px", color: "#888780", margin: "0 0 14px" },
    saveButton: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  };

  function chipStyle(active) {
    return { padding: "6px 12px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#5F5E5A", fontSize: "11px", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  return (
    <div style={styles.page}>
      <button style={styles.backLink} onClick={goBack}>← Back</button>
      <p style={styles.title}>Add item</p>

      <div style={styles.photoBox}>Photo upload — not connected yet</div>

      <p style={styles.label}>name</p>
      <input style={styles.input} value={name} onChange={function (e) { setName(e.target.value); }} placeholder="e.g. Rust cardigan" />

      <p style={styles.label}>category</p>
      <div style={styles.chipRow}>
        {realCategories.map(function (c) {
          return <button key={c.key} style={chipStyle(category === c.key)} onClick={function () { setCategory(c.key); }}>{c.label}</button>;
        })}
        <button style={chipStyle(category === "CUSTOM")} onClick={function () { setCategory("CUSTOM"); }}>+ custom</button>
      </div>

      {category === "CUSTOM" && (
        <input style={styles.input} value={customCategoryName} onChange={function (e) { setCustomCategoryName(e.target.value); }} placeholder="Name this category (e.g. Watches)" />
      )}

      {category === "TOP" && (
        <div style={styles.toggleRow}>
          <span style={{ fontSize: "12px" }}>can be worn as a layer</span>
          <input type="checkbox" checked={isLayer} onChange={function (e) { setIsLayer(e.target.checked); }} />
        </div>
      )}

      <p style={styles.label}>product link (optional)</p>
      <input style={styles.input} value={productLink} onChange={function (e) { setProductLink(e.target.value); }} placeholder="paste a link for a more accurate color" />
      <p style={styles.hint}>Color extraction from product links needs a backend step we haven't connected yet — for now this just saves the link.</p>

      <button style={styles.saveButton} onClick={handleSave}>save to closet</button>
    </div>
  );
}