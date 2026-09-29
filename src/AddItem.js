import React, { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "./closetData";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function AddItem(props) {
  const onAdd = props.onAdd;
  const onSave = props.onSave;
  const goBack = props.goBack;
  const editingItem = props.editingItem;
  const THEME = useTheme();
  const fileInputRef = useRef(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("TOP");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [isLayer, setIsLayer] = useState(false);
  const [color, setColor] = useState("");
  const [productLink, setProductLink] = useState("");
  const [photo, setPhoto] = useState(null);

  useEffect(function () {
    if (editingItem) {
      setName(editingItem.name || "");
      setCategory(editingItem.category || "TOP");
      setIsLayer(!!editingItem.isLayer);
      setColor(editingItem.color || "");
      setProductLink(editingItem.productLink || "");
      setPhoto(editingItem.photo || null);
    }
  }, [editingItem]);

  const realCategories = CATEGORIES.filter(function (c) { return c.key !== "ALL"; });

  function handlePhotoClick() { fileInputRef.current.click(); }
  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () { setPhoto(reader.result); };
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!name.trim()) { alert("Give this item a name first."); return; }
    if (!photo) { alert("Add a photo of this item before saving."); return; }
    const finalCategory = category === "CUSTOM" ? customCategoryName.toUpperCase().replace(/\s+/g, "_") : category;

    if (editingItem) {
      onSave(Object.assign({}, editingItem, {
        name: name.trim(), category: finalCategory, isLayer: category === "TOP" ? isLayer : false,
        color: color.trim(), productLink: productLink.trim() || null, photo: photo,
      }));
    } else {
      onAdd({
        id: Date.now().toString(), name: name.trim(), category: finalCategory,
        weatherTags: [], daysSinceWorn: 0, isLayer: category === "TOP" ? isLayer : false,
        isSet: category === "SET", color: color.trim(), productLink: productLink.trim() || null, photo: photo,
      });
    }
    goBack();
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, padding: "20px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", marginBottom: "12px", cursor: "pointer", background: "none", border: "none", fontFamily: FONT },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "20px", margin: "0 0 16px", color: "#000" },
    photoBox: { background: "#E4E4E0", borderRadius: "14px", width: "160px", aspectRatio: "1 / 1", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 6px", fontSize: "12px", color: "#888780", cursor: "pointer", border: "none", overflow: "hidden", padding: 0, textAlign: "center" },
    photoImg: { width: "100%", height: "100%", objectFit: "cover" },
    photoHint: { fontSize: "10px", color: "#888780", margin: "0 0 16px", textAlign: "center" },
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
      <p style={styles.title}>{editingItem ? "Edit item" : "Add item"}</p>

      <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handlePhotoChange} />
      <button style={styles.photoBox} onClick={handlePhotoClick}>
        {photo ? <img src={photo} alt="" style={styles.photoImg} /> : "Tap to add a photo"}
      </button>
      <p style={styles.photoHint}>{photo ? "Tap the photo to change it" : "a photo is required"}</p>

      <p style={styles.label}>name</p>
      <input style={styles.input} value={name} onChange={function (e) { setName(e.target.value); }} placeholder="e.g. Rust cardigan" />

      <p style={styles.label}>color</p>
      <input style={styles.input} value={color} onChange={function (e) { setColor(e.target.value); }} placeholder="e.g. navy, white, floral" />

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
      <p style={styles.hint}>Color extraction from product links needs a backend step we haven't connected yet, so for now this just saves the link.</p>

      <button style={styles.saveButton} onClick={handleSave}>{editingItem ? "save changes" : "save to closet"}</button>
    </div>
  );
}