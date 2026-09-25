import React, { useState, useEffect } from "react";
import Onboarding from "./Onboarding";
import Home from "./Home";

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

  return <Home preferences={preferences} />;
}

export default App;