import React, { useState } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";
import { colorsCompatible } from "./closetData";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

const OCCASIONS = [
  { key: "casual", label: "casual", setChance: 0.15, layerChance: 0.4, accessoryChance: 0.5, notes: ["an easy everyday look with room to move", "relaxed and effortless, nothing trying too hard", "a simple combination that just works"] },
  { key: "brunch", label: "brunch", setChance: 0.3, layerChance: 0.4, accessoryChance: 0.8, notes: ["light and put-together for a slow morning out", "easy but styled, perfect for good food and good company", "a fresh take on your everyday pieces"] },
  { key: "party", label: "party", setChance: 0.5, layerChance: 0.3, accessoryChance: 0.9, notes: ["dressed up with a little extra shine", "a night-out look that still feels like you", "a bit bolder than your usual, in a good way"] },
  { key: "work", label: "work", setChance: 0.25, layerChance: 0.7, accessoryChance: 0.6, notes: ["polished and comfortable for a full day", "professional without feeling stiff", "clean lines and a layer to finish it"] },
  { key: "cozy", label: "cozy", setChance: 0.1, layerChance: 0.9, accessoryChance: 0.2, notes: ["soft, layered, and made for staying in", "comfort first, still looks intentional", "a warm mix for slow days"] },
  { key: "cultural", label: "cultural", setChance: 1, layerChance: 0.4, accessoryChance: 0.8, notes: ["a coordinated set styled for a special occasion", "traditional pieces with a finishing touch", "an elegant look built around your set"] },
];

function makeRng(seed) {
  let a = seed + 1;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(list, rand) { if (!list.length) return null; return list[Math.floor(rand() * list.length)]; }

function isWeatherGear(item) {
  const tags = item.weatherTags || [];
  return tags.indexOf("rainy") !== -1 || tags.indexOf("drizzle") !== -1 || tags.indexOf("thunderstorm") !== -1 || tags.indexOf("snowy") !== -1;
}

function buildLook(items, occasion, rand, prefs) {
  const avoid = (prefs.colorsToAvoid || []).map(function (c) { return c.toLowerCase(); }).filter(Boolean);
  const usable = items.filter(function (item) {
    const name = item.name.toLowerCase();
    const avoided = avoid.some(function (a) { return name.indexOf(a) !== -1; });
    return !avoided && !isWeatherGear(item);
  });

  const sets = usable.filter(function (i) { return i.category === "SET"; });
  const tops = usable.filter(function (i) { return i.category === "TOP" && !i.isLayer; });
  const layers = usable.filter(function (i) { return i.category === "TOP" && i.isLayer; });
  const bottoms = usable.filter(function (i) { return i.category === "BOTTOM"; });
  const shoes = usable.filter(function (i) { return i.category === "SHOES"; });
  const accessories = usable.filter(function (i) { return ["JEWELRY", "BAG", "BELT", "HAT"].indexOf(i.category) !== -1; });
  const heads = usable.filter(function (i) { return i.category === "HEAD_COVERING"; });

  if (occasion.key === "cultural" && sets.length === 0) return null;

  for (let tries = 0; tries < 6; tries++) {
    const pieces = [];
    let baseIsLayer = false;
    const chooseSet = sets.length > 0 && rand() < occasion.setChance;

    if (chooseSet) {
      pieces.push(pick(sets, rand));
    } else {
      let top = pick(tops, rand);
      if (!top) { top = pick(layers, rand); baseIsLayer = true; }
      const bottom = pick(bottoms, rand);
      if (!top || !bottom) return null;
      if (!colorsCompatible(top.color, bottom.color)) continue;
      pieces.push(top);
      pieces.push(bottom);
    }

    if (!baseIsLayer && layers.length > 0 && rand() < occasion.layerChance) {
      const layer = pick(layers, rand);
      const baseColor = pieces[0] ? pieces[0].color : null;
      if (layer && (!baseColor || colorsCompatible(layer.color, baseColor))) pieces.push(layer);
    }

    const shoe = pick(shoes, rand);
    if (shoe) pieces.push(shoe);

    if (accessories.length > 0 && rand() < occasion.accessoryChance) pieces.push(pick(accessories, rand));
    if (prefs.headCoveringMatchingEnabled && heads.length > 0) pieces.push(pick(heads, rand));

    const key = occasion.key + ":" + pieces.map(function (p) { return p.id; }).sort().join("-");
    return { key: key, occasion: occasion.label, items: pieces, note: pick(occasion.notes, rand) };
  }
  return null;
}

function generateFeed(items, prefs, activeKey, seed) {
  const chosen = activeKey === "all" ? OCCASIONS : OCCASIONS.filter(function (o) { return o.key === activeKey; });
  const perOccasion = activeKey === "all" ? 3 : 8;
  const lists = chosen.map(function (occasion, index) {
    const rand = makeRng(seed * 977 + index * 101);
    const seen = {};
    const looks = [];
    for (let attempt = 0; attempt < perOccasion * 10 && looks.length < perOccasion; attempt++) {
      const look = buildLook(items, occasion, rand, prefs);
      if (look && !seen[look.key]) { seen[look.key] = true; looks.push(look); }
    }
    return looks;
  });

  const feed = [];
  for (let i = 0; i < perOccasion; i++) {
    lists.forEach(function (list) { if (list[i]) feed.push(list[i]); });
  }
  return feed;
}

function getShoppingIdeas(items, prefs) {
  const has = function (cat) { return items.some(function (i) { return i.category === cat; }); };
  const ideas = [];
  if (!items.some(function (i) { return i.category === "TOP" && i.isLayer; })) ideas.push({ text: "a lightweight cardigan to layer over your tops", query: "lightweight cardigan women" });
  if (!has("BELT")) ideas.push({ text: "a woven or leather belt to define an outfit", query: "leather belt women" });
  if (!has("HAT")) ideas.push({ text: "a bucket hat or wide brim hat for sunny days", query: "bucket hat" });
  if (!has("BAG")) ideas.push({ text: "a crossbody bag that goes with everything", query: "crossbody bag" });
  if (!has("JEWELRY")) ideas.push({ text: "simple everyday jewelry to finish a look", query: "everyday gold jewelry" });
  if (items.filter(function (i) { return i.category === "SHOES"; }).length < 2) ideas.push({ text: "a second pair of shoes for more outfit options", query: "white leather sneakers" });
  return ideas.slice(0, 4);
}

export default function Explore(props) {
  const items = props.items;
  const preferences = props.preferences;
  const goToTab = props.goToTab;
  const THEME = useTheme();

  const [activeKey, setActiveKey] = useState("all");
  const [seed, setSeed] = useState(1);
  const [selected, setSelected] = useState(null);

  const feed = generateFeed(items, preferences, activeKey, seed);
  const shoppingIdeas = getShoppingIdeas(items, preferences);

  function logLook(look) {
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push({ date: new Date().toISOString(), weather: null, anchorItem: look.items[0].name, vibe: look.occasion, items: look.items.map(function (i) { return { name: i.name, photo: i.photo }; }) });
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    setSelected(null);
    alert("Outfit logged for today!");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "20px 20px 4px" },
    backLink: { fontSize: "13px", color: "#5F5E5A", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: "8px", fontFamily: FONT },
    titleRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "22px", margin: 0, color: "#000" },
    subtitle: { fontSize: "12px", color: "#888780", margin: "4px 0 10px" },
    fitsLink: { background: "none", border: "none", color: THEME.accent, fontSize: "12px", fontWeight: 600, cursor: "pointer", padding: 0, marginBottom: "14px", fontFamily: FONT, textDecoration: "underline" },
    shuffle: { background: THEME.accent, color: "#fff", border: "none", borderRadius: "999px", padding: "7px 14px", fontSize: "12px", cursor: "pointer", fontFamily: FONT },
    chipRow: { display: "flex", gap: "6px", flexWrap: "wrap", padding: "0 20px 16px" },
    feed: { columnCount: 2, columnGap: "10px", padding: "0 20px" },
    card: { breakInside: "avoid", marginBottom: "10px", background: THEME.white, borderRadius: "14px", padding: "10px", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "block", fontFamily: FONT },
    collage: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" },
    collageImg: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "8px" },
    tag: { display: "inline-block", background: THEME.chip, color: "#5F5E5A", fontSize: "10px", padding: "3px 8px", borderRadius: "999px", marginBottom: "6px" },
    note: { fontSize: "12px", color: "#173404", margin: 0, lineHeight: 1.4 },
    empty: { textAlign: "center", color: "#888780", fontSize: "13px", padding: "30px 30px" },
    shopSection: { padding: "10px 20px 0" },
    sectionTitle: { fontFamily: HEADING_FONT, fontSize: "16px", fontWeight: 700, color: "#333", margin: "0 0 4px" },
    shopHint: { fontSize: "11px", color: "#888780", margin: "0 0 10px" },
    shopCard: { background: "#FAEEDA", borderRadius: "14px", padding: "12px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" },
    shopText: { fontSize: "12px", color: "#5C3A08", margin: 0 },
    shopLink: { fontSize: "11px", color: "#854F0B", fontWeight: 600, whiteSpace: "nowrap", textDecoration: "none" },
    overlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 10 },
    sheet: { background: THEME.white, width: "100%", maxWidth: "480px", borderRadius: "20px 20px 0 0", padding: "20px", fontFamily: FONT, maxHeight: "80vh", overflowY: "auto", boxSizing: "border-box" },
    sheetTitle: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "18px", margin: "0 0 4px", color: "#000" },
    sheetNote: { fontSize: "13px", color: "#5F5E5A", margin: "0 0 14px" },
    sheetItem: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", fontSize: "13px", color: "#173404" },
    sheetPhoto: { borderRadius: "8px", width: "40px", height: "40px", flexShrink: 0, objectFit: "cover" },
    sheetPrimary: { width: "100%", background: THEME.accent, color: "#fff", border: "none", borderRadius: "12px", padding: "12px", fontSize: "13px", fontWeight: 500, cursor: "pointer", fontFamily: FONT, marginTop: "10px" },
    sheetSecondary: { width: "100%", background: "none", color: "#888780", border: "none", padding: "10px", fontSize: "12px", cursor: "pointer", fontFamily: FONT },
  };

  function chipStyle(active) {
    return { padding: "6px 12px", borderRadius: "999px", background: active ? THEME.accent : THEME.white, color: active ? "#fff" : "#5F5E5A", fontSize: "11px", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  const filters = [{ key: "all", label: "all" }].concat(OCCASIONS.map(function (o) { return { key: o.key, label: o.label }; }));

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <button style={styles.backLink} onClick={function () { goToTab("Home"); }}>← Back</button>
        <div style={styles.titleRow}>
          <p style={styles.title}>Explore</p>
          <button style={styles.shuffle} onClick={function () { setSeed(seed + 1); }}>🔄 Shuffle</button>
        </div>
        <p style={styles.subtitle}>outfit ideas made from clothes you already own</p>
        <button style={styles.fitsLink} onClick={function () { goToTab("SavedFits"); }}>view my saved fits →</button>
      </div>

      <div style={styles.chipRow}>
        {filters.map(function (f) {
          return <button key={f.key} style={chipStyle(activeKey === f.key)} onClick={function () { setActiveKey(f.key); }}>{f.label}</button>;
        })}
      </div>

      {items.length === 0 ? (
        <div style={styles.empty}>Add a few items to your closet to start seeing outfit ideas here.</div>
      ) : feed.length === 0 ? (
        <div style={styles.empty}>{activeKey === "cultural" ? "Add a coordinated set to your closet to see cultural looks here." : "Add a few more pieces so I have more combinations to work with."}</div>
      ) : (
        <div style={styles.feed}>
          {feed.map(function (look) {
            return (
              <button key={look.key} style={styles.card} onClick={function () { setSelected(look); }}>
                <div style={styles.collage}>
                  {look.items.map(function (item) {
                    return <img key={item.id} src={item.photo} alt="" style={styles.collageImg} />;
                  })}
                </div>
                <span style={styles.tag}>{look.occasion}</span>
                <p style={styles.note}>{look.note}</p>
              </button>
            );
          })}
        </div>
      )}

      {shoppingIdeas.length > 0 && (
        <div style={styles.shopSection}>
          <p style={styles.sectionTitle}>Shopping inspiration</p>
          <p style={styles.shopHint}>ideas based on what your closet could use, opens a search in a new tab</p>
          {shoppingIdeas.map(function (idea, i) {
            return (
              <div key={i} style={styles.shopCard}>
                <p style={styles.shopText}>Look for {idea.text}</p>
                <a style={styles.shopLink} href={"https://www.google.com/search?tbm=shop&q=" + encodeURIComponent(idea.query)} target="_blank" rel="noopener noreferrer">Search →</a>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div style={styles.overlay} onClick={function () { setSelected(null); }}>
          <div style={styles.sheet} onClick={function (e) { e.stopPropagation(); }}>
            <p style={styles.sheetTitle}>{selected.occasion} look</p>
            <p style={styles.sheetNote}>{selected.note}</p>
            {selected.items.map(function (item) {
              return (
                <div key={item.id} style={styles.sheetItem}>
                  <img src={item.photo} alt="" style={styles.sheetPhoto} />
                  <span>{item.name}</span>
                </div>
              );
            })}
            <button style={styles.sheetPrimary} onClick={function () { logLook(selected); }}>Log this outfit for today</button>
            <button style={styles.sheetSecondary} onClick={function () { setSelected(null); }}>Close</button>
          </div>
        </div>
      )}

      <BottomNav activeTab="Explore" goToTab={goToTab} showHook={!!preferences.askHookEnabled} />
    </div>
  );
}