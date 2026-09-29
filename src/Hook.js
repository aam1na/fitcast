import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "./ThemeContext";
import BottomNav from "./BottomNav";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

const STARTER_PROMPTS = [
  "what should I wear to a rooftop party tonight?",
  "something cozy for movie night",
  "help me dress for a job interview",
];

const OUTFIT_WORDS = ["wear", "wearing", "outfit", "outfits", "dress", "dressed", "style", "styling", "clothes"];
const OCCASION_WORDS = [
  "party", "interview", "work", "office", "brunch", "dinner", "date", "wedding", "eid", "graduation",
  "church", "school", "class", "movie", "cozy", "casual", "formal", "trip", "travel", "concert",
  "picnic", "pumpkin", "festival", "mehndi", "nikkah", "lunch", "meeting", "presentation", "rooftop",
  "beach", "hike", "errands", "shopping", "birthday", "engagement", "diwali",
];

function has(text, phrases) { return phrases.some(function (p) { return text.indexOf(p) !== -1; }); }
function hasWord(text, words) {
  const tokens = text.replace(/[^a-z0-9' ]/g, " ").split(/\s+/);
  return words.some(function (w) { return tokens.indexOf(w) !== -1; });
}
function isOutfitRequest(lower) { return hasWord(lower, OUTFIT_WORDS) || hasWord(lower, OCCASION_WORDS); }

function detectIntent(lower) {
  if (has(lower, ["what's in my closet", "whats in my closet", "how many items", "how many clothes"])) return "closet";
  if (isOutfitRequest(lower)) return "outfit";
  if (has(lower, ["how are you", "how are u", "how's it going", "hows it going", "what's up", "whats up"])) return "howareyou";
  if (has(lower, ["thank", "thx", "appreciate"])) return "thanks";
  if (has(lower, ["who are you", "what are you", "your name", "what can you do"])) return "about";
  if (has(lower, ["weather", "temperature", "how hot", "how cold", "going to rain"])) return "weather";
  if (hasWord(lower, ["bye", "goodbye"])) return "bye";
  if (hasWord(lower, ["hi", "hello", "hey", "sup"]) || has(lower, ["good morning", "good afternoon", "good evening"])) return "greeting";
  return "unknown";
}

function getOccasion(lower) {
  if (has(lower, ["eid", "wedding", "mehndi", "nikkah", "festival", "cultural", "diwali", "engagement"])) {
    return { label: "a special occasion", why: "I leaned on your coordinated set so the look feels complete.", wantsSet: true, wantsLayer: false, wantsAccessory: true };
  }
  if (has(lower, ["party", "rooftop", "date", "dinner", "concert", "night out", "birthday"])) {
    return { label: "a night out", why: "It's a little dressed up, with an accessory to finish it.", wantsSet: true, wantsLayer: false, wantsAccessory: true };
  }
  if (has(lower, ["interview", "work", "office", "meeting", "presentation", "business"])) {
    return { label: "something polished", why: "Clean and comfortable enough for a full day.", wantsSet: false, wantsLayer: true, wantsAccessory: true };
  }
  if (has(lower, ["cozy", "movie", "lounge", "relax"])) {
    return { label: "a cozy day", why: "Comfort comes first, with a layer if you want it.", wantsSet: false, wantsLayer: true, wantsAccessory: false };
  }
  if (has(lower, ["brunch", "lunch", "coffee", "casual", "errands", "shopping", "walk", "picnic", "hike", "park"])) {
    return { label: "something easy and casual", why: "Relaxed but still put-together.", wantsSet: false, wantsLayer: false, wantsAccessory: true };
  }
  return { label: "today", why: "A versatile mix that works for most plans.", wantsSet: false, wantsLayer: false, wantsAccessory: true };
}

function filterAvoided(items, prefs) {
  const avoid = (prefs.colorsToAvoid || []).map(function (c) { return c.toLowerCase(); }).filter(Boolean);
  if (avoid.length === 0) return items;
  return items.filter(function (item) {
    const name = item.name.toLowerCase();
    return !avoid.some(function (a) { return name.indexOf(a) !== -1; });
  });
}

function leastWorn(list) {
  if (!list.length) return null;
  return list.reduce(function (a, b) { return a.daysSinceWorn > b.daysSinceWorn ? a : b; });
}

function pickBest(list, weather, strict) {
  if (!list.length) return null;
  const matching = weather ? list.filter(function (i) { return i.weatherTags && i.weatherTags.indexOf(weather.condition) !== -1; }) : [];
  if (matching.length > 0) return leastWorn(matching);
  const neutral = list.filter(function (i) { return !i.weatherTags || i.weatherTags.length === 0; });
  if (neutral.length > 0) return leastWorn(neutral);
  if (strict) return null;
  return leastWorn(list);
}

function joinNames(list) {
  if (list.length === 1) return list[0];
  if (list.length === 2) return list[0] + " and " + list[1];
  return list.slice(0, -1).join(", ") + ", and " + list[list.length - 1];
}

function buildOutfitReply(lower, items, weather, prefs) {
  const occ = getOccasion(lower);
  const usable = filterAvoided(items, prefs);

  const sets = usable.filter(function (i) { return i.category === "SET"; });
  const tops = usable.filter(function (i) { return i.category === "TOP" && !i.isLayer; });
  const layers = usable.filter(function (i) { return i.category === "TOP" && i.isLayer; });
  const bottoms = usable.filter(function (i) { return i.category === "BOTTOM"; });
  const shoes = usable.filter(function (i) { return i.category === "SHOES"; });
  const accessories = usable.filter(function (i) { return ["JEWELRY", "BAG", "BELT", "HAT"].indexOf(i.category) !== -1; });
  const heads = usable.filter(function (i) { return i.category === "HEAD_COVERING"; });

  const chosen = [];
  let baseIsLayer = false;
  const missingSet = has(lower, ["eid", "wedding", "mehndi", "nikkah", "cultural"]) && sets.length === 0;

  if (occ.wantsSet && sets.length > 0) {
    chosen.push(pickBest(sets, weather, false));
  } else {
    let top = pickBest(tops, weather, false);
    if (!top) { top = pickBest(layers, weather, false); baseIsLayer = true; }
    const bottom = pickBest(bottoms, weather, false);
    if (top) chosen.push(top);
    if (bottom) chosen.push(bottom);
  }

  if (chosen.length === 0) {
    return { text: "I need a few more pieces in your closet before I can build a look. Add a top, a bottom, and some shoes in the Closet tab and ask me again.", items: [] };
  }

  const isCool = weather && ["cold", "rainy", "drizzle", "snowy"].indexOf(weather.condition) !== -1;
  if (!baseIsLayer && (occ.wantsLayer || isCool)) {
    const layer = pickBest(layers, weather, true);
    if (layer) chosen.push(layer);
  }

  const shoe = pickBest(shoes, weather, false);
  if (shoe) chosen.push(shoe);

  if (occ.wantsAccessory && accessories.length > 0) chosen.push(pickBest(accessories, weather, false));
  if (prefs.headCoveringMatchingEnabled && heads.length > 0) chosen.push(pickBest(heads, weather, false));

  const names = chosen.map(function (i) { return i.name.toLowerCase(); });
  let text = "";
  if (missingSet) text += "I don't see a coordinated set in your closet yet, so I built a dressed-up look from your separates instead. ";
  text += "For " + occ.label + ", I'd go with " + joinNames(names) + ". " + occ.why;
  if (weather) text += " Right now it's " + weather.tempF + "°F (" + weather.label + "), so I kept that in mind.";
  const neglected = chosen.filter(function (i) { return i.daysSinceWorn >= 14; });
  if (neglected.length > 0) text += " It also brings your " + neglected[0].name.toLowerCase() + " back into rotation.";

  return { text: text, items: chosen };
}

function generateReply(text, items, weather, prefs) {
  const lower = text.toLowerCase();
  const intent = detectIntent(lower);

  if (intent === "outfit") return buildOutfitReply(lower, items, weather, prefs);
  if (intent === "howareyou") return { text: "I'm doing great, thanks for asking! I'm Hook, your personal stylist. What are you getting dressed for?", items: [] };
  if (intent === "greeting") return { text: "Hey" + (prefs.name ? " " + prefs.name : "") + "! What are you getting dressed for today?", items: [] };
  if (intent === "thanks") return { text: "Anytime! Want another idea, or a different vibe?", items: [] };
  if (intent === "about") return { text: "I'm Hook, your stylist inside Fitcast. Tell me where you're headed, like brunch, a party, or work, and I'll put together a look from your own closet.", items: [] };
  if (intent === "weather") {
    if (weather) return { text: "It's " + weather.tempF + "°F and " + weather.label + " right now. Want an outfit built for that?", items: [] };
    return { text: "I can't see the weather yet. Open Home first so it can load, then ask me again.", items: [] };
  }
  if (intent === "closet") {
    const sets = items.filter(function (i) { return i.isSet; }).length;
    return { text: "You have " + items.length + " items in your closet, including " + sets + " coordinated " + (sets === 1 ? "set" : "sets") + ".", items: [] };
  }
  if (intent === "bye") return { text: "See you later! Go wear something great.", items: [] };
  return { text: "I'm not sure I caught that. Tell me the occasion, like brunch, a party, or work, and I'll build a look from your closet.", items: [] };
}

export default function Hook(props) {
  const items = props.items;
  const weather = props.weather;
  const preferences = props.preferences || {};
  const goToTab = props.goToTab;
  const THEME = useTheme();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const endRef = useRef(null);

  useEffect(function () {
    if (endRef.current && messages.length > 0) endRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function sendMessage(text) {
    const clean = text.trim();
    if (!clean) return;
    const reply = generateReply(clean, items, weather, preferences);
    setMessages(messages.concat([{ role: "user", text: clean }, { role: "bot", text: reply.text, items: reply.items }]));
    setInput("");
  }

  function logOutfit(outfitItems) {
    const existing = JSON.parse(localStorage.getItem("fitcastLogs") || "[]");
    existing.push({
      date: new Date().toISOString(),
      weather: weather,
      anchorItem: outfitItems[0].name,
      vibe: "Hook",
      items: outfitItems.map(function (i) { return { name: i.name, photo: i.photo }; }),
    });
    localStorage.setItem("fitcastLogs", JSON.stringify(existing));
    alert("Outfit logged for today!");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px", display: "flex", flexDirection: "column" },
    header: { padding: "24px 20px 8px" },
    title: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "20px", margin: 0, color: "#000" },
    emptyHint: { textAlign: "center", color: "#888780", fontSize: "13px", margin: "20px 0" },
    starterList: { padding: "0 20px", display: "flex", flexDirection: "column", gap: "8px", marginBottom: "20px" },
    starterChip: { background: THEME.white, borderRadius: "14px", padding: "10px 14px", fontSize: "13px", color: "#5F5E5A", border: "none", cursor: "pointer", textAlign: "left", fontFamily: FONT },
    messageArea: { flex: 1, padding: "0 20px 70px", display: "flex", flexDirection: "column", gap: "10px" },
    userBubble: { background: THEME.accent, color: "#fff", borderRadius: "14px", padding: "10px 14px", fontSize: "13px", alignSelf: "flex-end", maxWidth: "80%" },
    botBubble: { background: THEME.white, borderRadius: "14px", padding: "12px", alignSelf: "flex-start", maxWidth: "88%" },
    botText: { fontSize: "12px", color: "#173404", margin: 0, lineHeight: 1.5 },
    botItemsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(64px, 1fr))", gap: "8px", marginBottom: "10px" },
    botItemBox: { width: "100%", aspectRatio: "1 / 1", objectFit: "cover", borderRadius: "8px" },
    botItemName: { fontSize: "10px", color: "#5F5E5A", margin: "4px 0 0", lineHeight: 1.2 },
    logButton: { marginTop: "10px", background: THEME.accent, color: "#fff", border: "none", borderRadius: "999px", padding: "7px 14px", fontSize: "11px", cursor: "pointer", fontFamily: FONT },
    inputRow: { display: "flex", gap: "8px", padding: "12px 20px", position: "fixed", bottom: "56px", left: 0, right: 0, background: THEME.bg },
    input: { flex: 1, padding: "10px 14px", borderRadius: "999px", border: "none", background: THEME.white, fontSize: "13px", fontFamily: FONT },
    sendButton: { background: THEME.accent, color: "#fff", border: "none", borderRadius: "50%", width: "38px", height: "38px", cursor: "pointer", fontSize: "14px" },
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.title}>Hook</p>
      </div>

      {messages.length === 0 && (
        <div>
          <p style={styles.emptyHint}>ask me anything about what to wear</p>
          <div style={styles.starterList}>
            {STARTER_PROMPTS.map(function (p, i) {
              return (
                <button key={i} style={styles.starterChip} onClick={function () { sendMessage(p); }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={styles.messageArea}>
        {messages.map(function (msg, i) {
          if (msg.role === "user") {
            return (
              <div key={i} style={styles.userBubble}>
                {msg.text}
              </div>
            );
          }

          const hasItems = msg.items && msg.items.length > 0;

          return (
            <div key={i} style={styles.botBubble}>
              {hasItems && (
                <div style={styles.botItemsGrid}>
                  {msg.items.map(function (item, j) {
                    return (
                      <div key={j}>
                        <img src={item.photo} alt={item.name} style={styles.botItemBox} />
                        <p style={styles.botItemName}>{item.name}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <p style={styles.botText}>{msg.text}</p>
              {hasItems && (
                <button style={styles.logButton} onClick={function () { logOutfit(msg.items); }}>
                  Log this outfit
                </button>
              )}
            </div>
          );
        })}
        <div ref={endRef}></div>
      </div>

      <div style={styles.inputRow}>
        <input
          style={styles.input}
          value={input}
          onChange={function (e) { setInput(e.target.value); }}
          onKeyDown={function (e) { if (e.key === "Enter") sendMessage(input); }}
          placeholder="ask Hook something..."
        />
        <button style={styles.sendButton} onClick={function () { sendMessage(input); }}>➤</button>
      </div>

      <BottomNav activeTab="Hook" goToTab={goToTab} showHook={true} />
    </div>
  );
}