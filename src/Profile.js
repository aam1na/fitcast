import React, { useRef } from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";
const HEADING_FONT = "'Playfair Display', serif";

const THEME_OPTIONS = [
  { key: "blue", color: "#BEDBE8" },
  { key: "green", color: "#D0F0C0" },
  { key: "pink", color: "#FADDE1" },
  { key: "grey", color: "#D3D3D3" },
];

export default function Profile(props) {
  const preferences = props.preferences;
  const onUpdate = props.onUpdate;
  const goToTab = props.goToTab;
  const onLogout = props.onLogout;
  const THEME = useTheme();
  const fileInputRef = useRef(null);

  const selectedTheme = preferences.themeChoice || "blue";

  function updatePref(key, value) {
    const updated = Object.assign({}, preferences);
    updated[key] = value;
    onUpdate(updated);
  }

  function selectTheme(key) {
    updatePref("themeChoice", key);
  }

  function handlePictureClick() {
    fileInputRef.current.click();
  }

  function handlePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      updatePref("profilePicture", reader.result);
    };
    reader.readAsDataURL(file);
  }

  function editReminderTime() {
    const newTime = prompt("Set daily reminder time (e.g. 07:00):", preferences.notificationTime || "07:00");
    if (newTime) updatePref("notificationTime", newTime);
  }

  function editColorsToAvoid() {
    const current = (preferences.colorsToAvoid || []).join(", ");
    const newColors = prompt("Colors or styles to avoid, comma separated:", current);
    if (newColors !== null) {
      const list = newColors.split(",").map(function (c) { return c.trim(); }).filter(Boolean);
      updatePref("colorsToAvoid", list);
    }
  }

  function editUnits() {
    updatePref("units", preferences.units === "CELSIUS" ? "FAHRENHEIT" : "CELSIUS");
  }

  function editLocation() {
    const newLocation = prompt("Set your location:", preferences.location || "");
    if (newLocation !== null) updatePref("location", newLocation);
  }

  function showAbout() {
    alert("Fitcast — built for the AWS Zero to Shipped Hackathon.\nVersion 0.1");
  }

  const styles = {
    page: { background: THEME.bg, minHeight: "100vh", fontFamily: FONT, paddingBottom: "80px" },
    header: { padding: "24px 20px 16px", display: "flex", alignItems: "center", gap: "12px" },
    avatarImg: { width: 44, height: 44, borderRadius: "50%", objectFit: "cover", cursor: "pointer" },
    avatarPlaceholder: { width: 44, height: 44, borderRadius: "50%", background: "#D9D9D9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#666", border: "none" },
    name: { fontFamily: HEADING_FONT, fontWeight: 700, fontSize: "16px", margin: 0, color: "#000" },
    email: { fontSize: "12px", color: "#888780", margin: "2px 0 0" },
    changePicLink: { fontSize: "10px", color: THEME.accent, marginTop: "2px", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT },
    sectionLabel: { fontSize: "10px", color: "#888780", letterSpacing: "0.5px", margin: "0 20px 8px" },
    themeRow: { display: "flex", gap: "10px", padding: "0 20px 20px" },
    row: { background: THEME.white, borderRadius: "12px", padding: "12px 14px", margin: "0 20px 8px", display: "flex", justifyContent: "space-between", alignItems: "center", border: "none", width: "calc(100% - 40px)", cursor: "pointer", textAlign: "left", fontFamily: FONT },
    rowLabel: { fontSize: "13px", color: "#173404" },
    rowSubLabel: { fontSize: "11px", color: "#888780", marginTop: "2px" },
    rowValue: { fontSize: "12px", color: "#888780" },
    logoutText: { fontSize: "13px", color: THEME.logout },
    spacer: { height: "16px" },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: THEME.card, display: "flex", justifyContent: "space-around", padding: "10px 0" },
  };

  function navItemStyle(active) {
    return { display: "flex", flexDirection: "column", alignItems: "center", fontSize: "10px", color: active ? "#173404" : "#888780", fontWeight: active ? 600 : 400, background: "none", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  function swatchStyle(color, active) {
    return { width: 26, height: 26, borderRadius: "50%", background: color, border: active ? "2px solid #173404" : "2px solid transparent", cursor: "pointer" };
  }

  function toggleStyle(on) {
    return { width: 34, height: 19, borderRadius: "999px", background: on ? THEME.toggleOn : "#A8A8A8", border: "none", position: "relative", cursor: "pointer" };
  }

  function knobStyle(on) {
    return { width: 15, height: 15, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: on ? 17 : 2 };
  }

  function Toggle(tprops) {
    return (
      <button style={toggleStyle(tprops.on)} onClick={tprops.onClick}>
        <span style={knobStyle(tprops.on)}></span>
      </button>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handlePictureChange} />
        {preferences.profilePicture ? (
          <img src={preferences.profilePicture} alt="" style={styles.avatarImg} onClick={handlePictureClick} />
        ) : (
          <button style={styles.avatarPlaceholder} onClick={handlePictureClick}>+</button>
        )}
        <div>
          <p style={styles.name}>{preferences.name || "Your name"}</p>
          <p style={styles.email}>{preferences.email || "your@email.com"}</p>
          <button style={styles.changePicLink} onClick={handlePictureClick}>Change photo</button>
        </div>
      </div>

      <p style={styles.sectionLabel}>THEME</p>
      <div style={styles.themeRow}>
        {THEME_OPTIONS.map(function (opt) {
          return <button key={opt.key} style={swatchStyle(opt.color, selectedTheme === opt.key)} onClick={function () { selectTheme(opt.key); }}></button>;
        })}
      </div>

      <p style={styles.sectionLabel}>PREFERENCES</p>
      <button style={styles.row} onClick={editReminderTime}>
        <span style={styles.rowLabel}>Daily reminder time</span>
        <span style={styles.rowValue}>{preferences.notificationTime || "7:00 AM"}</span>
      </button>
      <button style={styles.row} onClick={editColorsToAvoid}>
        <span style={styles.rowLabel}>Colors to avoid</span>
        <span style={styles.rowValue}>{(preferences.colorsToAvoid || []).length} set</span>
      </button>

      <div style={styles.spacer}></div>
      <p style={styles.sectionLabel}>AI & MATCHING</p>
      <div style={styles.row}>
        <div>
          <div style={styles.rowLabel}>Ask Hook directly</div>
          <div style={styles.rowSubLabel}>adds a chat tab</div>
        </div>
        <Toggle on={!!preferences.askHookEnabled} onClick={function () { updatePref("askHookEnabled", !preferences.askHookEnabled); }} />
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Head covering matching</span>
        <Toggle on={!!preferences.headCoveringMatchingEnabled} onClick={function () { updatePref("headCoveringMatchingEnabled", !preferences.headCoveringMatchingEnabled); }} />
      </div>
      <div style={styles.row}>
        <span style={styles.rowLabel}>Hairstyle suggestions</span>
        <Toggle on={!!preferences.hairstyleSuggestionsEnabled} onClick={function () { updatePref("hairstyleSuggestionsEnabled", !preferences.hairstyleSuggestionsEnabled); }} />
      </div>

      <div style={styles.spacer}></div>
      <p style={styles.sectionLabel}>GENERAL</p>
      <button style={styles.row} onClick={editUnits}>
        <span style={styles.rowLabel}>Units</span>
        <span style={styles.rowValue}>{preferences.units === "CELSIUS" ? "°C" : "°F"}</span>
      </button>
      <button style={styles.row} onClick={editLocation}>
        <span style={styles.rowLabel}>Location</span>
        <span style={styles.rowValue}>{preferences.location || "not set"}</span>
      </button>
      <button style={styles.row} onClick={showAbout}>
        <span style={styles.rowLabel}>About / help</span>
      </button>
      <button style={styles.row} onClick={onLogout}>
        <span style={styles.logoutText}>Log out</span>
      </button>

      <div style={styles.nav}>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Home"); }}><span>🏠</span><span>Home</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Closet"); }}><span>👗</span><span>Closet</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Capsule"); }}><span>🕐</span><span>Capsule</span></button>
        <button style={navItemStyle(false)} onClick={function () { goToTab("Hook"); }}><span>💬</span><span>Hook</span></button>
        <button style={navItemStyle(true)} onClick={function () { goToTab("Profile"); }}><span>👤</span><span>Profile</span></button>
      </div>
    </div>
  );
}