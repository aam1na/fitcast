import React, { useState, useEffect } from "react";
import Onboarding from "./Onboarding";

function App() {
  const [preferences, setPreferences] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fitcastPreferences");
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
    setChecked(true);
  }, []);

  if (!checked) return null;

  if (!preferences) {
    return <Onboarding onComplete={setPreferences} />;
  }

  return (
    <div style={{ padding: 24, fontFamily: "Quicksand, sans-serif" }}>
      <h1>Welcome back, {preferences.name} 👋</h1>
      <p>Onboarding complete — Home screen goes here next.</p>
    </div>
  );
}

export default App;