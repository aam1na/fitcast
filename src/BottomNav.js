import React from "react";
import { useTheme } from "./ThemeContext";

const FONT = "'Quicksand', sans-serif";

export default function BottomNav(props) {
  const activeTab = props.activeTab;
  const goToTab = props.goToTab;
  const showHook = props.showHook;
  const THEME = useTheme();

  const tabs = [
    { key: "Home", icon: "🏠", label: "Home" },
    { key: "Closet", icon: "👗", label: "Closet" },
    { key: "Capsule", icon: "🕐", label: "Capsule" },
  ];
  if (showHook) {
    tabs.push({ key: "Hook", icon: "💬", label: "Hook" });
  }
  tabs.push({ key: "Profile", icon: "👤", label: "Profile" });

  const navStyle = { position: "fixed", bottom: 0, left: 0, right: 0, background: THEME.card, display: "flex", justifyContent: "space-around", padding: "10px 0" };

  function itemStyle(active) {
    return { display: "flex", flexDirection: "column", alignItems: "center", fontSize: "10px", color: active ? "#173404" : "#888780", fontWeight: active ? 600 : 400, background: "none", border: "none", cursor: "pointer", fontFamily: FONT };
  }

  return (
    <div style={navStyle}>
      {tabs.map(function (tab) {
        return (
          <button key={tab.key} style={itemStyle(activeTab === tab.key)} onClick={function () { goToTab(tab.key); }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}