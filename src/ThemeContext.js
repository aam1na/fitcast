import React, { createContext, useContext } from "react";
import { THEMES } from "./themes";

const ThemeContext = createContext(THEMES.blue);

export function ThemeProvider(props) {
  const key = props.themeKey || "blue";
  const theme = THEMES[key] || THEMES.blue;
  return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}