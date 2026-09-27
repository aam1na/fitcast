import React, { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import Home from "./Home";
import Closet from "./Closet";
import AddItem from "./AddItem";
import Capsule from "./Capsule";
import Profile from "./Profile";
import { INITIAL_CLOSET } from "./closetData";
import { ThemeProvider } from "./ThemeContext";

function App() {
  const [preferences, setPreferences] = useState(null);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [items, setItems] = useState(INITIAL_CLOSET);

  useEffect(function () {
    const savedPrefs = localStorage.getItem("fitcastPreferences");
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));

    const savedItems = localStorage.getItem("fitcastItems");
    if (savedItems) setItems(JSON.parse(savedItems));

    setChecked(true);
  }, []);

  function addItem(newItem) {
    const updated = items.concat([newItem]);
    setItems(updated);
    localStorage.setItem("fitcastItems", JSON.stringify(updated));
  }

  function updatePreferences(updated) {
    setPreferences(updated);
    localStorage.setItem("fitcastPreferences", JSON.stringify(updated));
  }

  function handleLogout() {
    const confirmed = window.confirm("Log out? This clears your local data on this device.");
    if (confirmed) {
      localStorage.clear();
      setPreferences(null);
      setItems(INITIAL_CLOSET);
      setActiveTab("Home");
    }
  }

  if (!checked) return null;
  if (!preferences) return <Onboarding onComplete={setPreferences} />;

  const themeKey = preferences.themeChoice || "blue";

  let screen;
  if (activeTab === "Closet") {
    screen = <Closet items={items} goToTab={setActiveTab} />;
  } else if (activeTab === "AddItem") {
    screen = <AddItem onAdd={addItem} goBack={function () { setActiveTab("Closet"); }} />;
  } else if (activeTab === "Capsule") {
    screen = <Capsule goToTab={setActiveTab} />;
  } else if (activeTab === "Profile") {
    screen = <Profile preferences={preferences} onUpdate={updatePreferences} goToTab={setActiveTab} onLogout={handleLogout} />;
  } else {
    screen = <Home preferences={preferences} items={items} goToTab={setActiveTab} />;
  }

  return <ThemeProvider themeKey={themeKey}>{screen}</ThemeProvider>;
}

export default App;