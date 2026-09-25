import React, { useState } from "react";

const THEME = {
  bg: "#E6F1F6",
  card: "#BEDBE8",
  accent: "#679AB0",
  chip: "#D7E1E6",
  white: "#FFFFFF",
};

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [closetStructure, setClosetStructure] = useState("BOTH");
  const [headCoveringEnabled, setHeadCoveringEnabled] = useState(false);
  const [headCoveringName, setHeadCoveringName] = useState("");
  const [hairstyleEnabled, setHairstyleEnabled] = useState(false);
  const [hairLength, setHairLength] = useState("");
  const [hairTexture, setHairTexture] = useState("");
  const [colorsToAvoid, setColorsToAvoid] = useState("");
  const [notificationTime, setNotificationTime] = useState("07:00");

  const totalSteps = 6;

  function next() {
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }
  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function finishOnboarding() {
    const preferences = {
      name,
      email,
      closetStructure,
      headCoveringMatchingEnabled: headCoveringEnabled,
      headCoveringName: headCoveringEnabled ? headCoveringName : null,
      hairstyleSuggestionsEnabled: hairstyleEnabled,
      hairLength: hairstyleEnabled ? hairLength : null,
      hairTexture: hairstyleEnabled ? hairTexture : null,
      colorsToAvoid: colorsToAvoid
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      notificationTime,
      onboardingComplete: true,
    };

    // Saved locally for now — this is the piece we'll wire up
    // to actually write into the UserPreferences DynamoDB table next.
    localStorage.setItem("fitcastPreferences", JSON.stringify(preferences));

    onComplete(preferences);
  }

  const styles = {
    page: {
      background: THEME.bg,
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Quicksand, sans-serif",
      padding: "24px",
    },
    card: {
      background: THEME.white,
      borderRadius: "20px",
      padding: "28px",
      width: "100%",
      maxWidth: "360px",
    },
    heading: {
      fontFamily: "Playfair Display, serif",
      fontSize: "22px",
      marginBottom: "6px",
      color: "#000",
    },
    subtext: {
      fontSize: "13px",
      color: "#5F5E5A",
      marginBottom: "20px",
    },
    input: {
      width: "100%",
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #D7E1E6",
      marginBottom: "14px",
      fontSize: "14px",
      boxSizing: "border-box",
    },
    chipRow: {
      display: "flex",
      gap: "8px",
      marginBottom: "18px",
      flexWrap: "wrap",
    },
    chip: (active) => ({
      padding: "8px 14px",
      borderRadius: "999px",
      background: active ? THEME.accent : THEME.chip,
      color: active ? "#fff" : "#333",
      fontSize: "13px",
      cursor: "pointer",
      border: "none",
    }),
    toggleRow: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "16px",
    },
    button: {
      width: "100%",
      background: THEME.accent,
      color: "#fff",
      border: "none",
      borderRadius: "12px",
      padding: "12px",
      fontSize: "14px",
      fontWeight: 500,
      cursor: "pointer",
      marginTop: "8px",
    },
    backLink: {
      textAlign: "center",
      marginTop: "10px",
      fontSize: "12px",
      color: "#888780",
      cursor: "pointer",
    },
    progress: {
      display: "flex",
      justifyContent: "center",
      gap: "6px",
      marginBottom: "16px",
    },
    dot: (active) => ({
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: active ? THEME.accent : THEME.chip,
    }),
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.progress}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} style={styles.dot(i === step)} />
          ))}
        </div>

        {step === 0 && (
          <>
            <div style={styles.heading}>Welcome to Fitcast</div>
            <div style={styles.subtext}>Let's set a few things up first.</div>
            <input
              style={styles.input}
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              style={styles.input}
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button style={styles.button} onClick={next} disabled={!name || !email}>
              Continue
            </button>
          </>
        )}

        {step === 1 && (
          <>
            <div style={styles.heading}>How do you log outfits?</div>
            <div style={styles.subtext}>
              Pick whichever matches how your closet actually works.
            </div>
            <div style={styles.chipRow}>
              {[
                { key: "SEPARATES", label: "Separates" },
                { key: "SETS", label: "Coordinated sets" },
                { key: "BOTH", label: "Both" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  style={styles.chip(closetStructure === opt.key)}
                  onClick={() => setClosetStructure(opt.key)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button style={styles.button} onClick={next}>
              Continue
            </button>
            <div style={styles.backLink} onClick={back}>
              Back
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div style={styles.heading}>Head covering matching</div>
            <div style={styles.subtext}>
              If you wear a head covering, we can match it to your daily outfit.
            </div>
            <div style={styles.toggleRow}>
              <span>Enable this</span>
              <input
                type="checkbox"
                checked={headCoveringEnabled}
                onChange={(e) => setHeadCoveringEnabled(e.target.checked)}
              />
            </div>
            {headCoveringEnabled && (
              <input
                style={styles.input}
                placeholder="What do you call it? (hijab, turban, durag, etc.)"
                value={headCoveringName}
                onChange={(e) => setHeadCoveringName(e.target.value)}
              />
            )}
            <button style={styles.button} onClick={next}>
              Continue
            </button>
            <div style={styles.backLink} onClick={back}>
              Back
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={styles.heading}>Hairstyle suggestions</div>
            <div style={styles.subtext}>
              Want a hairstyle idea alongside your outfit suggestions?
            </div>
            <div style={styles.toggleRow}>
              <span>Enable this</span>
              <input
                type="checkbox"
                checked={hairstyleEnabled}
                onChange={(e) => setHairstyleEnabled(e.target.checked)}
              />
            </div>
            {hairstyleEnabled && (
              <>
                <input
                  style={styles.input}
                  placeholder="Hair length (short, medium, long)"
                  value={hairLength}
                  onChange={(e) => setHairLength(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Hair texture (straight, wavy, curly, coily)"
                  value={hairTexture}
                  onChange={(e) => setHairTexture(e.target.value)}
                />
              </>
            )}
            <button style={styles.button} onClick={next}>
              Continue
            </button>
            <div style={styles.backLink} onClick={back}>
              Back
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div style={styles.heading}>Colors or styles to avoid</div>
            <div style={styles.subtext}>
              Separate with commas. Leave blank if none.
            </div>
            <input
              style={styles.input}
              placeholder="e.g. neon yellow, animal print"
              value={colorsToAvoid}
              onChange={(e) => setColorsToAvoid(e.target.value)}
            />
            <button style={styles.button} onClick={next}>
              Continue
            </button>
            <div style={styles.backLink} onClick={back}>
              Back
            </div>
          </>
        )}

        {step === 5 && (
          <>
            <div style={styles.heading}>Daily reminder time</div>
            <div style={styles.subtext}>
              When should Fitcast check the weather and suggest an outfit?
            </div>
            <input
              type="time"
              style={styles.input}
              value={notificationTime}
              onChange={(e) => setNotificationTime(e.target.value)}
            />
            <button style={styles.button} onClick={finishOnboarding}>
              Finish setup
            </button>
            <div style={styles.backLink} onClick={back}>
              Back
            </div>
          </>
        )}
      </div>
    </div>
  );
}