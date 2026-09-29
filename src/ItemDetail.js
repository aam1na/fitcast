import React from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

export default function ItemDetail(props) {
  const item = props.item;
  const goBack = props.goBack;
  const onEdit = props.onEdit;
  const onDelete = props.onDelete;
  const THEME = useTheme();

  if (!item) {
    goBack();
    return null;
  }

  function handleDelete() {
    const confirmed = window.confirm("Delete " + item.name + "? This can't be undone.");
    if (confirmed) {
      onDelete(item.id);
      goBack();
    }
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, padding: "20px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", marginBottom: "12px", cursor: "pointer", background: "none", border: "none", fontFamily: FONT },
    photo: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "16px", marginBottom: "16px" },
    name: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "20px", margin: "0 0 4px", color: "#000" },
    meta: { fontSize: "13px", color: "#5F5E5A", margin: "0 0 4px" },
    row: { display: "flex", gap: "10px", marginTop: "20px" },
    editButton: { flex: 1, background: THEME.white, color: "#173404", border: "1px solid " + THEME.card, borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
    deleteButton: { flex: 1, background: "none", color: THEME.logout || "#B24848", border: "1px solid " + (THEME.logout || "#B24848"), borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT },
  };

  const wornText = item.daysSinceWorn === 0 ? "today" : item.daysSinceWorn + " days ago";

  return (
    <div style={styles.page}>
      <button style={styles.backLink} onClick={goBack}>← Back</button>
      <img src={item.photo} alt={item.name} style={styles.photo} />
      <p style={styles.name}>{item.name}</p>
      <p style={styles.meta}>{item.category.toLowerCase().replace("_", " ")}{item.color ? " · " + item.color : ""}{item.isLayer ? " · layer" : ""}</p>
      <p style={styles.meta}>Worn {wornText}</p>

      <div style={styles.row}>
        <button style={styles.editButton} onClick={function () { onEdit(item); }}>Edit</button>
        <button style={styles.deleteButton} onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
}