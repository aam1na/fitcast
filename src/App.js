import React, { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import Home from "./Home";
import Closet from "./Closet";
import AddItem from "./AddItem";
import ItemDetail from "./ItemDetail";
import Capsule from "./Capsule";
import Profile from "./Profile";
import Hook from "./Hook";
import Explore from "./Explore";
import SavedFits from "./SavedFits";
import CreateFit from "./CreateFit";
import Favorites from "./Favorites";
import { INITIAL_CLOSET } from "./closetData";
import { ThemeProvider } from "./ThemeContext";

function App() {
  const [preferences, setPreferences] = useState(null);
  const [checked, setChecked] = useState(false);
  const [activeTab, setActiveTab] = useState("Home");
  const [items, setItems] = useState(INITIAL_CLOSET);
  const [lastWeather, setLastWeather] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

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

  function updateItem(updatedItem) {
    const updated = items.map(function (i) { return i.id === updatedItem.id ? updatedItem : i; });
    setItems(updated);
    localStorage.setItem("fitcastItems", JSON.stringify(updated));
  }

  function deleteItem(id) {
    const updated = items.filter(function (i) { return i.id !== id; });
    setItems(updated);
    localStorage.setItem("fitcastItems", JSON.stringify(updated));
  }

  function updatePreferences(updated) {
    setPreferences(updated);
    localStorage.setItem("fitcastPreferences", JSON.stringify(updated));
  }

  function handleLogout() {
    const confirmed = window.confirm("This clears everything on this device: closet, logs, favorites, and preferences. Export your data first in Profile if you want to keep it. Continue?");
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
    screen = (
      <Closet
        items={items}
        goToTab={setActiveTab}
        preferences={preferences}
        onSelectItem={function (item) { setSelectedItem(item); setActiveTab("ItemDetail"); }}
      />
    );
  } else if (activeTab === "ItemDetail") {
    screen = (
      <ItemDetail
        item={selectedItem}
        goBack={function () { setActiveTab("Closet"); }}
        onEdit={function (item) { setEditingItem(item); setActiveTab("AddItem"); }}
        onDelete={deleteItem}
      />
    );
  } else if (activeTab === "AddItem") {
    screen = (
      <AddItem
        onAdd={addItem}
        onSave={updateItem}
        editingItem={editingItem}
        goBack={function () { setEditingItem(null); setActiveTab("Closet"); }}
      />
    );
  } else if (activeTab === "Capsule") {
    screen = <Capsule goToTab={setActiveTab} preferences={preferences} />;
  } else if (activeTab === "Profile") {
    screen = (
      <Profile
        preferences={preferences}
        onUpdate={updatePreferences}
        goToTab={setActiveTab}
        onLogout={handleLogout}
      />
    );
  } else if (activeTab === "Hook") {
    screen = <Hook items={items} weather={lastWeather} preferences={preferences} goToTab={setActiveTab} />;
  } else if (activeTab === "Explore") {
    screen = <Explore items={items} preferences={preferences} goToTab={setActiveTab} />;
  } else if (activeTab === "SavedFits") {
    screen = <SavedFits goToTab={setActiveTab} preferences={preferences} />;
  } else if (activeTab === "CreateFit") {
    screen = <CreateFit items={items} goToTab={setActiveTab} />;
  } else if (activeTab === "Favorites") {
    screen = <Favorites goToTab={setActiveTab} preferences={preferences} />;
  } else {
    screen = <Home preferences={preferences} items={items} goToTab={setActiveTab} onWeatherLoaded={setLastWeather} />;
  }

  return (
    <ThemeProvider themeKey={themeKey}>
      <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", boxShadow: "0 0 30px rgba(0,0,0,0.06)" }}>
        {screen}
      </div>
    </ThemeProvider>
  );
}

export default App;